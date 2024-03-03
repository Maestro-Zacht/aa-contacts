from django.db import models
from django.utils import timezone

from allianceauth.eveonline.models import EveAllianceInfo, EveCharacter, EveCorporationInfo, EveFactionInfo
from esi.models import Token


class AllianceTokenQueryset(models.QuerySet):
    def with_valid_tokens(self):
        valid_tokens = Token.objects.all().require_valid()
        return self.filter(token__in=valid_tokens)


class AllianceTokenManager(models.Manager):
    def get_queryset(self):
        return AllianceTokenQueryset(self.model, using=self._db)

    def with_valid_tokens(self):
        return self.get_queryset().with_valid_tokens()


class General(models.Model):
    class Meta:
        managed = False
        default_permissions = ()
        permissions = (
            ('view_contacts', 'Can view alliance contacts'),
        )


class AllianceContactLabel(models.Model):
    alliance = models.ForeignKey(EveAllianceInfo, on_delete=models.RESTRICT, related_name='contact_labels')
    label_id = models.BigIntegerField()
    label_name = models.CharField(max_length=255)

    class Meta:
        default_permissions = ()

    def __str__(self):
        return f"{self.alliance} - {self.label_name}"


class AllianceContact(models.Model):
    alliance = models.ForeignKey(EveAllianceInfo, on_delete=models.RESTRICT, related_name='contacts')
    contact_id = models.BigIntegerField()

    class ContactTypeOptions(models.TextChoices):
        CHARACTER = 'character'
        CORPORATION = 'corporation'
        ALLIANCE = 'alliance'
        FACTION = 'faction'

    contact_type = models.CharField(max_length=11, choices=ContactTypeOptions.choices)
    standing = models.FloatField()

    labels = models.ManyToManyField(AllianceContactLabel, blank=True, related_name='contacts')

    notes = models.TextField(blank=True, default='')

    class Meta:
        default_permissions = ()

    def __str__(self):
        return f"{self.alliance} - {self.contact_name}"

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


class AllianceToken(models.Model):
    alliance = models.OneToOneField(EveAllianceInfo, on_delete=models.RESTRICT, related_name='+')
    token = models.ForeignKey(Token, on_delete=models.CASCADE, related_name='+')

    last_update = models.DateTimeField(default=timezone.now)

    objects = AllianceTokenManager()

    class Meta:
        default_permissions = ()
