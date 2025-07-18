from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required

from .forms import CustomUserCreationForm, SubscriptionForm
from .models import Subscription


# --- Authentification ---

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('multiscribe-home')  
        else:
            messages.error(request, 'Identifiants invalides.')
    return render(request, 'multiscribe/login.html')


def inscription(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Compte créé avec succès.")
            return redirect('login')
    else:
        form = CustomUserCreationForm()
    return render(request, 'multiscribe/inscription.html', {'form': form})




@login_required
def home(request):
    subscriptions = Subscription.objects.filter(user=request.user)

    total_mensuel = 0
    for sub in subscriptions:
        if sub.billing_type == 'monthly':
            total_mensuel += sub.price
        elif sub.billing_type == 'yearly':
            total_mensuel += sub.price / 12

    return render(request, 'multiscribe/home.html', {
        'subscriptions': subscriptions,
        'total_mensuel': round(total_mensuel, 2)
    })




@login_required
def liste(request):
    subscriptions = Subscription.objects.filter(user=request.user)
    return render(request, 'multiscribe/liste.html', {'subscriptions': subscriptions})




@login_required
def ajouter_abonnement(request):
    if request.method == 'POST':
        form = SubscriptionForm(request.POST)
        if form.is_valid():
            abonnement = form.save(commit=False)
            abonnement.user = request.user
            abonnement.save()
            messages.success(request, "Abonnement ajouté avec succès.")
            return redirect('multiscribe-liste')
    else:
        form = SubscriptionForm()
    return render(request, 'multiscribe/abonnement_form.html', {'form': form})




@login_required
def modifier_abonnement(request, pk):
    abonnement = get_object_or_404(Subscription, pk=pk, user=request.user)
    if request.method == 'POST':
        form = SubscriptionForm(request.POST, instance=abonnement)
        if form.is_valid():
            form.save()
            messages.success(request, "Abonnement modifié.")
            return redirect('multiscribe-liste')
    else:
        form = SubscriptionForm(instance=abonnement)
    return render(request, 'multiscribe/abonnement_form.html', {'form': form})




@login_required
def supprimer_abonnement(request, pk):
    abonnement = get_object_or_404(Subscription, pk=pk, user=request.user)
    if request.method == 'POST':
        abonnement.delete()
        messages.success(request, "Abonnement supprimé.")
        return redirect('multiscribe-liste')
    return render(request, 'multiscribe/confirm_delete.html', {'abonnement': abonnement})




from django.http import JsonResponse
from django.utils import timezone

@login_required
def abonnements_json(request):
    abonnements = Subscription.objects.filter(user=request.user)
    today = timezone.now().date()

    data = []
    for ab in abonnements:
        data.append({
            'id': ab.id,
            'nom': ab.name,
            'prix': float(ab.price),
            'type_facturation': ab.billing_type,
            'date_prochain_paiement': ab.next_payment_date.strftime('%Y-%m-%d'),
        })
    return JsonResponse(data, safe=False)
