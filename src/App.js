import "./App.css";
import Bubble from "./bubble";
import Followers from "./followers";
import { useState, useEffect } from "react";

function App() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const updateBubbles = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      setBubbles([
        { x: viewportWidth * 0.2, y: viewportHeight * 0.2, size: 80 },
        { x: viewportWidth * 0.4, y: viewportHeight * 0.3, size: 120 },
      ]);
    };

    updateBubbles();
    window.addEventListener('resize', updateBubbles);
    
    return () => window.removeEventListener('resize', updateBubbles);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {bubbles.map((bubble, i) => (
        <Bubble key={i} {...bubble} />
      ))}
      <Followers bubblePositions={bubbles} />
    </div>
  );
}
export default App;
