import "./App.css";
import Bubble from "./bubble";
import Followers from "./followers";

function App() {
  const bubbles = [
    { x: 100, y: 100, size: 80 },
    { x: 300, y: 200, size: 120 },
    { x: 900, y: 600, size: 400 },
    { x: 500, y: 700, size: 500 },
    // Add more bubbles as needed
  ];

  return (
    <div>
      {bubbles.map((bubble, i) => (
        <Bubble key={i} {...bubble} />
      ))}
      <Followers bubblePositions={bubbles} />
    </div>
  );
}
export default App;
