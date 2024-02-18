from django.urls import path

from . import views

app_name = 'aa_contacts'


urlpatterns = [
    path('', views.index, name='index'),
    path('contacts/', views.contacts, name='contacts'),
    path('add_token/', views.add_token, name='add_token'),
    path('update_alliance/', views.update_alliance, name='update_alliance'),
]
