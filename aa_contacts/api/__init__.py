from ninja import NinjaAPI
from ninja.security import django_auth

from django.conf import settings

from .alliance import router as alliance_router
from .corporation import router as corporation_router

api = NinjaAPI(
    title="AA Contacts API",
    version="0.0.1",
    urls_namespace='aa_contacts:api',
    auth=django_auth,
    csrf=True,
    openapi_url=settings.DEBUG and "/openapi.json" or ""
)

api.add_router("/alliance", alliance_router)
api.add_router("/corporation", corporation_router)
