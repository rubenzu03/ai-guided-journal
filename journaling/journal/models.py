from django.db import models

# Create your models here.
class Entry(models.Model):
    title = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)