from django import forms
from django.contrib.auth.models import Group
from .models import Ticket,  Category

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
        fields = ['title', 'description', 'priority', 'status', 'assigned_to']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'priority': forms.Select(attrs={'class': 'form-select'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
            'assigned_to': forms.Select(attrs={'class': 'form-select'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Only show users from the Support Team group
        try:
            support_team_group = Group.objects.get(name='Support Team')
            self.fields['assigned_to'].queryset = support_team_group.user_set.all()
        except Group.DoesNotExist:
            # If Support Team group doesn't exist, show all users
            pass
        
        # Make assigned_to not required
        self.fields['assigned_to'].required = False