from django.db import models

# Create your models here.
class Entry(models.Model):
    text = models.TextField()
    ai_analysis = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)