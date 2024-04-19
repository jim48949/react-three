import React, { useState } from 'react';
import './App.css'; // Import the CSS file
import ThreeModelViewer from './ThreeModelViewer';
import Loading from './Loading';

function App() {
  const [appState, setAppState] = useState('initial');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const correctPassword = '9527';

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password === correctPassword) {
      setAppState('loading');
      setTimeout(() => {
        setAppState('authenticated');
      }, 3000);
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (appState === 'initial' || appState === 'authenticated') {
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
        {appState === 'authenticated' && (
          <div className="App">
            <header className="App-header">
              <h1>Javis 3D</h1>
            </header>
            <div>
              <ThreeModelViewer />
            </div>
          </div>
        )}
      </>
    );
  }

  return <Loading />;
}

export default App;
