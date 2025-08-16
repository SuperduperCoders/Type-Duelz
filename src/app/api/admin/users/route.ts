// app/api/users/route.ts
import { NextResponse } from 'next/server';

// In-memory user store (for demo purposes)
const users: { name: string; password: string }[] = [
  { name: 'alice', password: '123' },
  { name: 'bob', password: '456' },
];

// GET /api/users?admin=1
export async function GET(request: Request) {
  const url = new URL(request.url);

  // Check if admin query param exists
  if (url.searchParams.get('admin') !== '1') {
    return NextResponse.json(
      { error: 'Unauthorized. Admin query missing or invalid.' },
      { status: 401 } // Use valid HTTP status code
    );
  }

  // Return list of users
  return NextResponse.json({ users });
}

// POST /api/users to add a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, password } = body;

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Name and password are required' },
        { status: 400 }
      );
    }

    // Add user to in-memory store
    users.push({ name, password });

    return NextResponse.json({ message: 'User added', users }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
