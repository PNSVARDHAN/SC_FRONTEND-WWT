import React, { useEffect, useState } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/loading1.json";
import "./Profile.css";

interface Device {
  device_id: number;
  device_code: string;
  status: string;
  last_seen: string | null;
  playback_state: string;
  current_video_id: number | null;
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

  const API_URL = import.meta.env.VITE_API_URL;
  const userId = Number(localStorage.getItem("userId"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) {
      console.error("No userId or token found in localStorage");
      setLoading(false);
      return;
    }

    const fetchProfileAndDevices = async () => {
      try {
        const userRes = await axios.get(`${API_URL}/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        const devicesRes = await axios.get(`${API_URL}/api/devices/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (devicesRes.data.devices) setDevices(devicesRes.data.devices);
      } catch (err) {
        console.error("Error fetching profile or devices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndDevices();
  }, [userId, token, API_URL]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const handleDeleteDevice = async (id: number) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/api/devices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(devices.filter((d) => d.device_id !== id));
    } catch (err) {
      console.error("Error deleting device:", err);
    } finally {
      setLoading(false);
    }
  };

  const joinedDate = user ? new Date(user.created_at) : new Date();

  if (loading)
    return (
      <div className="profile-loading-overlay">
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          className="profile-loading-lottie"
        />
      </div>
    );

  if (!user) return <div>User not found</div>;

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
                  <li key={device.device_id} className="device-item">
                    <div className="device-info">
                      <span className="device-name">{device.device_code}</span>
                      <span className="device-status">
                        Status: {device.status || "inactive"}
                      </span>
                      {device.last_seen && (
                        <span className="device-last-seen">
                          Last seen:{" "}
                          {new Date(device.last_seen).toLocaleString()}
                        </span>
                      )}
                      <span className="device-playback">
                        Playback: {device.playback_state || "stopped"}
                      </span>
                    </div>

                    <div className="device-buttons">
                      <button
                        className="download-btn"
                        onClick={async () => {
                          try {
                            setLoading(true);
                            const res = await axios.get(
                              `${API_URL}/api/devices/${device.device_id}/download-config`,
                              {
                                headers: { Authorization: `Bearer ${token}` },
                                responseType: "blob",
                              }
                            );
                            const url = window.URL.createObjectURL(
                              new Blob([res.data])
                            );
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute(
                              "download",
                              `${device.device_code}.zip`
                            );
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                          } catch (err) {
                            console.error("Error downloading config:", err);
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        Download Config
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteDevice(device.device_id)}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li>No devices found</li>
              )}
            </ul>
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
