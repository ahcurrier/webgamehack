import { useEffect, useRef, useState } from "react";
import cursor from "./cursor.svg";

interface Follower {
  id: number;
  size: number;
  opacity: number;
  delay: number;
  position: { x: number; y: number };
  state: 'trailing' | 'wandering';
  wanderAngle?: number;
  wanderSpeed?: number;
  bubbleId?: number;
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
  onBubbleCollision: (bubbleId: number) => void;
}

const Followers = ({ bubblePositions, stationaryOrbs, onOrbCollected, followingCount, onBubbleCollision }: Props) => {
  const [trailingOrbs, setTrailingOrbs] = useState<Follower[]>(() => 
    Array.from({ length: 1 }, (_, i) => ({
      id: i,
      size: 20,
      opacity: 0.8,
      delay: i * 0.1,
      position: { x: 0, y: 0 },
      state: 'trailing',
      wanderAngle: Math.random() * Math.PI * 2,
      wanderSpeed: 1 + Math.random() * 2,
    }))
  );
  const [wanderingOrbs, setWanderingOrbs] = useState<Follower[]>([]);
  const [nextId, setNextId] = useState(1); // Track next available ID
  const targetRef = useRef({ x: 0, y: 0 });
  const lastPositions = useRef<Array<{x: number, y: number}>>([]);
  const [angle, setAngle] = useState(0);
  const pendingBubbleCollision = useRef<{bubbleId: number, orb: Follower} | null>(null);

  // Handle pending bubble collisions
  useEffect(() => {
    if (pendingBubbleCollision.current) {
      const { bubbleId, orb } = pendingBubbleCollision.current;
      setWanderingOrbs(prev => [...prev, orb]);
      onBubbleCollision(bubbleId);
      pendingBubbleCollision.current = null;
    }
  });

  // Update followers count when new orbs are collected
  useEffect(() => {
    const totalOrbs = trailingOrbs.length + wanderingOrbs.length;
    if (followingCount > totalOrbs) {
      setTrailingOrbs(prev => [
        ...prev,
        {
          id: nextId,
          size: 20,
          opacity: 0.8 - (prev.length * 0.1),
          delay: prev.length * 0.1,
          position: prev[prev.length - 1]?.position || targetRef.current,
          state: 'trailing',
          wanderAngle: Math.random() * Math.PI * 2,
          wanderSpeed: 1 + Math.random() * 2,
        }
      ]);
      setNextId(id => id + 1);
    }
  }, [followingCount, wanderingOrbs.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = {
        x: e.clientX,
        y: e.clientY
      };
      
      // Check for collisions with stationary orbs
      for (const orb of stationaryOrbs) {
        if (!orb.collected && checkCollision(targetRef.current, { ...orb, size: 20 })) {
          onOrbCollected(orb.id);
          break;
        }
      }
    };

    let animationFrameId: number;
    const updatePositions = () => {
      // First, check for bubble collisions with trailing orbs
      setTrailingOrbs(prevTrailing => {
        for (const bubble of bubblePositions) {
          const availableSpace = bubble.capacity - bubble.count;
          if (availableSpace <= 0) continue;

          // Check if any trailing orb collides with this bubble
          const collidingOrb = prevTrailing.find(orb => 
            checkCollision(orb.position, bubble)
          );

          if (collidingOrb) {
            // Schedule the orb transfer for next effect
            pendingBubbleCollision.current = {
              bubbleId: bubble.id,
              orb: {
                ...collidingOrb,
                state: 'wandering' as const,
                bubbleId: bubble.id,
                position: {
                  x: bubble.x + (Math.random() - 0.5) * bubble.size * 0.8,
                  y: bubble.y + Math.random() * bubble.size * 0.8
                }
              }
            };
            
            // Remove only the colliding orb from trailing
            return prevTrailing.filter(orb => orb.id !== collidingOrb.id);
          }
        }

        // If no collisions, update trailing orb positions
        return prevTrailing.map((orb, index) => {
          const target = index === 0 
            ? targetRef.current 
            : lastPositions.current[index - 1] || targetRef.current;

          const newPos = {
            x: orb.position.x + (target.x - orb.position.x) * (0.15 - (index * 0.02)),
            y: orb.position.y + (target.y - orb.position.y) * (0.15 - (index * 0.02))
          };

          if (!lastPositions.current[index]) {
            lastPositions.current[index] = { x: 0, y: 0 };
          }
          lastPositions.current[index] = newPos;

          return { ...orb, position: newPos };
        });
      });

      // Update wandering orb positions
      setWanderingOrbs(prevWandering => 
        prevWandering.map(orb => {
          const bubble = bubblePositions.find(b => b.id === orb.bubbleId);
          if (!bubble) return orb;

          const wanderAngle = (orb.wanderAngle || 0) + (Math.random() - 0.5) * 0.1;
          const speed = (orb.wanderSpeed || 1) * 0.8;
          
          let newX = orb.position.x + Math.cos(wanderAngle) * speed;
          let newY = orb.position.y + Math.sin(wanderAngle) * speed;
          
          const dx = newX - bubble.x;
          const dy = newY - bubble.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxRadius = (bubble.size / 2) * 0.8;
          
          if (distance > maxRadius) {
            const angle = Math.atan2(dy, dx);
            newX = bubble.x + Math.cos(angle) * maxRadius;
            newY = bubble.y + Math.sin(angle) * maxRadius;
            orb.wanderAngle = angle + Math.PI + (Math.random() - 0.5) * 0.5;
          } else {
            orb.wanderAngle = wanderAngle;
          }
          
          return {
            ...orb,
            position: { x: newX, y: newY }
          };
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
  }, [bubblePositions, stationaryOrbs, onOrbCollected, onBubbleCollision]);

  const checkCollision = (position: { x: number, y: number }, target: { x: number, y: number, size: number }) => {
    const dx = position.x - target.x;
    const dy = position.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < target.size / 2 + 10; // 10 is half the orb size
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {[...trailingOrbs, ...wanderingOrbs].map((orb) => (
        <img
          key={`orb-${orb.id}-${orb.state}`}
          src={cursor}
          alt="cursor"
          style={{
            position: "absolute",
            left: orb.position.x - orb.size / 2,
            top: orb.position.y - orb.size / 2,
            width: orb.size,
            height: orb.size,
            pointerEvents: "none",
            transform: `rotate(${angle + 90}deg)`,
            opacity: orb.opacity,
            transition: orb.state === 'trailing' ? `transform ${0.1 + orb.delay}s ease` : 'none',
            zIndex: 1000,
          }}
        />
      ))}
    </div>
  );
};

export default Followers;
