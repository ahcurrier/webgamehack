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
      
      // Set bubble positions first
      const bubblePositions = [
        { id: 1, x: viewportWidth * 0.2, y: viewportHeight * 0.2, size: 80, capacity: 3, count: 0 },
        { id: 2, x: viewportWidth * 0.4, y: viewportHeight * 0.3, size: 120, capacity: 6, count: 0 },
      ];
      setBubbles(bubblePositions);

      // Helper function to check if a position is too close to any bubble
      const isSafePosition = (x, y) => {
        const MIN_DISTANCE = 100; // Minimum distance from bubble edge
        for (const bubble of bubblePositions) {
          const dx = x - bubble.x;
          const dy = y - bubble.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < (bubble.size / 2) + MIN_DISTANCE) {
            return false;
          }
        }
        return true;
      };

      // Helper function to get a random position
      const getRandomPosition = () => {
        // Define the area where orbs can spawn (leaving margins)
        const margin = 50;
        const x = margin + Math.random() * (viewportWidth - 2 * margin);
        const y = margin + Math.random() * (viewportHeight - 2 * margin);
        return { x, y };
      };

      // Get safe positions for all orbs
      const orbPositions = [];
      const MAX_ATTEMPTS = 50;
      
      for (let i = 0; i < 8; i++) {
        let attempts = 0;
        let position;
        
        // Keep trying positions until we find a safe one or hit max attempts
        do {
          position = getRandomPosition();
          attempts++;
        } while (!isSafePosition(position.x, position.y) && attempts < MAX_ATTEMPTS);

        // If we couldn't find a safe position after max attempts, try a different area
        if (attempts >= MAX_ATTEMPTS) {
          // Try a different quadrant of the screen for each orb
          const quadrantX = (i % 2) * 0.5;
          const quadrantY = Math.floor(i / 4) * 0.5;
          position = {
            x: viewportWidth * (quadrantX + Math.random() * 0.4),
            y: viewportHeight * (quadrantY + Math.random() * 0.4)
          };
        }

        orbPositions.push({
          id: i,
          x: position.x,
          y: position.y,
          collected: false
        });
      }

      setStationaryOrbs(orbPositions);
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
          onOrbAdded={() => handleBubbleFilled(bubble.id, bubble.count + 1)}
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
        onBubbleCollision={(bubbleId) => handleBubbleFilled(bubbleId, bubbles.find(b => b.id === bubbleId)?.count + 1)}
      />
    </div>
  );
}
export default App;
