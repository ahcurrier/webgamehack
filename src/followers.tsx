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
      size: Math.max(30 - i * 3, 15),
      opacity: Math.max(0.8 - i * 0.1, 0.3),
      delay: i * 0.1,
      position: { x: 0, y: 0 },
      isStuck: false,
    }))
  );
  const [angle, setAngle] = useState(0);
  const targetRef = useRef({ x: 0, y: 0 });

  const checkCollision = (follower: Follower, bubble: BubblePosition) => {
    const dx = follower.position.x - bubble.x;
    const dy = follower.position.y - bubble.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < bubble.size / 2 + follower.size / 2;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    let animationFrameId: number;
    const updatePositions = () => {
      setFollowers((prevFollowers) =>
        prevFollowers.map((follower, index) => {
          if (follower.isStuck && follower.stuckTo) return follower;

          const target = index === 0 
            ? targetRef.current 
            : prevFollowers[index - 1].position;

          const speed = 0.15 - (index * 0.02);
          
          const newPos = {
            x: follower.position.x + (target.x - follower.position.x) * speed,
            y: follower.position.y + (target.y - follower.position.y) * speed,
          };

          for (const bubble of bubblePositions) {
            if (checkCollision({ ...follower, position: newPos }, bubble)) {
              return {
                ...follower,
                isStuck: true,
                stuckTo: { x: bubble.x, y: bubble.y },
                position: newPos,
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
      animationFrameId = requestAnimationFrame(updatePositions);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationFrameId = requestAnimationFrame(updatePositions);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [bubblePositions]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {followers.map((follower) => (
        <img
          key={follower.id}
          src={cursor}
          alt="cursor"
          style={{
            position: "absolute",
            left: follower.isStuck && follower.stuckTo
              ? follower.stuckTo.x - follower.size / 2
              : follower.position.x - follower.size / 2,
            top: follower.isStuck && follower.stuckTo
              ? follower.stuckTo.y - follower.size / 2
              : follower.position.y - follower.size / 2,
            width: follower.size,
            height: follower.size,
            pointerEvents: "none",
            transform: `rotate(${angle + 90}deg)`,
            opacity: follower.opacity,
            transition: follower.isStuck
              ? "none"
              : `transform ${0.1 + follower.delay}s ease`,
            zIndex: 1000,
          }}
        />
      ))}
    </div>
  );
};

export default Followers;
