import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRoomCode } from '@/lib/game/turn';
import { BOARD } from '@/lib/game/board-data';

export async function POST(req: NextRequest) {
  const { sessionId, playerName, color } = await req.json();
  if (!sessionId || !playerName || !color) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const supabase = await createClient();
  const code = generateRoomCode();

  const { data: room, error: roomErr } = await supabase
    .from('rooms')
    .insert({ code, host_session: sessionId })
    .select()
    .single();

  if (roomErr || !room) {
    return NextResponse.json({ error: roomErr?.message }, { status: 500 });
  }

  await supabase.from('players').insert({
    room_id: room.id,
    session_id: sessionId,
    name: playerName,
    color,
    turn_order: 0,
  });

  await supabase.from('game_states').insert({ room_id: room.id });

  // Инициализируем все покупаемые клетки
  const ownableIndices = BOARD
    .filter((s) => s.type === 'property' || s.type === 'railroad' || s.type === 'utility')
    .map((s) => ({ room_id: room.id, square_index: s.index, owner_session_id: null }));

  await supabase.from('property_ownership').insert(ownableIndices);

  return NextResponse.json({ code: room.code });
}

export async function PUT(req: NextRequest) {
  const { code, sessionId } = await req.json();
  if (!code || !sessionId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: room } = await supabase
    .from('rooms')
    .select('id, status')
    .eq('code', code.toUpperCase())
    .single();

  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  if (room.status !== 'lobby') return NextResponse.json({ error: 'Game already started' }, { status: 400 });

  return NextResponse.json({ roomId: room.id });
}
