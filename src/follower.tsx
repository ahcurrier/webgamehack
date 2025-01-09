import { useEffect, useRef, useState } from "react";
import cursor from "./cursor.svg";

const Follower = () => {
  const [position, setPosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [angle, setAngle] = useState(0);
  const targetRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const prevPosRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const updatePosition = () => {
      const newPos = {
        x: position.x + (targetRef.current.x - position.x) * 0.1,
        y: position.y + (targetRef.current.y - position.y) * 0.1,
      };

      const dx = newPos.x - prevPosRef.current.x;
      const dy = newPos.y - prevPosRef.current.y;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        setAngle(Math.atan2(dy, dx) * (180 / Math.PI));
      }

      setPosition(newPos);
      prevPosRef.current = newPos;
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove);
    requestAnimationFrame(updatePosition);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [position]); // Added position dependency

  return (
    <img
      src={cursor}
      alt="cursor"
      style={{
        position: "fixed",
        left: position.x - 25,
        top: position.y - 25,
        width: "50px",
        height: "50px",
        pointerEvents: "none",
        transform: `rotate(${angle + 90}deg)`,
      }}
    />
  );
};
export default Follower;
