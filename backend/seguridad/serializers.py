from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ("id", "username", "email", "first_name", "last_name", "rol")
        read_only_fields = fields


class LoginSerializer(serializers.Serializer):
    """Valida campos no vacios y autentica por username o correo electronico."""

    usuario = serializers.CharField(allow_blank=True, trim_whitespace=True)
    contrasena = serializers.CharField(allow_blank=True, trim_whitespace=False)

    def validate(self, attrs):
        identificador = (attrs.get("usuario") or "").strip()
        password = attrs.get("contrasena") or ""

        if not identificador or not password:
            raise serializers.ValidationError("credenciales_invalidas")

        username = identificador
        if "@" in identificador:
            usuario_por_email = Usuario.objects.filter(email__iexact=identificador).first()
            if usuario_por_email is not None:
                username = usuario_por_email.username

        user = authenticate(
            request=self.context.get("request"),
            username=username,
            password=password,
        )

        if user is None or not user.is_active:
            raise serializers.ValidationError("credenciales_invalidas")

        attrs["user"] = user
        return attrs
