from django.urls import path

from . import views

app_name = 'aa_contacts'


urlpatterns = [
    path('', views.index, name='index'),
    path('alliance/<int:alliance_pk>/', views.alliance_contacts, name='alliance_contacts'),
    path('alliance/add_token/', views.add_alliance_token, name='add_alliance_token'),
    path('alliance/update/<int:alliance_pk>/', views.update_alliance, name='update_alliance'),
    path('alliance/edit_contact/<int:contact_pk>/', views.update_alliance_contact, name='update_alliance_contact'),
]
