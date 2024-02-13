from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, permission_required

from .models import AllianceContact


@login_required
def index(request):
    return redirect('aa_contacts:contacts')


@login_required
@permission_required('aa_contacts.view_contacts')
def contacts(request):
    contacts = (
        AllianceContact.objects
        .filter(alliance=request.user.profile.main_character.alliance)
        .prefetch_related('labels')
    )
    return render(request, 'aa_contacts/contacts.html', context={'contacts': contacts})
