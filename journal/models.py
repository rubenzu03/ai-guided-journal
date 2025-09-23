from django.db import models
from django.conf import settings
import markdown
import bleach


# Create your models here.
class Entry(models.Model):
    text = models.TextField()
    ai_analysis = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="entries",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def render_ai_analysis(self):
        if not self.ai_analysis:
            return ""
        
        html = markdown.markdown(self.ai_analysis, extensions=["extra", "sane_lists"], output_format="html5")

        allowed_tags = [
            "a",
            "abbr",
            "acronym",
            "b",
            "blockquote",
            "code",
            "em",
            "i",
            "li",
            "ol",
            "strong",
            "ul",
            "p",
            "pre",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "br",
            "hr",
        ]

        allowed_attrs = {
            "a": ["href", "title", "rel"],
        }

        cleaned = bleach.clean(html, tags=allowed_tags, attributes=allowed_attrs, strip=True)

        cleaned = bleach.linkify(cleaned)

        return cleaned