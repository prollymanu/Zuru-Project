import os
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# BASE DIR
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY
SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-key")
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "web"]

# APPLICATIONS
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",

    # Local apps
    "accounts",
    "listings",
    "wallet",
    "transport",
    "concierge",
]


# MIDDLEWARE
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # must be first
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# URLS & WSGI
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# DATABASE
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "zuru_db"),
        "USER": os.getenv("POSTGRES_USER", "zuru_admin"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "prollymanu"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
        "CONN_MAX_AGE": 600,
    }
}
if os.getenv("DATABASE_URL"):
    DATABASES["default"] = dj_database_url.parse(
        os.getenv("DATABASE_URL"),
        conn_max_age=600,
        ssl_require=False,
    )

# TEMPLATES
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],  
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# AUTH
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]
AUTH_USER_MODEL = "accounts.User"

# EMAIL
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# INTERNATIONALIZATION
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True

# STATIC & MEDIA
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# REST FRAMEWORK
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

# SIMPLE JWT
from datetime import timedelta
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# CORS
CORS_ALLOWED_ORIGINS = [
    "https://zuru-frontend.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.0.100:5173", # Mobile testing
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.0.100:5173",
]

# DEFAULT AUTO FIELD
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
