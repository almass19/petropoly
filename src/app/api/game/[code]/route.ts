import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BOARD, COLOR_GROUPS, RAILROADS, UTILITIES } from '@/lib/game/board-data';
import { THEME, CHANCE_CARDS, COMMUNITY_CARDS } from '@/lib/game/theme';
import {
  rollDice, calcPropertyRent, calcRailroadRent, calcUtilityRent,
} from '@/lib/game/rent';
import {
  calcNewPosition, didPassGo, getJailPosition, nextPlayerIndex,
} from '@/lib/game/turn';
import type { PropertySquare, RailroadSquare, UtilitySquare } from '@/types/board';
import type { GameAction, PropertyOwnership } from '@/types/game';
import type { Player } from '@/types/player';

async function getRoom(supabase: Awaited<ReturnType<typeof createClient>>, code: string) {
  const { data } = await supabase.from('rooms').select('*').eq('code', code.toUpperCase()).single();
  return data;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();
  const room = await getRoom(supabase, code);
  if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [{ data: players }, { data: gameState }, { data: properties }] = await Promise.all([
    supabase.from('players').select('*').eq('room_id', room.id).order('turn_order'),
    supabase.from('game_states').select('*').eq('room_id', room.id).single(),
    supabase.from('property_ownership').select('*').eq('room_id', room.id),
  ]);

  return NextResponse.json({ room, players: players ?? [], gameState, properties: properties ?? [] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body: GameAction = await req.json();
  const supabase = await createClient();
  const room = await getRoom(supabase, code);
  if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [{ data: players }, { data: gs }, { data: props }] = await Promise.all([
    supabase.from('players').select('*').eq('room_id', room.id).order('turn_order'),
    supabase.from('game_states').select('*').eq('room_id', room.id).single(),
    supabase.from('property_ownership').select('*').eq('room_id', room.id),
  ]);

  if (!gs || !players) return NextResponse.json({ error: 'Game state missing' }, { status: 400 });

  const allProps: PropertyOwnership[] = props ?? [];
  const currentPlayer: Player = players[gs.current_player_index];

  if (currentPlayer?.session_id !== body.sessionId) {
    return NextResponse.json({ error: 'Not your turn' }, { status: 403 });
  }

  switch (body.type) {
    case 'ROLL_DICE': {
      if (gs.turn_phase !== 'awaiting_roll') {
        return NextResponse.json({ error: 'Cannot roll now' }, { status: 400 });
      }

      const dice = rollDice();
      const diceTotal = dice.die1 + dice.die2;
      let newPos = calcNewPosition(currentPlayer.position, diceTotal);
      const passedGo = didPassGo(currentPlayer.position, diceTotal);
      let cashDelta = passedGo ? THEME.goSalary : 0;

      let newPhase = 'handling_square';
      let pendingCard = null;

      // Jail handling
      if (currentPlayer.is_in_jail) {
        if (dice.die1 === dice.die2) {
          // Doubles — выходим из тюрьмы
          await supabase.from('players').update({ is_in_jail: false, jail_turns: 0 }).eq('id', currentPlayer.id);
        } else if (currentPlayer.jail_turns >= 2) {
          // Принудительно платим залог
          cashDelta -= THEME.bailPrice;
          await supabase.from('players').update({ is_in_jail: false, jail_turns: 0 }).eq('id', currentPlayer.id);
        } else {
          // Остаёмся в тюрьме
          await supabase.from('players').update({ jail_turns: currentPlayer.jail_turns + 1 }).eq('id', currentPlayer.id);
          await supabase.from('game_states').update({
            last_dice: dice, turn_phase: 'turn_ended', version: gs.version + 1, updated_at: new Date().toISOString(),
          }).eq('room_id', room.id);
          if (cashDelta !== 0) {
            await supabase.from('players').update({ cash: currentPlayer.cash + cashDelta }).eq('id', currentPlayer.id);
          }
          return NextResponse.json({ ok: true, message: 'В тюрьме, пропускаешь ход' });
        }
        newPos = calcNewPosition(currentPlayer.position, diceTotal);
      }

      const square = BOARD[newPos];

      // Обрабатываем клетку
      if (square.type === 'go_to_jail') {
        newPos = getJailPosition();
        await supabase.from('players').update({ position: newPos, is_in_jail: true, jail_turns: 0, cash: currentPlayer.cash + cashDelta }).eq('id', currentPlayer.id);
        await supabase.from('game_states').update({ last_dice: dice, turn_phase: 'turn_ended', version: gs.version + 1, updated_at: new Date().toISOString() }).eq('room_id', room.id);
        return NextResponse.json({ ok: true });
      }

      if (square.type === 'tax') {
        cashDelta -= square.amount;
      }

      if (square.type === 'chance' || square.type === 'community_chest') {
        const deck = square.type === 'chance' ? CHANCE_CARDS : COMMUNITY_CARDS;
        const card = deck[Math.floor(Math.random() * deck.length)];
        pendingCard = card;
        newPhase = 'action_required';
      }

      if (square.type === 'property' || square.type === 'railroad' || square.type === 'utility') {
        const ownership = allProps.find((p) => p.square_index === newPos);
        if (ownership?.owner_session_id && ownership.owner_session_id !== currentPlayer.session_id) {
          // Платим ренту
          let rent = 0;
          if (square.type === 'property') {
            rent = calcPropertyRent(square as PropertySquare, ownership, allProps);
          } else if (square.type === 'railroad') {
            rent = calcRailroadRent(ownership, allProps);
          } else {
            rent = calcUtilityRent(ownership, allProps, diceTotal);
          }
          cashDelta -= rent;
          // Начисляем владельцу
          const owner = players.find((p: Player) => p.session_id === ownership.owner_session_id);
          if (owner) {
            await supabase.from('players').update({ cash: owner.cash + rent }).eq('id', owner.id);
          }
          newPhase = 'turn_ended';
        } else if (!ownership?.owner_session_id) {
          newPhase = 'action_required';
        } else {
          newPhase = 'turn_ended';
        }
      }

      // Любая клетка без спецдействия → заканчиваем ход
      if (newPhase === 'handling_square') newPhase = 'turn_ended';

      await supabase.from('players').update({ position: newPos, cash: currentPlayer.cash + cashDelta }).eq('id', currentPlayer.id);
      await supabase.from('game_states').update({
        last_dice: dice,
        turn_phase: newPhase,
        pending_card: pendingCard,
        version: gs.version + 1,
        updated_at: new Date().toISOString(),
      }).eq('room_id', room.id);

      return NextResponse.json({ ok: true });
    }

    case 'BUY_PROPERTY': {
      const square = BOARD[body.squareIndex];
      if (square.type !== 'property' && square.type !== 'railroad' && square.type !== 'utility') {
        return NextResponse.json({ error: 'Not purchasable' }, { status: 400 });
      }
      const price = (square as PropertySquare | RailroadSquare | UtilitySquare).price;
      if (currentPlayer.cash < price) return NextResponse.json({ error: 'Not enough cash' }, { status: 400 });

      await Promise.all([
        supabase.from('players').update({ cash: currentPlayer.cash - price }).eq('id', currentPlayer.id),
        supabase.from('property_ownership').update({ owner_session_id: currentPlayer.session_id }).eq('room_id', room.id).eq('square_index', body.squareIndex),
        supabase.from('game_states').update({ turn_phase: 'turn_ended', version: gs.version + 1, updated_at: new Date().toISOString() }).eq('room_id', room.id),
      ]);
      return NextResponse.json({ ok: true });
    }

    case 'DECLINE_PURCHASE': {
      await supabase.from('game_states').update({ turn_phase: 'turn_ended', version: gs.version + 1, updated_at: new Date().toISOString() }).eq('room_id', room.id);
      return NextResponse.json({ ok: true });
    }

    case 'END_TURN': {
      const next = nextPlayerIndex(gs.current_player_index, players.length, players);
      await supabase.from('game_states').update({
        current_player_index: next,
        turn_phase: 'awaiting_roll',
        last_dice: null,
        pending_card: null,
        version: gs.version + 1,
        updated_at: new Date().toISOString(),
      }).eq('room_id', room.id);
      return NextResponse.json({ ok: true });
    }

    case 'PAY_BAIL': {
      if (!currentPlayer.is_in_jail) return NextResponse.json({ error: 'Not in jail' }, { status: 400 });
      if (currentPlayer.cash < THEME.bailPrice) return NextResponse.json({ error: 'Not enough cash' }, { status: 400 });
      await supabase.from('players').update({ cash: currentPlayer.cash - THEME.bailPrice, is_in_jail: false, jail_turns: 0 }).eq('id', currentPlayer.id);
      return NextResponse.json({ ok: true });
    }

    case 'BUILD_HOUSE': {
      const square = BOARD[body.squareIndex];
      if (square.type !== 'property') return NextResponse.json({ error: 'Not a property' }, { status: 400 });
      const prop = square as PropertySquare;
      const ownership = allProps.find((p) => p.square_index === body.squareIndex);
      if (ownership?.owner_session_id !== currentPlayer.session_id) return NextResponse.json({ error: 'Not yours' }, { status: 403 });
      if ((ownership?.houses ?? 0) >= 5) return NextResponse.json({ error: 'Max houses' }, { status: 400 });
      if (currentPlayer.cash < prop.houseCost) return NextResponse.json({ error: 'Not enough cash' }, { status: 400 });

      await Promise.all([
        supabase.from('players').update({ cash: currentPlayer.cash - prop.houseCost }).eq('id', currentPlayer.id),
        supabase.from('property_ownership').update({ houses: (ownership?.houses ?? 0) + 1 }).eq('room_id', room.id).eq('square_index', body.squareIndex),
      ]);
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

// Старт игры (хост)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { sessionId, playerName, color } = await req.json();
  const supabase = await createClient();
  const room = await getRoom(supabase, code);
  if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Если joinGame — добавляем игрока
  if (playerName && color) {
    const { data: existing } = await supabase.from('players').select('id').eq('room_id', room.id).eq('session_id', sessionId).maybeSingle();
    if (!existing) {
      const { data: others } = await supabase.from('players').select('turn_order').eq('room_id', room.id).order('turn_order', { ascending: false }).limit(1);
      const nextOrder = (others?.[0]?.turn_order ?? -1) + 1;
      await supabase.from('players').insert({ room_id: room.id, session_id: sessionId, name: playerName, color, turn_order: nextOrder });
    }
    return NextResponse.json({ ok: true });
  }

  // Старт игры
  if (room.host_session !== sessionId) return NextResponse.json({ error: 'Not host' }, { status: 403 });
  await supabase.from('rooms').update({ status: 'in_progress' }).eq('id', room.id);
  return NextResponse.json({ ok: true });
}
