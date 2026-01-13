from django.contrib import admin
from .models import Ticket, Category, TicketComment

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

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_displat = ('name',)
    search_fields = ('name',)

@admin.register(TicketComment)
class TicketCommentAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'author', 'is_internal', 'created_at')
    list_filter = ('is_internal', 'created_at')
    search_fields = ('content', 'ticket__title', 'author__username')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')