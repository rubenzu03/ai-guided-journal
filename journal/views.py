from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from .models import Entry
from .gemini_requests import generate_ai_analysis


# Create your views here.

@login_required
def home(request):
    if request.method == "POST":
        text = request.POST.get("text")
        ai_analysis = generate_ai_analysis(text)
        Entry.objects.create(text=text, ai_analysis=ai_analysis, owner=request.user)
        return redirect("home")
    entries = Entry.objects.filter(owner=request.user).order_by("-created_at")
    return render(request, "home.html", {"entries": entries})

@login_required
def entries(request):
    entries = Entry.objects.filter(owner=request.user).order_by("-created_at")
    return render(request, "entries.html", {"entries": entries})


def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, 'Account created successfully. Please log in.')
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})

