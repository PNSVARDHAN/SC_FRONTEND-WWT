import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

interface Device {
  id: number;
  name: string;
}

interface User {
  userId: number;
  username: string;
  email: string;
  created_at: string;
}

const Profile: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "devices" | "password">(
    "profile"
  );
  const [newDevice, setNewDevice] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const userId = Number(localStorage.getItem("userId"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) {
      console.error("No userId or token found in localStorage");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try { 
        const userRes = await axios.get(`${API_URL}/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        const devicesRes = await axios.get("/api/devices/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDevices(Array.isArray(devicesRes.data) ? devicesRes.data : []);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, token]);

  if (loading) return <div>Loading profile...</div>;
  if (!user) return <div>User not found</div>;

  const joinedDate = new Date(user.created_at);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  // ✅ Add device
  const handleAddDevice = async () => {
    if (!newDevice.trim()) return;
    try {
      const res = await axios.post(
        `${API_URL}/api/devices/add`,
        { name: newDevice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDevices([...devices, res.data]);
      setNewDevice("");
    } catch (err) {
      console.error("Error adding device:", err);
    }
  };

  // ✅ Delete device
  const handleDeleteDevice = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/devices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(devices.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Error deleting device:", err);
    }
  };

  return (
    <div className="profile-modal">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <h2>Welcome, {user.username}</h2>
        <ul>
          <li
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Profile Info
          </li>
          <li
            className={activeTab === "devices" ? "active" : ""}
            onClick={() => setActiveTab("devices")}
          >
            Devices
          </li>
          <li
            className={activeTab === "password" ? "active" : ""}
            onClick={() => setActiveTab("password")}
          >
            Change Password
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {/* Main Content */}
      <div className="profile-card">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="profile-header">
          <div className="avatar">
            <img src="/user.png" alt="User Avatar" />
          </div>
          <h2>{user.username}</h2>
          <p className="role">Administrator</p>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="profile-info">
            <h3>Profile Info</h3>
            <div className="info-row">
              <span className="label">Username:</span>
              <span className="value">{user.username}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="label">Joined:</span>
              <span className="value">
                {joinedDate.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <button className="edit-btn">Edit Profile</button>
          </div>
        )}

        {activeTab === "devices" && (
          <div className="devices-section">
            <h3>Devices</h3>
            <ul className="devices-list">
              {devices.length > 0 ? (
                devices.map((device) => (
                  <li key={device.id} className="device-item">
                    {device.name}
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteDevice(device.id)}
                    >
                      ✕
                    </button>
                  </li>
                ))
              ) : (
                <li>No devices found</li>
              )}
            </ul>
            <div className="add-device">
              <input
                type="text"
                value={newDevice}
                placeholder="Enter device name"
                onChange={(e) => setNewDevice(e.target.value)}
              />
              <button onClick={handleAddDevice}>Add Device</button>
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="password-section">
            <h3>Change Password</h3>
            <input type="password" placeholder="Old Password" />
            <input type="password" placeholder="New Password" />
            <input type="password" placeholder="Confirm New Password" />
            <button className="save-btn">Update Password</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
