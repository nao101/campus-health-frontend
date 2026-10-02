import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5036/api";

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ fullName: "", email: "", password: "", role: "Student" });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState("Home");

  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ studentName: "", doctorName: "", date: "", time: "", reason: "", status: "Pending" });
  const [editingId, setEditingId] = useState(null);

  // Doctors list for dropdown
  const doctorsList = [
    { id: 1, name: "Dr. Sarah Ahmed", specialty: "General Physician", availability: "Mon - Thu (9:00 AM - 2:00 PM)", experience: "8+ Years", rating: "4.9 ⭐", image: "🩺" },
    { id: 2, name: "Dr. Tanvir Rahman", specialty: "Cardiologist", availability: "Sun - Wed (10:00 AM - 4:00 PM)", experience: "12+ Years", rating: "4.8 ⭐", image: "❤️" },
    { id: 3, name: "Dr. Nusrat Jahan", specialty: "Mental Health Specialist", availability: "Mon - Fri (1:00 PM - 5:00 PM)", experience: "6+ Years", rating: "5.0 ⭐", image: "🧠" },
    { id: 4, name: "Dr. Karim Chowdhury", specialty: "Dermatologist", availability: "Tue - Sat (11:00 AM - 3:00 PM)", experience: "10+ Years", rating: "4.7 ⭐", image: "🩺" }
  ];

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
        setActiveTab(data.user.role === "Doctor" ? "DoctorDashboard" : "Home");
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

  // Quick Action for Doctor to Status Change (Confirm/Cancel)
  const handleStatusChange = async (appointment, newStatus) => {
    const updated = { ...appointment, status: newStatus };
    await fetch(`${API_URL}/appointments/${appointment.appointmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    fetchAppointments();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      await fetch(`${API_URL}/appointments/${id}`, { method: "DELETE" });
      fetchAppointments();
    }
  };

  // Stats Calculations
  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(a => a.status === "Pending").length;
  const confirmedCount = appointments.filter(a => a.status === "Confirmed").length;

  // 1. LOGIN / REGISTER VIEW
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
                <input type="text" name="fullName" required value={authForm.fullName} onChange={handleAuthChange} placeholder="e.g. Dr. Sarah / John Doe" style={{ width: "100%", padding: "10px 12px", marginTop: "5px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", outline: "none" }} />
              </div>
            )}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Email Address</label>
              <input type="email" name="email" required value={authForm.email} onChange={handleAuthChange} placeholder="user@campus.edu" style={{ width: "100%", padding: "10px 12px", marginTop: "5px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", outline: "none" }} />
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

  // Determine Tab Options according to Role
  const isDoctor = user.role === "Doctor";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* NAVBAR */}
      <nav style={{
        background: isDoctor ? "#064e3b" : "#0f172a", // Doctor has a professional Dark Emerald Navbar
        color: "#fff",
        padding: "15px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "28px" }}>{isDoctor ? "👨‍⚕️" : "🏥"}</div>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
              {isDoctor ? "Doctor Portal" : "CampusHealth"}
            </h3>
            <span style={{ fontSize: "11px", color: "#a7f3d0" }}>
              {isDoctor ? "Clinical Management & Patient Requests" : "Medical & Care Portal"}
            </span>
          </div>
        </div>

        {/* Dynamic Menu Tabs based on Role */}
        <div style={{ display: "flex", gap: "25px", fontSize: "14px", fontWeight: "500" }}>
          {isDoctor ? (
            <>
              <span onClick={() => setActiveTab("DoctorHome")} style={{ color: activeTab === "DoctorHome" ? "#34d399" : "#cbd5e1", cursor: "pointer", borderBottom: activeTab === "DoctorHome" ? "2px solid #34d399" : "none", paddingBottom: "4px" }}>
      Home
    </span>
    <span onClick={() => setActiveTab("DoctorDashboard")} style={{ color: activeTab === "DoctorDashboard" ? "#34d399" : "#cbd5e1", cursor: "pointer", borderBottom: activeTab === "DoctorDashboard" ? "2px solid #34d399" : "none", paddingBottom: "4px" }}>
      Patient Requests
    </span>
    <span onClick={() => setActiveTab("DoctorSchedule")} style={{ color: activeTab === "DoctorSchedule" ? "#34d399" : "#cbd5e1", cursor: "pointer", borderBottom: activeTab === "DoctorSchedule" ? "2px solid #34d399" : "none", paddingBottom: "4px" }}>
      My Schedule
              </span>
            </>
          ) : (
            <>
              {["Home", "Appointments", "Doctors", "Reports"].map((tab) => (
                <span
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    color: activeTab === tab ? "#38bdf8" : "#cbd5e1",
                    borderBottom: activeTab === tab ? "2px solid #38bdf8" : "2px solid transparent",
                    paddingBottom: "4px",
                    cursor: "pointer"
                  }}
                >
                  {tab}
                </span>
              ))}
            </>
          )}
        </div>

        {/* User Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>{user.fullName}</div>
            <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "10px", color: "#fff" }}>{user.role}</span>
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

      {/* BODY CONTENT */}
      <div style={{ maxWidth: "1100px", margin: "30px auto", padding: "0 20px" }}>

        {/* ==================== DOCTOR VIEW ==================== */}
     {/* ==================== DOCTOR VIEW ==================== */}
{isDoctor && (
  <div>
    {/* DOCTOR HOME TAB */}
    {activeTab === "DoctorHome" && (
      <div>
        <div style={{
          background: "linear-gradient(135deg, #064e3b, #047857)",
          color: "#fff",
          padding: "35px",
          borderRadius: "16px",
          marginBottom: "30px",
          boxShadow: "0 10px 20px rgba(4, 120, 87, 0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>Welcome Back, {user.fullName}! 👋</h1>
            <p style={{ margin: 0, color: "#a7f3d0", fontSize: "15px" }}>
              Here is your daily clinical overview and patient management panel.
            </p>
          </div>
          <div style={{ fontSize: "70px" }}>🩺</div>
        </div>

        {/* QUICK STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", borderLeft: "5px solid #059669", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>TOTAL PATIENT REQUESTS</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginTop: "5px" }}>{totalAppointments}</div>
          </div>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", borderLeft: "5px solid #f59e0b", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>PENDING APPROVALS</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginTop: "5px" }}>{pendingCount}</div>
          </div>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", borderLeft: "5px solid #2563eb", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>CONFIRMED VISITS</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginTop: "5px" }}>{confirmedCount}</div>
          </div>
        </div>

        {/* TODAY'S QUICK SUMMARY */}
        <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 15px 0", color: "#1e293b" }}>⚡ Quick Actions</h3>
          <div style={{ display: "flex", gap: "15px" }}>
            <button onClick={() => setActiveTab("DoctorDashboard")} style={{ padding: "12px 20px", background: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
              📋 Review Pending Requests ({pendingCount})
            </button>
            <button onClick={() => setActiveTab("DoctorSchedule")} style={{ padding: "12px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
              📅 View Today's Schedule
            </button>
          </div>
        </div>
      </div>
    )}

    {/* DOCTOR PATIENT REQUESTS TAB */}
    {activeTab === "DoctorDashboard" && (
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{ padding: "20px 25px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: "18px" }}>💉 Student Appointment Requests</h3>
          <span style={{ fontSize: "13px", color: "#64748b" }}>Review student health reasons and confirm or reject appointments</span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", color: "#475569" }}>
              <th style={{ padding: "12px 20px" }}>Student Name</th>
              <th style={{ padding: "12px 20px" }}>Date & Time</th>
              <th style={{ padding: "12px 20px" }}>Symptom / Reason</th>
              <th style={{ padding: "12px 20px" }}>Status</th>
              <th style={{ padding: "12px 20px", textAlign: "center" }}>Doctor Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>No appointment requests found.</td>
              </tr>
            ) : (
              appointments.map((item) => (
                <tr key={item.appointmentId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 20px", fontWeight: "600", color: "#1e293b" }}>{item.studentName}</td>
                  <td style={{ padding: "14px 20px", color: "#475569" }}>{item.date} at {item.time}</td>
                  <td style={{ padding: "14px 20px", color: "#334155" }}>
                    <span style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px" }}>{item.reason}</span>
                  </td>
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
                  <td style={{ padding: "14px 20px", textAlign: "center" }}>
                    {item.status === "Pending" ? (
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button onClick={() => handleStatusChange(item, "Confirmed")} style={{ padding: "6px 12px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>
                          ✔ Approve
                        </button>
                        <button onClick={() => handleStatusChange(item, "Cancelled")} style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>
                          ✖ Reject
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleDelete(item.appointmentId)} style={{ padding: "5px 10px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>
                        Remove Record
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}

    {/* DOCTOR SCHEDULE TAB */}
    {activeTab === "DoctorSchedule" && (
      <div>
        <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: "25px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>📅 Confirmed Patient Schedule</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>List of all approved appointments ready for consultation.</p>
        </div>

        <div style={{ display: "grid", gap: "15px" }}>
          {appointments.filter(a => a.status === "Confirmed").length === 0 ? (
            <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", textAlign: "center", color: "#94a3b8" }}>
              No confirmed appointments scheduled yet.
            </div>
          ) : (
            appointments.filter(a => a.status === "Confirmed").map((item) => (
              <div key={item.appointmentId} style={{ background: "#fff", padding: "20px", borderRadius: "12px", borderLeft: "6px solid #10b981", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>{item.studentName}</div>
                  <div style={{ fontSize: "14px", color: "#059669", fontWeight: "600", marginTop: "4px" }}>
                    🕒 {item.date} at {item.time}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "6px" }}>
                    <strong>Symptom/Reason:</strong> {item.reason}
                  </div>
                </div>
                <button onClick={() => alert(`Opening Consultation window for ${item.studentName}`)} style={{ padding: "10px 18px", background: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                  Start Consultation 🩺
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    )}
  </div>
)}

        {/* ==================== STUDENT VIEW ==================== */}
        {!isDoctor && (
          <>
            {/* TAB 1: HOME */}
            {activeTab === "Home" && (
              <div>
                <div style={{
                  background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
                  color: "#fff",
                  padding: "40px",
                  borderRadius: "16px",
                  marginBottom: "30px",
                  boxShadow: "0 10px 25px rgba(37, 99, 235, 0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{ maxWidth: "600px" }}>
                    <h1 style={{ margin: "0 0 10px 0", fontSize: "32px", fontWeight: "800" }}>Welcome to Campus Health Center 🏥</h1>
                    <p style={{ margin: "0 0 20px 0", fontSize: "16px", lineHeight: "1.5", color: "#e0f2fe" }}>
                      Providing quality healthcare services for students and faculty members. Book appointments with campus doctors, track medical visits, and access digital health reports easily.
                    </p>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <button onClick={() => setActiveTab("Appointments")} style={{ padding: "12px 24px", background: "#fff", color: "#1d4ed8", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                        Book Appointment Now
                      </button>
                      <button onClick={() => setActiveTab("Doctors")} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid #fff", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                        View On-Duty Doctors
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: "110px", opacity: 0.9 }}>⚕️</div>
                </div>

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
              </div>
            )}

            {/* TAB 2: APPOINTMENTS */}
            {activeTab === "Appointments" && (
              <div>
                <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
                  <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px" }}>
                    {editingId ? "📝 Edit Appointment Details" : "➕ Book New Appointment"}
                  </h3>
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Student Name</label>
                        <input type="text" name="studentName" placeholder="Your Full Name" value={form.studentName} onChange={handleAppointmentChange} required style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Assigned Doctor</label>
                        <select name="doctorName" value={form.doctorName} onChange={handleAppointmentChange} required style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}>
                          <option value="">Select Doctor</option>
                          {doctorsList.map(doc => (
                            <option key={doc.id} value={doc.name}>{doc.name} ({doc.specialty})</option>
                          ))}
                        </select>
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

                    <button type="submit" style={{
                      padding: "10px 25px",
                      backgroundColor: "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}>
                      Submit Booking Request
                    </button>
                  </form>
                </div>

                <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                  <div style={{ padding: "20px 25px", borderBottom: "1px solid #f1f5f9" }}>
                    <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px" }}>📋 My Appointment Requests</h3>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "12px 20px" }}>Student</th>
                        <th style={{ padding: "12px 20px" }}>Doctor</th>
                        <th style={{ padding: "12px 20px" }}>Date & Time</th>
                        <th style={{ padding: "12px 20px" }}>Reason</th>
                        <th style={{ padding: "12px 20px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>No appointments requested yet.</td>
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
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: DOCTORS */}
            {activeTab === "Doctors" && (
              <div>
                <h2 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>👨‍⚕️ Campus Specialist Doctors</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                  {doctorsList.map((doc) => (
                    <div key={doc.id} style={{ background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", gap: "20px", alignItems: "center" }}>
                      <div style={{ fontSize: "50px", background: "#eff6ff", padding: "15px", borderRadius: "12px" }}>{doc.image}</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 5px 0", color: "#1e293b" }}>{doc.name}</h3>
                        <div style={{ color: "#2563eb", fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>{doc.specialty}</div>
                        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>⏱ <strong>Hours:</strong> {doc.availability}</div>
                        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>🎓 <strong>Exp:</strong> {doc.experience} | {doc.rating}</div>
                        <button
                          onClick={() => {
                            setForm({ ...form, doctorName: doc.name });
                            setActiveTab("Appointments");
                          }}
                          style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                        >
                          Book Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: REPORTS */}
            {activeTab === "Reports" && (
              <div>
                <h2 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>📄 Patient Health Reports</h2>
                <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "15px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ margin: 0, color: "#1e293b" }}>Campus Medical Summary</h3>
                      <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>Generated for: <strong>{user.fullName}</strong> ({user.role})</p>
                    </div>
                    <button onClick={() => window.print()} style={{ padding: "10px 20px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>
                      🖨️ Print Report
                    </button>
                  </div>
                  <p style={{ color: "#475569" }}>All checkups and visits history recorded in system.</p>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default App;