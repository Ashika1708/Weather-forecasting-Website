import React, { useState, useEffect } from 'react';
import backs from './backs.jpg';
import Weather from './Weather';

function App() {
  const [welcomeText, setWelcomeText] = useState('');
  const fullText = "Welcome! Get live weather updates for any city.";

  useEffect(() => {
    let i = 0;
    setWelcomeText('');
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setWelcomeText((text) => text + fullText[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 38);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="center-wrapper"
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: `url(${backs})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div className="background-overlay"></div>
      <div className="welcome-text">{welcomeText}</div>
      <h1 className="main-title">Weather Forecast Website</h1>
      <Weather />
      <footer className="footer">Made by [Your Name]</footer>
    </div>
  );
}

export default App;
