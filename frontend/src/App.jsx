import { useEffect, useState } from "react";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import CreateTicket from "./pages/CreateTicket";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import api from "./api/axios";

function App() {
  const [authenticated, setAuthenticated] = useState(
    !!localStorage.getItem("access")
  );
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!authenticated) {
        setLoadingRole(false);
        return;
      }

      try {
        // Try to fetch admin dashboard to determine if user is admin
        await api.get("api/admin/dashboard/");
        setUserRole("admin");
      } catch (err) {
        // Check if user can access support team endpoints
        try {
          await api.get("api/tickets/");
          // If we get here, user can access tickets
          setUserRole("user");
        } catch (e) {
          setUserRole("user");
        }
      } finally {
        setLoadingRole(false);
      }
    };

    checkUserRole();
  }, [authenticated]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAuthenticated(false);
    setSelectedTicketId(null);
    setShowCreateTicket(false);
    setUserRole(null);
  };

  const handleTicketCreated = (newTicket) => {
    setShowCreateTicket(false);
    setSelectedTicketId(newTicket.id);
  };

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />;
  }

  if (loadingRole) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh" 
      }}>
        <p style={{ fontSize: "1.125rem", color: "#6b7280" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{
        backgroundColor: "#2563eb",
        color: "white",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <h1 style={{ margin: 0 }}>HelpDesk Pro</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {userRole === "admin" ? (
            <>
              <button
                onClick={() => {
                  setSelectedTicketId(null);
                  setShowCreateTicket(false);
                }}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  marginRight: "1rem",
                  textDecoration: selectedTicketId || showCreateTicket ? "none" : "underline"
                }}
              >
                Admin
              </button>
              <span style={{ color: "#dbeafe", fontSize: "0.875rem" }}>
                Admin Mode
              </span>
            </>
          ) : (
            <button
              onClick={() => {
                setSelectedTicketId(null);
                setShowCreateTicket(false);
              }}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                marginRight: "1rem",
                textDecoration: selectedTicketId || showCreateTicket ? "none" : "underline"
              }}
            >
              My Tickets
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ padding: "2rem", flex: 1 }}>
        {userRole === "admin" ? (
          <AdminDashboard />
        ) : showCreateTicket ? (
          <CreateTicket onSuccess={handleTicketCreated} />
        ) : selectedTicketId ? (
          <TicketDetail
            ticketId={selectedTicketId}
            onBack={() => setSelectedTicketId(null)}
          />
        ) : (
          <Tickets 
            onSelectTicket={setSelectedTicketId}
            onCreateClick={() => setShowCreateTicket(true)}
          />
        )}
      </div>

      <footer style={{
        backgroundColor: "#f3f4f6",
        borderTop: "1px solid #e5e7eb",
        padding: "2rem",
        textAlign: "center",
        color: "#6b7280",
        fontSize: "0.875rem"
      }}>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} HelpDesk Pro. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
