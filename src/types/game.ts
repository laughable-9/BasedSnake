export interface Position {
  x: number;
  y: number;
}

export interface SnakeSegment {
  x: number;
  y: number;
}

export interface BaseToken {
  x: number;
  y: number;
  id: string;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface GameState {
  snake: SnakeSegment[];
  direction: Direction;
  baseToken: BaseToken;
  score: number;
  gameOver: boolean;
  isPaused: boolean;
}

export interface GameControls {
  onDirectionChange: (direction: Direction) => void;
  onRestart: () => void;
  onPause: () => void;
}