from rest_framework import serializers
from .models import Ticket, TicketComment

class TicketCommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = TicketComment
        fields = ['id', 'ticket', 'author', 'author_username', 'content', 'is_internal', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at']

class TicketSerializers(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True, allow_null=True)
    comments = TicketCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'category', 'priority', 'status', 
                  'created_by', 'created_by_username', 'assigned_to', 'assigned_to_username', 
                  'created_at', 'updated_at', 'comments']
        read_only_fields = ['created_by', 'created_at']