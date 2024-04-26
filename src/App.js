import React, { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file
import ThreeModelViewer from './ThreeModelViewer';
import Loading from './Loading';
import ChatApp from './ChatApp';

function App() {
  const [appState, setAppState] = useState('initial');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const correctPassword = '9527';

  const [isLoading, setIsLoading] = useState(false); // Set initial isLoading state to false
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [showChat, setShowChat] = useState(false);

  // Function to trigger the chatbox
  const toggleChat = () => setShowChat(!showChat);

  // Function to update loading progress
  const updateLoadingProgress = () => {
    setLoadingProgress((prevProgress) => {
      const newProgress = prevProgress + 10;
      return newProgress > 100 ? 100 : newProgress;
    });
  };
  // Log the loadingProgress after it's updated
  useEffect(() => {
    //console.log("After updating, loadingProgress:", loadingProgress);
  }, [loadingProgress]);

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password === correctPassword) {
      setIsLoading(true); // Start loading animation after correct password is entered
      setAppState('loading'); // Update app state to 'loading'
      const interval = setInterval(() => {
        updateLoadingProgress();
      }, 300);

      setTimeout(() => {
        clearInterval(interval);
        setAppState('authenticated'); // Update app state to 'authenticated' after loading
      }, 3000); // Simulate a 3-second loading process
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (appState === 'initial' || appState === 'loading' || appState === 'authenticated') {
    return (
      <>
        {appState === 'initial' && (
          <>
            <div className="background" />
            <div className="password-container">
              <h2>Enter Password</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter password"
                />
                <button type="submit">Submit</button>
              </form>
              {error && <p>{error}</p>}
            </div>
          </>
        )}
        {appState === 'loading' && isLoading && (
          <div className="loading-container">
            <div className="loading-bar">
              <div className="loading-progress" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p className="loading-text">{loadingProgress}%</p>
          </div>
        )}
        {appState === 'authenticated' && (
          <div className="App">
            <header className="App-header">
              <h1>Javis 3D</h1>
            </header>
            <div>
              <ThreeModelViewer />
            </div>
            <div className="chatapp-container">
              <button className="chat-button" onClick={toggleChat}>Got Question?</button>
              {showChat && <ChatApp onClose={() => setShowChat(false)} />}
            </div>
            <div className="fade-in-animation">
              {/* Fade-in animation component */}
            </div>
          </div>
        )}
      </>
    );
  }

  return <Loading />;
}

export default App;
