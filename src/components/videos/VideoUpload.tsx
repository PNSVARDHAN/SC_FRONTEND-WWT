import { useState } from "react";
import "./VideoUpload.css";
import Lottie from "lottie-react";
import uploadingAnimation from "../../assets/uploading.json";
import errorAnimation from "../../assets/error.json";
import successAnimation from "../../assets/success (1).json"
interface VideoUploadProps {
  onClose?: () => void;
}
const API_URL = import.meta.env.VITE_API_URL;

const VideoUpload: React.FC<VideoUploadProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTitle(e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a video");

    setUploading(true);
    setError(false);

    try {
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";

      videoElement.onloadedmetadata = async () => {
        const duration = Math.floor(videoElement.duration);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("is_default", isDefault ? "true" : "false");
        formData.append("duration", duration.toString());

        const token = localStorage.getItem("authToken");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_URL}/api/videos/upload`);
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            setUploading(false);
            setProgress(100);
            setShowSuccess(true); 
            setTimeout(() => {
              setShowSuccess(false); 
              setProgress(0);
              onClose && onClose();
            }, 3000);
          } else {
            setError(true);
            setUploading(false);
          }
        };


        xhr.onerror = () => {
          setError(true);
          setUploading(false);
        };

        xhr.send(formData);
      };

      videoElement.src = URL.createObjectURL(file);
    } catch (err: any) {
      setError(true);
      setUploading(false);
    }
  };

  return (
    <div className="video-upload-modal">
      <h2>Upload Video</h2>

      {/* ---------- Upload Form ---------- */}
      {!uploading && !error && !showSuccess && (
        <>
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
            {file ? (
              <p>{file.name}</p>
            ) : (
              <p>Drag & drop a video here or click to select</p>
            )}
            <input type="file" accept="video/*" onChange={handleFileChange} />
          </div>

          <input
            type="text"
            className="vu-text-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="vu-textarea"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="vu-default-toggle">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            Set as default
          </label>

          <button
            className="vu-upload-button"
            onClick={handleUpload}
            disabled={!file}
          >
            Upload
          </button>

          <button className="vu-cancel-button" onClick={onClose}>
            Cancel
          </button>
        </>
      )}

      {/* ---------- Uploading Popup ---------- */}
      {uploading && (
        <div className="vu-popup">
          <div className="vu-popup-content">
            <Lottie
              animationData={uploadingAnimation}
              loop
              className="vu-popup-animation"
            />
            <p className="Successmessage">Uploading... {progress}%</p>
          </div>
        </div>
      )}

      {/* ---------- Success Popup ---------- */}
      {showSuccess && (
        <div className="vu-popup">
          <div className="vu-popup-content">
            <Lottie
              animationData={successAnimation}
              loop={false}
              className="vu-popup-animation"
            />
            <p className="Successmessage">Video uploaded successfully!</p>
          </div>
        </div>
      )}

      {/* ---------- Error Popup ---------- */}
      {error && (
        <div className="vu-popup">
          <div className="vu-popup-content">
            <Lottie
              animationData={errorAnimation}
              loop={false}
              className="vu-popup-animation"
            />
            <p>Upload failed. Please try again.</p>
            <button
              onClick={() => {
                setError(false);
                setUploading(false);
              }}
              className="vu-retry-button"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );

};

export default VideoUpload;
