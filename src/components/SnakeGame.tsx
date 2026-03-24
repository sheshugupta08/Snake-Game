import { useEffect, useRef, useState } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 120;

type Point = { x: number; y: number };

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const gameLoopRef = useRef<number | null>(null);
  const lastRenderRef = useRef<number>(0);

  const generateFood = (snake: Point[]): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOccupied = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  };

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    foodRef.current = generateFood(snakeRef.current);
    setScore(0);
    setGameOver(false);
    setHasStarted(true);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && hasStarted) {
        if (gameOver) resetGame();
        else setIsPaused((p) => !p);
        return;
      }

      if (!hasStarted && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        setHasStarted(true);
      }

      const { x, y } = dirRef.current;
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          if (y !== 1) nextDirRef.current = { x: 0, y: -1 };
          break;
        case 'arrowdown':
        case 's':
          if (y !== -1) nextDirRef.current = { x: 0, y: 1 };
          break;
        case 'arrowleft':
        case 'a':
          if (x !== 1) nextDirRef.current = { x: -1, y: 0 };
          break;
        case 'arrowright':
        case 'd':
          if (x !== -1) nextDirRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, hasStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw grid lines (optional, for aesthetic)
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
      }

      // Draw Food (Neon Pink)
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ec4899';
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(
        foodRef.current.x * CELL_SIZE + 2,
        foodRef.current.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
      );

      // Draw Snake (Neon Cyan)
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#06b6d4';
      ctx.fillStyle = '#22d3ee';
      
      snakeRef.current.forEach((segment, index) => {
        if (index === 0) {
          // Head is slightly brighter
          ctx.fillStyle = '#67e8f9';
        } else {
          ctx.fillStyle = '#06b6d4';
        }
        ctx.fillRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2
        );
      });
      
      // Reset shadow for next frame
      ctx.shadowBlur = 0;
    };

    const update = (timestamp: number) => {
      if (gameOver || isPaused || !hasStarted) {
        draw();
        gameLoopRef.current = requestAnimationFrame(update);
        return;
      }

      // Throttle updates to control speed
      const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 5) * 5); // Speeds up as score increases
      if (timestamp - lastRenderRef.current < speed) {
        gameLoopRef.current = requestAnimationFrame(update);
        return;
      }
      lastRenderRef.current = timestamp;

      dirRef.current = nextDirRef.current;
      const head = snakeRef.current[0];
      const newHead = {
        x: head.x + dirRef.current.x,
        y: head.y + dirRef.current.y,
      };

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        setHighScore((prev) => Math.max(prev, score));
        return;
      }

      // Self collision
      if (snakeRef.current.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        setHighScore((prev) => Math.max(prev, score));
        return;
      }

      const newSnake = [newHead, ...snakeRef.current];

      // Food collision
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore((s) => s + 10);
        foodRef.current = generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      snakeRef.current = newSnake;
      draw();
      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameOver, isPaused, hasStarted, score]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[400px] mb-4 px-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xl drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          <span>SCORE:</span>
          <span className="font-mono">{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-xl drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]">
          <Trophy className="w-5 h-5" />
          <span className="font-mono">{highScore.toString().padStart(4, '0')}</span>
        </div>
      </div>

      <div className="relative p-1 rounded-lg bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
        <div className="absolute inset-0 rounded-lg border border-cyan-500/50 shadow-[inset_0_0_20px_rgba(34,211,238,0.2)] pointer-events-none z-10"></div>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-black rounded-md block"
        />
        
        {/* Overlays */}
        {!hasStarted && !gameOver && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-md">
            <h2 className="text-3xl font-bold text-cyan-400 mb-4 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] tracking-widest">SNAKE</h2>
            <p className="text-gray-300 animate-pulse">Press any arrow key to start</p>
          </div>
        )}

        {isPaused && hasStarted && !gameOver && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-md">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] tracking-widest">PAUSED</h2>
            <p className="text-gray-300">Press SPACE to resume</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-md border border-red-500/50 shadow-[inset_0_0_50px_rgba(239,68,68,0.3)]">
            <h2 className="text-4xl font-bold text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] tracking-widest">GAME OVER</h2>
            <p className="text-cyan-400 mb-6 font-mono text-lg">FINAL SCORE: {score}</p>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-400 rounded-full transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]"
            >
              <RotateCcw className="w-5 h-5" />
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-gray-500 text-sm flex gap-6">
        <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-2 py-1 rounded border border-gray-700 text-gray-300">WASD</kbd> or <kbd className="bg-gray-800 px-2 py-1 rounded border border-gray-700 text-gray-300">Arrows</kbd> to move</span>
        <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-2 py-1 rounded border border-gray-700 text-gray-300">Space</kbd> to pause</span>
      </div>
    </div>
  );
}
