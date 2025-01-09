import { useState } from "react";
import bubble from "./bubble.svg";

interface BubbleProps {
  x: number;
  y: number;
  size?: number;
}

const Bubble = ({ x, y, size = 100 }: BubbleProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <img
      src={bubble}
      alt="bubble"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transition: "transform 0.3s ease",
        transform: `rotate(${isHovered ? "360deg" : "0deg"})`,
        animation: isHovered ? "spin 3s linear infinite" : "none",
      }}
    />
  );
};

export default Bubble;
