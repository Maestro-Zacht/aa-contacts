from celery import shared_task, group

from django.db import transaction
from django.utils import timezone

from allianceauth.eveonline.models import EveAllianceInfo
from allianceauth.services.hooks import get_extension_logger

from .models import AllianceContact, AllianceContactLabel, AllianceToken
from .provider import esi

logger = get_extension_logger(__name__)


@shared_task
def load_contact_name(contact_pk: int):
    contact = AllianceContact.objects.get(pk=contact_pk)
    contact.contact_name


@shared_task
def update_alliance_contacts(alliance_id: int):
    contact_to_load = []

    try:
        alliance = EveAllianceInfo.objects.get(alliance_id=alliance_id)
    except EveAllianceInfo.DoesNotExist:
        alliance = EveAllianceInfo.objects.create_alliance(alliance_id)

    try:
        alliance_token = AllianceToken.objects.with_valid_tokens().select_related('token').get(alliance=alliance)
    except AllianceToken.DoesNotExist:
        raise ValueError(f"No valid token found for alliance {alliance}")

    labels_data = (
        esi.client
        .Contacts
        .get_alliances_alliance_id_contacts_labels(
            alliance_id=alliance_id,
            token=alliance_token.token.valid_access_token()
        )
        .results()
    )

    labels = {label['label_id']: label['label_name'] for label in labels_data}

    contacts_data = (
        esi.client
        .Contacts
        .get_alliances_alliance_id_contacts(
            alliance_id=alliance_id,
            token=alliance_token.token.valid_access_token()
        )
        .results()
    )

    contact_ids = {
        contact['contact_id']: {
            'contact_type': contact['contact_type'],
            'label_ids': contact.get('label_ids', []),
            'standing': contact['standing']
        } for contact in contacts_data
    }

    with transaction.atomic():
        alliance_labels = AllianceContactLabel.objects.filter(
            alliance=alliance
        )

        alliance_labels.exclude(
            label_id__in=labels.keys()
        ).delete()

        for label_id, label_name in labels.items():
            label, _ = alliance_labels.update_or_create(
                alliance=alliance,
                label_id=label_id,
                defaults={'label_name': label_name}
            )

            labels[label_id] = label

        alliance_contacts = AllianceContact.objects.filter(alliance=alliance)

        alliance_contacts.exclude(
            contact_id__in=contact_ids.keys()
        ).update(standing=0.0)

        for contact_id, contact_data in contact_ids.items():
            contact, _ = alliance_contacts.update_or_create(
                alliance=alliance,
                contact_id=contact_id,
                defaults={
                    'contact_type': contact_data['contact_type'],
                    'standing': contact_data['standing']
                }
            )

            contact.labels.clear()
            if contact_data['label_ids'] is not None:
                contact.labels.set([labels[label_id] for label_id in contact_data['label_ids']])

            contact_to_load.append(contact.pk)

        alliance_token.last_update = timezone.now()
        alliance_token.save()

    group(load_contact_name.si(pk) for pk in contact_to_load).delay()


@shared_task
def update_all_alliances_contacts():
    for alliance_token in AllianceToken.objects.with_valid_tokens().select_related('alliance'):
        update_alliance_contacts.delay(alliance_token.alliance.alliance_id)
