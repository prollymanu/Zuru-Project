from django.urls import path
from .views import WalletStatusView, SetupPinView, VerifyPinView, WalletConvertView, WalletMpesaPayView, WalletBalancesView, WalletDepositView, WalletWithdrawalView

urlpatterns = [
    path('status/', WalletStatusView.as_view(), name='wallet-status'),
    path('balances/', WalletBalancesView.as_view(), name='wallet-balances'),
    path('deposit/', WalletDepositView.as_view(), name='wallet-deposit'),
    path('setup-pin/', SetupPinView.as_view(), name='wallet-setup-pin'),
    path('verify-pin/', VerifyPinView.as_view(), name='wallet-verify-pin'),
    path('convert/', WalletConvertView.as_view(), name='wallet-convert'),
    path('mpesa-pay/', WalletMpesaPayView.as_view(), name='wallet-mpesa-pay'),
    path('withdraw/', WalletWithdrawalView.as_view(), name='wallet-withdraw'),
]
