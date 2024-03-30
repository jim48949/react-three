import React from 'react';
import ThreeModelViewer from './ThreeModelViewer';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ position: 'absolute', top: '1%', left: '50%' }}>
          Javis 3D
        </h1>
      </header>
      <div>
        <ThreeModelViewer />
      </div>
    </div>
  );
}

export default App;
