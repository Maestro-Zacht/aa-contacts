from ninja import Router

from ..schema import CorporationTokenSchema
from aa_contacts.models import CorporationToken

router = Router()


@router.get("/", response=list[CorporationTokenSchema])
def get_list(request):
    return CorporationToken.visible_for(request.user)
