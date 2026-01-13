# tickets/api_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Ticket
from .serializers import TicketSerializers

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ticket_list_api(request):
    tickets = Ticket.objects.all()  # or filter by user: Ticket.objects.filter(user=request.user)
    serializer = TicketSerializers(tickets, many=True)
    return Response(serializer.data)
