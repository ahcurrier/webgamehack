import "./App.css";
import Bubble from "./bubble";
import Follower from "./follower";

function App() {
  return (
    <div className="App">
      <Follower />
      <Bubble x={100} y={100} size={80} />
      <Bubble x={300} y={200} size={120} />
      <header className="App-header h-[3000px] bg-blue-500 border border-4 border-white">
        thing
      </header>
    </div>
  );
}

export default App;
