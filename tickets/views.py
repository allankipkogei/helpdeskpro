from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import TicketCreateForm, TicketUpdateForm
from .models import Ticket
from django.contrib.auth.models import Group
from django.db.models import Count

# view to create a new ticket
@login_required
def create_ticket(request):
    if request.method == 'POST':
        form = TicketCreateForm(request.POST)
        if form.is_valid():
            ticket = form.save(commit=False)
            ticket.created_by = request.user
            ticket.save()
            return redirect('ticket_list')  # Redirect to ticket list after creation
    else:
        form = TicketCreateForm()
    return render(request, 'tickets/create_ticket.html', {'form': form})

def new_ticket(request):
    # For now, just render a template
    return render(request, 'tickets/new_ticket.html')

def ticket_list(request):

    """
    Show tickets depending on user role:
    - IT Staff: all tickets
    - Employee: only own tickets
    """
    user = request.user
    if user.groups.filter(name='IT Staff').exists() or user.is_superuser:
        tickets = Ticket.objects.all().order_by('-created_at')
    else:
        tickets = Ticket.objects.filter(created_by=user).order_by('-created_at')

    return render(request, 'tickets/ticket_list.html', {'tickets': tickets})

    """
    Show all tickets created by the logged-in employee.
    """
    tickets = Ticket.objects.filter(created_by=request.user).order_by('-created_at')
    return render(request, 'tickets/ticket_list.html', {'tickets': tickets})

def ticket_detail(request, ticket_id):

    """
    Show ticket detail depending on role:
    - IT Staff: any ticket
    - Employee: only own tickets
    """
    user = request.user
    ticket = redirect(Ticket, id=ticket_id)

    if ticket.created_by != user and not user.groups.filter(name='IT Staff').exists() and not user.is_superuser:
        from django.http import HttpResponseForbidden
        return HttpResponseForbidden("You do not have permission to view this ticket.")

    return render(request, 'tickets/ticket_detail.html', {'ticket': ticket})
    """
    Show details of a specific ticket.
    """
    ticket = redirect(Ticket, id=ticket_id, created_by=request.user)
    return render(request, 'tickets/ticket_detail.html', {'ticket': ticket})

def ticket_update(request, ticket_id):
    user = request.user
    if not user.groups.filter(name='IT Staff').exists() and not user.is_superuser:
        from django.http import HttpResponseForbidden
        return HttpResponseForbidden("You do not have permission to update this ticket.")

    ticket = redirect(Ticket, id=ticket_id)

    if request.method == 'POST':
        form = TicketUpdateForm(request.POST, instance=ticket)
        if form.is_valid():
            form.save()
            return redirect('ticket_detail', ticket_id=ticket.id)
    else:
        form = TicketUpdateForm(instance=ticket)

    return render(request, 'tickets/ticket_update.html', {'form': form, 'ticket': ticket})

def dashboard(request):
    """
    Dashboard showing ticket summaries for IT staff and admins.
    Employees see a simplified version (their own tickets).
    """
    user = request.user
    if user.groups.filter(name='IT Staff').exists() or user.is_superuser:
        tickets = Ticket.objects.all()
    else:
        tickets = Ticket.objects.filter(created_by=user)

    # Tickets by status
    tickets_by_status = tickets.values('status').annotate(count=Count('id'))

    # Tickets by priority
    tickets_by_priority = tickets.values('priority').annotate(count=Count('id'))

    # Assigned vs unassigned
    assigned_count = tickets.filter(assigned_to__isnull=False).count()
    unassigned_count = tickets.filter(assigned_to__isnull=True).count()

    context = {
        'tickets_by_status': tickets_by_status,
        'tickets_by_priority': tickets_by_priority,
        'assigned_count': assigned_count,
        'unassigned_count': unassigned_count,
        'total_tickets': tickets.count(),
    }

    return render(request, 'tickets/dashboard.html', context)
