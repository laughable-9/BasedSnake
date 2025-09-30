'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import type { Direction } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface GameControlsProps {
  onDirectionChange: (direction: Direction) => void;
  onRestart: () => void;
  onTogglePause: () => void;
  isPaused: boolean;
  gameOver: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onDirectionChange,
  onRestart,
  onTogglePause,
  isPaused,
  gameOver
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<TouchPosition>({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState<TouchPosition>({ x: 0, y: 0 });

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current || gameOver) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setIsDragging(true);
    setStartPos({ x: centerX, y: centerY });
    setCurrentPos({ x: clientX, y: clientY });
  }, [gameOver]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = rect.width / 2 - 10;

    if (distance <= maxDistance) {
      setCurrentPos({ x: clientX, y: clientY });
    } else {
      const angle = Math.atan2(deltaY, deltaX);
      setCurrentPos({
        x: centerX + Math.cos(angle) * maxDistance,
        y: centerY + Math.sin(angle) * maxDistance
      });
    }
  }, [isDragging]);

  const handleEnd = useCallback(() => {
    if (!isDragging || gameOver || isPaused) {
      setIsDragging(false);
      setStartPos({ x: 0, y: 0 });
      setCurrentPos({ x: 0, y: 0 });
      return;
    }

    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Reduced threshold for better responsiveness
    if (distance > 15) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        onDirectionChange(deltaX > 0 ? 'RIGHT' : 'LEFT');
      } else {
        onDirectionChange(deltaY > 0 ? 'DOWN' : 'UP');
      }
    }

    setIsDragging(false);
    setStartPos({ x: 0, y: 0 });
    setCurrentPos({ x: 0, y: 0 });
  }, [isDragging, currentPos, startPos, onDirectionChange, gameOver, isPaused]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // Mouse events for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // Global mouse events for drag continuation
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  const getKnobPosition = (): React.CSSProperties => {
    if (!isDragging || !joystickRef.current) {
      return { transform: 'translate(-50%, -50%)' };
    }

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;

    return {
      transform: `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`
    };
  };

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-between items-end px-4 z-50">
      {/* Virtual Joystick */}
      <div className="relative">
        <div
          ref={joystickRef}
          className="w-24 h-24 bg-gray-800/70 rounded-full border-4 border-blue-500/50 flex items-center justify-center touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            ref={knobRef}
            className="w-8 h-8 bg-blue-500 rounded-full absolute top-1/2 left-1/2 transition-transform duration-100 shadow-lg"
            style={getKnobPosition()}
          />
        </div>
        <div className="text-center mt-2 text-xs text-white/70">Move</div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {gameOver ? (
          <Button
            onClick={onRestart}
            className="bg-green-600 hover:bg-green-700 text-white w-16 h-16 rounded-full"
          >
            <RotateCcw size={24} />
          </Button>
        ) : (
          <Button
            onClick={onTogglePause}
            className="bg-yellow-600 hover:bg-yellow-700 text-white w-16 h-16 rounded-full"
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </Button>
        )}
        <div className="text-center text-xs text-white/70">
          {gameOver ? 'Restart' : isPaused ? 'Resume' : 'Pause'}
        </div>
      </div>
    </div>
  );
};