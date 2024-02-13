from django.urls import path

from . import views

app_name = 'aa_contacts'


urlpatterns = [
    path('', views.index, name='index'),
    path('contacts/', views.contacts, name='contacts'),
]
