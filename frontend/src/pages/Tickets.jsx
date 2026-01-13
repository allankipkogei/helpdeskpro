import { useEffect, useState } from "react";
import api from "../api/axios";

function Tickets({ onSelectTicket, onCreateClick }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get("api/tickets/");
        setTickets(res.data);
        
        // Determine user role based on the tickets they can see
        // If they can see admin endpoints, they're admin
        try {
          await api.get("api/admin/dashboard/");
          setUserRole("admin");
        } catch {
          setUserRole("customer");
        }
      } catch (err) {
        console.error("API error:", err);
        setError("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [refreshTrigger]);

  const handleTicketCreated = (newTicket) => {
    setTickets([newTicket, ...tickets]);
    setRefreshTrigger((prev) => prev + 1);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'open':
        return '#fbbf24';
      case 'in progress':
        return '#60a5fa';
      case 'resolved':
        return '#34d399';
      case 'closed':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f97316';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ fontSize: "1.125rem", color: "#6b7280" }}>Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: "2rem",
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        borderRadius: "8px",
        textAlign: "center"
      }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: "0 0 0.5rem 0" }}>Your Support Tickets</h1>
          <p style={{ color: "#6b7280", margin: 0 }}>
            Total tickets: <strong>{tickets.length}</strong>
          </p>
        </div>
        {userRole === "customer" && (
          <button
            onClick={onCreateClick}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "1em",
            }}
          >
            + Create New Ticket
          </button>
        )}
      </div>

      {tickets.length === 0 ? (
        <div style={{
          padding: "3rem",
          textAlign: "center",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <p style={{ fontSize: "1.125rem", color: "#6b7280", marginBottom: "1.5rem" }}>
            No tickets yet
          </p>
          {userRole === "customer" && (
            <button
              onClick={onCreateClick}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Create Your First Ticket
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {tickets.map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                borderLeft: "4px solid #2563eb",
                transition: "all 0.3s",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.125rem" }}>
                    {ticket.title}
                  </h3>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}>
                    ID: #{ticket.id}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{
                  display: "inline-block",
                  padding: "0.375rem 0.75rem",
                  backgroundColor: getStatusColor(ticket.status),
                  color: "white",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  fontWeight: "500"
                }}>
                  {ticket.status}
                </div>
                
                {ticket.priority && (
                  <div style={{
                    display: "inline-block",
                    padding: "0.375rem 0.75rem",
                    backgroundColor: getPriorityColor(ticket.priority),
                    color: "white",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}>
                    {ticket.priority} Priority
                  </div>
                )}
              </div>

              {ticket.description && (
                <p style={{ marginTop: "1rem", color: "#4b5563", lineHeight: "1.6" }}>
                  {ticket.description.substring(0, 150)}
                  {ticket.description.length > 150 ? "..." : ""}
                </p>
              )}

              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb", fontSize: "0.875rem", color: "#6b7280" }}>
                <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                {ticket.assigned_to_username && (
                  <span style={{ marginLeft: "1rem" }}>
                    Assigned to: <strong>{ticket.assigned_to_username}</strong>
                  </span>
                )}
                {ticket.comments && ticket.comments.length > 0 && (
                  <span style={{ marginLeft: "1rem" }}>
                    Comments: <strong>{ticket.comments.length}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Tickets;
