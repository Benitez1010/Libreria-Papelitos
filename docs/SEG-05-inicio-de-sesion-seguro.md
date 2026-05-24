# SEG-05 · Inicio de sesión seguro

Documentación técnica de la implementación del **inicio de sesión seguro** del
Sistema Librería Papelitos.

- **Rama:** `Moises`
- **Stack:** Django 6.0.5 + DRF + JWT (`djangorestframework-simplejwt`) · React 19 + Vite + Material UI v9
- **Persistencia local:** SQLite (`backend/db.sqlite3`, ignorada por git)

---

## 1. Resumen ejecutivo

Se implementó un flujo de autenticación end-to-end que cumple los criterios de
aceptación del ticket **SEG-05**: el sistema valida que las credenciales no
estén vacías, devuelve el mensaje exacto *"Credenciales invalidas, intente
nuevamente"* cuando el login falla, y al éxito redirige al usuario al dashboard
correspondiente según su rol (Administrador / Operador).

La autorización se basa en **JSON Web Tokens (JWT)**: cada petición posterior al
login lleva un token de acceso firmado, lo que permite que cualquier ruta del
frontend (por ejemplo `/admin`, `/operador`) pida iniciar sesión la primera vez
que se accede a ella.

El módulo se entregó con **9 pruebas unitarias** que pasan en verde.

---

## 2. Decisiones técnicas

| Decisión | Por qué |
|---|---|
| **JWT con `djangorestframework-simplejwt`** | Estándar para SPAs. Stateless (no llena la BD de sesiones). Tokens cortos (access 30 min, refresh 1 día) para minimizar la ventana en caso de robo. |
| **Custom User con campo `rol`** | Permite decidir el dashboard de destino con una sola consulta, sin tener que mapear Groups de Django. Limpio para los 2 roles del negocio (Administrador / Operador). |
| **PBKDF2 (default de Django)** | Las contraseñas se almacenan hasheadas y con sal automáticamente. No guardamos contraseñas en texto plano. |
| **Material UI v9** | Stack acordado por el equipo. Se creó un *theme* central (`src/theme.js`) con la paleta verde de la marca para reutilizar en todas las pantallas. |
| **Mensaje único para errores de credenciales** | El backend siempre devuelve el mismo mensaje (`"Credenciales invalidas, intente nuevamente"`) cuando el problema es de credenciales (usuario inexistente, contraseña errada, usuario desactivado, campos vacíos). Esto es una buena práctica de seguridad: no revela si el usuario existe o no. |

---

## 3. Arquitectura del flujo de autenticación

```
┌──────────────┐    POST /api/auth/login/       ┌──────────────┐
│   React SPA  │ ─────────────────────────────► │   Django API │
│   (Vite)     │   { usuario, contrasena }       │   (DRF)      │
│              │                                 │              │
│              │ ◄───────────────────────────── │              │
│              │   { access, refresh, usuario }  │              │
└──────┬───────┘                                 └──────┬───────┘
       │                                                 │
       │ guarda tokens en localStorage                   │
       │ guarda { id, username, rol } en contexto React  │
       │                                                 │
       │ GET /api/auth/me/  (con Authorization: Bearer)  │
       │ ──────────────────────────────────────────────► │
       │                                                 │
       │ ◄────────────────────────────────────────────── │
       │   { id, username, email, rol, ... }             │
       │                                                 │
       │ si rol == ADMINISTRADOR → /admin                │
       │ si rol == OPERADOR      → /operador             │
       │                                                 │
       │ cada request posterior lleva el token           │
       │ automáticamente (interceptor de axios)          │
       │                                                 │
       │ si el access expira → POST /api/auth/refresh/   │
       │ ──────────────────────────────────────────────► │
       │   { refresh: <refresh_token> }                  │
       │ ◄────────────────────────────────────────────── │
       │   { access: <nuevo_access_token> }              │
```

### Flujo principal (login exitoso)

1. Usuario ingresa `usuario` (o correo) + `contrasena` en `/login`.
2. Frontend valida que ambos campos no estén vacíos antes de enviar.
3. Frontend envía `POST /api/auth/login/`.
4. Backend autentica con `django.contrib.auth.authenticate()`.
5. Backend genera y devuelve `access`, `refresh` y datos del usuario (incluido `rol`).
6. Frontend guarda los tokens en `localStorage` y el usuario en el AuthContext.
7. Frontend redirige a `/admin` o `/operador` según el rol.

### Flujo alternativo (credenciales inválidas)

1. Backend recibe credenciales, falla la autenticación.
2. Backend devuelve **HTTP 400** con `{ "detail": "Credenciales invalidas, intente nuevamente" }`.
3. Frontend muestra el mensaje en un `<Alert severity="error">` y el usuario permanece en `/login`.

### Flujo alternativo (acceso a ruta protegida sin sesión)

1. Usuario abre `/admin` directo sin haber iniciado sesión.
2. El componente `<RutaProtegida>` revisa el AuthContext.
3. Como no hay usuario en contexto, hace `<Navigate to="/login" />`.
4. Una vez logueado, el sistema lo regresa al destino original.

---

## 4. Backend (Django)

### Estructura de archivos

```
backend/
├── libreria_papelitos/
│   ├── settings.py        (modificado)
│   └── urls.py            (modificado)
├── seguridad/
│   ├── models.py          (modificado)       ← modelo Usuario
│   ├── serializers.py     (nuevo)            ← LoginSerializer, UsuarioSerializer
│   ├── views.py           (modificado)       ← LoginView, MeView
│   ├── urls.py            (nuevo)            ← rutas del módulo seguridad
│   ├── admin.py           (modificado)       ← Usuario gestionable en /admin/
│   ├── tests.py           (modificado)       ← 9 pruebas unitarias
│   ├── migrations/
│   │   └── 0001_initial.py (nuevo)           ← migración del modelo Usuario
│   └── management/
│       └── commands/
│           └── crear_usuarios_demo.py (nuevo)
└── requeriments.txt       (modificado)        ← + simplejwt + PyJWT
```

### Modelo `Usuario`

Hereda de `AbstractUser` (mantiene todo lo de Django: username, email,
contraseña hasheada, permisos, etc.) y agrega un campo `rol`:

```python
class Usuario(AbstractUser):
    class Rol(models.TextChoices):
        ADMINISTRADOR = "ADMINISTRADOR", "Administrador"
        OPERADOR = "OPERADOR", "Operador"

    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.OPERADOR)
```

Configurado en `settings.py` como `AUTH_USER_MODEL = 'seguridad.Usuario'`.

### Endpoints

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login/` | Pública | Recibe `{ usuario, contrasena }`. Devuelve `{ access, refresh, usuario }` o error 400. |
| `GET`  | `/api/auth/me/`    | Bearer JWT | Devuelve los datos del usuario autenticado. |
| `POST` | `/api/auth/refresh/` | Pública | Recibe `{ refresh }` y devuelve un nuevo `access`. |

### Configuración DRF (en `settings.py`)

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}
```

> Por defecto **todo endpoint del API requiere autenticación**. Los endpoints
> públicos (como `/login/`) tienen que declarar explícitamente
> `permission_classes = [AllowAny]`. Esto es lo correcto desde el punto de vista
> de seguridad: protege por omisión, no por opción.

### Configuración JWT

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### Comando para usuarios demo

```bash
python manage.py crear_usuarios_demo
```

Crea (o actualiza si ya existen) dos usuarios:

| Username   | Contraseña       | Rol           |
|------------|------------------|---------------|
| `admin`    | `Admin12345*`    | ADMINISTRADOR |
| `operador` | `Operador12345*` | OPERADOR      |

Es **idempotente** (se puede correr varias veces sin romper nada).

### Pruebas unitarias (9 tests)

Archivo: `backend/seguridad/tests.py`. Cubren los 3 escenarios pedidos por el
ticket (datos válidos, datos límite y datos erróneos):

| # | Prueba | Categoría |
|---|---|---|
| 1 | Login con credenciales válidas devuelve tokens y rol | Válido |
| 2 | Login acepta correo electrónico como identificador | Válido |
| 3 | Login con contraseña incorrecta devuelve mensaje exacto | Erróneo |
| 4 | Login con usuario inexistente devuelve mensaje exacto | Erróneo |
| 5 | Login con campos vacíos devuelve mensaje exacto | Límite |
| 6 | Login con usuario desactivado no permite acceso | Límite |
| 7 | Endpoint protegido sin token responde 401 | Erróneo |
| 8 | Endpoint protegido con token inválido responde 401 | Erróneo |
| 9 | Endpoint protegido con token válido devuelve usuario | Válido |

Ejecución:

```bash
python manage.py test seguridad
# Ran 9 tests in 4.3s — OK
```

---

## 5. Frontend (React + Vite + Material UI)

### Estructura de archivos

```
frontend/src/
├── main.jsx                    (modificado)   ← ThemeProvider + AuthProvider + BrowserRouter
├── App.jsx                     (modificado)   ← Rutas
├── theme.js                    (nuevo)        ← Tema MUI con paleta verde
├── api/
│   └── client.js               (nuevo)        ← Axios con interceptor JWT y auto-refresh
├── auth/
│   ├── authContext.js          (nuevo)        ← AuthContext + hook useAuth
│   ├── AuthProvider.jsx        (nuevo)        ← Provider con login/logout/usuario
│   └── RutaProtegida.jsx       (nuevo)        ← Wrapper para rutas privadas
└── pages/
    ├── Login.jsx               (nuevo)        ← Pantalla del Figma con MUI
    ├── DashboardAdmin.jsx      (nuevo)
    └── DashboardOperador.jsx   (nuevo)
```

### Dependencias añadidas

```bash
npm install react-router-dom axios
```

Material UI, `@emotion/react`, `@emotion/styled` y `@mui/icons-material` ya
estaban instalados previamente.

### Cliente HTTP (`src/api/client.js`)

- Instancia de `axios` apuntando a `http://127.0.0.1:8000/api`.
- **Interceptor de request:** agrega `Authorization: Bearer <access>`
  automáticamente a toda petición saliente.
- **Interceptor de response:** si una petición responde 401, intenta refrescar
  el token llamando a `/auth/refresh/`, guarda el nuevo `access` y
  reintenta la petición original transparentemente. Si el refresh también
  falla, limpia `localStorage` y redirige a `/login`.

### AuthContext (`src/auth/AuthProvider.jsx`)

Estado global de sesión que expone:

```js
const { usuario, cargandoSesion, login, logout } = useAuth();
```

- Al cargar la app, valida la sesión llamando a `/auth/me/` con el token
  guardado en `localStorage`. Si falla, limpia todo y deja al usuario en
  estado deslogueado.
- `login(identificador, contrasena)` → llama al backend, guarda los tokens
  y devuelve el usuario.
- `logout()` → limpia `localStorage` y el contexto.

### Componente `<RutaProtegida>`

Lógica:

- Si la sesión sigue cargando → muestra un spinner.
- Si no hay usuario → `<Navigate to="/login" />`.
- Si se recibe `rolesPermitidos={[...]}` y el rol del usuario no está en
  la lista → redirige al inicio (evita que un Operador entre a `/admin`).

### Rutas (`App.jsx`)

```
/login        → Login (pública)
/admin        → DashboardAdmin (solo ADMINISTRADOR)
/operador     → DashboardOperador (solo OPERADOR)
/             → redirige según rol del usuario logueado
*             → cualquier otra ruta redirige a /
```

### Pantalla de Login

Replica el diseño del Figma con dos columnas:

- **Izquierda:** verde marca (`#0F4D2E`) con el logo y el nombre "PAPELITOS".
- **Derecha:** crema con el formulario (`TextField` + `Button` de MUI).

Validaciones:

- **Frontend:** antes de enviar, valida que ningún campo esté vacío. Si lo
  están, muestra *"Complete usuario y contrasena para continuar."*.
- **Backend:** si las credenciales son inválidas, muestra el mensaje exacto
  del ticket: *"Credenciales invalidas, intente nuevamente"*.
- **Error de red:** *"No se pudo contactar al servidor. Intente mas tarde."*.

---

## 6. Cómo levantar todo en local (para los compañeros)

> Estos pasos son para alguien que clona el repo y se cambia a la rama `Moises`
> (o que ya hizo merge a `main`). Cada quien tiene su propia `db.sqlite3`
> local, no se sube al repo.

### Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate      # (Windows / Git Bash)
pip install -r requeriments.txt
python manage.py migrate
python manage.py crear_usuarios_demo
python manage.py runserver        # corre en http://127.0.0.1:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                       # corre en http://localhost:5173
```

### Probarlo

1. Abrir `http://localhost:5173/admin` — debe redirigir a `/login`.
2. Ingresar `admin` / `Admin12345*` → carga `/admin`.
3. Cerrar sesión → vuelve a `/login`.
4. Ingresar `operador` / `Operador12345*` → carga `/operador`.
5. Ingresar credenciales incorrectas → muestra *"Credenciales invalidas, intente nuevamente"*.

### Correr los tests del backend

```bash
cd backend
python manage.py test seguridad
```

---

## 7. Mapping con los criterios de aceptación del ticket

| Criterio de aceptación | Cómo se cumple |
|---|---|
| El sistema debe validar que los campos de usuario y contraseña no estén vacíos. | Doble validación: en frontend (`Login.jsx`) antes de enviar, y en backend (`LoginSerializer.validate`). |
| Si las credenciales son incorrectas, debe mostrar el mensaje "Credenciales invalidas, intente nuevamente". | `LoginView` devuelve exactamente ese `detail` en HTTP 400. El frontend lo muestra en un `<Alert>`. |
| El inicio de sesión exitoso debe redirigir al Dashboard correspondiente a su rol. | `Login.jsx` lee `usuario.rol` y hace `navigate("/admin")` o `navigate("/operador")` según corresponda. |
| Modelo de Caso de Uso (diagrama y flujo principal/alternativo). | **Pendiente** — sección 8 de este documento describe los flujos textualmente; falta el diagrama visual. |
| Aprobación del Stakeholder. | **Pendiente** — entregar la pantalla a la dueña de la librería para validación. |
| Pruebas Unitarias (mínimo 5 con datos válidos, límite y erróneos). | **9 pruebas en `seguridad/tests.py`**, cubriendo los 3 tipos de datos. |
| Limpieza de Código (sin bloques comentados, sin prints, sin variables sin usar). | Código revisado. ESLint pasa sin warnings ni errores. |
| Cero Errores Críticos (el despliegue local no rompe lo existente). | `python manage.py check` → "System check identified no issues (0 silenced)". `vite build` → ✓ built in 2.86s. |

---

## 8. Pendientes para cerrar el ticket en Jira

1. **Diagrama de caso de uso** "Iniciar sesión" en draw.io o PlantUML. Debe
   incluir actores (Administrador, Operador), flujo principal y flujo
   alternativo.
2. **Aprobación del Stakeholder**: presentar la pantalla a la dueña de la
   librería.
3. **Commit + push de la rama `Moises`** al remoto y abrir el Pull Request
   hacia `main`. Recordar avisar a los compañeros que tendrán que borrar
   su `db.sqlite3` local y volver a correr `migrate` (porque cambiamos
   `AUTH_USER_MODEL`).

---

## 9. Anexo · Catálogo de cambios

### Archivos nuevos

- `backend/seguridad/serializers.py`
- `backend/seguridad/urls.py`
- `backend/seguridad/migrations/0001_initial.py`
- `backend/seguridad/management/__init__.py`
- `backend/seguridad/management/commands/__init__.py`
- `backend/seguridad/management/commands/crear_usuarios_demo.py`
- `frontend/src/theme.js`
- `frontend/src/api/client.js`
- `frontend/src/auth/authContext.js`
- `frontend/src/auth/AuthProvider.jsx`
- `frontend/src/auth/RutaProtegida.jsx`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/DashboardAdmin.jsx`
- `frontend/src/pages/DashboardOperador.jsx`
- `docs/SEG-05-inicio-de-sesion-seguro.md` (este documento)

### Archivos modificados

- `backend/libreria_papelitos/settings.py` (REST_FRAMEWORK, SIMPLE_JWT, AUTH_USER_MODEL, idioma `es`)
- `backend/libreria_papelitos/urls.py` (incluye `api/auth/`)
- `backend/seguridad/models.py` (modelo Usuario)
- `backend/seguridad/admin.py` (registro de Usuario en el admin)
- `backend/seguridad/views.py` (LoginView, MeView)
- `backend/seguridad/tests.py` (9 tests)
- `backend/requeriments.txt` (+ djangorestframework-simplejwt, + PyJWT)
- `frontend/src/main.jsx` (envuelve la app en ThemeProvider, BrowserRouter, AuthProvider)
- `frontend/src/App.jsx` (configuración de rutas)
- `frontend/package.json`, `package-lock.json` (+ react-router-dom, axios)

### Archivos eliminados

- `frontend/src/App.css` (template viejo de Vite, sin uso)
- `frontend/src/index.css` (reemplazado por `CssBaseline` de MUI)
- `frontend/src/pages/Login.css` (estilos migrados a `sx` de MUI)
- `frontend/src/pages/Dashboard.css` (estilos migrados a `sx` de MUI)
- `frontend/src/assets/hero.png`, `react.svg`, `vite.svg` (assets del template, sin uso)
