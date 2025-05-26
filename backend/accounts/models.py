from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('data_scientist', 'Data Scientist'),
        ('responsable_marketing', 'Responsable Marketing'),
    )
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='data_scientist')

    def __str__(self):
        return f"{self.username} ({self.role})"
