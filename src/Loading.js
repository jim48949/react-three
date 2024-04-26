import React from 'react';
import './Loading.css'; // Import the CSS file

const Loading = ({ progress }) => {
  return (
    <div className="loading-container">
      <div className="loading-bar">
        <div className="loading-progress" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="loading-text">{progress}%</p>
    </div>
  );
};

export default Loading;
