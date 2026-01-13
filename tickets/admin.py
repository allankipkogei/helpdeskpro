from django.contrib import admin
from .models import Ticket

#use the settings in the class below to display the Ticket model.
@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):

    #The Columns to be displayed in the admin interface
    list_display = (
        'title',
        'category',
        'priority',
        'status',
        'created_at',
        'assigned_to',
        'created_at'
    )

    
    #The Sidebar Filters
    list_filter = (
        'category',
        'priority',
        'status'
    )

    #The Search Bar
    search_fields = (
        'title',
        'description'
    )

    #The Sorting ordering of the tickets
    ordering = ('-created_at',)