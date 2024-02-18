from allianceauth import hooks
from allianceauth.services.hooks import UrlHook, MenuItemHook

from . import urls


class AAContactsHook(MenuItemHook):
    def __init__(self):
        super().__init__("Contacts", "fas fa-address-book", "aa_contacts:index", navactive=['aa_contacts:'])

    def render(self, request):
        if request.user.has_perm('aa_contacts.view_contacts'):
            return super().render(request)
        return ''


@hooks.register('menu_item_hook')
def register_menu():
    return AAContactsHook()


@hooks.register('url_hook')
def register_urls():
    return UrlHook(urls, 'aa_contacts', 'aa_contacts/')
