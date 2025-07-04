import { NextResponse } from 'next/server';

// In-memory store for demo. Replace with a database in production.
const takenNames = new Set<string>();
const nameChangeTimestamps = new Map<string, number>(); // name -> last change timestamp (ms)
const CHANGE_INTERVAL_MS = 4 * 24 * 60 * 60 * 1000; // 4 days in ms

// In-memory user store for demo. Replace with a database in production.
export const users: { name: string; password: string }[] = [];

async function POST(request: Request) {
  const { name, password, release, userId } = await request.json();
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid name.' }, { status: 400 });
  }
  const lower = name.trim().toLowerCase();
  const now = Date.now();

  if (release) {
    // Release the name (e.g., on logout or name change)
    takenNames.delete(lower);
    nameChangeTimestamps.delete(userId || lower);
    return NextResponse.json({ success: true, released: true });
  }

  // Enforce 4-day change interval per userId (or name if no userId)
  const key = userId || lower;
  const lastChange = nameChangeTimestamps.get(key);
  if (lastChange && now - lastChange < CHANGE_INTERVAL_MS) {
    const msLeft = CHANGE_INTERVAL_MS - (now - lastChange);
    const days = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
    return NextResponse.json({ success: false, error: `You can change your name again in ${days} day(s).` }, { status: 429 });
  }

  if (takenNames.has(lower)) {
    return NextResponse.json({ success: false, error: 'Name is already taken.' }, { status: 409 });
  }
  takenNames.add(lower);
  nameChangeTimestamps.set(key, now);

  // Store user and password for admin view (demo only)
  if (password && typeof password === 'string') {
    users.push({ name: lower, password });
  }

  return NextResponse.json({ success: true });
}

export default { POST };
