# DRISHTI Auth Testing Playbook

## Admin Credentials (seeded from backend/.env on startup)
See `/app/memory/test_credentials.md` for the actual values.

## Endpoints
- POST `/api/admin/login` — body `{email, password}` → returns `{access_token, token_type, user}`
- GET `/api/admin/me` — protected via `Authorization: Bearer <token>` header → returns admin user
- GET `/api/admin/inquiries?limit=&skip=&q=` — protected, lists inquiries (newest first)
- GET `/api/admin/inquiries/export.csv` — protected, streams CSV of all inquiries
- DELETE `/api/admin/inquiries/{id}` — protected

## Mongo verification
```
mongosh
use test_database
db.users.find({role:"admin"}).pretty()      # bcrypt hash should start with $2b$
db.inquiries.find().sort({created_at:-1}).limit(5)
```

## Curl smoke test
```bash
API=http://localhost:8001/api
# Login
TOKEN=$(curl -s -X POST $API/admin/login -H "Content-Type: application/json" \
  -d '{"email":"admin@drishti-aidc.com","password":"Drishti@2026"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
echo "Token: $TOKEN"

# Protected routes
curl -s $API/admin/me -H "Authorization: Bearer $TOKEN"
curl -s "$API/admin/inquiries?limit=5" -H "Authorization: Bearer $TOKEN"
curl -s "$API/admin/inquiries/export.csv" -H "Authorization: Bearer $TOKEN" -o /tmp/leads.csv && head /tmp/leads.csv

# Negative
curl -s -X POST $API/admin/login -H "Content-Type: application/json" -d '{"email":"admin@drishti-aidc.com","password":"wrong"}'   # 401
curl -s $API/admin/me                                                                                                       # 401
curl -s $API/admin/me -H "Authorization: Bearer bad.token.here"                                                             # 401
```
