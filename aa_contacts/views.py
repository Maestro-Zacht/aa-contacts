from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib import messages

from esi.decorators import token_required
from esi.models import Token
from allianceauth.eveonline.models import EveCharacter, EveAllianceInfo, EveCorporationInfo

from .models import AllianceContact, AllianceToken, CorporationToken, CorporationContact
from .tasks import update_alliance_contacts, update_corporation_contacts
from .forms import AllianceContactForm, CorporationContactForm


@login_required
def index(request):
    context = {
        'alliance_tokens': AllianceToken.visible_for(request.user).select_related('alliance'),
        'corporation_tokens': CorporationToken.visible_for(request.user).select_related('corporation'),
    }
    return render(request, 'aa_contacts/index.html', context=context)


@login_required
def alliance_contacts(request, alliance_pk: int):
    try:
        token = AllianceToken.visible_for(request.user).select_related('alliance').get(alliance_id=alliance_pk)
    except AllianceToken.DoesNotExist:
        messages.error(request, 'You do not have the permissions for viewing this alliance contacts.')
        return redirect('aa_contacts:index')

    contacts = (
        AllianceContact.objects
        .filter(alliance=token.alliance)
        .prefetch_related('labels')
    )

    context = {
        'contacts': contacts,
        'token': token,
        'alliance': token.alliance,
    }

    return render(request, 'aa_contacts/alliance_contacts.html', context=context)


@login_required
def corporation_contacts(request, corporation_pk: int):
    try:
        token = CorporationToken.visible_for(request.user).select_related('corporation').get(corporation_id=corporation_pk)
    except CorporationToken.DoesNotExist:
        messages.error(request, 'You do not have the permissions for viewing this corporation contacts.')
        return redirect('aa_contacts:index')

    contacts = (
        CorporationContact.objects
        .filter(corporation=token.corporation)
        .prefetch_related('labels')
    )

    context = {
        'contacts': contacts,
        'token': token,
        'corporation': token.corporation,
    }

    return render(request, 'aa_contacts/corporation_contacts.html', context=context)


@login_required
@permission_required('aa_contacts.manage_alliance_contacts')
@token_required(scopes=['esi-alliances.read_contacts.v1'])
def add_alliance_token(request, token: Token):
    char = get_object_or_404(EveCharacter, character_id=token.character_id)

    if char.alliance_id is None:
        messages.error(request, 'You need to be in an alliance to add alliance contacts.')
        return redirect('aa_contacts:index')

    try:
        alliance = char.alliance
    except EveAllianceInfo.DoesNotExist:
        alliance = EveAllianceInfo.objects.create_alliance(char.alliance_id)

    if AllianceToken.objects.filter(alliance=alliance).exists():
        messages.error(request, 'Alliance contacts for your alliance are already being tracked.')
        return redirect('aa_contacts:index')

    AllianceToken.objects.create(alliance=alliance, token=token)
    update_alliance_contacts.delay(alliance.alliance_id)

    messages.success(request, 'Alliance contacts are now being tracked.')
    return redirect('aa_contacts:index')


@login_required
@permission_required('aa_contacts.manage_corporation_contacts')
@token_required(scopes=['esi-corporations.read_contacts.v1'])
def add_corporation_token(request, token: Token):
    char = get_object_or_404(EveCharacter, character_id=token.character_id)

    try:
        corporation = char.corporation
    except EveCorporationInfo.DoesNotExist:
        corporation = EveCorporationInfo.objects.create_corporation(char.corporation_id)

    if CorporationToken.objects.filter(corporation=corporation).exists():
        messages.error(request, 'Corporation contacts for your corporation are already being tracked.')
        return redirect('aa_contacts:index')

    CorporationToken.objects.create(corporation=corporation, token=token)
    update_corporation_contacts.delay(corporation.corporation_id)

    messages.success(request, 'Corporation contacts are now being tracked.')
    return redirect('aa_contacts:index')


@login_required
@permission_required('aa_contacts.manage_alliance_contacts')
def update_alliance(request, alliance_pk: int):
    try:
        token = AllianceToken.visible_for(request.user).select_related('alliance').get(alliance_id=alliance_pk)
    except AllianceToken.DoesNotExist:
        messages.error(request, 'You do not have the permissions for viewing this alliance contacts.')
        return redirect('aa_contacts:index')

    update_alliance_contacts.delay(token.alliance.alliance_id)

    messages.success(request, 'Alliance contacts are being updated.')
    return redirect('aa_contacts:alliance_contacts', alliance_pk)


@login_required
@permission_required('aa_contacts.manage_corporation_contacts')
def update_corporation(request, corporation_pk: int):
    try:
        token = CorporationToken.visible_for(request.user).select_related('corporation').get(corporation_id=corporation_pk)
    except CorporationToken.DoesNotExist:
        messages.error(request, 'You do not have the permissions for viewing this corporation contacts.')
        return redirect('aa_contacts:index')

    update_corporation_contacts.delay(token.corporation.corporation_id)

    messages.success(request, 'Corporation contacts are being updated.')
    return redirect('aa_contacts:corporation_contacts', corporation_pk)


@login_required
@permission_required(['aa_contacts.manage_alliance_contacts', 'aa_contacts.view_alliance_notes'])
def update_alliance_contact(request, contact_pk: int):
    contact = get_object_or_404(AllianceContact, pk=contact_pk)

    if request.method == 'POST':
        form = AllianceContactForm(request.POST, instance=contact)
        if form.is_valid():
            form.save()
            messages.success(request, f'{contact.contact_name} contact updated successfully')
            return redirect('aa_contacts:alliance_contacts', contact.alliance_id)
    else:
        form = AllianceContactForm(instance=contact)

    context = {
        'form': form,
        'contact': contact,
    }

    return render(request, 'aa_contacts/edit_contact.html', context=context)


@login_required
@permission_required(['aa_contacts.manage_corporation_contacts', 'aa_contacts.view_corporation_notes'])
def update_corporation_contact(request, contact_pk: int):
    contact = get_object_or_404(CorporationContact, pk=contact_pk)

    if request.method == 'POST':
        form = CorporationContactForm(request.POST, instance=contact)
        if form.is_valid():
            form.save()
            messages.success(request, f'{contact.contact_name} contact updated successfully')
            return redirect('aa_contacts:corporation_contacts', contact.corporation_id)
    else:
        form = CorporationContactForm(instance=contact)

    context = {
        'form': form,
        'contact': contact,
    }

    return render(request, 'aa_contacts/edit_contact.html', context=context)
