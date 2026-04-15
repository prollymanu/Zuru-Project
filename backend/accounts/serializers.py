from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserChecklist
import datetime

User = get_user_model()

class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=255, required=False)
    nationality = serializers.CharField(max_length=100, required=False)
    is_in_kenya = serializers.BooleanField(default=False)
    expected_arrival_date = serializers.DateField(required=False, allow_null=True)


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

class UserChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserChecklist
        fields = ['checked_items', 'is_complete', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    checklist_progress = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'first_name', 'nationality', 'is_in_kenya', 'expected_arrival_date', 'is_verified', 'checklist_progress']
        read_only_fields = ['email', 'is_verified']

    def get_first_name(self, obj):
        if obj.full_name:
            return obj.full_name.split()[0]
        return ""

    def get_checklist_progress(self, obj):
        """Calculates progress percentage dynamically (Total items = 6)"""
        try:
            checklist = obj.checklist
            total_items = 6
            checked_count = len(checklist.checked_items)
            return int((checked_count / total_items) * 100)
        except (UserChecklist.DoesNotExist, AttributeError):
            return 0

