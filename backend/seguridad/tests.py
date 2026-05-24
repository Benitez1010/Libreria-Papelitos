from rest_framework import status
from rest_framework.test import APITestCase

from .models import Usuario

URL_LOGIN = "/api/auth/login/"
URL_ME = "/api/auth/me/"
MENSAJE_ERROR = "Credenciales invalidas, intente nuevamente"


class LoginTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.password = "ClaveSegura123*"
        cls.admin = Usuario.objects.create_user(
            username="admin_demo",
            email="admin@papelitos.test",
            password=cls.password,
            rol=Usuario.Rol.ADMINISTRADOR,
        )
        cls.operador = Usuario.objects.create_user(
            username="op_demo",
            email="op@papelitos.test",
            password=cls.password,
            rol=Usuario.Rol.OPERADOR,
        )

    def test_login_con_credenciales_validas_devuelve_tokens_y_rol(self):
        respuesta = self.client.post(
            URL_LOGIN,
            {"usuario": "admin_demo", "contrasena": self.password},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertIn("access", respuesta.data)
        self.assertIn("refresh", respuesta.data)
        self.assertEqual(respuesta.data["usuario"]["rol"], "ADMINISTRADOR")

    def test_login_acepta_correo_electronico_como_identificador(self):
        respuesta = self.client.post(
            URL_LOGIN,
            {"usuario": "op@papelitos.test", "contrasena": self.password},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["usuario"]["rol"], "OPERADOR")

    def test_login_con_contrasena_incorrecta_devuelve_mensaje_exacto(self):
        respuesta = self.client.post(
            URL_LOGIN,
            {"usuario": "admin_demo", "contrasena": "ClaveIncorrecta!"},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(respuesta.data["detail"], MENSAJE_ERROR)

    def test_login_con_usuario_inexistente_devuelve_mensaje_exacto(self):
        respuesta = self.client.post(
            URL_LOGIN,
            {"usuario": "no_existe", "contrasena": "loquesea"},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(respuesta.data["detail"], MENSAJE_ERROR)

    def test_login_con_campos_vacios_devuelve_mensaje_exacto(self):
        respuesta = self.client.post(
            URL_LOGIN,
            {"usuario": "", "contrasena": ""},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(respuesta.data["detail"], MENSAJE_ERROR)

    def test_login_con_usuario_desactivado_no_permite_acceso(self):
        self.operador.is_active = False
        self.operador.save()
        respuesta = self.client.post(
            URL_LOGIN,
            {"usuario": "op_demo", "contrasena": self.password},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(respuesta.data["detail"], MENSAJE_ERROR)


class RutaProtegidaTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.password = "ClaveSegura123*"
        cls.usuario = Usuario.objects.create_user(
            username="admin_demo",
            email="admin@papelitos.test",
            password=cls.password,
            rol=Usuario.Rol.ADMINISTRADOR,
        )

    def test_endpoint_protegido_sin_token_responde_401(self):
        respuesta = self.client.get(URL_ME)
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_endpoint_protegido_con_token_invalido_responde_401(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer token-falso")
        respuesta = self.client.get(URL_ME)
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_endpoint_protegido_con_token_valido_devuelve_usuario(self):
        login = self.client.post(
            URL_LOGIN,
            {"usuario": "admin_demo", "contrasena": self.password},
            format="json",
        )
        token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        respuesta = self.client.get(URL_ME)
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["username"], "admin_demo")
        self.assertEqual(respuesta.data["rol"], "ADMINISTRADOR")
