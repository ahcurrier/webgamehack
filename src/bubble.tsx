import { useState } from "react";
import bubble from "./bubble2.svg";

interface BubbleProps {
  id: number;
  x: number;
  y: number;
  size?: number;
  capacity: number;
  count: number;
  onOrbAdded: () => void;
}

const Bubble = ({ id, x, y, size = 100, capacity, count, onOrbAdded }: BubbleProps) => {
  const getRotationSpeed = () => {
    if (count === 0) return 'none';
    // Start slow at 1 orb, get progressively faster
    const baseSpeed = 8 - ((count / capacity) * 6); // Goes from 8s to 2s as it fills up
    return `spin ${baseSpeed}s linear infinite`;
  };

  return (
    <div style={{ 
      position: "absolute", 
      left: x - size/2, 
      top: y - size/2,
      width: size,
      height: size,
    }}>
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        border: '2px solid rgba(0, 0, 0, 0.5)',
        borderRadius: '50%',
        animation: getRotationSpeed(),
        pointerEvents: 'none',
      }} />
      <img
        src={bubble}
        alt="bubble"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#000',
        fontSize: size * 0.25,
        fontWeight: 'bold',
        zIndex: 2,
        pointerEvents: 'none',
      }}>
        {count}/{capacity}
      </div>
    </div>
  );
};

export default Bubble;
