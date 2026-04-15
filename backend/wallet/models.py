from django.db import models
from django.conf import settings
from django.core.exceptions import PermissionDenied

class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet')
    pin_hash = models.CharField(max_length=128, blank=True, null=True)
    foreign_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    foreign_currency = models.CharField(max_length=10, default='USD')
    kes_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user}'s Wallet"

class ImmutableTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('DEPOSIT', 'Deposit'),
        ('CONVERSION', 'Conversion'),
        ('TILL', 'M-Pesa Till'),
        ('PAYBILL', 'M-Pesa Paybill'),
        ('SEND_MONEY', 'M-Pesa Send Money'),
        ('WITHDRAWAL', 'Withdrawal'),
    )
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    )
    WITHDRAWAL_METHODS = (
        ('CARD', 'Card'),
        ('APPLE_PAY', 'Apple Pay'),
        ('PAYPAL', 'PayPal'),
    )
    
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10)
    fee_applied = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    reference_code = models.CharField(max_length=100, unique=True)
    withdrawal_method = models.CharField(max_length=20, choices=WITHDRAWAL_METHODS, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def delete(self, *args, **kwargs):
        raise PermissionDenied("Transactions are immutable and cannot be deleted.")

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} {self.currency} ({self.status})"
