'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, RotateCw, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { lyria2Submit, lyria2PollStatus, lyria2FetchAudioUrl } from '@/lyria2-api';

interface MusicPlayerProps {
  gameStarted: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ gameStarted, soundEnabled = true, onToggleSound }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.3);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateMusic = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Generate Based Snake theme music
      const prompt = 'Upbeat electronic gaming soundtrack with synthesizers, perfect for a retro snake game. Energetic bass line, catchy melody, arcade-style sound effects. Loop-friendly composition with driving rhythm at 120 BPM.';
      
      const requestId = await lyria2Submit({
        prompt,
        negative_prompt: 'vocals, lyrics, slow tempo, sad, depressing',
        seed: 42069 // Based seed for consistency
      });

      await lyria2PollStatus(requestId);
      const url = await lyria2FetchAudioUrl(requestId);
      
      setAudioUrl(url);
    } catch (error) {
      console.error('Failed to generate music:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = (): void => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const toggleMute = (): void => {
    if (!audioRef.current) return;
    
    if (volume > 0) {
      setVolume(0);
      audioRef.current.volume = 0;
    } else {
      setVolume(0.3);
      audioRef.current.volume = 0.3;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
    }
  }, [volume, audioUrl]);

  // Auto-generate music when component mounts
  useEffect(() => {
    if (!audioUrl && !isLoading) {
      generateMusic();
    }
  }, [audioUrl, isLoading]);

  // Auto-start music when game starts
  useEffect(() => {
    if (gameStarted && audioUrl && !isPlaying && audioRef.current) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [gameStarted, audioUrl, isPlaying]);

  return (
    <Card className="fixed top-4 right-4 bg-gray-800/90 text-white p-3 z-50">
      <div className="flex items-center gap-2">
        <div className="text-xs font-semibold">🎵 Based Beats</div>
        
        {isLoading ? (
          <div className="flex items-center gap-1 text-xs text-blue-400">
            <RotateCw size={12} className="animate-spin" />
            Generating...
          </div>
        ) : audioUrl ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-gray-700 h-6 w-6 p-0"
              disabled={!audioUrl}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-gray-700 h-6 w-6 p-0"
            >
              {volume > 0 ? <Volume2 size={12} /> : <VolumeX size={12} />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={generateMusic}
              className="text-white hover:bg-gray-700 h-6 w-6 p-0"
              title="Generate new track"
            >
              <RotateCw size={12} />
            </Button>
            
            {onToggleSound && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSound}
                className={`h-6 w-6 p-0 hover:bg-gray-700 ${soundEnabled ? 'text-yellow-400' : 'text-gray-500'}`}
                title={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
              >
                <Zap size={12} />
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={generateMusic}
            className="text-white hover:bg-gray-700 text-xs px-2 h-6"
          >
            Generate Music
          </Button>
        )}
      </div>
      
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </Card>
  );
};