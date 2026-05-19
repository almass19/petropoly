'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  die1: number | null;
  die2: number | null;
  rolling?: boolean;
}

const DOTS: Record<number, [number, number][]> = {
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
      className="w-12 h-12 bg-white rounded-xl shadow-xl relative overflow-hidden"
      animate={rolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1] } : { rotate: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ border: '3px solid #e2e8f0' }}
    >
      <div className="absolute inset-2 grid grid-cols-3 grid-rows-3">
        {Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const hasDot = dots.some(([r, c]) => r === row && c === col);
          return (
            <div key={i} className="flex items-center justify-center">
              {hasDot && <div className="w-2 h-2 rounded-full bg-slate-800" />}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Dice({ die1, die2, rolling }: Props) {
  return (
    <AnimatePresence mode="wait">
      {die1 !== null && die2 !== null ? (
        <motion.div
          key={`${die1}-${die2}`}
          className="flex gap-2"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Die value={die1} rolling={rolling} />
          <Die value={die2} rolling={rolling} />
        </motion.div>
      ) : (
        <motion.div key="empty" className="flex gap-2 opacity-20" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}>
          <div className="w-12 h-12 bg-white/20 rounded-xl border-2 border-white/20" />
          <div className="w-12 h-12 bg-white/20 rounded-xl border-2 border-white/20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
