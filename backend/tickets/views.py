from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import Group
from django.db.models import Count
from django.http import HttpResponseForbidden
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .forms import TicketCreateForm, TicketUpdateForm
from .models import Ticket, Category
from .serializers import TicketSerializers

# ---------------------------
# Frontend / Template Views
# ---------------------------

def login_view(request):
    """
    Custom login view for frontend
    """
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("dashboard")
        else:
            return render(request, "login.html", {"error": "Invalid credentials"})
    return render(request, "login.html")


@login_required
def dashboard(request):
    """
    Dashboard view showing summaries
    """
    user = request.user
    if user.groups.filter(name='IT Staff').exists() or user.is_superuser:
        tickets = Ticket.objects.all()
    else:
        tickets = Ticket.objects.filter(created_by=user)

    context = {
        'tickets_by_status': tickets.values('status').annotate(count=Count('id')),
        'tickets_by_priority': tickets.values('priority').annotate(count=Count('id')),
        'assigned_count': tickets.filter(assigned_to__isnull=False).count(),
        'unassigned_count': tickets.filter(assigned_to__isnull=True).count(),
        'total_tickets': tickets.count(),
    }
    return render(request, "tickets/dashboard.html", context)


@login_required
def ticket_list(request):
    """
    Show tickets depending on user role
    """
    user = request.user
    if user.groups.filter(name='IT Staff').exists() or user.is_superuser:
        tickets = Ticket.objects.all().order_by('-created_at')
    else:
        tickets = Ticket.objects.filter(created_by=user).order_by('-created_at')

    return render(request, "tickets/ticket_list.html", {"tickets": tickets})


@login_required
def ticket_detail(request, ticket_id):
    """
    Show ticket details depending on role
    """
    ticket = get_object_or_404(Ticket, id=ticket_id)
    user = request.user

    if ticket.created_by != user and not user.groups.filter(name='IT Staff').exists() and not user.is_superuser:
        return HttpResponseForbidden("You do not have permission to view this ticket.")

    return render(request, "tickets/ticket_detail.html", {"ticket": ticket})


@login_required
def create_ticket(request):
    """
    Create a new ticket
    """
    if request.method == "POST":
        form = TicketCreateForm(request.POST)
        if form.is_valid():
            ticket = form.save(commit=False)
            ticket.created_by = request.user
            ticket.save()
            return redirect("ticket_list")
    else:
        form = TicketCreateForm()

    return render(request, "tickets/create_ticket.html", {"form": form})


@login_required
def ticket_update(request, ticket_id):
    """
    Update a ticket (IT Staff or superuser only)
    """
    ticket = get_object_or_404(Ticket, id=ticket_id)
    user = request.user

    if not user.groups.filter(name='IT Staff').exists() and not user.is_superuser:
        return HttpResponseForbidden("You do not have permission to update this ticket.")

    if request.method == "POST":
        form = TicketUpdateForm(request.POST, instance=ticket)
        if form.is_valid():
            form.save()
            return redirect("ticket_detail", ticket_id=ticket.id)
    else:
        form = TicketUpdateForm(instance=ticket)

    return render(request, "tickets/ticket_update.html", {"form": form, "ticket": ticket})

# ---------------------------
# API Views (DRF)
# ---------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ticket_list_api(request):
    """
    API: List tickets based on user role
    - IT Staff/Admin: See all tickets
    - Support/Agent: See only tickets assigned to them
    - Regular User: See only their own tickets
    """
    user = request.user
    
    if user.groups.filter(name='IT Staff').exists() or user.is_superuser:
        # IT Staff can see all tickets
        tickets = Ticket.objects.all().order_by('-created_at')
    elif user.groups.filter(name='Support Team').exists():
        # Support Team agents can see tickets assigned to them
        tickets = Ticket.objects.filter(assigned_to=user).order_by('-created_at')
    else:
        # Regular users can only see their own tickets
        tickets = Ticket.objects.filter(created_by=user).order_by('-created_at')
    
    serializer = TicketSerializers(tickets, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ticket_create_api(request):
    """
    API: Create a new ticket (customers only)
    """
    serializer = TicketSerializers(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def ticket_detail_api(request, ticket_id):
    """
    API: Get ticket details or update status/assignment (Support Team only)
    """
    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    
    # Check permissions
    if not (user.is_superuser or 
            user.groups.filter(name='IT Staff').exists() or 
            user.groups.filter(name='Support Team').exists() or
            ticket.created_by == user):
        return Response(
            {"error": "You do not have permission to view this ticket"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == "GET":
        serializer = TicketSerializers(ticket)
        return Response(serializer.data)
    
    # PATCH: Update ticket (Support Team or IT Staff only)
    if not (user.is_superuser or 
            user.groups.filter(name='IT Staff').exists() or 
            user.groups.filter(name='Support Team').exists()):
        return Response(
            {"error": "Only support staff can update tickets"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Support agents can only update their assigned tickets
    if (user.groups.filter(name='Support Team').exists() and 
        ticket.assigned_to != user and not user.is_superuser):
        return Response(
            {"error": "You can only update tickets assigned to you"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = TicketSerializers(ticket, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_ticket_comment(request, ticket_id):
    """
    API: Add a comment to a ticket (Support Team or creator only)
    """
    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    
    # Only support staff or ticket creator can comment
    if not (user.is_superuser or 
            user.groups.filter(name='IT Staff').exists() or 
            user.groups.filter(name='Support Team').exists() or
            ticket.created_by == user):
        return Response(
            {"error": "You do not have permission to comment on this ticket"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .models import TicketComment
    from .serializers import TicketCommentSerializer
    
    data = request.data.copy()
    data['ticket'] = ticket.id
    data['author'] = user.id
    
    serializer = TicketCommentSerializer(data=data)
    if serializer.is_valid():
        serializer.save(author=user, ticket=ticket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ticket_comments_api(request, ticket_id):
    """
    API: Get all comments for a ticket
    """
    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    
    # Check permissions
    if not (user.is_superuser or 
            user.groups.filter(name='IT Staff').exists() or 
            user.groups.filter(name='Support Team').exists() or
            ticket.created_by == user):
        return Response(
            {"error": "You do not have permission to view this ticket"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .models import TicketComment
    from .serializers import TicketCommentSerializer
    
    # Filter comments - hide internal comments from customers
    comments = ticket.comments.all()
    if not (user.is_superuser or 
            user.groups.filter(name='IT Staff').exists() or 
            user.groups.filter(name='Support Team').exists()):
        comments = comments.filter(is_internal=False)
    
    serializer = TicketCommentSerializer(comments, many=True)
    return Response(serializer.data)

# ---------------------------
# Admin/Dashboard Views (DRF)
# ---------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    """
    API: Admin dashboard with statistics and summaries
    Only accessible to superusers and IT Staff
    """
    user = request.user
    
    # Check admin permissions
    if not (user.is_superuser or user.groups.filter(name='IT Staff').exists()):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from django.contrib.auth.models import User
    from django.db.models import Q
    
    all_tickets = Ticket.objects.all()
    
    dashboard_data = {
        "total_tickets": all_tickets.count(),
        "tickets_by_status": dict(
            all_tickets.values('status').annotate(count=Count('id')).values_list('status', 'count')
        ),
        "tickets_by_priority": dict(
            all_tickets.values('priority').annotate(count=Count('id')).values_list('priority', 'count')
        ),
        "unassigned_tickets": all_tickets.filter(assigned_to__isnull=True).count(),
        "total_users": User.objects.count(),
        "support_team_count": User.objects.filter(groups__name='Support Team').count(),
        "total_categories": Category.objects.count(),
        "recent_tickets": TicketSerializers(
            all_tickets.order_by('-created_at')[:5],
            many=True
        ).data,
    }
    
    return Response(dashboard_data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def admin_users(request):
    """
    API: Manage users (list and create)
    Only accessible to superusers
    """
    user = request.user
    
    if not user.is_superuser:
        return Response(
            {"error": "Superuser access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from django.contrib.auth.models import User
    
    if request.method == "GET":
        users = User.objects.all()
        user_data = []
        for u in users:
            groups = list(u.groups.values_list('name', flat=True))
            user_data.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "is_staff": u.is_staff,
                "is_superuser": u.is_superuser,
                "groups": groups,
                "date_joined": u.date_joined,
            })
        return Response(user_data)
    
    elif request.method == "POST":
        from django.contrib.auth.models import User
        
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        groups = request.data.get("groups", [])
        
        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Add user to groups
            for group_name in groups:
                try:
                    group = Group.objects.get(name=group_name)
                    new_user.groups.add(group)
                except Group.DoesNotExist:
                    pass
            
            return Response({
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "first_name": new_user.first_name,
                "last_name": new_user.last_name,
                "groups": list(new_user.groups.values_list('name', flat=True))
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, user_id):
    """
    API: Manage individual user
    Only accessible to superusers
    """
    user = request.user
    
    if not user.is_superuser:
        return Response(
            {"error": "Superuser access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from django.contrib.auth.models import User
    
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == "GET":
        return Response({
            "id": target_user.id,
            "username": target_user.username,
            "email": target_user.email,
            "first_name": target_user.first_name,
            "last_name": target_user.last_name,
            "is_staff": target_user.is_staff,
            "is_superuser": target_user.is_superuser,
            "groups": list(target_user.groups.values_list('name', flat=True))
        })
    
    elif request.method == "PATCH":
        email = request.data.get("email")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        groups = request.data.get("groups")
        
        if email:
            target_user.email = email
        if first_name is not None:
            target_user.first_name = first_name
        if last_name is not None:
            target_user.last_name = last_name
        
        if groups is not None:
            target_user.groups.clear()
            for group_name in groups:
                try:
                    group = Group.objects.get(name=group_name)
                    target_user.groups.add(group)
                except Group.DoesNotExist:
                    pass
        
        target_user.save()
        
        return Response({
            "id": target_user.id,
            "username": target_user.username,
            "email": target_user.email,
            "first_name": target_user.first_name,
            "last_name": target_user.last_name,
            "groups": list(target_user.groups.values_list('name', flat=True))
        })
    
    elif request.method == "DELETE":
        target_user.delete()
        return Response({"message": "User deleted successfully"})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def admin_categories(request):
    """
    API: Manage categories
    Only accessible to superusers and IT Staff
    """
    user = request.user
    
    if not (user.is_superuser or user.groups.filter(name='IT Staff').exists()):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == "GET":
        categories = Category.objects.all()
        data = [{"id": c.id, "name": c.name} for c in categories]
        return Response(data)
    
    elif request.method == "POST":
        name = request.data.get("name")
        
        if not name:
            return Response(
                {"error": "Category name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if Category.objects.filter(name=name).exists():
            return Response(
                {"error": "Category already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        category = Category.objects.create(name=name)
        return Response(
            {"id": category.id, "name": category.name},
            status=status.HTTP_201_CREATED
        )


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def admin_category_detail(request, category_id):
    """
    API: Update or delete a category
    Only accessible to superusers and IT Staff
    """
    user = request.user
    
    if not (user.is_superuser or user.groups.filter(name='IT Staff').exists()):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == "PATCH":
        name = request.data.get("name")
        if name:
            category.name = name
            category.save()
        return Response({"id": category.id, "name": category.name})
    
    elif request.method == "DELETE":
        category.delete()
        return Response({"message": "Category deleted successfully"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_ticket_assignments(request):
    """
    API: Get unassigned tickets for admin assignment
    Only accessible to superusers and IT Staff
    """
    user = request.user
    
    if not (user.is_superuser or user.groups.filter(name='IT Staff').exists()):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    unassigned = Ticket.objects.filter(assigned_to__isnull=True).order_by('-created_at')
    serializer = TicketSerializers(unassigned, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def admin_assign_ticket(request, ticket_id):
    """
    API: Assign a ticket to a support agent
    Only accessible to superusers and IT Staff
    """
    user = request.user
    
    if not (user.is_superuser or user.groups.filter(name='IT Staff').exists()):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
    
    assigned_to_id = request.data.get("assigned_to")
    
    if not assigned_to_id:
        return Response(
            {"error": "assigned_to user ID is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    from django.contrib.auth.models import User
    try:
        assigned_user = User.objects.get(id=assigned_to_id)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    ticket.assigned_to = assigned_user
    ticket.save()
    
    serializer = TicketSerializers(ticket)
    return Response(serializer.data)