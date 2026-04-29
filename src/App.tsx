import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, RotateCcw, Pause, PlayCircle } from 'lucide-react';
import { useTetris } from './hooks/useTetris';
import { TetrisBoard } from './components/TetrisBoard';
import { PreviewPiece } from './components/PreviewPiece';
import { MobileControls } from './components/MobileControls';

export default function App() {
  const {
    grid,
    activePiece,
    nextPiece,
    score,
    level,
    lines,
    gameOver,
    isPaused,
    setIsPaused,
    move,
    rotate,
    drop,
    hardDrop,
    resetGame,
  } = useTetris();

  const [hasStarted, setHasStarted] = useState(false);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || !hasStarted) return;
      
      switch (e.key) {
        case 'ArrowLeft': move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowDown': drop(); break;
        case 'ArrowUp': rotate(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
        case 'p': setIsPaused(prev => !prev); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, rotate, drop, hardDrop, gameOver, hasStarted, setIsPaused]);

  const handleStart = () => {
    setHasStarted(true);
    resetGame();
  };

  const [isShaking, setIsShaking] = useState(false);

  // Line clear effect
  useEffect(() => {
    if (lines > 0) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 200);
      return () => clearTimeout(timer);
    }
  }, [lines]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <header className="mb-4 z-10 flex flex-col items-center relative">
        <motion.h1 
          animate={isShaking ? { x: [-2, 2, -2, 2, 0] } : {}}
          className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] text-center"
        >
          oburiG Tetris
        </motion.h1>
        <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-1 opacity-70">MOBILE PERFORMANCE EDITION</p>
      </header>

      <motion.div 
        animate={isShaking ? { x: [-5, 5, -5, 5, 0], y: [-2, 2, -2, 2, 0] } : {}}
        className="flex flex-col md:flex-row gap-6 items-start z-10"
      >
        {/* Game Area */}
        <div className="relative group">
          <TetrisBoard grid={grid} activePiece={activePiece} />
          
          <AnimatePresence>
            {(!hasStarted || gameOver || isPaused) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-sm"
              >
                <div className="flex flex-col items-center p-8 bg-slate-900/80 border border-slate-700/50 rounded-2xl shadow-2xl">
                  {gameOver ? (
                    <>
                      <Trophy className="text-yellow-500 mb-4 animate-bounce" size={48} />
                      <h2 className="text-2xl font-bold mb-1">GAME OVER</h2>
                      <p className="text-slate-400 font-mono text-sm mb-6">FINAL SCORE: {score}</p>
                      <button 
                        onClick={handleStart}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition-all active:scale-95"
                      >
                        <RotateCcw size={20} /> TRY AGAIN
                      </button>
                    </>
                  ) : isPaused ? (
                    <>
                      <Pause className="text-blue-400 mb-4" size={48} />
                      <h2 className="text-2xl font-bold mb-6">PAUSED</h2>
                      <button 
                        onClick={() => setIsPaused(false)}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition-all active:scale-95"
                      >
                        <Play size={20} /> RESUME
                      </button>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="text-blue-400 mb-4" size={48} />
                      <h2 className="text-2xl font-bold mb-1 tracking-tight">READY?</h2>
                      <p className="text-slate-400 text-xs mb-8 text-center max-w-[160px]">Tap play to start the neon challenge</p>
                      <button 
                        onClick={handleStart}
                        className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 rounded-full font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95"
                      >
                         START GAME
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HUD / Stats */}
        <div className="flex flex-col gap-4 w-full md:w-32">
          {/* Next Piece */}
          <PreviewPiece piece={nextPiece} label="NEXT" />

          {/* Stats Cards */}
          <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
            <StatBox label="SCORE" value={score} color="text-yellow-400" />
            <StatBox label="LEVEL" value={level} color="text-blue-400" />
            <StatBox label="LINES" value={lines} color="text-purple-400" />
          </div>

          {!gameOver && hasStarted && (
             <button 
               onClick={() => setIsPaused(p => !p)}
               className="mt-auto hidden md:flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-mono tracking-tighter"
             >
               {isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? 'RESUME' : 'PAUSE'}
             </button>
          )}
        </div>
      </motion.div>

      {/* Mobile Controls */}
      {hasStarted && !gameOver && (
        <MobileControls 
          onMove={move} 
          onRotate={rotate} 
          onDrop={drop} 
          onHardDrop={hardDrop} 
        />
      )}

      {/* Instructions for Desktop */}
      <footer className="mt-8 hidden md:block opacity-40 text-[10px] font-mono tracking-tighter text-center">
        ARROWS: MOVE & ROTATE • SPACE: HARD DROP • P: PAUSE
      </footer>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col items-center">
      <span className="text-[9px] text-slate-500 font-mono tracking-tighter mb-1 uppercase">{label}</span>
      <span className={`text-lg font-bold font-mono ${color}`}>{value}</span>
    </div>
  );
}
