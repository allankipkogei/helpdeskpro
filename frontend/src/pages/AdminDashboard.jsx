import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("api/admin/dashboard/");
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ fontSize: "1.125rem", color: "#6b7280" }}>
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div
        style={{
          padding: "2rem",
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        {error || "Failed to load dashboard"}
      </div>
    );
  }

  const StatCard = ({ title, value, color = "#2563eb" }) => (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        borderTop: `4px solid ${color}`,
      }}
    >
      <p style={{ color: "#6b7280", margin: "0 0 0.5rem 0", fontSize: "0.875rem" }}>
        {title}
      </p>
      <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color }}>
        {value}
      </p>
    </div>
  );

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

  return (
    <div>
      <h1 style={{ marginBottom: "2rem" }}>Admin Dashboard</h1>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          borderBottom: "2px solid #e5e7eb",
          flexWrap: "wrap",
        }}
      >
        {["overview", "users", "categories", "assignments"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: activeTab === tab ? "#2563eb" : "transparent",
              color: activeTab === tab ? "white" : "#6b7280",
              border: "none",
              cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid #2563eb" : "none",
              fontWeight: activeTab === tab ? "600" : "500",
              textTransform: "capitalize",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <StatCard title="Total Tickets" value={dashboardData.total_tickets} />
            <StatCard
              title="Unassigned"
              value={dashboardData.unassigned_tickets}
              color="#f97316"
            />
            <StatCard
              title="Total Users"
              value={dashboardData.total_users}
              color="#10b981"
            />
            <StatCard
              title="Support Team"
              value={dashboardData.support_team_count}
              color="#8b5cf6"
            />
            <StatCard
              title="Categories"
              value={dashboardData.total_categories}
              color="#06b6d4"
            />
          </div>

          {/* Status Distribution */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>
                Tickets by Status
              </h3>
              {Object.entries(dashboardData.tickets_by_status).map(
                ([status, count]) => (
                  <div
                    key={status}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                      padding: "0.75rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: getStatusColor(status),
                        }}
                      />
                      <span style={{ color: "#6b7280" }}>{status}</span>
                    </div>
                    <strong style={{ color: "#1a1a1a" }}>{count}</strong>
                  </div>
                )
              )}
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>
                Tickets by Priority
              </h3>
              {Object.entries(dashboardData.tickets_by_priority).map(
                ([priority, count]) => (
                  <div
                    key={priority}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                      padding: "0.75rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: getPriorityColor(priority),
                        }}
                      />
                      <span style={{ color: "#6b7280" }}>{priority}</span>
                    </div>
                    <strong style={{ color: "#1a1a1a" }}>{count}</strong>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Recent Tickets */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Recent Tickets</h3>
            {dashboardData.recent_tickets.length === 0 ? (
              <p style={{ color: "#6b7280", textAlign: "center" }}>
                No recent tickets
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {dashboardData.recent_tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    style={{
                      padding: "1rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "4px",
                      borderLeft: `4px solid ${getStatusColor(ticket.status)}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#1a1a1a" }}>
                        #{ticket.id} - {ticket.title}
                      </strong>
                      <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                        {ticket.created_by_username}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          backgroundColor: getStatusColor(ticket.status),
                          color: "white",
                          borderRadius: "3px",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                        }}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && <UserManagement />}

      {/* Categories Tab */}
      {activeTab === "categories" && <CategoryManagement />}

      {/* Assignments Tab */}
      {activeTab === "assignments" && <TicketAssignments />}
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    groups: [],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("api/admin/users/");
      setUsers(res.data);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("api/admin/users/", formData);
      setUsers([...users, res.data]);
      setFormData({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        groups: [],
      });
      setShowForm(false);
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Failed to add user: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`api/admin/users/${userId}/`);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginBottom: "1.5rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "500",
        }}
      >
        {showForm ? "Cancel" : "Add New User"}
      </button>

      {showForm && (
        <form
          onSubmit={handleAddUser}
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              marginBottom: "1rem",
              boxSizing: "border-box",
            }}
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              marginBottom: "1rem",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              marginBottom: "1rem",
              boxSizing: "border-box",
            }}
          />

          <input
            type="text"
            placeholder="First Name"
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              marginBottom: "1rem",
              boxSizing: "border-box",
            }}
          />

          <input
            type="text"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              marginBottom: "1rem",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Create User
          </button>
        </form>
      )}

      {error && <p style={{ color: "#991b1b" }}>{error}</p>}

      <div style={{ display: "grid", gap: "1rem" }}>
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong style={{ color: "#1a1a1a", fontSize: "1.125rem" }}>
                {user.first_name} {user.last_name}
              </strong>
              <p style={{ margin: "0.25rem 0 0 0", color: "#6b7280" }}>
                @{user.username} • {user.email}
              </p>
              {user.groups.length > 0 && (
                <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                  {user.groups.map((group) => (
                    <span
                      key={group}
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#dbeafe",
                        color: "#1e40af",
                        borderRadius: "3px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      {group}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleDeleteUser(user.id)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("api/admin/categories/");
      setCategories(res.data);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const res = await api.post("api/admin/categories/", {
        name: newCategory,
      });
      setCategories([...categories, res.data]);
      setNewCategory("");
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Failed to add category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await api.delete(`api/admin/categories/${categoryId}/`);
      setCategories(categories.filter((c) => c.id !== categoryId));
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category");
    }
  };

  if (loading) return <p>Loading categories...</p>;

  return (
    <div>
      <form
        onSubmit={handleAddCategory}
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          display: "flex",
          gap: "1rem",
        }}
      >
        <input
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{
            flex: 1,
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "1em",
          }}
        />
        <button
          type="submit"
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
          Add
        </button>
      </form>

      {error && <p style={{ color: "#991b1b" }}>{error}</p>}

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {categories.map((category) => (
          <div
            key={category.id}
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong style={{ color: "#1a1a1a" }}>{category.name}</strong>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketAssignments() {
  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [supportAgents, setSupportAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketsRes = await api.get("api/admin/assignments/");
        setUnassignedTickets(ticketsRes.data);

        const usersRes = await api.get("api/admin/users/");
        const agents = usersRes.data.filter((u) =>
          u.groups.includes("Support Team")
        );
        setSupportAgents(agents);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssign = async (ticketId, userId) => {
    try {
      await api.patch(`api/admin/tickets/${ticketId}/assign/`, {
        assigned_to: userId,
      });
      setUnassignedTickets(unassignedTickets.filter((t) => t.id !== ticketId));
      setSelectedAgent({
        ...selectedAgent,
        [ticketId]: null,
      });
    } catch (err) {
      console.error("Error assigning ticket:", err);
      alert("Failed to assign ticket");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {error && <p style={{ color: "#991b1b" }}>{error}</p>}

      {unassignedTickets.length === 0 ? (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "2rem",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          <p>All tickets are assigned!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {unassignedTickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <h4 style={{ margin: "0 0 0.5rem 0" }}>
                  #{ticket.id} - {ticket.title}
                </h4>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}>
                  Created by {ticket.created_by_username} • Priority: {ticket.priority}
                </p>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <select
                  value={selectedAgent[ticket.id] || ""}
                  onChange={(e) =>
                    setSelectedAgent({
                      ...selectedAgent,
                      [ticket.id]: e.target.value,
                    })
                  }
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1em",
                  }}
                >
                  <option value="">Select support agent...</option>
                  {supportAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.first_name} {agent.last_name} (@{agent.username})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const agentId = selectedAgent[ticket.id];
                    if (agentId) {
                      handleAssign(ticket.id, agentId);
                    } else {
                      alert("Please select an agent");
                    }
                  }}
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
                  Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
