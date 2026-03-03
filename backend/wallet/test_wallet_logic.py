from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from .models import Wallet, ImmutableTransaction
from .services import calculate_fee, hash_pin

User = get_user_model()

class WalletPhase2LogicTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@zuru.com', password='password123')
        self.wallet = Wallet.objects.create(
            user=self.user,
            pin_hash=hash_pin('1234'),
            foreign_balance=Decimal('100.00'),
            kes_balance=Decimal('10000.00')
        )

    def test_fee_calculations(self):
        # Conversion fee (1.5%)
        self.assertEqual(calculate_fee('CONVERSION', 100), Decimal('1.50'))
        # M-Pesa Till (Free)
        self.assertEqual(calculate_fee('TILL', 1000), Decimal('0.00'))
        # M-Pesa Paybill (0.5%)
        self.assertEqual(calculate_fee('PAYBILL', 1000), Decimal('5.00'))
        # M-Pesa Send Money (1.0%)
        self.assertEqual(calculate_fee('SEND_MONEY', 1000), Decimal('10.00'))

    def test_invalid_pin_rejection(self):
        from .views import WalletConvertView
        from rest_framework.test import APIRequestFactory, force_authenticate
        
        factory = APIRequestFactory()
        view = WalletConvertView.as_view()
        
        # Wrong PIN should return 403
        request = factory.post('/api/wallet/convert/', {'pin': 'wrong', 'from_account': 'FOREIGN', 'amount': '10'})
        force_authenticate(request, user=self.user)
        response = view(request)
        
        self.assertEqual(response.status_code, 403)

    def test_insufficient_funds_conversion(self):
        from .views import WalletConvertView
        from rest_framework.test import APIRequestFactory, force_authenticate
        
        factory = APIRequestFactory()
        view = WalletConvertView.as_view()
        
        # Try to convert more than balance (Amount 100 + Fee 1.5 = 101.5 > 100)
        request = factory.post('/api/wallet/convert/', {'pin': '1234', 'from_account': 'FOREIGN', 'amount': '100'})
        force_authenticate(request, user=self.user)
        response = view(request)
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('Insufficient foreign balance', response.data['error'])

    def test_successful_conversion_and_history(self):
        from .views import WalletConvertView
        from rest_framework.test import APIRequestFactory, force_authenticate
        
        factory = APIRequestFactory()
        view = WalletConvertView.as_view()
        
        # Convert 50 USD to KES (Fee 0.75 USD)
        request = factory.post('/api/wallet/convert/', {'pin': '1234', 'from_account': 'FOREIGN', 'amount': '50'})
        force_authenticate(request, user=self.user)
        response = view(request)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('transactions', response.data)
        self.assertEqual(len(response.data['transactions']), 1)
        self.assertEqual(response.data['transactions'][0]['type'], 'CONVERSION')
        
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.foreign_balance, Decimal('49.25'))

    def test_mpesa_payment_standardization(self):
        from .views import WalletMpesaPayView
        from rest_framework.test import APIRequestFactory, force_authenticate
        
        factory = APIRequestFactory()
        view = WalletMpesaPayView.as_view()
        
        # Send Money 1000 KES (Fee 10 KES)
        payload = {
            'pin': '1234',
            'type': 'send_money', # test lowercase handling
            'destination': '254712345678',
            'amount': '1000'
        }
        request = factory.post('/api/wallet/mpesa-pay/', payload)
        force_authenticate(request, user=self.user)
        response = view(request)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('transactions', response.data)
        self.assertEqual(response.data['transactions'][0]['type'], 'SEND_MONEY')
        
        self.wallet.refresh_from_db()
        # 10000 - (1000 + 10) = 8990
        self.assertEqual(self.wallet.kes_balance, Decimal('8990.00'))
