'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

export const ControlsDisplay: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [shouldFade, setShouldFade] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldFade(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const controls = [
    { key: 'W / ↑', action: 'Move Up' },
    { key: 'S / ↓', action: 'Move Down' },
    { key: 'A / ←', action: 'Move Left' },
    { key: 'D / →', action: 'Move Right' },
    { key: 'Space', action: 'Pause/Resume' },
    { key: 'R', action: 'Restart (when game over)' }
  ];

  return (
    <Card 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 md:left-4 md:translate-x-0 bg-gray-800/90 text-white p-3 transition-all duration-300 z-50 ${
        shouldFade && !isMinimized ? 'opacity-50 hover:opacity-100' : 'opacity-100'
      } ${isMinimized ? 'w-auto' : 'w-64'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">
          {isMinimized ? 'Controls' : 'Game Controls'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-white hover:bg-gray-700 h-6 w-6 p-0"
        >
          {isMinimized ? <Plus size={12} /> : <Minus size={12} />}
        </Button>
      </div>
      
      {!isMinimized && (
        <div className="space-y-1 text-xs">
          {controls.map(({ key, action }) => (
            <div key={key} className="flex justify-between">
              <span className="font-mono bg-gray-700 px-1 rounded">{key}</span>
              <span className="text-gray-300">{action}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};