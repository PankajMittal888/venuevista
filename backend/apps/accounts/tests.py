import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestAuthentication:
    def setup_method(self):
        self.client = APIClient()

    def test_registration_success(self):
        payload = {
            "username": "testattendee",
            "email": "testattendee@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "first_name": "Test",
            "last_name": "Attendee",
            "phone": "1234567890"
        }
        response = self.client.post("/api/auth/register/", payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert response.data["user"]["role"] == "ATTENDEE"

        # Check DB
        user = User.objects.get(email="testattendee@example.com")
        assert user.role == "ATTENDEE"

    def test_registration_duplicate_email(self):
        User.objects.create_user(
            username="existinguser",
            email="existing@example.com",
            password="Password123!"
        )
        payload = {
            "username": "newuser",
            "email": "existing@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!"
        }
        response = self.client.post("/api/auth/register/", payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_success_and_jwt(self):
        user = User.objects.create_user(
            username="loginuser",
            email="login@example.com",
            password="SecurePassword123!"
        )
        response = self.client.post("/api/auth/login/", {
            "email": "login@example.com",
            "password": "SecurePassword123!"
        }, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert response.data["user"]["email"] == "login@example.com"

    def test_login_invalid_credentials(self):
        User.objects.create_user(
            username="validuser",
            email="valid@example.com",
            password="CorrectPassword123!"
        )
        response = self.client.post("/api/auth/login/", {
            "email": "valid@example.com",
            "password": "WrongPassword!"
        }, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_user_profile_authenticated(self):
        user = User.objects.create_user(
            username="profileuser",
            email="profile@example.com",
            password="SecurePassword123!",
            role="PRODUCER"
        )
        self.client.force_authenticate(user=user)
        response = self.client.get("/api/auth/profile/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == "profile@example.com"
        assert response.data["role"] == "PRODUCER"

    def test_user_profile_unauthenticated(self):
        response = self.client.get("/api/auth/profile/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_and_blacklist(self):
        user = User.objects.create_user(
            username="logoutuser",
            email="logout@example.com",
            password="SecurePassword123!"
        )
        login_resp = self.client.post("/api/auth/login/", {
            "email": "logout@example.com",
            "password": "SecurePassword123!"
        }, format="json")
        access_token = login_resp.data["access"]
        refresh_token = login_resp.data["refresh"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        logout_resp = self.client.post("/api/auth/logout/", {"refresh": refresh_token}, format="json")
        assert logout_resp.status_code == status.HTTP_200_OK

        # Trying to refresh with the blacklisted token should fail
        refresh_resp = self.client.post("/api/auth/token/refresh/", {"refresh": refresh_token}, format="json")
        assert refresh_resp.status_code == status.HTTP_401_UNAUTHORIZED
