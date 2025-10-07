from datetime import datetime
from typing import Optional
from ninja import Schema, ModelSchema

from allianceauth.eveonline.models import EveCorporationInfo, EveAllianceInfo

from aa_contacts.models import Contact

from allianceauth.services.hooks import get_extension_logger

logger = get_extension_logger(__name__)


class EveAllianceSchema(ModelSchema):
    logo_url: str

    class Meta:
        model = EveAllianceInfo
        fields = ["alliance_id", "alliance_name"]

    @staticmethod
    def resolve_logo_url(obj: EveAllianceInfo) -> str:
        return obj.logo_url_32.split('?')[0]


class EveCorporationSchema(ModelSchema):
    alliance: Optional[EveAllianceSchema] = None
    logo_url: str

    class Meta:
        model = EveCorporationInfo
        fields = ["corporation_id", "corporation_name"]

    @staticmethod
    def resolve_logo_url(obj: EveCorporationInfo) -> str:
        return obj.logo_url_32.split('?')[0]


class TokenSchema(Schema):
    id: int
    last_update: datetime


class AllianceTokenSchema(TokenSchema):
    alliance: EveAllianceSchema


class CorporationTokenSchema(TokenSchema):
    corporation: EveCorporationSchema


class ContactLabelSchema(Schema):
    label_name: str


class ContactSchema(Schema):
    contact_id: int
    contact_type: Contact.ContactTypeOptions
    contact_logo_url: str
    contact_name: str
    standing: float
    notes: Optional[str] = None
    labels: list[ContactLabelSchema] = []

    @staticmethod
    def resolve_notes(obj: Contact, context) -> Optional[str]:
        user = context['request'].user
        if user.has_perm('aa_contacts.view_contact_notes'):
            return obj.notes

    @staticmethod
    def resolve_contact_logo_url(obj: Contact) -> str:
        return obj.image_src.split('?')[0]
