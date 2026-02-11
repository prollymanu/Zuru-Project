from rest_framework import serializers
from django.contrib.auth import get_user_model
import datetime

User = get_user_model()

class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=255, required=False)
    nationality = serializers.CharField(max_length=100, required=False)
    is_in_kenya = serializers.BooleanField(default=False)
    expected_arrival_date = serializers.DateField(required=False)

    def validate_email(self, value):
        """
        Email Validation: Ensure email is unique in ACTUAL Users.
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value

    def validate_expected_arrival_date(self, value):
        """
        Date Validation: 
        If is_in_kenya is False, and the date is in the past, raise ValidationError.
        """
        # is_in_kenya check
        is_in_kenya = self.initial_data.get('is_in_kenya', False)
        
        if isinstance(is_in_kenya, str):
            is_in_kenya = is_in_kenya.lower() == 'true'

        if not is_in_kenya:
            if not value:
                 raise serializers.ValidationError("This field is required when not in Kenya.")
            
            if value < datetime.date.today():
                raise serializers.ValidationError("Arrival date cannot be in the past.")
        
        return value
