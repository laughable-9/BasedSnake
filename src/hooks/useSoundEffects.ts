import { useRef, useCallback } from 'react';

export interface SoundEffects {
  coinPickup: string;
}

const DEFAULT_SOUNDS: SoundEffects = {
  coinPickup: 'https://v3.fal.media/files/monkey/Rvv1BAFHy5-HZvZpEnjTj_output.mp4'
};

export const useSoundEffects = (soundsEnabled: boolean = true) => {
  const audioRefs = useRef<Record<keyof SoundEffects, HTMLAudioElement | null>>({
    coinPickup: null
  });

  const initializeAudio = useCallback(() => {
    if (!soundsEnabled) return;

    // Initialize coin pickup sound
    if (!audioRefs.current.coinPickup) {
      audioRefs.current.coinPickup = new Audio(DEFAULT_SOUNDS.coinPickup);
      audioRefs.current.coinPickup.volume = 0.6;
      audioRefs.current.coinPickup.preload = 'auto';
    }
  }, [soundsEnabled]);

  const playCoinPickup = useCallback(() => {
    if (!soundsEnabled) return;
    
    if (!audioRefs.current.coinPickup) {
      initializeAudio();
    }

    const audio = audioRefs.current.coinPickup;
    if (audio) {
      // Reset the audio to the beginning and play
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.log('Sound effect could not be played:', error);
      });
    }
  }, [soundsEnabled, initializeAudio]);

  // Initialize audio elements on first call
  const sounds = {
    playCoinPickup
  };

  return {
    sounds,
    initializeAudio
  };
};