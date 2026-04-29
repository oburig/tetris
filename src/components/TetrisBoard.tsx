import React, { useRef, useEffect } from 'react';
import { COLS, ROWS, BLOCK_SIZE } from '../constants';
import { Grid, Piece } from '../types';

interface TetrisBoardProps {
  grid: Grid;
  activePiece: Piece | null;
}

export const TetrisBoard: React.FC<TetrisBoardProps> = ({ grid, activePiece }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 그리드 그리기
    grid.forEach((row, y) => {
      row.forEach((color, x) => {
        drawBlock(ctx, x, y, color || '#111'); // 빈 공간은 어두운 색상
      });
    });

    // 고스트 피스(내려갈 위치 미리보기) 그리기
    if (activePiece) {
        let ghostY = 0;
        while (!isCollision(activePiece, grid, 0, ghostY + 1)) {
            ghostY++;
        }
        activePiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(ctx, activePiece.pos.x + x, activePiece.pos.y + y + ghostY, activePiece.color, true);
                }
            });
        });
    }

    // 현재 조작 중인 블록 그리기
    if (activePiece) {
      activePiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            drawBlock(ctx, activePiece.pos.x + x, activePiece.pos.y + y, activePiece.color);
          }
        });
      });
    }

    // 그리드 가이드 라인 (눈에 띄지 않게 아주 옅게)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK_SIZE, 0);
      ctx.lineTo(x * BLOCK_SIZE, ROWS * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK_SIZE);
      ctx.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE);
      ctx.stroke();
    }

  }, [grid, activePiece]);

  // 블록 하나를 그리는 함수
  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isGhost = false) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = isGhost ? 0.3 : 1;
    
    // 네온 효과를 위한 그라데이션 적용
    if (!isGhost && color !== '#111') {
        const gradient = ctx.createRadialGradient(
            (x + 0.5) * BLOCK_SIZE, (y + 0.5) * BLOCK_SIZE, 0,
            (x + 0.5) * BLOCK_SIZE, (y + 0.5) * BLOCK_SIZE, BLOCK_SIZE
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, '#000'); // 테두리 쪽으로 갈수록 어둡게
        ctx.fillStyle = gradient;
    }

    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    if (color !== '#111') {
        ctx.strokeStyle = isGhost ? color : 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = isGhost ? 1 : 1.5;
        ctx.strokeRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        
        // 블룸(Glow) 효과
        if (!isGhost) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = color;
        }
    } else {
        ctx.shadowBlur = 0;
    }
    
    ctx.globalAlpha = 1;
  };

  // 보드 내부에서의 충돌 감지 (고스트 피스 계산용)
  const isCollision = (piece: Piece, currentGrid: Grid, offsetX = 0, offsetY = 0) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const newX = piece.pos.x + x + offsetX;
          const newY = piece.pos.y + y + offsetY;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && currentGrid[newY][newX] !== null)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const adjustColor = (color: string, amount: number) => {
    return color; // Simplified for now, could use a helper to lighten/darken
  };

  return (
    <div className="relative border-4 border-slate-800 shadow-[0_0_20px_rgba(30,41,59,0.5)] bg-slate-950 p-1 rounded-sm">
      <canvas
        ref={canvasRef}
        width={COLS * BLOCK_SIZE}
        height={ROWS * BLOCK_SIZE}
        className="block"
      />
    </div>
  );
};
