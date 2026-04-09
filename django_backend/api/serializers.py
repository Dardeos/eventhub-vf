from rest_framework import serializers
from .models import Event, Participant, Registration
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = '__all__'

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = '__all__'

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        if user.is_superuser:
            token['role'] = 'admin'
        elif user.is_staff:
            token['role'] = 'editor'
        else:
            token['role'] = 'viewer'
        
        return token