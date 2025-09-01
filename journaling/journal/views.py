from django.shortcuts import render, redirect
from .models import Entry


# Create your views here.

def home(request):
    if request.method == "POST":
        text = request.POST.get("text")
        Entry.objects.create(text=text)
        return redirect("home")
    entries = Entry.objects.all().order_by("-created_at")
    return render(request, "journal/home.html", {"entries": entries})

