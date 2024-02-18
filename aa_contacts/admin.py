from django.contrib import admin

from .models import AllianceContact


@admin.register(AllianceContact)
class AllianceContactAdmin(admin.ModelAdmin):
    exclude = ('contact_id', )
    readonly_fields = ('alliance', 'contact_type', 'standing', 'labels', )
