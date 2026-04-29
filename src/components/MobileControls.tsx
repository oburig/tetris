import React from 'react';
import { ChevronLeft, ChevronRight, RotateCw, ChevronDown, ChevronsDown } from 'lucide-react';

interface ControlsProps {
  onMove: (dir: number) => void;
  onRotate: () => void;
  onDrop: () => void;
  onHardDrop: () => void;
}

export const MobileControls: React.FC<ControlsProps> = ({ onMove, onRotate, onDrop, onHardDrop }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] mt-6 select-none">
      <div />
      <ControlButton icon={<RotateCw size={32} />} onClick={onRotate} className="bg-purple-600/20 text-purple-400 border-purple-500/50" />
      <div />

      <ControlButton icon={<ChevronLeft size={32} />} onClick={() => onMove(-1)} className="bg-blue-600/20 text-blue-400 border-blue-500/50" />
      <ControlButton icon={<ChevronDown size={32} />} onClick={onDrop} className="bg-cyan-600/20 text-cyan-400 border-cyan-500/50" />
      <ControlButton icon={<ChevronRight size={32} />} onClick={() => onMove(1)} className="bg-blue-600/20 text-blue-400 border-blue-500/50" />

      <div />
      <ControlButton icon={<ChevronsDown size={32} />} onClick={onHardDrop} className="bg-red-600/20 text-red-400 border-red-500/50 col-span-1" />
      <div />
    </div>
  );
};

const ControlButton = ({ icon, onClick, className = "", col_span = "" }: { icon: React.ReactNode, onClick: () => void, className?: string, col_span?: string }) => (
  <button
    onPointerDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`p-4 rounded-xl border flex items-center justify-center active:scale-95 active:brightness-125 transition-all outline-none ${className} ${col_span}`}
  >
    {icon}
  </button>
);
