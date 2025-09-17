from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from .models import Entry
from .gemini_requests import generate_ai_analysis
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password


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


@require_POST
def password_check(request):
    """AJAX endpoint: validate a password using Django's validators.

    Expects JSON payload: { "password": "..." }
    Returns JSON: { valid: bool, errors: [...], codes: [...], too_common: bool }
    """
    try:
        import json

        data = json.loads(request.body.decode() or "{}")
        password = data.get("password", "")
    except Exception:
        return JsonResponse({"valid": False, "errors": ["invalid request"]}, status=400)

    try:
        validate_password(password)
        return JsonResponse({"valid": True, "errors": [], "codes": [], "too_common": False})
    except ValidationError as exc:
        codes = [getattr(err, "code", None) for err in exc.error_list]
        errors = [str(err) for err in exc.error_list]
        too_common = any((c == "password_too_common") or ("too common" in e.lower()) for c, e in zip(codes, errors))
        return JsonResponse({"valid": False, "errors": errors, "codes": codes, "too_common": too_common})

