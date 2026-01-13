import { useEffect, useState } from "react";
import api from "../api/axios";

function TicketDetail({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [canUpdateStatus, setCanUpdateStatus] = useState(false);
  const [userRole, setUserRole] = useState("customer");

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true);
        const ticketRes = await api.get(`api/tickets/${ticketId}/`);
        setTicket(ticketRes.data);

        const commentsRes = await api.get(`api/tickets/${ticketId}/comments/`);
        setComments(commentsRes.data);

        // Check if user can update status
        try {
          await api.get("api/admin/dashboard/");
          setUserRole("admin");
          setCanUpdateStatus(true);
        } catch {
          // Check if they're a support agent
          try {
            await api.patch(`api/tickets/${ticketId}/`, { status: ticket?.status });
            setUserRole("support");
            setCanUpdateStatus(true);
          } catch {
            setUserRole("customer");
            setCanUpdateStatus(false);
          }
        }
      } catch (err) {
        console.error("Error loading ticket:", err);
        setError("Failed to load ticket details");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [ticketId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await api.post(`api/tickets/${ticketId}/comments/add/`, {
        content: newComment,
        is_internal: isInternal && userRole !== "customer",
      });

      setComments([res.data, ...comments]);
      setNewComment("");
      setIsInternal(false);
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!canUpdateStatus) {
      alert("You don't have permission to update this ticket");
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await api.patch(`api/tickets/${ticketId}/`, {
        status: newStatus,
      });
      setTicket(res.data);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update ticket status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "#fbbf24";
      case "in progress":
        return "#60a5fa";
      case "resolved":
        return "#34d399";
      case "closed":
        return "#6b7280";
      default:
        return "#9ca3af";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f97316";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ fontSize: "1.125rem", color: "#6b7280" }}>
          Loading ticket details...
        </p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div>
        <button
          onClick={onBack}
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← Back to Tickets
        </button>
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          {error || "Ticket not found"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          marginBottom: "1rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#6b7280",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#4b5563")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#6b7280")}
      >
        ← Back to Tickets
      </button>

      <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "2rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.5rem 0" }}>{ticket.title}</h1>
            <p style={{ margin: 0, color: "#6b7280" }}>Ticket ID: #{ticket.id}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 0.5rem 0" }}>
              Status
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["Open", "In progress", "Resolved", "Closed"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={updatingStatus || !canUpdateStatus}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor:
                      ticket.status === status
                        ? getStatusColor(status)
                        : "#e5e7eb",
                    color:
                      ticket.status === status ? "white" : "#4b5563",
                    border: "none",
                    borderRadius: "4px",
                    cursor: canUpdateStatus ? "pointer" : "not-allowed",
                    fontWeight: ticket.status === status ? "500" : "normal",
                    opacity: !canUpdateStatus ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (canUpdateStatus) {
                      e.target.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 0.5rem 0" }}>
              Priority
            </p>
            <div
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                backgroundColor: getPriorityColor(ticket.priority),
                color: "white",
                borderRadius: "4px",
                fontWeight: "500",
              }}
            >
              {ticket.priority}
            </div>
          </div>

          {ticket.assigned_to_username && (
            <div>
              <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 0.5rem 0" }}>
                Assigned To
              </p>
              <p style={{ margin: 0, fontWeight: "500" }}>
                {ticket.assigned_to_username}
              </p>
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", marginBottom: "2rem" }}>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 0.5rem 0" }}>
            Description
          </p>
          <p style={{ margin: 0, color: "#4b5563", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
            {ticket.description}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
          <div>
            <span>Created by: </span>
            <strong>{ticket.created_by_username}</strong>
          </div>
          <div>
            <span>Created: </span>
            <strong>{new Date(ticket.created_at).toLocaleString()}</strong>
          </div>
          <div>
            <span>Last Updated: </span>
            <strong>{new Date(ticket.updated_at).toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "2rem" }}>
        <h2 style={{ marginTop: 0 }}>Comments & Updates</h2>

        {comments.filter((c) => userRole !== "customer" || !c.is_internal).length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "1rem" }}>
            No comments yet
          </p>
        ) : (
          <div style={{ marginBottom: "2rem" }}>
            {comments
              .filter((c) => userRole !== "customer" || !c.is_internal)
              .map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: "1rem",
                  marginBottom: "1rem",
                  backgroundColor: comment.is_internal ? "#f3f4f6" : "white",
                  border: `1px solid ${comment.is_internal ? "#d1d5db" : "#e5e7eb"}`,
                  borderRadius: "6px",
                  borderLeft: `4px solid ${
                    comment.is_internal ? "#f97316" : "#2563eb"
                  }`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                  <div>
                    <strong style={{ color: "#1a1a1a" }}>
                      {comment.author_username}
                    </strong>
                    {comment.is_internal && (
                      <span
                        style={{
                          marginLeft: "0.5rem",
                          padding: "0.25rem 0.5rem",
                          backgroundColor: "#fed7aa",
                          color: "#92400e",
                          borderRadius: "3px",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                        }}
                      >
                        Internal
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: 0, color: "#4b5563", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "2rem" }}>
          <h3 style={{ marginTop: 0 }}>Add a Comment</h3>
          <form onSubmit={handleAddComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
              style={{
                width: "100%",
                padding: "1rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontFamily: "inherit",
                fontSize: "1em",
                minHeight: "120px",
                marginBottom: "1rem",
                boxSizing: "border-box",
              }}
            />

            {userRole !== "customer" && (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    Internal comment (visible to support team only)
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingComment}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: submittingComment ? "not-allowed" : "pointer",
                fontWeight: "500",
                opacity: submittingComment ? 0.7 : 1,
              }}
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TicketDetail;
