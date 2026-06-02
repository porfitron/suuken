interface GameState {
  turn: 'P1' | 'P2';
  phase: 'GUESS' | 'COUNTDOWN' | 'ACTION' | 'RESOLUTION' | 'GAMEOVER';
  activeCorners: {
    p1Left: boolean; p1Right: boolean;
    p2Left: boolean; p2Right: boolean;
  };
  pressedCorners: {
    p1Left: boolean; p1Right: boolean;
    p2Left: boolean; p2Right: boolean;
  };
  currentGuess: number | null;
  winner: 'P1' | 'P2' | null;
  // Actions
  setGuess: (num: number) => void;
  setCornerPressed: (corner: string, isPressed: boolean) => void;
  resolveRound: () => void;
  resetGame: () => void;
}