from django.db import models
from django.contrib.auth.models import User

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

    CATEGORY_CHOICES = [
        ('Hardware', 'Hardware'),
        ('Software', 'Software'),
        ('Network', 'Network'),
        ('Account', 'Account'),
        ('Other', 'Other')
    ]

    # 2. Basic Fields
    title = models.CharField(max_length=200)
    description = models.TextField()

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
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
    created_at = models.DateTimeField(auto_created=True)
    # auto_now updates the time every time you click save
    updated_at = models.DateTimeField(auto_created=True)

    # 5. String Representation
    def __str__(self):
        # This makes the ticket show up as "Printer Issue - High" in the admin panel
        return f"{self.title} - {self.priority}"