from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.contrib.auth.hashers import make_password, check_password
from .models import Wallet
from .services import hash_pin, verify_pin, calculate_fee

class WalletStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            wallet = request.user.wallet
            has_wallet = True
            pin_setup = bool(wallet.pin_hash)
        except Wallet.DoesNotExist:
            has_wallet = False
            pin_setup = False

        return Response({
            'has_wallet': has_wallet,
            'pin_setup': pin_setup
        }, status=status.HTTP_200_OK)

class WalletBalancesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            wallet = Wallet.objects.get(user=request.user)
        except Wallet.DoesNotExist:
            return Response({'error': 'Wallet not found.'}, status=status.HTTP_404_NOT_FOUND)

        transactions = wallet.transactions.order_by('-timestamp')[:10]
        transactions_data = [
            {
                "id": t.id,
                "type": t.transaction_type,
                "amount": str(t.amount),
                "fee": str(t.fee_applied),
                "timestamp": t.timestamp.strftime("%Y-%m-%d %H:%M"),
                "status": t.status
            }
            for t in transactions
        ]

        return Response({
            'foreign_balance': str(wallet.foreign_balance),
            'foreign_currency': wallet.foreign_currency,
            'kes_balance': str(wallet.kes_balance),
            'transactions': transactions_data,
        }, status=status.HTTP_200_OK)

class SetupPinView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        pin = request.data.get('pin')
        if not pin or len(str(pin)) != 4 or not str(pin).isdigit():
            return Response({'error': 'A valid 4-digit PIN is required.'}, status=status.HTTP_400_BAD_REQUEST)

        wallet, created = Wallet.objects.get_or_create(user=request.user)
        
        if wallet.pin_hash:
            return Response({'error': 'PIN is already set up.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # FIX: Securely hash before saving
        wallet.pin_hash = make_password(str(pin))
        wallet.save()
        
        return Response({'message': 'PIN successfully set.'}, status=status.HTTP_200_OK)

class VerifyPinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        pin = request.data.get('pin')
        if not pin:
            return Response({'error': 'PIN is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            wallet = request.user.wallet
        except Wallet.DoesNotExist:
            return Response({'error': 'Wallet not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not wallet.pin_hash:
            return Response({'error': 'PIN not set up for this wallet.'}, status=status.HTTP_400_BAD_REQUEST)

        # FIX: Strict verification using check_password
        if check_password(str(pin), wallet.pin_hash):
            transactions = wallet.transactions.order_by('-timestamp')[:10]
            transactions_data = [
                {
                    'transaction_type': t.transaction_type,
                    'amount': str(t.amount),
                    'currency': t.currency,
                    'status': t.status,
                    'reference_code': t.reference_code,
                    'timestamp': t.timestamp
                }
                for t in transactions
            ]
            return Response({
                'foreign_balance': str(wallet.foreign_balance),
                'foreign_currency': wallet.foreign_currency,
                'kes_balance': str(wallet.kes_balance),
                'recent_transactions': transactions_data
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid PIN.'}, status=status.HTTP_403_FORBIDDEN)

class WalletConvertView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        pin = request.data.get('pin')
        from_account = request.data.get('from_account')
        amount = request.data.get('amount')
        
        if not all([pin, from_account, amount]):
            return Response({'error': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(str(amount))
            # select_for_update locks the wallet row for the duration of this
            # atomic block, preventing concurrent requests from reading a stale
            # balance and passing the insufficient-funds check simultaneously.
            wallet = Wallet.objects.select_for_update().get(user=request.user)
        except (Wallet.DoesNotExist, ValueError):
            return Response({'error': 'Invalid request or wallet not found.'}, status=status.HTTP_400_BAD_REQUEST)

        # FIX: Strict verification using check_password
        if not check_password(str(pin), wallet.pin_hash):
            return Response({'error': 'Invalid PIN.'}, status=status.HTTP_403_FORBIDDEN)

        exchange_rate = Decimal('130.00')
        fee = calculate_fee('CONVERSION', amount)

        if from_account == 'FOREIGN':
            total_deduction = amount + fee
            if wallet.foreign_balance < total_deduction:
                return Response(
                    {'error': f'Insufficient foreign balance. You need {total_deduction:.4f} {wallet.foreign_currency} (including {fee:.4f} fee).'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            wallet.foreign_balance -= total_deduction
            wallet.kes_balance += (amount * exchange_rate)
            currency = wallet.foreign_currency
        elif from_account == 'KES':
            total_deduction = amount + fee
            if wallet.kes_balance < total_deduction:
                return Response(
                    {'error': f'Insufficient KES balance. You need {total_deduction:.4f} KES (including {fee:.4f} fee).'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            wallet.kes_balance -= total_deduction
            wallet.foreign_balance += (amount / exchange_rate)
            currency = 'KES'
        else:
            return Response({'error': "Invalid from_account. Use 'FOREIGN' or 'KES'."}, status=status.HTTP_400_BAD_REQUEST)

        # Explicit, targeted write — only the two balance columns are flushed.
        wallet.save(update_fields=['foreign_balance', 'kes_balance', 'updated_at'])

        from .models import ImmutableTransaction
        from .services import generate_reference_code
        # FIX: Ledger correctly records the dynamic fee
        ImmutableTransaction.objects.create(
            wallet=wallet,
            transaction_type='CONVERSION',
            amount=amount,
            currency=currency,
            fee_applied=fee,
            status='COMPLETED',
            reference_code=generate_reference_code('CONVERSION')
        )

        transactions = wallet.transactions.order_by('-timestamp')[:10]
        tx_data = [{
            "id": tx.id,
            "type": tx.transaction_type,
            "amount": str(tx.amount),
            "fee": str(tx.fee_applied),
            "timestamp": tx.timestamp.strftime("%Y-%m-%d %H:%M"),
            "status": tx.status
        } for tx in transactions]

        return Response({
            'message': 'Conversion successful.',
            'foreign_balance': str(wallet.foreign_balance),
            'foreign_currency': wallet.foreign_currency,
            'kes_balance': str(wallet.kes_balance),
            'transactions': tx_data
        }, status=status.HTTP_200_OK)

class WalletMpesaPayView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        pin = request.data.get('pin')
        mpesa_type = request.data.get('type')
        destination = request.data.get('destination')
        amount = request.data.get('amount')

        if not all([pin, mpesa_type, destination, amount]):
            return Response({'error': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(str(amount))
            # Row-level lock: same as ConvertView — prevents double-spend race.
            wallet = Wallet.objects.select_for_update().get(user=request.user)
        except (Wallet.DoesNotExist, ValueError):
            return Response({'error': 'Invalid request or wallet not found.'}, status=status.HTTP_400_BAD_REQUEST)

        # FIX: Strict verification using check_password
        if not check_password(str(pin), wallet.pin_hash):
            return Response({'error': 'Invalid PIN.'}, status=status.HTTP_403_FORBIDDEN)

        type_mapping = {
            'TILL': 'TILL',
            'PAYBILL': 'PAYBILL',
            'SEND_MONEY': 'SEND_MONEY'
        }
        
        tx_type_input = str(mpesa_type).upper()
        internal_type = type_mapping.get(tx_type_input)
        if not internal_type:
            return Response({'error': f'Invalid type: {tx_type_input}'}, status=status.HTTP_400_BAD_REQUEST)

        fee = calculate_fee(internal_type, amount)
        total_deduction = amount + fee

        if wallet.kes_balance < total_deduction:
            return Response(
                {'error': f'Insufficient funds. You need {total_deduction:.2f} KES (including {fee:.2f} KES fee).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        wallet.kes_balance -= total_deduction
        # Explicit, targeted write — only the KES balance column is flushed.
        wallet.save(update_fields=['kes_balance', 'updated_at'])

        from .models import ImmutableTransaction
        from .services import generate_reference_code
        # FIX: Ledger correctly records the dynamic fee
        ImmutableTransaction.objects.create(
            wallet=wallet,
            transaction_type=internal_type,
            amount=amount,
            currency='KES',
            fee_applied=fee,
            status='COMPLETED',
            reference_code=generate_reference_code(internal_type)
        )

        transactions = wallet.transactions.order_by('-timestamp')[:10]
        tx_data = [{
            "id": tx.id,
            "type": tx.transaction_type,
            "amount": str(tx.amount),
            "fee": str(tx.fee_applied),
            "timestamp": tx.timestamp.strftime("%Y-%m-%d %H:%M"),
            "status": tx.status
        } for tx in transactions]

        return Response({
            'message': f'M-Pesa {mpesa_type} payment of {amount} KES successful.',
            'kes_balance': str(wallet.kes_balance),
            'foreign_balance': str(wallet.foreign_balance),
            'transactions': tx_data
        }, status=status.HTTP_200_OK)

class WalletDepositView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        amount = request.data.get('amount')
        currency = request.data.get('currency', 'USD')
        payment_method = request.data.get('payment_method')

        # --- Validation ---
        if not all([amount, payment_method]):
            return Response({'error': 'amount and payment_method are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(str(amount))
        except Exception:
            return Response({'error': 'Invalid amount.'}, status=status.HTTP_400_BAD_REQUEST)

        if amount < Decimal('10.00'):
            return Response({'error': 'Minimum deposit is $10.00.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- Mock Payment Gateway (Stripe) ---
        # In production, call stripe.PaymentIntent.create() here.
        # For now, we assume the charge succeeds.
        payment_success = True
        if not payment_success:
            return Response({'error': 'Payment gateway declined the transaction.'}, status=status.HTTP_402_PAYMENT_REQUIRED)

        # --- Compute gateway fee (Stripe standard: 2.9% + $0.30) ---
        gateway_fee = (amount * Decimal('0.029')) + Decimal('0.30')

        # --- Atomic wallet update ---
        try:
            # Row-level lock prevents concurrent deposit race conditions
            wallet = Wallet.objects.select_for_update().get(user=request.user)
        except Wallet.DoesNotExist:
            return Response({'error': 'Wallet not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Zuru absorbs the gateway fee — user receives the full requested amount.
        wallet.foreign_balance += amount
        wallet.save(update_fields=['foreign_balance', 'updated_at'])

        # --- Immutable ledger entry ---
        from .models import ImmutableTransaction
        from .services import generate_reference_code
        ImmutableTransaction.objects.create(
            wallet=wallet,
            transaction_type='DEPOSIT',
            amount=amount,
            currency=currency.upper(),
            fee_applied=gateway_fee,
            status='COMPLETED',
            reference_code=generate_reference_code('DEPOSIT')
        )

        transactions = wallet.transactions.order_by('-timestamp')[:10]
        tx_data = [{
            "id": tx.id,
            "type": tx.transaction_type,
            "amount": str(tx.amount),
            "fee": str(tx.fee_applied),
            "timestamp": tx.timestamp.strftime("%Y-%m-%d %H:%M"),
            "status": tx.status
        } for tx in transactions]

        return Response({
            'message': f'Deposit of {amount} {currency.upper()} successful.',
            'foreign_balance': str(wallet.foreign_balance),
            'kes_balance': str(wallet.kes_balance),
            'transactions': tx_data
        }, status=status.HTTP_200_OK)
