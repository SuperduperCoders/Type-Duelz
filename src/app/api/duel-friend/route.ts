import { NextRequest, NextResponse } from 'next/server';

// In-memory store for demo (replace with DB or Redis in production)
const duelRequests: Record<string, { from: string, roomId: string, accepted: boolean }> = {};

export async function POST(req: NextRequest) {
  const { friendName } = await req.json();
  const myName = req.cookies.get('playerName')?.value || req.headers.get('x-forwarded-for') || 'anonymous';

  if (!friendName || typeof friendName !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid friend name.' }, { status: 400 });
  }
  if (friendName === myName) {
    return NextResponse.json({ success: false, error: 'You cannot duel yourself.' }, { status: 400 });
  }

  // Create a roomId for this duel
  const roomId = `${myName}-${friendName}-${Date.now()}`;
  duelRequests[friendName] = { from: myName, roomId, accepted: false };
  return NextResponse.json({ success: true, message: 'Duel request sent.' });
}

export async function GET(req: NextRequest) {
  // Get current player
  const myName = req.cookies.get('playerName')?.value || req.headers.get('x-forwarded-for') || 'anonymous';
  const duel = duelRequests[myName];
  if (duel) {
    return NextResponse.json({ request: duel });
  } else {
    return NextResponse.json({ request: null });
  }
}

export async function PUT(req: NextRequest) {
  // Accept or decline a duel
  const { accept } = await req.json();
  const myName = req.cookies.get('playerName')?.value || req.headers.get('x-forwarded-for') || 'anonymous';
  const duel = duelRequests[myName];
  if (!duel) {
    return NextResponse.json({ success: false, error: 'No duel request found.' });
  }
  if (accept) {
    duel.accepted = true;
    // Notify both users to go to the duel room
    return NextResponse.json({ success: true, roomId: duel.roomId, from: duel.from });
  } else {
    delete duelRequests[myName];
    return NextResponse.json({ success: true, declined: true });
  }
}
