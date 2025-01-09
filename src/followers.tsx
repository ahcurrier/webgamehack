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
  id: number;
  x: number;
  y: number;
  size: number;
  capacity: number;
  count: number;
}

interface StationaryOrb {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface Props {
  bubblePositions: BubblePosition[];
  stationaryOrbs: StationaryOrb[];
  onOrbCollected: (orbId: number) => void;
  followingCount: number;
}

const Followers = ({ bubblePositions, stationaryOrbs, onOrbCollected, followingCount }: Props) => {
  const [followers, setFollowers] = useState<Follower[]>(() =>
    Array.from({ length: 1 }, (_, i) => ({
      id: i,
      size: 20,
      opacity: 0.8,
      delay: i * 0.1,
      position: { x: 0, y: 0 },
      isStuck: false,
    }))
  );
  const [angle, setAngle] = useState(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const lastPositions = useRef<Array<{x: number, y: number}>>([]);

  // Update followers count when new orbs are collected
  useEffect(() => {
    if (followingCount > followers.length) {
      setFollowers(prev => [
        ...prev,
        {
          id: prev.length,
          size: 20,
          opacity: 0.8 - (prev.length * 0.1),
          delay: prev.length * 0.1,
          position: prev[prev.length - 1]?.position || targetRef.current,
          isStuck: false,
        }
      ]);
    }
  }, [followingCount]);

  const checkCollision = (position: { x: number, y: number }, target: { x: number, y: number, size: number }) => {
    const dx = position.x - target.x;
    const dy = position.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < target.size / 2 + 10; // 10 is half the orb size
  };

  const checkStationaryCollisions = (position: { x: number, y: number }) => {
    for (const orb of stationaryOrbs) {
      if (!orb.collected && checkCollision(position, { ...orb, size: 20 })) {
        onOrbCollected(orb.id);
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = {
        x: e.clientX,
        y: e.clientY
      };
      
      // Check for collisions even when no followers
      if (followers.length === 0) {
        checkStationaryCollisions(targetRef.current);
      }
    };

    let animationFrameId: number;
    const updatePositions = () => {
      setFollowers((prevFollowers) => {
        // First, check for bubble collisions with any follower
        for (const bubble of bubblePositions) {
          const availableSpace = bubble.capacity - bubble.count;
          if (availableSpace <= 0) continue;

          // Check if any follower collides with this bubble
          const collidingFollower = prevFollowers.find(follower => 
            !follower.isStuck && checkCollision(follower.position, bubble)
          );

          if (collidingFollower) {
            // Calculate entry point on bubble circumference
            const dx = collidingFollower.position.x - bubble.x;
            const dy = collidingFollower.position.y - bubble.y;
            const angle = Math.atan2(dy, dx);
            const radius = bubble.size / 2;
            const entryPoint = {
              x: bubble.x + Math.cos(angle) * radius,
              y: bubble.y + Math.sin(angle) * radius
            };

            // If there's a collision, stick as many free orbs as possible into the bubble
            const freeFollowers = prevFollowers.filter(f => !f.isStuck);
            const orbsToStick = Math.min(freeFollowers.length, availableSpace);
            
            const updatedFollowers = prevFollowers.map((follower, index) => {
              if (follower.isStuck) return follower;
              
              // Only stick the first orbsToStick followers
              if (freeFollowers.indexOf(follower) < orbsToStick) {
                return {
                  ...follower,
                  isStuck: true,
                  stuckTo: entryPoint,
                  position: entryPoint,
                };
              }
              return follower;
            });

            // Update bubble count
            bubble.count += orbsToStick;
            
            return updatedFollowers;
          }
        }

        // If no bubble collisions, update positions normally
        return prevFollowers.map((follower, index) => {
          if (follower.isStuck) return follower;

          const target = index === 0 
            ? targetRef.current 
            : lastPositions.current[index - 1] || targetRef.current;

          const newPos = {
            x: follower.position.x + (target.x - follower.position.x) * (0.15 - (index * 0.02)),
            y: follower.position.y + (target.y - follower.position.y) * (0.15 - (index * 0.02)),
          };

          // Store the current position for the next follower to follow
          if (!lastPositions.current[index]) {
            lastPositions.current[index] = { x: 0, y: 0 };
          }
          lastPositions.current[index] = newPos;

          // Check collisions with stationary orbs
          checkStationaryCollisions(newPos);

          const dx = newPos.x - follower.position.x;
          const dy = newPos.y - follower.position.y;
          if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            setAngle(Math.atan2(dy, dx) * (180 / Math.PI));
          }

          return { ...follower, position: newPos };
        });
      });
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
  }, [bubblePositions, stationaryOrbs, onOrbCollected, followers.length]);

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
