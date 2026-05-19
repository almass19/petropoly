'use client';

import type { Square } from '@/types/board';
import type { PropertyOwnership } from '@/types/game';
import type { Player } from '@/types/player';
import { PLAYER_COLORS } from '@/types/player';
import { THEME } from '@/lib/game/theme';

const COLOR_MAP: Record<string, string> = {
  brown: '#92400e', cyan: '#06b6d4', pink: '#ec4899',
  orange: '#f97316', red: '#ef4444', yellow: '#eab308',
  green: '#22c55e', blue: '#1d4ed8',
};

interface Props {
  square: Square;
  ownership?: PropertyOwnership;
  players: Player[];
  onClose: () => void;
}

export default function PropertyCard({ square, ownership, players, onClose }: Props) {
  const owner = players.find((p) => p.session_id === ownership?.owner_session_id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Цветная шапка */}
        {square.type === 'property' && (
          <div
            className="h-10 w-full"
            style={{ backgroundColor: COLOR_MAP[square.color] }}
          />
        )}
        {square.type === 'railroad' && (
          <div className="h-10 w-full bg-slate-800 flex items-center justify-center text-white text-2xl">🚗</div>
        )}
        {square.type === 'utility' && (
          <div className="h-10 w-full bg-teal-600 flex items-center justify-center text-white text-2xl">🏠</div>
        )}

        <div className="p-4 space-y-3">
          <h2 className="text-lg font-bold text-center text-slate-800">{square.name}</h2>

          {(square.type === 'property' || square.type === 'railroad' || square.type === 'utility') && (
            <div className="text-sm text-slate-500 text-center">
              Цена: <span className="font-semibold text-slate-700">{(square as { price: number }).price.toLocaleString()}{THEME.currency}</span>
            </div>
          )}

          {/* Ренты для недвижимости */}
          {square.type === 'property' && (
            <table className="w-full text-xs text-slate-600">
              <tbody>
                {['Без домов', '1 дом', '2 дома', '3 дома', '4 дома', 'Отель'].map((label, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                    <td className="py-0.5 px-2">{label}</td>
                    <td className="py-0.5 px-2 text-right font-mono">{square.rent[i].toLocaleString()}{THEME.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {square.type === 'railroad' && (
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex justify-between"><span>1 машина</span><span className="font-mono">250₸</span></div>
              <div className="flex justify-between"><span>2 машины</span><span className="font-mono">500₸</span></div>
              <div className="flex justify-between"><span>3 машины</span><span className="font-mono">1 000₸</span></div>
              <div className="flex justify-between"><span>4 машины</span><span className="font-mono">2 000₸</span></div>
            </div>
          )}

          {/* Владелец */}
          {owner ? (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: PLAYER_COLORS[owner.color] }}
              />
              <span className="text-sm font-medium text-slate-700">Владелец: {owner.name}</span>
            </div>
          ) : (
            <div className="text-center text-sm text-slate-400 italic">Не куплено</div>
          )}

          {ownership?.is_mortgaged && (
            <div className="text-center text-xs text-red-500 font-medium">⚠️ Заложено</div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors border-t"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
