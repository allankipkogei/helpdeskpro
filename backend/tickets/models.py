from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Ticket(models.Model):
    # 1. Choices
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical')
    ]

    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In progress', 'In progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed')
    ]

    # 2. Basic Fields
    title = models.CharField(max_length=50)

    def __str__(self):
        return self.title

    description = models.TextField()

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets'
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='Medium'
    )

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='Open'
    )

    # 3. Relationships
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tickets_created'
    )

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets_assigned'
    )

    # 4. Timestamps
    # auto_now_add sets the time only when created
    created_at = models.DateTimeField(auto_now_add=True)
    # auto_now updates the time every time you click save
    updated_at = models.DateTimeField(auto_now=True)

    # 5. String Representation
    def __str__(self):
        return self.title


class TicketComment(models.Model):
    """
    Model for Support Team to add comments/updates on tickets
    """
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ticket_comments'
    )
    
    content = models.TextField()
    
    is_internal = models.BooleanField(
        default=False,
        help_text="Internal comments visible only to support team"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment on {self.ticket.title} by {self.author.username}"