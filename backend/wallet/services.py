import uuid
from django.contrib.auth.hashers import make_password, check_password
from decimal import Decimal

def hash_pin(raw_pin):
    """
    Securely hash a 4-digit PIN.
    """
    if not str(raw_pin).isdigit() or len(str(raw_pin)) != 4:
        raise ValueError("PIN must be exactly 4 digits.")
    return make_password(str(raw_pin))

def verify_pin(wallet, raw_pin):
    """
    Verify the given PIN against the wallet's hashed PIN.
    """
    if not wallet.pin_hash:
        return False
    return check_password(str(raw_pin), wallet.pin_hash)

def calculate_fee(transaction_type, amount):
    """
    Calculate fee based on transaction type and amount (KES).
    """
    amount = Decimal(str(amount))
    
    if transaction_type == 'CONVERSION':
        return amount * Decimal('0.015')
    
    if transaction_type == 'TILL':
        return Decimal('0.00')
    
    if transaction_type == 'PAYBILL':
        return amount * Decimal('0.005')
    
    if transaction_type == 'SEND_MONEY':
        return amount * Decimal('0.01')
            
    return Decimal('0.00')

def generate_reference_code(transaction_type):
    """
    Generate a unique reference code.
    """
    prefix = transaction_type[:4].upper()
    unique_id = uuid.uuid4().hex[:8].upper()
    return f"ZURU-{prefix}-{unique_id}"
