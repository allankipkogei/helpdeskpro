import { useEffect, useState } from "react";
import api from "../api/axios";

function CreateTicket({ onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("api/admin/categories/");
        setCategories(res.data);
      } catch (err) {
        console.error("Error loading categories:", err);
        // Categories are optional, so don't show error
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
      };

      if (formData.category) {
        submitData.category = formData.category;
      }

      const res = await api.post("api/tickets/create/", submitData);

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "Medium",
      });

      // Call success callback with new ticket
      onSuccess(res.data);
    } catch (err) {
      console.error("Error creating ticket:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to create ticket. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "2rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1 style={{ marginTop: 0 }}>Create New Ticket</h1>

      {error && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1rem",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "6px",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#1a1a1a",
            }}
          >
            Ticket Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief description of your issue"
            maxLength="100"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "1em",
              boxSizing: "border-box",
            }}
          />
          <p
            style={{
              margin: "0.25rem 0 0 0",
              fontSize: "0.75rem",
              color: "#6b7280",
            }}
          >
            {formData.title.length}/100
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#1a1a1a",
            }}
          >
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please provide detailed information about your issue, including any error messages or steps to reproduce"
            minLength="10"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "1em",
              fontFamily: "inherit",
              minHeight: "150px",
              boxSizing: "border-box",
            }}
          />
          <p
            style={{
              margin: "0.25rem 0 0 0",
              fontSize: "0.75rem",
              color: "#6b7280",
            }}
          >
            Provide as much detail as possible to help us resolve your issue faster
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#1a1a1a",
              }}
            >
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1em",
                boxSizing: "border-box",
              }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <p
              style={{
                margin: "0.25rem 0 0 0",
                fontSize: "0.75rem",
                color: "#6b7280",
              }}
            >
              How urgent is this issue?
            </p>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#1a1a1a",
              }}
            >
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1em",
                boxSizing: "border-box",
              }}
            >
              <option value="">Select a category (optional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.875rem",
              backgroundColor: loading ? "#9ca3af" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "500",
              fontSize: "1em",
            }}
          >
            {loading ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>

      <div
        style={{
          marginTop: "2rem",
          paddingTop: "2rem",
          borderTop: "1px solid #e5e7eb",
          fontSize: "0.875rem",
          color: "#6b7280",
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>Tips for creating effective tickets:</strong>
        </p>
        <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.5rem" }}>
          <li>Be clear and specific about your issue</li>
          <li>Include error messages if applicable</li>
          <li>Describe what you were trying to do</li>
          <li>Set appropriate priority level</li>
        </ul>
      </div>
    </div>
  );
}

export default CreateTicket;
