from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib import messages

from esi.decorators import token_required
from esi.models import Token
from allianceauth.eveonline.models import EveCharacter, EveAllianceInfo

from .models import AllianceContact, AllianceToken
from .tasks import update_alliance_contacts
from .forms import AllianceContactForm


@login_required
def index(request):
    context = {
        'alliance_tokens': AllianceToken.visible_for(request.user),
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
