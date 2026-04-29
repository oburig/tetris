import React, { useRef, useEffect } from 'react';
import { BLOCK_SIZE } from '../constants';
import { Piece } from '../types';

interface PreviewProps {
  piece: Piece | null;
  label: string;
}

export const PreviewPiece: React.FC<PreviewProps> = ({ piece, label }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!piece) return;

    const blockSize = 20;
    const offsetX = (canvas.width - piece.shape[0].length * blockSize) / 2;
    const offsetY = (canvas.height - piece.shape.length * blockSize) / 2;

    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          ctx.fillStyle = piece.color;
          ctx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize - 1, blockSize - 1);
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1;
          ctx.strokeRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize - 1, blockSize - 1);
          
          ctx.shadowBlur = 8;
          ctx.shadowColor = piece.color;
        }
      });
    });
  }, [piece]);

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-700 p-2 rounded-lg">
      <span className="text-[10px] text-slate-400 font-mono mb-1 uppercase tracking-widest">{label}</span>
      <canvas ref={canvasRef} width={80} height={80} />
    </div>
  );
};
