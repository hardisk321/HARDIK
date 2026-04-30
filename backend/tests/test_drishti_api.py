"""Backend API tests for DRISHTI Auto ID Solution."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://aidc-product.preview.emergentagent.com').rstrip('/')


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Root health ----------
def test_root_returns_ok(api):
    r = api.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert "DRISHTI" in data.get("message", "")


# ---------- Inquiry CRUD ----------
def test_create_inquiry_valid_payload(api):
    payload = {
        "name": "TEST_John Doe",
        "email": "test_john@example.com",
        "phone": "+1-555-0100",
        "company": "TEST Corp",
        "interested_in": "RFID",
        "message": "Please send me more info about your RFID solution."
    }
    r = api.post(f"{BASE_URL}/api/inquiries", json=payload)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert data["interested_in"] == "RFID"
    assert "id" in data and isinstance(data["id"], str)
    assert "_id" not in data
    assert "created_at" in data


def test_create_inquiry_missing_required_fields(api):
    r = api.post(f"{BASE_URL}/api/inquiries", json={"name": "TEST", "email": "a@b.com"})
    assert r.status_code in (400, 422)


def test_create_inquiry_invalid_email(api):
    payload = {
        "name": "TEST_InvalidEmail",
        "email": "not-an-email",
        "message": "Testing bad email format here."
    }
    r = api.post(f"{BASE_URL}/api/inquiries", json=payload)
    assert r.status_code in (400, 422)


def test_create_inquiry_short_message(api):
    # message < 5 chars should fail
    payload = {
        "name": "TEST_Short",
        "email": "test_short@example.com",
        "message": "hi"
    }
    r = api.post(f"{BASE_URL}/api/inquiries", json=payload)
    assert r.status_code in (400, 422)


def test_list_inquiries_returns_list_and_excludes_mongo_id(api):
    # Ensure at least one inquiry exists
    api.post(f"{BASE_URL}/api/inquiries", json={
        "name": "TEST_ListProbe",
        "email": "test_list@example.com",
        "message": "List endpoint verification message."
    })
    r = api.get(f"{BASE_URL}/api/inquiries")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    for it in items:
        assert "_id" not in it
        assert "id" in it
        assert "email" in it
