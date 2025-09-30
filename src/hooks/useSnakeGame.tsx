'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Direction, SnakeSegment, BaseToken } from '@/types/game';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const GRID_SIZE = 20;
const INITIAL_SNAKE: SnakeSegment[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];

const generateRandomToken = (snake: SnakeSegment[]): BaseToken => {
  let newToken: BaseToken;
  do {
    newToken = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      id: Math.random().toString(36).substr(2, 9)
    };
  } while (snake.some(segment => segment.x === newToken.x && segment.y === newToken.y));
  
  return newToken;
};

export const useSnakeGame = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    snake: INITIAL_SNAKE,
    direction: 'RIGHT',
    baseToken: generateRandomToken(INITIAL_SNAKE),
    score: 0,
    gameOver: false,
    isPaused: false
  }));
  
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const { sounds, initializeAudio } = useSoundEffects(soundEnabled);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>('RIGHT');
  const lastProcessedDirectionRef = useRef<Direction>('RIGHT');
  const directionChangeThisLoopRef = useRef<boolean>(false);
  
  // Initialize audio on first interaction
  useEffect(() => {
    const initAudio = () => {
      initializeAudio();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
    
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
    
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, [initializeAudio]);

  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver || prevState.isPaused) return prevState;

      const currentDirection = directionRef.current;
      const newSnake = [...prevState.snake];
      const head = { ...newSnake[0] };

      // Move head based on direction
      switch (currentDirection) {
        case 'UP':
          head.y = head.y - 1;
          break;
        case 'DOWN':
          head.y = head.y + 1;
          break;
        case 'LEFT':
          head.x = head.x - 1;
          break;
        case 'RIGHT':
          head.x = head.x + 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return { ...prevState, gameOver: true };
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return { ...prevState, gameOver: true };
      }

      newSnake.unshift(head);

      // Update the last processed direction and reset the change flag
      lastProcessedDirectionRef.current = currentDirection;
      directionChangeThisLoopRef.current = false;

      // Check if token is collected
      if (head.x === prevState.baseToken.x && head.y === prevState.baseToken.y) {
        // Play coin pickup sound effect
        sounds.playCoinPickup();
        
        return {
          ...prevState,
          snake: newSnake,
          baseToken: generateRandomToken(newSnake),
          score: prevState.score + 10,
          direction: currentDirection
        };
      }

      // Remove tail if no token collected
      newSnake.pop();

      return {
        ...prevState,
        snake: newSnake,
        direction: currentDirection
      };
    });
  }, [sounds]);

  const changeDirection = useCallback((newDirection: Direction) => {
    // Prevent direction changes within the same game loop iteration
    if (directionChangeThisLoopRef.current) {
      return;
    }

    // Prevent reverse direction - use the last processed direction for accuracy
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT'
    };

    if (opposites[lastProcessedDirectionRef.current] !== newDirection) {
      directionRef.current = newDirection;
      directionChangeThisLoopRef.current = true;
    }
  }, []);

  const resetGame = useCallback(() => {
    directionRef.current = 'RIGHT';
    lastProcessedDirectionRef.current = 'RIGHT';
    directionChangeThisLoopRef.current = false;
    setGameState({
      snake: INITIAL_SNAKE,
      direction: 'RIGHT',
      baseToken: generateRandomToken(INITIAL_SNAKE),
      score: 0,
      gameOver: false,
      isPaused: false
    });
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Game loop
  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, 150);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveSnake]);

  // Keyboard controls - Fixed to ensure proper event handling
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent default for game keys to avoid page scrolling
      const gameKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'r'];
      if (gameKeys.includes(event.key.toLowerCase())) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Handle direction changes only if game is not paused or over
      if (!gameState.gameOver && !gameState.isPaused) {
        switch (event.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            changeDirection('UP');
            break;
          case 's':
          case 'arrowdown':
            changeDirection('DOWN');
            break;
          case 'a':
          case 'arrowleft':
            changeDirection('LEFT');
            break;
          case 'd':
          case 'arrowright':
            changeDirection('RIGHT');
            break;
        }
      }

      // Handle pause/restart regardless of game state
      switch (event.key.toLowerCase()) {
        case ' ':
          if (!gameState.gameOver) {
            togglePause();
          }
          break;
        case 'r':
          if (gameState.gameOver) {
            resetGame();
          }
          break;
      }
    };

    // Add event listener with capture phase for better reliability
    document.addEventListener('keydown', handleKeyPress, true);
    return () => document.removeEventListener('keydown', handleKeyPress, true);
  }, [changeDirection, togglePause, resetGame, gameState.gameOver, gameState.isPaused]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);
  
  return {
    gameState,
    changeDirection,
    resetGame,
    togglePause,
    soundEnabled,
    toggleSound,
    GRID_SIZE
  };
};