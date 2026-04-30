"""Backend API tests for DRISHTI admin endpoints (iteration 2).
Covers: login, /admin/me, list/search/paginate inquiries, CSV export, delete, regression on public POST.
"""
import os
import time
import uuid
import pytest
import requests
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")
BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
ADMIN_EMAIL = "admin@drishti-aidc.com"
ADMIN_PASSWORD = "Drishti@2026"


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def token(api):
    r = api.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data and isinstance(data["access_token"], str)
    return data["access_token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def seeded_inquiry_ids(api):
    """Seed three TEST_ inquiries so list/search/pagination/delete have data."""
    ids = []
    suffix = uuid.uuid4().hex[:8]
    payloads = [
        {"name": f"TEST_Alpha_{suffix}", "email": f"alpha_{suffix}@example.com", "phone": "+1-555-0001",
         "company": "AlphaCorp", "interested_in": "RFID",
         "message": "Alpha wants RFID quote please send details soon."},
        {"name": f"TEST_Bravo_{suffix}", "email": f"bravo_{suffix}@example.com", "phone": "+1-555-0002",
         "company": "BravoIndustries", "interested_in": "Barcode",
         "message": "Bravo barcode inquiry, distribution warehouse."},
        {"name": f"TEST_searchme_{suffix}", "email": f"searchme_{suffix}@example.com",
         "company": "SearchMeLLC", "interested_in": "RTLS",
         "message": "uniquemarker_zzz1234 needle in haystack content."},
    ]
    for p in payloads:
        time.sleep(0.05)
        r = api.post(f"{BASE_URL}/api/inquiries", json=p)
        assert r.status_code == 201, r.text
        ids.append(r.json()["id"])
    return {"ids": ids, "suffix": suffix, "needle": "uniquemarker_zzz1234"}


# ---------- Login ----------
class TestAdminLogin:
    def test_login_success(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == 24 * 3600
        assert isinstance(data["access_token"], str) and len(data["access_token"]) > 30
        u = data["user"]
        assert u["email"] == ADMIN_EMAIL
        assert u["role"] == "admin"
        assert "id" in u and isinstance(u["id"], str)
        assert "_id" not in u
        assert "password_hash" not in u

    def test_login_wrong_password(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": "wrong-pass"})
        assert r.status_code == 401
        assert "detail" in r.json()

    def test_login_invalid_email_format(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"email": "not-an-email", "password": "x"})
        assert r.status_code == 422

    def test_login_unknown_user(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"email": "nobody@example.com", "password": "whatever"})
        assert r.status_code == 401


# ---------- /admin/me ----------
class TestAdminMe:
    def test_me_with_valid_token(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/me", headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "_id" not in data
        assert "password_hash" not in data

    def test_me_without_token(self, api):
        r = api.get(f"{BASE_URL}/api/admin/me")
        assert r.status_code in (401, 403)

    def test_me_with_malformed_token(self, api):
        r = api.get(f"{BASE_URL}/api/admin/me", headers={"Authorization": "Bearer not.a.jwt"})
        assert r.status_code == 401

    def test_me_with_expired_signature_invalid_secret(self, api):
        # Token signed with wrong secret -> InvalidSignatureError -> 401
        import jwt as pyjwt
        from datetime import datetime, timezone, timedelta
        bad = pyjwt.encode(
            {"sub": "x", "email": "x", "role": "admin", "type": "access",
             "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
            "wrong-secret", algorithm="HS256"
        )
        r = api.get(f"{BASE_URL}/api/admin/me", headers={"Authorization": f"Bearer {bad}"})
        assert r.status_code == 401


# ---------- /admin/inquiries listing ----------
class TestAdminListInquiries:
    def test_list_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/inquiries")
        assert r.status_code in (401, 403)

    def test_list_returns_envelope(self, api, auth_headers, seeded_inquiry_ids):
        r = api.get(f"{BASE_URL}/api/admin/inquiries", headers=auth_headers)
        assert r.status_code == 200
        body = r.json()
        for k in ("total", "limit", "skip", "items"):
            assert k in body, f"missing key {k}"
        assert isinstance(body["items"], list)
        assert body["total"] >= 3
        # newest-first sort & no _id leak
        prev = None
        for it in body["items"]:
            assert "_id" not in it
            assert "id" in it and "email" in it and "created_at" in it
            if prev is not None:
                assert it["created_at"] <= prev, "items not sorted newest first"
            prev = it["created_at"]

    def test_list_search_filter(self, api, auth_headers, seeded_inquiry_ids):
        needle = seeded_inquiry_ids["needle"]
        r = api.get(f"{BASE_URL}/api/admin/inquiries", headers=auth_headers, params={"q": needle})
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1
        assert all(needle in (it.get("message") or "") for it in body["items"]) or \
               any(needle in (it.get("message") or "") for it in body["items"])

    def test_list_search_no_match(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/inquiries", headers=auth_headers,
                    params={"q": "nooneshouldevermatch_xxxxxxxxxxxx"})
        assert r.status_code == 200
        assert r.json()["total"] == 0
        assert r.json()["items"] == []

    def test_list_pagination(self, api, auth_headers, seeded_inquiry_ids):
        r1 = api.get(f"{BASE_URL}/api/admin/inquiries", headers=auth_headers,
                     params={"limit": 2, "skip": 0})
        r2 = api.get(f"{BASE_URL}/api/admin/inquiries", headers=auth_headers,
                     params={"limit": 2, "skip": 2})
        assert r1.status_code == 200 and r2.status_code == 200
        b1, b2 = r1.json(), r2.json()
        assert b1["limit"] == 2 and b1["skip"] == 0
        assert b2["limit"] == 2 and b2["skip"] == 2
        assert len(b1["items"]) <= 2
        ids1 = {i["id"] for i in b1["items"]}
        ids2 = {i["id"] for i in b2["items"]}
        assert ids1.isdisjoint(ids2), "pagination returned overlapping items"


# ---------- /admin/inquiries/export.csv ----------
class TestAdminExportCsv:
    def test_export_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/inquiries/export.csv")
        assert r.status_code in (401, 403)

    def test_export_returns_csv(self, api, auth_headers, seeded_inquiry_ids):
        r = api.get(f"{BASE_URL}/api/admin/inquiries/export.csv", headers=auth_headers)
        assert r.status_code == 200
        ct = r.headers.get("content-type", "")
        assert "text/csv" in ct, f"unexpected content-type: {ct}"
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd.lower() and ".csv" in cd
        text = r.text
        first_line = text.splitlines()[0]
        assert first_line == "id,created_at,name,email,phone,company,interested_in,message"
        # Should contain at least one of our seeded names
        assert "TEST_Alpha_" in text or "TEST_Bravo_" in text


# ---------- DELETE /admin/inquiries/{id} ----------
class TestAdminDeleteInquiry:
    def test_delete_requires_auth(self, api, seeded_inquiry_ids):
        target = seeded_inquiry_ids["ids"][1]
        r = api.delete(f"{BASE_URL}/api/admin/inquiries/{target}")
        assert r.status_code in (401, 403)

    def test_delete_then_redelete_404(self, api, auth_headers, seeded_inquiry_ids):
        target = seeded_inquiry_ids["ids"][0]
        r1 = api.delete(f"{BASE_URL}/api/admin/inquiries/{target}", headers=auth_headers)
        assert r1.status_code == 200, r1.text
        body = r1.json()
        assert body.get("ok") is True
        assert body.get("deleted") == target
        # Re-delete should now 404
        r2 = api.delete(f"{BASE_URL}/api/admin/inquiries/{target}", headers=auth_headers)
        assert r2.status_code == 404

    def test_delete_unknown_id(self, api, auth_headers):
        r = api.delete(f"{BASE_URL}/api/admin/inquiries/does-not-exist-{uuid.uuid4()}", headers=auth_headers)
        assert r.status_code == 404


# ---------- Regression ----------
class TestPublicInquiryRegression:
    def test_public_post_still_works(self, api):
        suffix = uuid.uuid4().hex[:6]
        payload = {
            "name": f"TEST_RegressPublic_{suffix}",
            "email": f"public_{suffix}@example.com",
            "message": "Regression check that public form still works."
        }
        r = api.post(f"{BASE_URL}/api/inquiries", json=payload)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["email"] == payload["email"]
        assert "_id" not in body
