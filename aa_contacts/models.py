from django.db import models
from django.utils import timezone

from allianceauth.authentication.models import CharacterOwnership
from allianceauth.eveonline.models import EveAllianceInfo, EveCharacter, EveCorporationInfo, EveFactionInfo
from esi.models import Token


class ContactTokenQueryset(models.QuerySet):
    def with_valid_tokens(self):
        valid_tokens = Token.objects.all().require_valid()
        return self.filter(token__in=valid_tokens)


class ContactTokenManager(models.Manager):
    def get_queryset(self):
        return ContactTokenQueryset(self.model, using=self._db)

    def with_valid_tokens(self):
        return self.get_queryset().with_valid_tokens()


class General(models.Model):
    class Meta:
        managed = False
        default_permissions = ()
        permissions = (
            ('manage_alliance_contacts', 'Can manage alliance contacts'),
            ('manage_corporation_contacts', 'Can manage corporation contacts'),
            ('view_alliance_notes', 'Can view notes on alliance contacts'),
            ('view_corporation_notes', 'Can view notes on corporation contacts'),
        )


class ContactLabel(models.Model):
    label_id = models.BigIntegerField()
    label_name = models.CharField(max_length=255)

    class Meta:
        abstract = True
        default_permissions = ()


class Contact(models.Model):
    contact_id = models.BigIntegerField()

    class ContactTypeOptions(models.TextChoices):
        CHARACTER = 'character'
        CORPORATION = 'corporation'
        ALLIANCE = 'alliance'
        FACTION = 'faction'

    contact_type = models.CharField(max_length=11, choices=ContactTypeOptions.choices)
    standing = models.FloatField()
    notes = models.TextField(blank=True, default='')

    class Meta:
        abstract = True
        default_permissions = ()

    @property
    def image_src(self) -> str:
        if self.contact_type == self.ContactTypeOptions.CHARACTER:
            return EveCharacter.generic_portrait_url(self.contact_id)
        if self.contact_type == self.ContactTypeOptions.CORPORATION:
            return EveCorporationInfo.generic_logo_url(self.contact_id)
        if self.contact_type == self.ContactTypeOptions.ALLIANCE:
            return EveAllianceInfo.generic_logo_url(self.contact_id)
        if self.contact_type == self.ContactTypeOptions.FACTION:
            return EveFactionInfo.generic_logo_url(self.contact_id)
        return ''

    @property
    def contact_name(self) -> str:
        if self.contact_type == self.ContactTypeOptions.CHARACTER:
            try:
                res = EveCharacter.objects.get(character_id=self.contact_id).character_name
            except EveCharacter.DoesNotExist:
                char = EveCharacter.objects.create_character(self.contact_id)
                res = char.character_name
        elif self.contact_type == self.ContactTypeOptions.CORPORATION:
            try:
                res = EveCorporationInfo.objects.get(corporation_id=self.contact_id).corporation_name
            except EveCorporationInfo.DoesNotExist:
                corp = EveCorporationInfo.objects.create_corporation(self.contact_id)
                res = corp.corporation_name
        elif self.contact_type == self.ContactTypeOptions.ALLIANCE:
            try:
                res = EveAllianceInfo.objects.get(alliance_id=self.contact_id).alliance_name
            except EveAllianceInfo.DoesNotExist:
                alliance = EveAllianceInfo.objects.create_alliance(self.contact_id)
                res = alliance.alliance_name
        elif self.contact_type == self.ContactTypeOptions.FACTION:
            try:
                res = EveFactionInfo.objects.get(faction_id=self.contact_id).faction_name
            except EveFactionInfo.DoesNotExist:
                faction = EveFactionInfo.provider.get_faction(self.contact_id)
                EveFactionInfo.objects.create(faction_id=faction.id, faction_name=faction.name)
                res = faction.name
        else:
            res = ''

        return res


class ContactToken(models.Model):
    token = models.ForeignKey(Token, on_delete=models.CASCADE, related_name='+')

    last_update = models.DateTimeField(default=timezone.now)

    objects = ContactTokenManager()

    class Meta:
        abstract = True
        default_permissions = ()


class AllianceContactLabel(ContactLabel):
    alliance = models.ForeignKey(EveAllianceInfo, on_delete=models.RESTRICT, related_name='contact_labels')

    class Meta:
        default_permissions = ()

    def __str__(self):
        return f"{self.alliance} - {self.label_name}"


class AllianceContact(Contact):
    alliance = models.ForeignKey(EveAllianceInfo, on_delete=models.RESTRICT, related_name='contacts')

    labels = models.ManyToManyField(AllianceContactLabel, blank=True, related_name='contacts')

    class Meta:
        default_permissions = ()

    def __str__(self):
        return f"{self.alliance} - {self.contact_name}"


class AllianceToken(ContactToken):
    alliance = models.OneToOneField(EveAllianceInfo, on_delete=models.RESTRICT, related_name='+')

    class Meta:
        default_permissions = ()

    @classmethod
    def visible_for(cls, user):
        if user.is_superuser:
            return cls.objects.all()

        return cls.objects.filter(
            alliance__alliance_id__in=CharacterOwnership.objects
            .filter(user=user)
            .values('character__alliance_id')
        )


class CorporationContactLabel(ContactLabel):
    corporation = models.ForeignKey(EveCorporationInfo, on_delete=models.RESTRICT, related_name='contact_labels')

    class Meta:
        default_permissions = ()

    def __str__(self):
        return f"{self.corporation} - {self.label_name}"


class CorporationContact(Contact):
    corporation = models.ForeignKey(EveCorporationInfo, on_delete=models.RESTRICT, related_name='contacts')

    labels = models.ManyToManyField(CorporationContactLabel, blank=True, related_name='contacts')

    is_watched = models.BooleanField(null=True, blank=True, default=None)

    class Meta:
        default_permissions = ()

    def __str__(self):
        return f"{self.corporation} - {self.contact_name}"


class CorporationToken(ContactToken):
    corporation = models.OneToOneField(EveCorporationInfo, on_delete=models.RESTRICT, related_name='+')

    class Meta:
        default_permissions = ()
