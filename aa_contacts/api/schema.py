from datetime import datetime
from typing import Optional
from ninja import Schema, ModelSchema

from allianceauth.eveonline.models import EveCorporationInfo, EveAllianceInfo


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
