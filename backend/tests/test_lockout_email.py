"""Iteration 3 backend tests: brute-force lockout on /api/admin/login + email no-op background task."""
import os
import time
import uuid
import pytest
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv("/app/frontend/.env")
load_dotenv("/app/backend/.env")
BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
ADMIN_EMAIL = "admin@drishti-aidc.com"
ADMIN_PASSWORD = "Drishti@2026"
MAX = int(os.environ.get('LOGIN_LOCKOUT_MAX_ATTEMPTS', '5'))

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def mongo():
    c = MongoClient(MONGO_URL)
    yield c[DB_NAME]
    c.close()


@pytest.fixture(autouse=True)
def clean_login_attempts(mongo):
    """Wipe login_attempts collection before every test so lockout state is isolated."""
    mongo.login_attempts.delete_many({})
    yield
    mongo.login_attempts.delete_many({})


# ---------- Brute-force lockout ----------
class TestBruteForceLockout:
    def test_wrong_password_5_times_then_429(self, api):
        """5 wrong-password 401s, 6th request returns 429 with Retry-After."""
        # Use a unique email so this identifier is isolated from other tests / ADMIN_EMAIL
        email = ADMIN_EMAIL
        for i in range(MAX):
            r = api.post(f"{BASE_URL}/api/admin/login",
                         json={"email": email, "password": f"wrong-{i}"})
            assert r.status_code == 401, f"attempt {i + 1} expected 401, got {r.status_code}: {r.text}"

        # 6th attempt must be locked out
        r6 = api.post(f"{BASE_URL}/api/admin/login",
                      json={"email": email, "password": "wrong-6"})
        assert r6.status_code == 429, f"expected 429 on 6th, got {r6.status_code}: {r6.text}"
        assert "Retry-After" in r6.headers, "Retry-After header missing on 429 response"
        retry = int(r6.headers["Retry-After"])
        assert retry > 0, f"Retry-After must be positive, got {retry}"
        body = r6.json()
        assert "detail" in body

    def test_correct_password_within_lockout_still_429(self, api):
        """After lockout triggered, even correct password returns 429."""
        email = ADMIN_EMAIL
        for i in range(MAX):
            api.post(f"{BASE_URL}/api/admin/login",
                     json={"email": email, "password": f"wrong-{i}"})
        r = api.post(f"{BASE_URL}/api/admin/login",
                     json={"email": email, "password": ADMIN_PASSWORD})
        assert r.status_code == 429, f"correct pw during lockout should be 429, got {r.status_code}"
        assert "Retry-After" in r.headers

    def test_successful_login_clears_attempts(self, api, mongo):
        """A few failed logins then a successful one clears the counter in DB."""
        email = ADMIN_EMAIL
        # 3 failures (below lockout threshold)
        for i in range(3):
            r = api.post(f"{BASE_URL}/api/admin/login",
                         json={"email": email, "password": f"bad-{i}"})
            assert r.status_code == 401

        # Successful login
        r_ok = api.post(f"{BASE_URL}/api/admin/login",
                        json={"email": email, "password": ADMIN_PASSWORD})
        assert r_ok.status_code == 200, r_ok.text
        token = r_ok.json()["access_token"]

        # login_attempts for this identifier should be cleared
        # We can't know the exact identifier (IP:email) server-side, but collection should
        # contain no doc pointing to this email substring
        remaining = list(mongo.login_attempts.find({"identifier": {"$regex": email}}))
        assert remaining == [], f"login_attempts not cleared: {remaining}"

        # /admin/me works post-clear
        r_me = api.get(f"{BASE_URL}/api/admin/me",
                       headers={"Authorization": f"Bearer {token}"})
        assert r_me.status_code == 200
        assert r_me.json()["email"] == email


# ---------- Valid admin login (post-reset) ----------
class TestAdminLoginStillWorks:
    def test_valid_login_returns_token(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data
        assert data["user"]["email"] == ADMIN_EMAIL

    def test_admin_me_after_login(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        token = r.json()["access_token"]
        r2 = api.get(f"{BASE_URL}/api/admin/me",
                     headers={"Authorization": f"Bearer {token}"})
        assert r2.status_code == 200


# ---------- Email background-task no-op ----------
class TestEmailNoop:
    def test_inquiry_post_returns_201_without_email_keys(self, api):
        """RESEND_API_KEY is empty → email helper logs 'skipped' but endpoint still returns 201."""
        suffix = uuid.uuid4().hex[:6]
        payload = {
            "name": f"TEST_EmailNoop_{suffix}",
            "email": f"emailnoop_{suffix}@example.com",
            "phone": "+1-555-9999",
            "company": "NoopCorp",
            "interested_in": "RFID",
            "message": "Verifying inquiry creation succeeds when RESEND_API_KEY is empty."
        }
        r = api.post(f"{BASE_URL}/api/inquiries", json=payload)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["email"] == payload["email"]
        assert "id" in body and isinstance(body["id"], str)
        assert "_id" not in body
        # Give background task a moment to run (no-op logs; no exception)
        time.sleep(0.4)

    def test_send_lead_notification_skips_gracefully(self):
        """Direct unit call to send_lead_notification with empty keys returns None without raising."""
        import sys, asyncio
        sys.path.insert(0, "/app/backend")
        # Ensure keys are empty for this import
        os.environ["RESEND_API_KEY"] = ""
        os.environ["NOTIFICATION_EMAIL"] = ""
        from email_service import send_lead_notification
        result = asyncio.run(send_lead_notification({
            "name": "TestLead", "email": "x@example.com", "message": "hi",
            "created_at": "2026-01-01T00:00:00+00:00"
        }))
        assert result is None


# ---------- Admin regression (iteration-2 endpoints still green) ----------
class TestAdminRegression:
    @pytest.fixture
    def token(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        return r.json()["access_token"]

    def test_list_inquiries(self, api, token):
        r = api.get(f"{BASE_URL}/api/admin/inquiries",
                    headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200
        body = r.json()
        assert "total" in body and "items" in body

    def test_export_csv(self, api, token):
        r = api.get(f"{BASE_URL}/api/admin/inquiries/export.csv",
                    headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")

    def test_search_regex_safe(self, api, token):
        """q parameter with regex metacharacters should not error (re.escape applied)."""
        r = api.get(f"{BASE_URL}/api/admin/inquiries",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"q": "(.*)[abc]+?"})
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 0 or isinstance(body["items"], list)

    def test_delete_nonexistent(self, api, token):
        r = api.delete(f"{BASE_URL}/api/admin/inquiries/ghost-{uuid.uuid4()}",
                       headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 404
