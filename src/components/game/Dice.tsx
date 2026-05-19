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

const DIE_SIZE = 'clamp(24px, 6vw, 52px)';
const DOT_SIZE = 'clamp(3px, 1vw, 8px)';

function Die({ value, rolling }: { value: number; rolling?: boolean }) {
  const dots = DOTS[value] ?? [];
  return (
    <motion.div
      animate={rolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.15, 1] } : { rotate: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        width: DIE_SIZE,
        height: DIE_SIZE,
        backgroundColor: '#ffffff',
        borderRadius: 'clamp(4px, 1.2vw, 10px)',
        border: '2px solid #d4c9b4',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 'clamp(3px, 0.9vw, 7px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
        }}
      >
        {Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const hasDot = dots.some(([r, c]) => r === row && c === col);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hasDot && (
                <div
                  style={{
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    borderRadius: '50%',
                    backgroundColor: '#1e293b',
                  }}
                />
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
    <AnimatePresence mode="wait">
      {die1 !== null && die2 !== null ? (
        <motion.div
          key={`${die1}-${die2}`}
          style={{ display: 'flex', gap: 'clamp(4px, 1.2vw, 10px)' }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Die value={die1} rolling={rolling} />
          <Die value={die2} rolling={rolling} />
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          style={{ display: 'flex', gap: 'clamp(4px, 1.2vw, 10px)', opacity: 0.25 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
        >
          {[0, 1].map(i => (
            <div
              key={i}
              style={{
                width: DIE_SIZE,
                height: DIE_SIZE,
                borderRadius: 'clamp(4px, 1.2vw, 10px)',
                border: '2px solid #b8a98a',
                backgroundColor: 'transparent',
                flexShrink: 0,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
