import { useState, useCallback, useEffect, useRef } from 'react';
import { COLS, ROWS, PIECES, INITIAL_DROP_SPEED, MIN_DROP_SPEED, SPEED_INCREMENT, SCORE_MAP } from '../constants';
import { Grid, Piece, PieceType, Position } from '../types';

// 테트리스 게임의 핵심 로직을 담당하는 커스텀 훅입니다.
export const useTetris = () => {
  const [grid, setGrid] = useState<Grid>(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
  const [activePiece, setActivePiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // 게임 내부 상태 관리를 위한 ref
  const bag = useRef<PieceType[]>([]);
  const dropCounter = useRef<number>(0);
  const lastTime = useRef<number>(0);

  // 7-bag 시스템: 7개의 서로 다른 블록이 한 묶음으로 나오도록 보장합니다.
  const generateBag = useCallback(() => {
    const types: PieceType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    return types;
  }, []);

  // 다음 블록을 가져옵니다. 가방이 비어있으면 새로 생성합니다.
  const getNextPieceType = useCallback(() => {
    if (bag.current.length === 0) {
      bag.current = generateBag();
    }
    return bag.current.pop()!;
  }, [generateBag]);

  // 새로운 블록 객체를 생성합니다.
  const createPiece = useCallback((type: PieceType): Piece => {
    const pieceInfo = PIECES[type];
    return {
      type,
      shape: pieceInfo.shape,
      color: pieceInfo.color,
      pos: { x: Math.floor(COLS / 2) - Math.floor(pieceInfo.shape[0].length / 2), y: 0 },
    };
  }, []);

  // 게임 초기화
  const resetGame = useCallback(() => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    bag.current = [];
    
    const firstPiece = createPiece(getNextPieceType());
    const secondPiece = createPiece(getNextPieceType());
    setActivePiece(firstPiece);
    setNextPiece(secondPiece);
  }, [createPiece, getNextPieceType]);

  // 충돌 감지 로직
  const isCollision = useCallback((piece: Piece, currentGrid: Grid, offsetX = 0, offsetY = 0) => {
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
  }, []);

  // 매트릭스 회전 (시계 방향)
  const rotate = (matrix: number[][]) => {
    const outer = matrix.length;
    const rotated = Array.from({ length: outer }, () => Array(outer).fill(0));
    for (let y = 0; y < outer; y++) {
      for (let x = 0; x < outer; x++) {
        rotated[x][outer - 1 - y] = matrix[y][x];
      }
    }
    return rotated;
  };

  // 회전 핸들러 (간단한 월 킥 포함)
  const handleRotate = useCallback(() => {
    if (!activePiece || gameOver || isPaused) return;

    const rotatedShape = rotate(activePiece.shape);
    const rotatedPiece = { ...activePiece, shape: rotatedShape };

    const originalX = rotatedPiece.pos.x;
    
    // 기본 위치, 왼쪽 1칸, 오른쪽 1칸 순으로 충돌 여부 확인 (월 킥)
    if (isCollision(rotatedPiece, grid)) {
      rotatedPiece.pos.x += 1;
      if (isCollision(rotatedPiece, grid)) {
        rotatedPiece.pos.x -= 2;
        if (isCollision(rotatedPiece, grid)) {
          rotatedPiece.pos.x = originalX; // 모든 시도 실패 시 회전 불가
          return;
        }
      }
    }
    
    setActivePiece(rotatedPiece);
  }, [activePiece, grid, isCollision, gameOver, isPaused]);

  // 고정된 블록을 그리드에 병합
  const merge = useCallback((piece: Piece, currentGrid: Grid) => {
    const newGrid = currentGrid.map(row => [...row]);
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const gridX = piece.pos.x + x;
          const gridY = piece.pos.y + y;
          if (gridY >= 0) {
            newGrid[gridY][gridX] = piece.color;
          }
        }
      });
    });
    return newGrid;
  }, []);

  // 가득 찬 줄 제거 및 점수 계산
  const clearLines = useCallback((currentGrid: Grid) => {
    let linesCleared = 0;
    const newGrid = currentGrid.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (newGrid.length < ROWS) {
      newGrid.unshift(Array(COLS).fill(null));
    }

    if (linesCleared > 0) {
        setLines(prev => {
            const nextLines = prev + linesCleared;
            const nextLevel = Math.floor(nextLines / 10) + 1; // 10줄마다 레벨업
            setLevel(nextLevel);
            return nextLines;
        });
        setScore(prev => prev + SCORE_MAP[linesCleared] * level);
    }

    return newGrid;
  }, [level]);

  // 블록 한 칸 아래로 이동
  const drop = useCallback(() => {
    if (!activePiece || gameOver || isPaused) return;

    if (!isCollision(activePiece, grid, 0, 1)) {
      setActivePiece(prev => prev ? { ...prev, pos: { ...prev.pos, y: prev.pos.y + 1 } } : null);
    } else {
      // 바닥에 닿으면 고정
      const newGrid = merge(activePiece, grid);
      const afterClear = clearLines(newGrid);
      setGrid(afterClear);

      // 다음 블록 소환
      const nextOne = nextPiece!;
      if (isCollision(nextOne, afterClear)) {
        setGameOver(true); // 새 블록이 생성되자마자 충돌하면 게임 오버
      } else {
        setActivePiece(nextOne);
        setNextPiece(createPiece(getNextPieceType()));
      }
    }
    dropCounter.current = 0;
  }, [activePiece, grid, gameOver, isPaused, isCollision, merge, clearLines, nextPiece, createPiece, getNextPieceType]);

  // 하드 드롭 (즉시 바닥으로)
  const hardDrop = useCallback(() => {
    if (!activePiece || gameOver || isPaused) return;
    
    let dropDist = 0;
    while (!isCollision(activePiece, grid, 0, dropDist + 1)) {
      dropDist++;
    }
    
    const finalPosPiece = { ...activePiece, pos: { ...activePiece.pos, y: activePiece.pos.y + dropDist } };
    const newGrid = merge(finalPosPiece, grid);
    const afterClear = clearLines(newGrid);
    setGrid(afterClear);

    setScore(prev => prev + dropDist * 2);

    const nextOne = nextPiece!;
    if (isCollision(nextOne, afterClear)) {
      setGameOver(true);
    } else {
      setActivePiece(nextOne);
      setNextPiece(createPiece(getNextPieceType()));
    }
    dropCounter.current = 0;
  }, [activePiece, grid, gameOver, isPaused, isCollision, merge, clearLines, nextPiece, createPiece, getNextPieceType]);

  const move = useCallback((dir: number) => {
    if (!activePiece || gameOver || isPaused) return;
    if (!isCollision(activePiece, grid, dir, 0)) {
       setActivePiece(prev => prev ? { ...prev, pos: { ...prev.pos, x: prev.pos.x + dir } } : null);
    }
  }, [activePiece, grid, gameOver, isPaused, isCollision]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    let requestRef: number;
    const speed = Math.max(MIN_DROP_SPEED, INITIAL_DROP_SPEED - (level - 1) * SPEED_INCREMENT);

    const animate = (time: number) => {
      const deltaTime = time - lastTime.current;
      lastTime.current = time;
      
      dropCounter.current += deltaTime;
      if (dropCounter.current > speed) {
        drop();
      }
      
      requestRef = requestAnimationFrame(animate);
    };

    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, [drop, level, gameOver, isPaused]);

  return {
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
    rotate: handleRotate,
    drop,
    hardDrop,
    resetGame,
  };
};
