from django.apps import apps
from django.contrib import admin

from .models import AllianceContact, CorporationContact, CorpStandingFilter, AllianceStandingFilter


@admin.register(AllianceContact)
class AllianceContactAdmin(admin.ModelAdmin):
    exclude = ('contact_id', )
    readonly_fields = ('alliance', 'contact_type', 'standing', 'labels', )


@admin.register(CorporationContact)
class CorporationContactAdmin(admin.ModelAdmin):
    exclude = ('contact_id', )
    readonly_fields = ('corporation', 'contact_type', 'standing', 'labels', )


class CorpStandingFilterAdmin(admin.ModelAdmin):
    raw_id_fields = ('corporations', )


class AllianceStandingFilterAdmin(admin.ModelAdmin):
    raw_id_fields = ('alliances', )


if apps.is_installed('securegroups'):
    admin.site.register(CorpStandingFilter, CorpStandingFilterAdmin)
    admin.site.register(AllianceStandingFilter, AllianceStandingFilterAdmin)
