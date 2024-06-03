from django.db.models import Exists, OuterRef
from django.contrib.auth.models import Permission

from allianceauth.eveonline.models import EveCharacter, EveAllianceInfo, EveCorporationInfo

from charlink.app_imports.utils import AppImport, LoginImport
from esi.models import Token
from app_utils.allianceauth import users_with_permission

from .models import AllianceToken, CorporationToken
from .tasks import update_alliance_contacts, update_corporation_contacts


alliance_scopes = ['esi-alliances.read_contacts.v1']
corporation_scopes = ['esi-corporations.read_contacts.v1']


def _alliance_login(token: Token):
    char = EveCharacter.objects.get(character_id=token.character_id)

    assert char.alliance_id is not None

    try:
        alliance = char.alliance
    except EveAllianceInfo.DoesNotExist:
        alliance = EveAllianceInfo.objects.create_alliance(char.alliance_id)

    assert not AllianceToken.objects.filter(alliance=alliance).exists()

    AllianceToken.objects.create(alliance=alliance, token=token)
    update_alliance_contacts.delay(alliance.alliance_id)


def _corporation_login(token: Token):
    char = EveCharacter.objects.get(character_id=token.character_id)

    try:
        corporation = char.corporation
    except EveCorporationInfo.DoesNotExist:
        corporation = EveCorporationInfo.objects.create_corporation(char.corporation_id)

    assert not CorporationToken.objects.filter(corporation=corporation).exists()

    CorporationToken.objects.create(corporation=corporation, token=token)
    update_corporation_contacts.delay(corporation.corporation_id)


def _alliance_users_with_perms():
    return users_with_permission(
        Permission.objects.get(
            content_type__app_label='aa_contacts',
            codename='manage_alliance_contacts'
        )
    )


def _corporation_users_with_perms():
    return users_with_permission(
        Permission.objects.get(
            content_type__app_label='aa_contacts',
            codename='manage_corporation_contacts'
        )
    )


app_import = AppImport(
    "aa_contacts",
    [
        LoginImport(
            app_label="aa_contacts",
            unique_id="alliance",
            field_label="Alliance Contacts",
            add_character=_alliance_login,
            scopes=alliance_scopes,
            check_permissions=lambda user: user.has_perm('aa_contacts.manage_alliance_contacts'),
            is_character_added=lambda char: AllianceToken.objects.filter(token__character_id=char.character_id).exists(),
            is_character_added_annotation=Exists(
                AllianceToken.objects.filter(
                    token__character_id=OuterRef('character_id'),
                )
            ),
            get_users_with_perms=_alliance_users_with_perms
        ),
        LoginImport(
            app_label="aa_contacts",
            unique_id="corporation",
            field_label="Corporation Contacts",
            add_character=_corporation_login,
            scopes=corporation_scopes,
            check_permissions=lambda user: user.has_perm('aa_contacts.manage_corporation_contacts'),
            is_character_added=lambda char: CorporationToken.objects.filter(token__character_id=char.character_id).exists(),
            is_character_added_annotation=Exists(
                CorporationToken.objects.filter(
                    token__character_id=OuterRef('character_id'),
                )
            ),
            get_users_with_perms=_corporation_users_with_perms
        )
    ]
)
