import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Monitor, Play, Clock } from "lucide-react";
import "./DeviceList.css";

interface Video {
  video_id: number;
  title: string;
  video_link: string;
}

interface Device {
  device_id: number;
  device_code: string;
  status: string;
  playback_state: string;
  last_seen: string | null;
  current_video: Video | null;
}

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/devices/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDevices(res.data.devices);
      } catch (err) {
        console.error("Failed to fetch devices", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  if (loading) {
    return (
      <div className="device-list-loader-container">
        <Loader2 className="device-list-loader" />
      </div>
    );
  }

  return (
    <div className="device-list-container">
      <div className="device-list-header">
        <h2>Devices</h2>
        <button className="device-list-add-button">+ Add Device</button>
      </div>

      <div className="device-list-grid">
        {devices.map((device) => (
          <div key={device.device_id} className="device-list-card">
            <div
              className={`device-list-badge ${
                device.status === "active" ? "active" : "inactive"
              }`}
            >
              {device.status}
            </div>

            <div className="device-list-device-header">
              <div className="device-list-device-icon">
                {device.device_code.charAt(0).toUpperCase()}
              </div>
              <h3>{device.device_code}</h3>
            </div>

            {/* ✅ Show video preview if available */}
            {device.current_video ? (
              <div className="device-list-video-preview">
                <video
                  src={device.current_video.video_link}
                  controls
                  muted
                  className="device-list-video"
                />
                <p className="device-list-video-title">
                  {device.current_video.title}
                </p>
              </div>
            ) : (
              <div className="device-list-no-video">
                <Play className="device-list-icon" />
                <span>No video playing</span>
              </div>
            )}

            <div className="device-list-info">
              <Monitor className="device-list-icon" />
              <span>{device.playback_state}</span>
            </div>

            <div className="device-list-info">
              <Clock className="device-list-icon" />
              <span>
                {device.last_seen
                  ? new Date(device.last_seen).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
