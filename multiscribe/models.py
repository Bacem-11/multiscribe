from django.db import models
from django.contrib.auth.models import User
from dateutil.relativedelta import relativedelta
from datetime import date

class Subscription(models.Model):
    BILLING_CHOICES = [
        ('monthly', 'Mensuel'),
        ('yearly', 'Annuel'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=7, decimal_places=2)
    billing_type = models.CharField(max_length=10, choices=BILLING_CHOICES)
    next_payment_date = models.DateField()

    # ✅ Nouveau champ logo
    logo = models.URLField(blank=True, null=True, help_text="URL du logo de l'abonnement (facultatif)")

    def __str__(self):
        return f"{self.name} - {self.user.username}"
