import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify NextAuth configuration
 * This helps debug authentication issues without needing browser interaction
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
    }

    // Simulate credential validation (same logic as authorize function)
    const DEMO_USERS = [
      { id: 'demo', email: 'demo@dealbook.com', password: 'demo123', name: 'Demo User', role: 'admin' },
      { id: 'admin', email: 'admin@dealbook.com', password: 'admin123', name: 'Admin User', role: 'admin' },
    ];

    const user = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password', tested: true },
        { status: 401 }
      );
    }

    // Return user object (would be sent to jwt callback)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: 'Credentials validated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Test endpoint error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
