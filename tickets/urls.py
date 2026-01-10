from django.urls import path
from . import views
from .views import create_ticket, ticket_list, ticket_detail, ticket_update, dashboard

urlpatterns = [
    path('new/', views.new_ticket, name='new_ticket'),
    path('', ticket_list, name='ticket_list'),  # List of employee tickets
    path('<int:ticket_id>/', ticket_detail, name='ticket_detail'),  # Detail view
    path('create/', views.create_ticket, name='create_ticket'),
    path('<int:ticket_id>/update/', ticket_update, name='ticket_update'),
    path('dashboard/', dashboard, name='dashboard'),
]
