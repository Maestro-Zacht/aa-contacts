from typing import TYPE_CHECKING

from allianceauth.authentication.models import CharacterOwnership
from ninja import Path, Router

from aa_contacts.api.schema import (
    ContactSchema,
    ServerLinkInputSchema,
    ServerLinkSchema,
    UpdateContactSchema,
)
from aa_contacts.models import (
    CorporationContact,
    CorporationToken,
)
from aa_contacts.tasks import update_corporation_contacts

if TYPE_CHECKING:
    from django.contrib.auth.models import User

router = Router()


@router.get("/", response={200: list[ContactSchema], 403: None, 404: None})
def list_contacts(request, corporation_id: int = Path(...)):
    user: User = request.user

    ownerships = CharacterOwnership.objects.filter(user=user)
    if (
        not user.is_superuser
        and not ownerships.filter(character__corporation_id=corporation_id).exists()
    ):
        return 403, None

    token = CorporationToken.visible_for(user).filter(
        corporation__corporation_id=corporation_id
    )
    if not token.exists():
        return 404, None

    contacts = (
        CorporationContact.objects.with_contact_name()
        .filter(corporation__corporation_id=corporation_id)
        .prefetch_related("labels", "server_links")
    )

    return 200, contacts


@router.post("/update", response={200: None, 403: None, 404: None})
def update_contacts(request, corporation_id: int = Path(...)):
    user: User = request.user

    ownerships = CharacterOwnership.objects.filter(user=user)
    if (
        not user.is_superuser
        and not ownerships.filter(character__corporation_id=corporation_id).exists()
    ) or not user.has_perm("aa_contacts.manage_corporation_contacts"):
        return 403, None

    token = CorporationToken.visible_for(user).filter(
        corporation__corporation_id=corporation_id
    )
    if not token.exists():
        return 404, None

    update_corporation_contacts.delay(corporation_id)

    return 200, None


@router.patch("/{int:contact_pk}", response={200: None, 403: None, 404: None})
def edit_contact(
    request, data: UpdateContactSchema, contact_pk: int, corporation_id: int = Path(...)
):
    user: User = request.user

    ownerships = CharacterOwnership.objects.filter(user=user)
    if (
        not user.is_superuser
        and not ownerships.filter(character__corporation_id=corporation_id).exists()
    ) or (
        not user.has_perms(
            [
                "aa_contacts.manage_corporation_contacts",
                "aa_contacts.view_corporation_notes",
            ]
        )
    ):
        return 403, None

    token = CorporationToken.visible_for(user).filter(
        corporation__corporation_id=corporation_id
    )
    if not token.exists():
        return 404, None

    try:
        contact: CorporationContact = CorporationContact.objects.get(
            pk=contact_pk, corporation__corporation_id=corporation_id
        )
    except CorporationContact.DoesNotExist:
        return 404, None

    contact.notes = data.notes
    contact.save(update_fields=["notes"])

    return 200, None


def _get_managed_contact(
    user: "User", corporation_id: int, contact_pk: int
) -> "CorporationContact | int":
    ownerships = CharacterOwnership.objects.filter(user=user)
    if (
        not user.is_superuser
        and not ownerships.filter(character__corporation_id=corporation_id).exists()
    ) or not user.has_perm("aa_contacts.manage_corporation_contacts"):
        return 403

    if (
        not CorporationToken.visible_for(user)
        .filter(corporation__corporation_id=corporation_id)
        .exists()
    ):
        return 404

    try:
        return CorporationContact.objects.get(
            pk=contact_pk, corporation__corporation_id=corporation_id
        )
    except CorporationContact.DoesNotExist:
        return 404


@router.post(
    "/{int:contact_pk}/server-links",
    response={200: ServerLinkSchema, 403: None, 404: None},
)
def create_server_link(
    request,
    data: ServerLinkInputSchema,
    contact_pk: int,
    corporation_id: int = Path(...),
):
    contact = _get_managed_contact(request.user, corporation_id, contact_pk)
    if isinstance(contact, int):
        return contact, None

    link = contact.server_links.create(**data.dict())

    return 200, link


@router.put(
    "/{int:contact_pk}/server-links/{int:link_pk}",
    response={200: ServerLinkSchema, 403: None, 404: None},
)
def update_server_link(
    request,
    data: ServerLinkInputSchema,
    contact_pk: int,
    link_pk: int,
    corporation_id: int = Path(...),
):
    contact = _get_managed_contact(request.user, corporation_id, contact_pk)
    if isinstance(contact, int):
        return contact, None

    if not contact.server_links.filter(pk=link_pk).exists():
        return 404, None

    contact.server_links.filter(pk=link_pk).update(**data.dict())
    link = contact.server_links.get(pk=link_pk)

    return 200, link


@router.delete(
    "/{int:contact_pk}/server-links/{int:link_pk}",
    response={200: None, 403: None, 404: None},
)
def delete_server_link(
    request,
    contact_pk: int,
    link_pk: int,
    corporation_id: int = Path(...),
):
    contact = _get_managed_contact(request.user, corporation_id, contact_pk)
    if isinstance(contact, int):
        return contact, None

    deletes = contact.server_links.filter(pk=link_pk).delete()

    if deletes[0] == 0:
        return 404, None
    return 200, None
