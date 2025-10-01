import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import "./MultiScheduleModal.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

interface Device {
  device_id: number;
  device_code: string;
  status: string;
}

interface Video {
  videoId: number;
  title: string; 
}

const MultiScheduleModal = ({ onClose }: { onClose: () => void }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [playMode, setPlayMode] = useState("loop");

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    axios
      .get("/api/devices/list", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setDevices(res.data.devices || []);
      })
      .catch((err) => console.error("Failed to load devices", err));

    axios
      .get("/api/videos/my-videos", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setVideos(res.data || []);
      })
      .catch((err) => console.error("Failed to load videos", err));
  }, []);

  const handleSchedule = async () => {
    if (!selectedDevices.length || !selectedVideos.length || !startTime) {
      return alert("Please select at least one device, one video, and start time.");
    }

    const token = localStorage.getItem("authToken");
    if (!token) return alert("Unauthorized");

    try {
      const res = await axios.post(
        "/api/schedules/create-multiple",
        {
          deviceIds: selectedDevices,
          videoIds: selectedVideos,
          startTime,
          endTime,
          repeat,
          playMode,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      alert(
        `Schedules created successfully!\nGroup ID: ${data.schedule_group_id}\nSchedules: ${data.schedule_ids.join(", ")}`
      );

      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to create schedules");
    }
  };

  const toggleVideoSelection = (videoId: number) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]
    );
  };

  const toggleDeviceSelection = (device_id: number) => {
    setSelectedDevices((prev) =>
      prev.includes(device_id) ? prev.filter((id) => id !== device_id) : [...prev, device_id]
    );
  };

  return (
    <div className="multi-schedule-modal">
      <div className="modal-header">
        <h2>Create Multi Video Schedule</h2>
        <button onClick={onClose} className="close-btn">
          ✖
        </button>
      </div>

      <div className="modal-body">
        <h4>Select Devices:</h4>
        {devices.map((d) => (
          <label key={`device-${d.device_id}`} style={{ display: "block", marginBottom: "5px" }}>
            <input
              type="checkbox"
              checked={selectedDevices.includes(d.device_id)}
              onChange={() => toggleDeviceSelection(d.device_id)}
            />
            {d.device_code} ({d.status})
          </label>
        ))}

        <h4>Select Videos:</h4>
        {videos.map((v) => (
          <label key={`video-${v.videoId}`} style={{ display: "block", marginBottom: "5px" }}>
            <input
              type="checkbox"
              checked={selectedVideos.includes(v.videoId)}
              onChange={() => toggleVideoSelection(v.videoId)}
            />
            {v.title}
          </label>
        ))}

        <label>Start Time:</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <label>End Time:</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
          />
          Repeat
        </label>

        <label>Play Mode:</label>
        <select value={playMode} onChange={(e) => setPlayMode(e.target.value)}>
          <option value="loop">Loop</option>
          <option value="once">Play Once</option>
        </select>
      </div>

      <div className="modal-footer">
        <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
          <button onClick={handleSchedule} className="btn-primary">
            Create Schedule
          </button>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiScheduleModal;
