"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib.auth import views as auth_views
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from tickets.views import (
    ticket_list_api, ticket_create_api, ticket_detail_api, 
    add_ticket_comment, ticket_comments_api,
    admin_dashboard, admin_users, admin_user_detail,
    admin_categories, admin_category_detail,
    admin_ticket_assignments, admin_assign_ticket
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/login/', auth_views.LoginView.as_view(), name='login'),
    path('accounts/logout/', auth_views.LogoutView.as_view(next_page='/accounts/login/'), name='logout'),
    path('tickets/', include('tickets.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Ticket APIs
    path('api/tickets/', ticket_list_api, name='api_ticket_list'),
    path('api/tickets/create/', ticket_create_api, name='api_ticket_create'),
    path('api/tickets/<int:ticket_id>/', ticket_detail_api, name='api_ticket_detail'),
    path('api/tickets/<int:ticket_id>/comments/', ticket_comments_api, name='api_ticket_comments'),
    path('api/tickets/<int:ticket_id>/comments/add/', add_ticket_comment, name='api_add_comment'),
    
    # Admin APIs
    path('api/admin/dashboard/', admin_dashboard, name='api_admin_dashboard'),
    path('api/admin/users/', admin_users, name='api_admin_users'),
    path('api/admin/users/<int:user_id>/', admin_user_detail, name='api_admin_user_detail'),
    path('api/admin/categories/', admin_categories, name='api_admin_categories'),
    path('api/admin/categories/<int:category_id>/', admin_category_detail, name='api_admin_category_detail'),
    path('api/admin/assignments/', admin_ticket_assignments, name='api_admin_assignments'),
    path('api/admin/tickets/<int:ticket_id>/assign/', admin_assign_ticket, name='api_admin_assign_ticket'),
]
