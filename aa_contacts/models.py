from django.db import models

from allianceauth.eveonline.models import EveAllianceInfo
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

    labels = models.ManyToManyField(AllianceContactLabel, related_name='contacts')

    notes = models.TextField(blank=True, default='')

    class Meta:
        default_permissions = ()


class AllianceToken(models.Model):
    alliance = models.OneToOneField(EveAllianceInfo, on_delete=models.RESTRICT, related_name='+')
    token = models.ForeignKey(Token, on_delete=models.CASCADE, related_name='+')

    objects = AllianceTokenManager()

    class Meta:
        default_permissions = ()
