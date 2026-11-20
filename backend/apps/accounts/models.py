# from django.contrib.auth.models import AbstractUser, BaseUserManager
# from django.db import models


# class CustomUserManager(BaseUserManager):
#     """Custom user manager where email is the unique identifier for auth."""

#     def create_user(self, email, username, password=None, **extra_fields):
#         if not email:
#             raise ValueError('The Email field must be set')
#         if not username:
#             raise ValueError('The Username field must be set')
#         email = self.normalize_email(email)
#         extra_fields.setdefault('is_active', True)
#         user = self.model(email=email, username=username, **extra_fields)
#         user.set_password(password)
#         user.save(using=self._db)
#         return user

#     def create_superuser(self, email, username, password=None, **extra_fields):
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('is_superuser', True)
#         extra_fields.setdefault('role', User.Role.PRODUCER)

#         if extra_fields.get('is_staff') is not True:
#             raise ValueError('Superuser must have is_staff=True.')
#         if extra_fields.get('is_superuser') is not True:
#             raise ValueError('Superuser must have is_superuser=True.')

#         return self.create_user(email, username, password, **extra_fields)


# class User(AbstractUser):
#     class Role(models.TextChoices):
#         PRODUCER = 'PRODUCER', 'Producer'
#         CONTENT_MANAGER = 'CONTENT_MANAGER', 'Content Manager'

#     name = models.CharField(max_length=255, blank=True)
#     email = models.EmailField(unique=True)
#     username = models.CharField(max_length=150, unique=True)
#     role = models.CharField(
#         max_length=20,
#         choices=Role.choices,
#         default=Role.PRODUCER,
#     )
#     created_at = models.DateTimeField(auto_now_add=True)

#     objects = CustomUserManager()

#     USERNAME_FIELD = 'email'
#     REQUIRED_FIELDS = ['username', 'name']

#     def __str__(self):
#         return f"{self.email} ({self.role})"


from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        PRODUCER = "PRODUCER", "Producer"
        CONTENT_MANAGER = "CONTENT_MANAGER", "Content Manager"
        ATTENDEE = "ATTENDEE", "Attendee"

    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.ATTENDEE,
    )

    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"