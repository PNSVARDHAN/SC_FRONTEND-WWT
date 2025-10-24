import { useState } from 'react';
import './CreatePlaylist.css';

const CreatePlaylist = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="create-playlist-container">
        <button className="btn-schedule" onClick={openModal}>
          <span className="plus-symbol">+</span>
          Create Playlist
        </button>
      </div>

      <div className={`playlist-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
        <div className="playlist-modal" onClick={e => e.stopPropagation()}>
          <button className="close-modal" onClick={closeModal}>&times;</button>
          {/* Add your playlist creation form here */}
          <h2>Create New Playlis</h2>
          {/* Add more content as needed */}
        </div>
      </div>
    </>
  );
};

export default CreatePlaylist;