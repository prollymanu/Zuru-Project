from decimal import Decimal
from rest_framework import serializers
from .models import Wallet, ImmutableTransaction


class WalletStatusSerializer(serializers.ModelSerializer):
    has_pin = serializers.SerializerMethodField()
    wallet_id = serializers.CharField(source='id')

    class Meta:
        model = Wallet
        fields = ['has_pin', 'wallet_id']

    def get_has_pin(self, obj):
        return bool(obj.pin_hash)


class WithdrawalSerializer(serializers.Serializer):
    """
    Validates incoming withdrawal requests.
    Uses snake_case keys that Django/DRF standards dictate.
    The frontend must send: { amount, withdrawal_method }
    """
    VALID_METHODS = [choice[0] for choice in ImmutableTransaction.WITHDRAWAL_METHODS]

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal('10.00'),  # Must be Decimal — string causes TypeError on comparison
        error_messages={
            'required': 'amount is required.',
            'invalid': 'amount must be a valid number.',
            'min_value': 'Minimum withdrawal amount is $10.00.',
        }
    )
    withdrawal_method = serializers.ChoiceField(
        choices=VALID_METHODS,
        error_messages={
            'required': 'withdrawal_method is required.',
            'invalid_choice': (
                'Invalid withdrawal_method. Valid options are: CARD, APPLE_PAY, PAYPAL.'
            ),
        }
    )

    def validate_withdrawal_method(self, value):
        """Normalise to uppercase so 'card' or 'Card' are also accepted."""
        normalised = str(value).upper()
        if normalised not in self.VALID_METHODS:
            raise serializers.ValidationError(
                f'Invalid withdrawal_method. Valid options are: {self.VALID_METHODS}.'
            )
        return normalised
