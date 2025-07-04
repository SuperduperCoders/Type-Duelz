import { NextResponse } from 'next/server';

// In-memory user store for demo. Replace with a database in production.
// This should be imported/shared with your main API if you want to keep state in-memory.
const users: { name: string; password: string }[] = [];

export async function GET(request: Request) {
  // Simple admin check: require ?admin=1 query param (for demo only)
  const url = new URL(request.url);
  if (url.searchParams.get('admin') !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ users });
}

// To use this, you must also update your registration logic to push to this users array.
