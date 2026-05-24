from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    """Usuario del sistema con un rol que decide el dashboard al iniciar sesion."""

    class Rol(models.TextChoices):
        ADMINISTRADOR = "ADMINISTRADOR", "Administrador"
        OPERADOR = "OPERADOR", "Operador"

    rol = models.CharField(
        max_length=20,
        choices=Rol.choices,
        default=Rol.OPERADOR,
    )

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"
