import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5036/api";

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ fullName: "", email: "", password: "", role: "Student" });

  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ studentName: "", doctorName: "", date: "", time: "", reason: "", status: "Pending" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } else {
        alert(data || "Login failed!");
      }
    } catch (err) {
      alert("Error logging in");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm)
      });
      if (res.ok) {
        alert("Registration successful! Please login.");
        setIsRegistering(false);
      } else {
        const msg = await res.text();
        alert(msg || "Registration failed!");
      }
    } catch (err) {
      alert("Error registering");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments`);
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const handleAppointmentChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`${API_URL}/appointments/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, appointmentId: editingId }),
      });
      setEditingId(null);
    } else {
      await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm({ studentName: "", doctorName: "", date: "", time: "", reason: "", status: "Pending" });
    fetchAppointments();
  };

  const handleEdit = (item) => {
    setEditingId(item.appointmentId);
    setForm(item);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      await fetch(`${API_URL}/appointments/${id}`, { method: "DELETE" });
      fetchAppointments();
    }
  };

  // Stats Calculations for Cards
  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(a => a.status === "Pending").length;
  const confirmedCount = appointments.filter(a => a.status === "Confirmed").length;

  // 1. LOGIN / REGISTER VIEW (MODERN GLASS UI)
  if (!user) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <div style={{
          width: "400px",
          padding: "40px",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          textAlign: "center"
        }}>
          {/* Logo & Header */}
          <div style={{ fontSize: "42px", marginBottom: "5px" }}>🏥</div>
          <h2 style={{ margin: "0 0 5px 0", color: "#1e293b", fontWeight: "700" }}>Campus Health</h2>
          <p style={{ color: "#64748b", margin: "0 0 25px 0", fontSize: "14px" }}>Management & Care Portal</p>

          <h3 style={{ textAlign: "left", color: "#334155", marginBottom: "15px" }}>
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h3>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ textAlign: "left" }}>
            {isRegistering && (
              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Full Name</label>
                <input type="text" name="fullName" required value={authForm.fullName} onChange={handleAuthChange} placeholder="e.g. John Doe" style={{ width: "100%", padding: "10px 12px", marginTop: "5px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", outline: "none" }} />
              </div>
            )}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Email Address</label>
              <input type="email" name="email" required value={authForm.email} onChange={handleAuthChange} placeholder="student@campus.edu" style={{ width: "100%", padding: "10px 12px", marginTop: "5px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", outline: "none" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Password</label>
              <input type="password" name="password" required value={authForm.password} onChange={handleAuthChange} placeholder="••••••••" style={{ width: "100%", padding: "10px 12px", marginTop: "5px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", outline: "none" }} />
            </div>
            {isRegistering && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Register As</label>
                <select name="role" value={authForm.role} onChange={handleAuthChange} style={{ width: "100%", padding: "10px 12px", marginTop: "5px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}>
                  <option value="Student">Student</option>
                  <option value="Doctor">Doctor</option>
                </select>
              </div>
            )}
            <button type="submit" style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "15px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
            }}>
              {isRegistering ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <p style={{ marginTop: "20px", fontSize: "14px", color: "#64748b" }}>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <span style={{ color: "#2563eb", cursor: "pointer", fontWeight: "600" }} onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Login" : "Register"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // 2. MAIN DASHBOARD VIEW
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* NAVBAR */}
      <nav style={{
        background: "#0f172a",
        color: "#fff",
        padding: "15px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "28px" }}>🏥</div>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>CampusHealth</h3>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Medical & Care Portal</span>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ display: "flex", gap: "25px", fontSize: "14px", fontWeight: "500", color: "#cbd5e1" }}>
          <span style={{ color: "#38bdf8", borderBottom: "2px solid #38bdf8", paddingBottom: "4px", cursor: "pointer" }}>Dashboard</span>
          <span style={{ cursor: "pointer" }}>Appointments</span>
          <span style={{ cursor: "pointer" }}>Doctors</span>
          <span style={{ cursor: "pointer" }}>Reports</span>
        </div>

        {/* User Info & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>{user.fullName}</div>
            <span style={{ fontSize: "11px", background: "#1e293b", padding: "2px 8px", borderRadius: "10px", color: "#38bdf8" }}>{user.role}</span>
          </div>
          <button onClick={handleLogout} style={{
            padding: "8px 16px",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer"
          }}>
            Logout
          </button>
        </div>
      </nav>

      {/* DASHBOARD CONTENT */}
      <div style={{ maxWidth: "1100px", margin: "30px auto", padding: "0 20px" }}>
        
        {/* STATS CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
          
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderLeft: "5px solid #2563eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600" }}>TOTAL APPOINTMENTS</div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginTop: "5px" }}>{totalAppointments}</div>
            </div>
            <div style={{ fontSize: "32px" }}>📅</div>
          </div>

          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderLeft: "5px solid #f59e0b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600" }}>PENDING REQUESTS</div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginTop: "5px" }}>{pendingCount}</div>
            </div>
            <div style={{ fontSize: "32px" }}>⏳</div>
          </div>

          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderLeft: "5px solid #10b981", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600" }}>CONFIRMED VISITS</div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginTop: "5px" }}>{confirmedCount}</div>
            </div>
            <div style={{ fontSize: "32px" }}>✅</div>
          </div>

        </div>

        {/* BOOKING FORM CARD */}
        <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px" }}>
            {editingId ? "📝 Edit Appointment Details" : "➕ Book New Appointment"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Student Name</label>
                <input type="text" name="studentName" placeholder="Student Name" value={form.studentName} onChange={handleAppointmentChange} required style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Assigned Doctor</label>
                <input type="text" name="doctorName" placeholder="Doctor Name" value={form.doctorName} onChange={handleAppointmentChange} required style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleAppointmentChange} required style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Time</label>
                <input type="time" name="time" value={form.time} onChange={handleAppointmentChange} required style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Reason for Visit</label>
              <input type="text" name="reason" placeholder="e.g. Fever, Headache, Routine Checkup" value={form.reason} onChange={handleAppointmentChange} required style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <select name="status" value={form.status} onChange={handleAppointmentChange} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <button type="submit" style={{
                padding: "10px 25px",
                backgroundColor: editingId ? "#10b981" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer"
              }}>
                {editingId ? "Update Record" : "Confirm Booking"}
              </button>
            </div>
          </form>
        </div>

        {/* APPOINTMENTS TABLE CARD */}
        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "20px 25px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px" }}>📋 Appointment Records</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px 20px" }}>Student</th>
                <th style={{ padding: "12px 20px" }}>Doctor</th>
                <th style={{ padding: "12px 20px" }}>Date & Time</th>
                <th style={{ padding: "12px 20px" }}>Reason</th>
                <th style={{ padding: "12px 20px" }}>Status</th>
                <th style={{ padding: "12px 20px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>No appointments registered yet.</td>
                </tr>
              ) : (
                appointments.map((item) => (
                  <tr key={item.appointmentId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 20px", fontWeight: "600", color: "#334155" }}>{item.studentName}</td>
                    <td style={{ padding: "14px 20px", color: "#475569" }}>{item.doctorName}</td>
                    <td style={{ padding: "14px 20px", color: "#475569" }}>{item.date} at {item.time}</td>
                    <td style={{ padding: "14px 20px", color: "#475569" }}>{item.reason}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#fff",
                        backgroundColor: item.status === "Confirmed" ? "#10b981" : item.status === "Cancelled" ? "#ef4444" : "#f59e0b"
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <button onClick={() => handleEdit(item)} style={{ padding: "5px 12px", marginRight: "8px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>Edit</button>
                      <button onClick={() => handleDelete(item.appointmentId)} style={{ padding: "5px 12px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default App;