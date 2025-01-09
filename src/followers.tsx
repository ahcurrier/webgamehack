import { useEffect, useRef, useState } from "react";
import cursor from "./cursor.svg";

interface Follower {
  id: number;
  size: number;
  opacity: number;
  delay: number;
  position: { x: number; y: number };
  isStuck: boolean;
  stuckTo?: { x: number; y: number };
}

interface BubblePosition {
  x: number;
  y: number;
  size: number;
}

interface Props {
  bubblePositions: BubblePosition[];
}

const Followers = ({ bubblePositions }: Props) => {
  const [followers, setFollowers] = useState<Follower[]>(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      size: Math.random() * 30 + 20,
      opacity: Math.random() * 0.5 + 0.2,
      delay: i * 0.2,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      isStuck: false,
    }))
  );
  const [angle, setAngle] = useState(0);
  const targetRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const checkCollision = (follower: Follower, bubble: BubblePosition) => {
    const dx = follower.position.x - bubble.x;
    const dy = follower.position.y - bubble.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < bubble.size / 2 + follower.size / 2;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const updatePositions = () => {
      setFollowers((prevFollowers) =>
        prevFollowers.map((follower) => {
          if (follower.isStuck) return follower;

          const newPos = {
            x:
              follower.position.x +
              (targetRef.current.x - follower.position.x) * 0.1,
            y:
              follower.position.y +
              (targetRef.current.y - follower.position.y) * 0.1,
          };

          // Check collisions with bubbles
          for (const bubble of bubblePositions) {
            if (checkCollision({ ...follower, position: newPos }, bubble)) {
              return {
                ...follower,
                isStuck: true,
                stuckTo: { x: bubble.x, y: bubble.y },
              };
            }
          }

          const dx = newPos.x - follower.position.x;
          const dy = newPos.y - follower.position.y;
          if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            setAngle(Math.atan2(dy, dx) * (180 / Math.PI));
          }

          return { ...follower, position: newPos };
        })
      );
      requestAnimationFrame(updatePositions);
    };

    window.addEventListener("mousemove", handleMouseMove);
    requestAnimationFrame(updatePositions);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [bubblePositions]);

  return (
    <>
      {followers.map((follower) => (
        <img
          key={follower.id}
          src={cursor}
          alt="cursor"
          style={{
            position: "fixed",
            left: follower.isStuck
              ? follower.stuckTo!.x
              : follower.position.x - follower.size / 2,
            top: follower.isStuck
              ? follower.stuckTo!.y
              : follower.position.y - follower.size / 2,
            width: follower.size,
            height: follower.size,
            pointerEvents: "none",
            transform: `rotate(${angle + 90}deg)`,
            opacity: follower.opacity,
            transition: follower.isStuck
              ? "none"
              : `all ${0.1 + follower.delay}s ease`,
          }}
        />
      ))}
    </>
  );
};

export default Followers;
