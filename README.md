# Mini Gestionnaire d’Abonnements - Django

Ce projet permet de gérer des abonnements mensuels/annuels (Netflix, Spotify, etc.).

## Fonctionnalités
- Ajout / modification / suppression d’abonnements
- Logos dynamiques selon le nom de l’abonnement
- Authentification utilisateur
- API REST (optionnel)
- Interface simple avec du JavaScript pour l'édition en ligne

## Technologies utilisées
- Python 3
- Django 5.x
- SQLite3
- JavaScript Vanilla
- HTML/CSS
- Django REST Framework 

## Installation

```bash
git clone https://github.com/Bacem-11/multiscribe.git
cd multiscribe
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # pour accéder à l'admin
python manage.py runserver

## Auteur 
Bacem Touati 2025