from django.urls import path
from . import views
from django.contrib.auth import views as auth_views


urlpatterns = [
    path('login/', views.login_view, name='multiscribe-login'),
    path('signup/', views.inscription, name='multiscribe-inscription'),
    path('home/', views.home, name='multiscribe-home'),
    path('liste/', views.liste, name='multiscribe-liste'),
    path('ajouter/', views.ajouter_abonnement, name='ajouter_abonnement'),
    path('modifier/<int:pk>/', views.modifier_abonnement, name='modifier_abonnement'),
    path('supprimer/<int:pk>/', views.supprimer_abonnement, name='supprimer_abonnement'),
    path('logout/', auth_views.LogoutView.as_view(next_page='multiscribe-login'), name='multiscribe-logout'),
     path('api/abonnements/', views.abonnements_json, name='abonnements_json'),

    
]   