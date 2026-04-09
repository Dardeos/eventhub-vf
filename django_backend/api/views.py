from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Event, Participant, Registration
from .serializers import EventSerializer, ParticipantSerializer, RegistrationSerializer,CustomTokenObtainPairSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import PermissionDenied
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
def is_admin(user):
    return user.is_staff

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend]
    def get_queryset(self):
        qs = Event.objects.all()
        status = self.request.query_params.get('status')
        date = self.request.query_params.get('date')

        if status:
            qs = qs.filter(status=status)
        if date:
            qs = qs.filter(date__date=date)

        return qs


    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAuthenticated()] if is_admin(self.request.user) else [IsAuthenticated()]

    def check_permissions(self, request):
        super().check_permissions(request)
        if self.action not in ['list', 'retrieve'] and not is_admin(request.user):
            raise PermissionDenied("Vous n'avez pas les droits pour effectuer cette action.")

class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer

    def check_permissions(self, request):
        super().check_permissions(request)
        if self.action not in ['list', 'retrieve'] and not is_admin(request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas les droits pour effectuer cette action.")
    def perform_destroy(self, instance):
        email_to_delete = instance.email
        instance.delete()
        User.objects.filter(email=email_to_delete).delete()

class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer

    def check_permissions(self, request):
        super().check_permissions(request)
        super().check_permissions(request)
        
        allowed_actions = ['list', 'retrieve', 'create', 'destroy']
        if self.action not in allowed_actions and not is_admin(request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas les droits pour effectuer cette action.")
    
    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if is_admin(request.user):
            return True
        if obj.participant.name.lower() == request.user.username.lower():
            if self.action in ['destroy', 'partial_update', 'update']:
                return True

        raise PermissionDenied("Vous n'avez pas les droits sur cette inscription.")

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({"error": "Données manquantes"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Ce nom d'utilisateur est déjà pris."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(password, user=User(username=username))
        except ValidationError as e:
            return Response({"error": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        return Response({"message": "Utilisateur créé avec succès"}, status=status.HTTP_201_CREATED)
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer