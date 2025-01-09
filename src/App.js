import "./App.css";
import Bubble from "./bubble";
import Followers from "./followers";
import { useState, useEffect } from "react";
import cursor from "./cursor.svg";

function App() {
  const [bubbles, setBubbles] = useState([]);
  const [stationaryOrbs, setStationaryOrbs] = useState([]);
  const [gameState, setGameState] = useState({
    bubble1Count: 0,
    bubble2Count: 0,
    followingOrbs: 1, // Start with 1 orb
  });

  useEffect(() => {
    const updatePositions = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Set bubble positions
      setBubbles([
        { id: 1, x: viewportWidth * 0.2, y: viewportHeight * 0.2, size: 80, capacity: 3, count: 0 },
        { id: 2, x: viewportWidth * 0.4, y: viewportHeight * 0.3, size: 120, capacity: 6, count: 0 },
      ]);

      // Set stationary orb positions
      setStationaryOrbs(
        Array.from({ length: 8 }, (_, i) => ({
          id: i,
          x: viewportWidth * (0.2 + (i * 0.1)),
          y: viewportHeight * (Math.random() * 0.5 + 0.2),
          collected: false
        }))
      );
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    
    return () => window.removeEventListener('resize', updatePositions);
  }, []);

  const handleOrbCollected = (orbId) => {
    setStationaryOrbs(prev => 
      prev.map(orb => 
        orb.id === orbId ? { ...orb, collected: true } : orb
      )
    );
    setGameState(prev => ({
      ...prev,
      followingOrbs: prev.followingOrbs + 1
    }));
  };

  const handleBubbleFilled = (bubbleId, count) => {
    setBubbles(prev =>
      prev.map(bubble =>
        bubble.id === bubbleId 
          ? { ...bubble, count } 
          : bubble
      )
    );
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {bubbles.map((bubble) => (
        <Bubble 
          key={bubble.id} 
          {...bubble}
        />
      ))}
      {stationaryOrbs.map((orb) => (
        !orb.collected && (
          <img
            key={orb.id}
            src={cursor}
            alt="stationary orb"
            style={{
              position: 'absolute',
              left: orb.x - 10,
              top: orb.y - 10,
              width: 20,
              height: 20,
              filter: 'brightness(0)', // Makes the SVG black
              transform: 'rotate(90deg)', // Match the orientation of moving orbs
            }}
          />
        )
      ))}
      <Followers 
        bubblePositions={bubbles}
        stationaryOrbs={stationaryOrbs}
        onOrbCollected={handleOrbCollected}
        followingCount={gameState.followingOrbs}
      />
    </div>
  );
}
export default App;
