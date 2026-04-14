from rest_framework import serializers
from .models import Wallet

class WalletStatusSerializer(serializers.ModelSerializer):
    has_pin = serializers.SerializerMethodField()
    wallet_id = serializers.CharField(source='id')

    class Meta:
        model = Wallet
        fields = ['has_pin', 'wallet_id']
        
    def get_has_pin(self, obj):
        return bool(obj.pin_hash)
