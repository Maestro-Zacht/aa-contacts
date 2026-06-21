from typing import TYPE_CHECKING

from allianceauth.authentication.models import CharacterOwnership
from ninja import Path, Router

from aa_contacts.api.schema import (
    ContactSchema,
    ServerLinkInputSchema,
    ServerLinkSchema,
    UpdateContactSchema,
)
from aa_contacts.models import AllianceContact, AllianceToken
from aa_contacts.tasks import update_alliance_contacts

if TYPE_CHECKING:
    from django.contrib.auth.models import User

router = Router()


@router.get("/", response={200: list[ContactSchema], 403: None, 404: None})
def list_contacts(request, alliance_id: int = Path(...)):
    user: User = request.user

    ownerships = CharacterOwnership.objects.filter(user=user)
    if (
        not user.is_superuser
        and not ownerships.filter(character__alliance_id=alliance_id).exists()
    ):
        return 403, None

    token = AllianceToken.visible_for(user).filter(alliance__alliance_id=alliance_id)
    if not token.exists():
        return 404, None

    contacts = (
        AllianceContact.objects.with_contact_name()
        .filter(alliance__alliance_id=alliance_id)
        .prefetch_related("labels", "server_links")
    )

    return 200, contacts


@router.post("/update", response={200: None, 403: None, 404: None})
def update_contacts(request, alliance_id: int = Path(...)):
    user: User = request.user

    ownerships = CharacterOwnership.objects.filter(user=user)
    if (
        not user.is_superuser
        and not ownerships.filter(character__alliance_id=alliance_id).exists()
    ) or not user.has_perm("aa_contacts.manage_alliance_contacts"):
        return 403, None

    token = AllianceToken.visible_for(user).filter(alliance__alliance_id=alliance_id)
    if not token.exists():
        return 404, None

    update_alliance_contacts.delay(alliance_id)

    return 200, None


@router.patch("/{int:contact_pk}", response={200: None, 403: None, 404: None})
def edit_contact(
    request, data: UpdateContactSchema, contact_pk: int, alliance_id: int = Path(...)
):
    user: User = request.user

    ownerships = CharacterOwnership.objects.filter(user=user)
    if (
        not user.is_superuser
        and not ownerships.filter(character__alliance_id=alliance_id).exists()
    ) or (
        not user.has_perms(
            ["aa_contacts.manage_alliance_contacts", "aa_contacts.view_alliance_notes"]
        )
    ):
        return 403, None

    token = AllianceToken.visible_for(user).filter(alliance__alliance_id=alliance_id)
    if not token.exists():
        return 404, None

    try:
        contact: AllianceContact = AllianceContact.objects.get(
            pk=contact_pk, alliance__alliance_id=alliance_id
        )
    except AllianceContact.DoesNotExist:
        return 404, None

    contact.notes = data.notes
    contact.save(update_fields=["notes"])

    return 200, None


def _get_managed_contact(
    user: "User", alliance_id: int, contact_pk: int
) -> "AllianceContact | int":
    ownerships = CharacterOwnership.objects.filter(user=user)
    if (
        not user.is_superuser
        and not ownerships.filter(character__alliance_id=alliance_id).exists()
    ) or not user.has_perm("aa_contacts.manage_alliance_contacts"):
        return 403

    if (
        not AllianceToken.visible_for(user)
        .filter(alliance__alliance_id=alliance_id)
        .exists()
    ):
        return 404

    try:
        return AllianceContact.objects.get(
            pk=contact_pk, alliance__alliance_id=alliance_id
        )
    except AllianceContact.DoesNotExist:
        return 404


@router.post(
    "/{int:contact_pk}/server-links",
    response={200: ServerLinkSchema, 403: None, 404: None},
)
def create_server_link(
    request,
    data: ServerLinkInputSchema,
    contact_pk: int,
    alliance_id: int = Path(...),
):
    contact = _get_managed_contact(request.user, alliance_id, contact_pk)
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
    alliance_id: int = Path(...),
):
    contact = _get_managed_contact(request.user, alliance_id, contact_pk)
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
    alliance_id: int = Path(...),
):
    contact = _get_managed_contact(request.user, alliance_id, contact_pk)
    if isinstance(contact, int):
        return contact, None

    deletes = contact.server_links.filter(pk=link_pk).delete()

    if deletes[0] == 0:
        return 404, None
    return 200, None
