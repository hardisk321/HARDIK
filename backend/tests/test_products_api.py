"""Iteration 4: Tests for products catalog API (MongoDB-backed)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fall back to frontend/.env file
    from pathlib import Path
    env = Path("/app/frontend/.env").read_text()
    for line in env.splitlines():
        if line.startswith("REACT_APP_BACKEND_URL"):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
            break

API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@drishti-aidc.com"
ADMIN_PASSWORD = "Drishti@2026"


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# -------- Public GET /products --------
class TestProductsList:
    def test_list_returns_16_items(self):
        r = requests.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert "total" in data and "items" in data
        assert data["total"] >= 16, f"Expected >=16 seeded products, got {data['total']}"
        # no _id leak
        for item in data["items"]:
            assert "_id" not in item
            assert item.get("image_url"), f"Missing image_url on {item.get('slug')}"
            assert item.get("slug")

    def test_filter_category_printer(self):
        r = requests.get(f"{API}/products", params={"category": "printer"})
        assert r.status_code == 200
        items = r.json()["items"]
        # seeded: 6 printers
        printers = [i for i in items if i["category"] == "printer"]
        assert len(printers) == len(items)
        assert len(items) >= 6

    def test_filter_category_label(self):
        r = requests.get(f"{API}/products", params={"category": "label"})
        assert r.status_code == 200
        items = r.json()["items"]
        assert all(i["category"] == "label" for i in items)
        assert len(items) >= 5

    def test_filter_category_ribbon(self):
        r = requests.get(f"{API}/products", params={"category": "ribbon"})
        assert r.status_code == 200
        items = r.json()["items"]
        assert all(i["category"] == "ribbon" for i in items)
        assert len(items) >= 5

    def test_search_zebra(self):
        r = requests.get(f"{API}/products", params={"q": "zebra"})
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) >= 2
        for i in items:
            hay = (i["name"] + i["brand"] + i["slug"] + " ".join(i.get("tags", []))).lower()
            assert "zebra" in hay

    def test_search_regex_escaped(self):
        # special regex chars should not 500
        r = requests.get(f"{API}/products", params={"q": ".*("})
        assert r.status_code == 200

    def test_filter_featured_true(self):
        r = requests.get(f"{API}/products", params={"featured": "true"})
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) > 0
        assert all(i["featured"] is True for i in items)

    def test_invalid_category_rejected(self):
        r = requests.get(f"{API}/products", params={"category": "invalid"})
        assert r.status_code == 422


# -------- Public GET /products/{slug} --------
class TestProductDetail:
    def test_get_zebra_zd621(self):
        r = requests.get(f"{API}/products/zebra-zd621")
        assert r.status_code == 200
        p = r.json()
        assert p["slug"] == "zebra-zd621"
        assert p["category"] == "printer"
        assert p.get("specs") and len(p["specs"]) > 0
        assert p.get("use_cases") and len(p["use_cases"]) > 0
        assert p.get("tags") and len(p["tags"]) > 0
        assert p.get("long_desc")
        assert p.get("image_url")
        assert "_id" not in p

    def test_get_unknown_slug_404(self):
        r = requests.get(f"{API}/products/nonexistent-slug-xyz")
        assert r.status_code == 404


# -------- Admin CRUD --------
VALID_PAYLOAD = {
    "slug": "test-aidc-product",
    "category": "printer",
    "name": "TEST AIDC Product",
    "brand": "TESTBrand",
    "form": "Desktop",
    "dpi": 203,
    "width": "4-inch",
    "tags": ["TEST", "Desktop"],
    "short_desc": "Test product for pytest regression.",
    "long_desc": "Longer test description for the test product created by pytest.",
    "specs": ["Spec A", "Spec B"],
    "use_cases": ["UC1", "UC2"],
    "image_url": "",
    "featured": False,
}


class TestAdminProductsAuth:
    def test_post_without_token_401(self):
        r = requests.post(f"{API}/admin/products", json=VALID_PAYLOAD)
        assert r.status_code == 401

    def test_put_without_token_401(self):
        r = requests.put(f"{API}/admin/products/zebra-zd621", json={"name": "x"})
        assert r.status_code == 401

    def test_delete_without_token_401(self):
        r = requests.delete(f"{API}/admin/products/zebra-zd621")
        assert r.status_code == 401


class TestAdminProductsCRUD:
    @pytest.fixture(autouse=True)
    def _cleanup(self, auth_headers):
        # Pre-clean
        requests.delete(f"{API}/admin/products/{VALID_PAYLOAD['slug']}", headers=auth_headers)
        yield
        requests.delete(f"{API}/admin/products/{VALID_PAYLOAD['slug']}", headers=auth_headers)

    def test_invalid_payload_422_bad_category(self, auth_headers):
        bad = {**VALID_PAYLOAD, "category": "badcategory"}
        r = requests.post(f"{API}/admin/products", json=bad, headers=auth_headers)
        assert r.status_code == 422

    def test_invalid_payload_422_short_slug(self, auth_headers):
        bad = {**VALID_PAYLOAD, "slug": "a"}
        r = requests.post(f"{API}/admin/products", json=bad, headers=auth_headers)
        assert r.status_code == 422

    def test_create_product_201(self, auth_headers):
        r = requests.post(f"{API}/admin/products", json=VALID_PAYLOAD, headers=auth_headers)
        assert r.status_code == 201, r.text
        p = r.json()
        assert p["slug"] == VALID_PAYLOAD["slug"]
        assert p["name"] == VALID_PAYLOAD["name"]
        assert "id" in p
        # Verify persisted via public GET
        g = requests.get(f"{API}/products/{VALID_PAYLOAD['slug']}")
        assert g.status_code == 200
        assert g.json()["name"] == VALID_PAYLOAD["name"]

    def test_duplicate_slug_409(self, auth_headers):
        r1 = requests.post(f"{API}/admin/products", json=VALID_PAYLOAD, headers=auth_headers)
        assert r1.status_code == 201
        r2 = requests.post(f"{API}/admin/products", json=VALID_PAYLOAD, headers=auth_headers)
        assert r2.status_code == 409

    def test_partial_update_preserves_untouched_fields(self, auth_headers):
        # Create first
        requests.post(f"{API}/admin/products", json=VALID_PAYLOAD, headers=auth_headers)
        # Update only name
        r = requests.put(
            f"{API}/admin/products/{VALID_PAYLOAD['slug']}",
            json={"name": "TEST Updated Name"},
            headers=auth_headers,
        )
        assert r.status_code == 200, r.text
        assert r.json()["name"] == "TEST Updated Name"
        # Verify other fields preserved
        g = requests.get(f"{API}/products/{VALID_PAYLOAD['slug']}")
        gd = g.json()
        assert gd["name"] == "TEST Updated Name"
        assert gd["brand"] == VALID_PAYLOAD["brand"]
        assert gd["short_desc"] == VALID_PAYLOAD["short_desc"]
        assert gd["category"] == VALID_PAYLOAD["category"]

    def test_update_unknown_slug_404(self, auth_headers):
        r = requests.put(
            f"{API}/admin/products/unknown-slug-xyz",
            json={"name": "Valid Name"},
            headers=auth_headers,
        )
        assert r.status_code == 404

    def test_delete_then_redelete_404(self, auth_headers):
        requests.post(f"{API}/admin/products", json=VALID_PAYLOAD, headers=auth_headers)
        r1 = requests.delete(f"{API}/admin/products/{VALID_PAYLOAD['slug']}", headers=auth_headers)
        assert r1.status_code == 200
        # Public GET should now be 404
        g = requests.get(f"{API}/products/{VALID_PAYLOAD['slug']}")
        assert g.status_code == 404
        # Re-delete
        r2 = requests.delete(f"{API}/admin/products/{VALID_PAYLOAD['slug']}", headers=auth_headers)
        assert r2.status_code == 404


# -------- Regression: existing admin routes still work --------
class TestAdminRegression:
    def test_admin_me(self, auth_headers):
        r = requests.get(f"{API}/admin/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_admin_inquiries_list(self, auth_headers):
        r = requests.get(f"{API}/admin/inquiries", headers=auth_headers)
        assert r.status_code == 200
        assert "items" in r.json()

    def test_admin_inquiries_export_csv(self, auth_headers):
        r = requests.get(f"{API}/admin/inquiries/export.csv", headers=auth_headers)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
