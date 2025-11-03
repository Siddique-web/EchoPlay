import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface Music {
  id: string;
  title: string;
  artist: string;
  url: string;
  created_at?: string;
}

type PlaybackCommand = 'play' | 'pause' | 'stop' | 'toggle';

interface MusicContextType {
  currentMusic: Music | null;
  isPlaying: boolean;
  setCurrentMusic: (music: Music | null) => void;
  setIsPlaying: (playing: boolean) => void;
  sendPlaybackCommand: (command: PlaybackCommand) => void;
  playbackCommand: PlaybackCommand | null;
  clearPlaybackCommand: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMusic, setCurrentMusic] = useState<Music | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackCommand, setPlaybackCommand] = useState<PlaybackCommand | null>(null);

  const sendPlaybackCommand = useCallback((command: PlaybackCommand) => {
    setPlaybackCommand(command);
  }, []);

  const clearPlaybackCommand = useCallback(() => {
    setPlaybackCommand(null);
  }, []);

  return (
    <MusicContext.Provider value={{ 
      currentMusic, 
      isPlaying, 
      setCurrentMusic, 
      setIsPlaying, 
      sendPlaybackCommand,
      playbackCommand,
      clearPlaybackCommand
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};