from datetime import datetime
from typing import TYPE_CHECKING, ClassVar

from allianceauth.eveonline.models import EveAllianceInfo, EveCorporationInfo
from allianceauth.services.hooks import get_extension_logger
from ninja import ModelSchema, Schema

from aa_contacts.models import Contact

if TYPE_CHECKING:
    from django.contrib.auth.models import User

logger = get_extension_logger(__name__)


class UserPermissionsSchema(Schema):
    can_manage_alliance_contacts: bool
    can_manage_corporation_contacts: bool


class EveAllianceSchema(ModelSchema):
    logo_url: str

    class Meta:
        model = EveAllianceInfo
        fields: ClassVar[list[str]] = ["alliance_id", "alliance_name"]

    @staticmethod
    def resolve_logo_url(obj: EveAllianceInfo) -> str:
        return obj.logo_url_32.split("?")[0]


class EveCorporationSchema(ModelSchema):
    alliance: EveAllianceSchema | None = None
    logo_url: str

    class Meta:
        model = EveCorporationInfo
        fields: ClassVar[list[str]] = ["corporation_id", "corporation_name"]

    @staticmethod
    def resolve_logo_url(obj: EveCorporationInfo) -> str:
        return obj.logo_url_32.split("?")[0]


class TokenSchema(Schema):
    last_update: datetime


class AllianceTokenSchema(TokenSchema):
    alliance: EveAllianceSchema


class CorporationTokenSchema(TokenSchema):
    corporation: EveCorporationSchema


class ContactLabelSchema(Schema):
    label_name: str


class ContactSchema(Schema):
    id: int
    contact_id: int
    contact_type: Contact.ContactTypeOptions
    contact_logo_url: str
    contact_name: str
    standing: float
    notes: str | None = None
    can_edit_notes: bool
    labels: list[ContactLabelSchema] = []  # noqa: RUF012

    @staticmethod
    def resolve_notes(obj: Contact, context) -> str | None:
        user: User = context["request"].user
        if obj.can_view_notes(user):
            return obj.notes
        return None

    @staticmethod
    def resolve_contact_logo_url(obj: Contact) -> str:
        return obj.image_src.split("?")[0]

    @staticmethod
    def resolve_can_edit_notes(obj: Contact, context) -> bool:
        user: User = context["request"].user
        return obj.can_edit_notes(user)


class UpdateContactSchema(Schema):
    notes: str
