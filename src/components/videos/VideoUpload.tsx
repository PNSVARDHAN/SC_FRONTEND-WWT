import { useState } from "react";
import "./VideoUpload.css";

interface VideoUploadProps {
  onClose?: () => void;
}
const API_URL = import.meta.env.VITE_API_URL

const VideoUpload: React.FC<VideoUploadProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTitle(e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a video");

    setUploading(true);

    try {
      // Create a temporary video element to get duration
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";

      videoElement.onloadedmetadata = async () => {
        const duration = Math.floor(videoElement.duration); // duration in seconds

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("is_default", isDefault ? "true" : "false");
        formData.append("duration", duration.toString()); // send duration

        const token = localStorage.getItem("authToken"); // JWT token
        const response = await fetch(`${API_URL}/api/videos/upload`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.msg || `HTTP error ${response.status}`);
        }

        const data = await response.json();
        alert(`Video uploaded successfully: ${data.title}`);

        // Reset form
        setFile(null);
        setTitle("");
        setDescription("");
        setIsDefault(false);
        setProgress(0);
        onClose && onClose();
      };

      // Load the file URL to get metadata
      videoElement.src = URL.createObjectURL(file);

    } catch (err: any) {
      alert("Upload failed: " + err.message);
      setUploading(false);
    }
  };

  return (
    <div className="video-upload-modal">
      <h2>Upload Video</h2>

      {/* Drag & Drop Area */}
      <div
        className="vu-dropzone"
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setTitle(e.dataTransfer.files[0].name);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {file ? <p>{file.name}</p> : <p>Drag & drop a video here or click to select</p>}
        <input type="file" accept="video/*" onChange={handleFileChange} />
      </div>

      {/* Title Input */}
      <input
        type="text"
        className="vu-text-input"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Description Input */}
      <textarea
        className="vu-textarea"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Default Toggle */}
      <label className="vu-default-toggle">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
        Set as default
      </label>

      {/* Progress Bar */}
      {uploading && (
        <div className="vu-progress-bar">
          <div className="vu-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {/* Upload Button */}
      <button
        className="vu-upload-button"
        onClick={handleUpload}
        disabled={uploading || !file}
      >
        {uploading ? `Uploading...` : "Upload"}
      </button>

      {/* Cancel Button */}
      <button
        className="vu-cancel-button"
        onClick={onClose}
        disabled={uploading}
      >
        Cancel
      </button>
    </div>
  );
};

export default VideoUpload;
