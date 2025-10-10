import React, { useState } from "react";
import { Link } from "react-router-dom";
import VideoUpload from "../videos/VideoUpload";
import Profile from "../profile/Profile";
import MultiScheduleModal from "../videos/MultiScheduleModal";
import DeviceList from "../videos/DeviceList";
import "./Header.css";

const Header: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeviceList, setShowDeviceList] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">Logo</Link>
          </div>

          <div className="header-right">
            {/* Upload Button */}
            <button
              type="button"
              className="btn-upload"
              onClick={() => setShowUploadModal(true)}
            >
              <img src="/upload.png" alt="Upload" className="upload-icon" />
              Upload
            </button>

            {/* Device Preview Button */}
            <button
              type="button"
              className="btn-upload"
              onClick={() => setShowDeviceList(true)}
            >
              Device Preview
            </button>

            {/* Profile Avatar */}
            <div className="avatar" onClick={() => setShowProfileModal(true)}>
              <img src="/user.png" alt="User Avatar" />
            </div>
          </div>
        </div>
      </header>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="video-upload-modal-backdrop"
          onClick={() => setShowUploadModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <VideoUpload onClose={() => setShowUploadModal(false)} />
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div
          className="video-upload-modal-backdrop"
          onClick={() => setShowProfileModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Profile onClose={() => setShowProfileModal(false)} />
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div
          className="video-upload-modal-backdrop"
          onClick={() => setShowScheduleModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <MultiScheduleModal onClose={() => setShowScheduleModal(false)} />
          </div>
        </div>
      )}

      {/* Device List Modal */}
      {showDeviceList && (
        <div
          className="video-upload-modal-backdrop"
          onClick={() => setShowDeviceList(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <DeviceList />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
