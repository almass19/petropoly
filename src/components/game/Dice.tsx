'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  die1: number | null;
  die2: number | null;
  rolling?: boolean;
}

const DOTS: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function Die({ value, rolling }: { value: number; rolling?: boolean }) {
  const dots = DOTS[value] ?? [];
  return (
    <motion.div
      className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl border-2 border-slate-200 shadow-lg relative"
      animate={rolling ? { rotate: [0, 180, 360, 540, 720] } : { rotate: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="absolute inset-1.5 grid grid-cols-3 grid-rows-3 gap-0.5">
        {Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const hasDot = dots.some(([r, c]) => r === row && c === col);
          return (
            <div key={i} className="flex items-center justify-center">
              {hasDot && (
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-800" />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Dice({ die1, die2, rolling }: Props) {
  return (
    <div className="flex items-center gap-3">
      <AnimatePresence mode="wait">
        {(die1 !== null && die2 !== null) ? (
          <motion.div
            key={`${die1}-${die2}`}
            className="flex gap-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Die value={die1} rolling={rolling} />
            <Die value={die2} rolling={rolling} />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="flex gap-2 opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl border-2 border-slate-200 shadow" />
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl border-2 border-slate-200 shadow" />
          </motion.div>
        )}
      </AnimatePresence>

      {die1 !== null && die2 !== null && (
        <span className="text-slate-500 text-sm font-mono">
          = {die1 + die2}
        </span>
      )}
    </div>
  );
}
