import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import VideoUpload from "../videos/VideoUpload";
import Profile from "../profile/Profile";
import MultiScheduleModal from "../videos/MultiScheduleModal";
import DeviceList from "../videos/DeviceList";
import "./Header.css";
import logo from "../../assets/logo.png"
import axios from "../../utils/axios";
import user from "../../assets/icons8-profile-48.png"

const Header: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [devices, setDevices] = useState<{ device_id: number; device_code: string; status: string; last_fetch_time?: string;}[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    let mounted = true;
    axios.get('/api/devices/list', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!mounted) return;
        setDevices(res.data.devices || []);
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  // close notification dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showNotifs && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showNotifs]);

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">
              <img src={logo} alt="Logo" style={{ width: "60px", height: "auto" }} />
            </Link>
          </div>

          <div className="header-right">
            <nav className="header-nav">
              <NavLink
                to="/home"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Home
              </NavLink>
              <NavLink
                to="/designers"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Creative designs
              </NavLink>
            </nav>

            {/* Upload Button */}
            <button
              type="button"
              className="btn-upload"
              onClick={() => setShowUploadModal(true)}
            >
              <img src="/upload.png" alt="Upload" className="upload-icon" />
              Upload
            </button>

            {/* Notification bell */}
            <div className="header-notif" ref={notifRef}>
              <button className="notif-btn" onClick={() => setShowNotifs(s => !s)} aria-label="Notifications" aria-expanded={showNotifs}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 1 0-3 0v0.68C7.64 5.36 6 7.929 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {devices.filter(d => ['inactive','offline','disconnected'].includes(String(d.status).toLowerCase())).length > 0 && (
                  <span className="notif-badge">{devices.filter(d => ['inactive','offline','disconnected'].includes(String(d.status).toLowerCase())).length}</span>
                )}
              </button>

              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="notif-title">Device Alerts</div>
                  {devices.filter(d => ['inactive','offline','disconnected'].includes(String(d.status).toLowerCase())).length === 0 ? (
                    <div className="notif-empty">No alerts</div>
                  ) : (
                    devices
                      .filter(d => ['inactive','offline','disconnected'].includes(String(d.status).toLowerCase()))
                      .map(d => (
                        <div key={`hdr-alert-${d.device_id}`} className="notif-item">
                          <div className="notif-item-title">{d.device_code} is <strong>{d.status}</strong></div>
                          <div className="notif-item-sub">Last fetch: {d.last_fetch_time ? new Date(d.last_fetch_time).toLocaleString() : '—'}</div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          
            {/* Device Preview Button */}
            {/* <button
              type="button"
              className="btn-upload"
              onClick={() => setShowDeviceList(true)}
            >
              Device Preview
            </button> */}

            {/* Profile Avatar */}
            <div className="avatar" onClick={() => setShowProfileModal(true)}>
              <img src={user} alt="User Avatar" />
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
