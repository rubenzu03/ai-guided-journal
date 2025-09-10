from django.shortcuts import render, redirect
from .models import Entry
from .gemini_requests import generate_ai_analysis


# Create your views here.

def home(request):
    if request.method == "POST":
        text = request.POST.get("text")
        ai_analysis = generate_ai_analysis(text)
        Entry.objects.create(text=text, ai_analysis=ai_analysis)
        return redirect("home")
    entries = Entry.objects.all().order_by("-created_at")
    return render(request, "home.html", {"entries": entries})

def entries(request):
    entries = Entry.objects.all().order_by("-created_at")
    return render(request, "entries.html", {"entries": entries})

