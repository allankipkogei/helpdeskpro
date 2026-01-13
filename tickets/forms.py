from django import forms
from .models import Ticket

# form for creating a new ticket
class TicketCreateForm(forms.ModelForm):
    class Meta:
        # specify the models and files in the form
        model = Ticket
        # specify the fields to be included in the file
        fields = ['title', 'description', 'category', 'priority']
        # customize form widgets
        widgets = {
            'status': forms.Select(attrs={'class': 'form-select'}),
            'assigned_to': forms.Select(attrs={'class': 'form-select'}),
            'priority': forms.Select(attrs={'class': 'form-select'}),
        }
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter ticket title'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Describe your issue', 'rows': 4}),
            'category': forms.Select(attrs={'class': 'form-select'}),
            'priority': forms.Select(attrs={'class': 'form-select'}),
        }

class TicketUpdateForm(forms.ModelForm):
    class Meta:
        model = Ticket
        fields = ['title', 'description', 'priority', 'status']