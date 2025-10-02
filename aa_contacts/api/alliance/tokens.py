from ninja import Router

from ..schema import AllianceTokenSchema
from aa_contacts.models import AllianceToken

router = Router()


@router.get("/", response=list[AllianceTokenSchema])
def get_list(request):
    return AllianceToken.visible_for(request.user)
