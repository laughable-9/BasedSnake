'use client';

import React from 'react';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import { GameControls } from '@/components/GameControls';
import { ControlsDisplay } from '@/components/ControlsDisplay';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SnakeSegment, BaseToken } from '@/types/game';

export const BasedSnake: React.FC = () => {
  const { gameState, changeDirection, resetGame, togglePause, soundEnabled, toggleSound, GRID_SIZE } = useSnakeGame();

  const renderCell = (x: number, y: number): JSX.Element => {
    const isSnakeHead = gameState.snake[0]?.x === x && gameState.snake[0]?.y === y;
    const isSnakeBody = gameState.snake.slice(1).some((segment: SnakeSegment) => segment.x === x && segment.y === y);
    const isBaseToken = gameState.baseToken.x === x && gameState.baseToken.y === y;

    let cellContent = null;
    // Fixed cell size: each cell is exactly 16px x 16px (320px / 20 = 16px)
    let cellClass = "w-4 h-4 border border-gray-800/20 flex items-center justify-center";

    if (isSnakeHead) {
      cellClass += " bg-blue-600 shadow-md relative";
      cellContent = (
        <div className="w-full h-full relative">
          <div className="absolute inset-0.5 bg-blue-400 rounded-sm" />
          {/* Snake eyes */}
          <div className="absolute top-0.5 left-1 w-0.5 h-0.5 bg-white rounded-full" />
          <div className="absolute top-0.5 right-1 w-0.5 h-0.5 bg-white rounded-full" />
        </div>
      );
    } else if (isSnakeBody) {
      cellClass += " bg-blue-500";
      cellContent = <div className="w-3 h-3 bg-blue-400 rounded-sm" />;
    } else if (isBaseToken) {
      cellContent = (
        // Base Token - perfectly sized to fit 16x16px cell
        <div className="w-3.5 h-3.5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border border-yellow-300 shadow-lg animate-pulse">
          <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-transparent rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full" />
          </div>
        </div>
      );
    }

    return (
      <div key={`${x}-${y}`} className={cellClass}>
        {cellContent}
      </div>
    );
  };

  const renderGrid = (): JSX.Element[] => {
    const cells: JSX.Element[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        cells.push(renderCell(x, y));
      }
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center p-4 pt-16 md:pt-4">
      <ControlsDisplay />
      <MusicPlayer 
        gameStarted={gameState.score > 0 || gameState.snake.length > 3} 
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />
      
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
          Based Snake
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Collect Base tokens and grow your based snake! 🔵
        </p>
      </div>

      {/* Game Info */}
      <div className="flex gap-4 mb-4">
        <Card className="bg-gray-800/50 text-white px-4 py-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{gameState.score}</div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
        </Card>
        
        <Card className="bg-gray-800/50 text-white px-4 py-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{gameState.snake.length}</div>
            <div className="text-xs text-gray-400">Length</div>
          </div>
        </Card>
      </div>

      {/* Game Board */}
      <Card className="bg-gray-800/30 p-4 mb-4 shadow-2xl">
        <div 
          className="grid bg-gray-900 rounded-lg p-2 shadow-inner"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 16px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 16px)`,
            width: '352px',
            height: '352px'
          }}
        >
          {renderGrid()}
        </div>
      </Card>

      {/* Game Status */}
      {gameState.gameOver && (
        <div className="text-center mb-4">
          <Card className="bg-red-900/50 text-white p-4 border border-red-500/50">
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="mb-4">Final Score: <span className="text-blue-400 font-bold">{gameState.score}</span></p>
            <Button 
              onClick={resetGame}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Play Again
            </Button>
          </Card>
        </div>
      )}

      {gameState.isPaused && !gameState.gameOver && (
        <div className="text-center mb-4">
          <Card className="bg-yellow-900/50 text-white p-4 border border-yellow-500/50">
            <h2 className="text-xl font-bold mb-2">Paused</h2>
            <Button 
              onClick={togglePause}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Resume
            </Button>
          </Card>
        </div>
      )}

      {/* Desktop Controls */}
      <div className="hidden md:flex gap-2 mb-4">
        <Button 
          onClick={togglePause}
          disabled={gameState.gameOver}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {gameState.isPaused ? 'Resume' : 'Pause'}
        </Button>
        {gameState.gameOver && (
          <Button 
            onClick={resetGame}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Restart
          </Button>
        )}
      </div>

      {/* Mobile Controls */}
      <GameControls
        onDirectionChange={changeDirection}
        onRestart={resetGame}
        onTogglePause={togglePause}
        isPaused={gameState.isPaused}
        gameOver={gameState.gameOver}
      />

      {/* Footer */}
      <div className="text-center text-gray-500 text-xs mt-4 mb-20 md:mb-4">
        Built on Base. Stay based! 💙
      </div>
    </div>
  );
};