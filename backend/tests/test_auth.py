import pytest


@pytest.mark.asyncio
async def test_register_and_login_flow(client):
    # 1. Register
    reg_payload = {
        "email": "sarah.smith@example.com",
        "password": "SecurePassword123!",
        "full_name": "Sarah Smith",
        "terms_consent": True,
        "biometric_consent": True
    }
    res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    user_data = res.json()
    assert user_data["email"] == "sarah.smith@example.com"
    assert "id" in user_data

    # 2. Login
    login_payload = {
        "email": "sarah.smith@example.com",
        "password": "SecurePassword123!"
    }
    res_login = await client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token_data = res_login.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 3. Access authenticated endpoint /users/me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = await client.get("/api/v1/users/me", headers=headers)
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert me_data["email"] == "sarah.smith@example.com"


@pytest.mark.asyncio
async def test_duplicate_registration_rejected(client):
    payload = {
        "email": "dup@example.com",
        "password": "Password123!"
    }
    res1 = await client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = await client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
