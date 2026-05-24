"""Comando de utilidad para crear usuarios demo de Administrador y Operador.

Uso:
    python manage.py crear_usuarios_demo
"""

from django.core.management.base import BaseCommand

from seguridad.models import Usuario


USUARIOS_DEMO = [
    {
        "username": "admin",
        "email": "admin@papelitos.local",
        "password": "Admin12345*",
        "rol": Usuario.Rol.ADMINISTRADOR,
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "username": "operador",
        "email": "operador@papelitos.local",
        "password": "Operador12345*",
        "rol": Usuario.Rol.OPERADOR,
        "is_staff": False,
        "is_superuser": False,
    },
]


class Command(BaseCommand):
    help = "Crea usuarios demo (administrador y operador) si no existen."

    def handle(self, *args, **options):
        for datos in USUARIOS_DEMO:
            usuario, creado = Usuario.objects.get_or_create(
                username=datos["username"],
                defaults={
                    "email": datos["email"],
                    "rol": datos["rol"],
                    "is_staff": datos["is_staff"],
                    "is_superuser": datos["is_superuser"],
                },
            )
            usuario.set_password(datos["password"])
            usuario.is_staff = datos["is_staff"]
            usuario.is_superuser = datos["is_superuser"]
            usuario.rol = datos["rol"]
            usuario.save()

            estado = "creado" if creado else "actualizado"
            self.stdout.write(
                self.style.SUCCESS(
                    f"Usuario '{usuario.username}' {estado} (rol: {usuario.rol}, "
                    f"contrasena: {datos['password']})"
                )
            )
