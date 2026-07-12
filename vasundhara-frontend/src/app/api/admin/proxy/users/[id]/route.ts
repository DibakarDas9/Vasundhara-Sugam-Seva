import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';

/**
 * Proxy: DELETE /api/admin/proxy/users/[id]  → DELETE {BACKEND}/api/admin/users/:id
 * Proxy: POST   /api/admin/proxy/users/[id]  → routes based on ?action= query param
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!API_BASE) {
    return NextResponse.json({ message: 'Backend API URL not configured' }, { status: 503 });
  }

  try {
    const token = request.headers.get('authorization') || '';
    const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'X-Admin-Pin': 'admin',
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Proxy error' }, { status: 502 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action'); // 'premium'

  if (!API_BASE) {
    return NextResponse.json({ message: 'Backend API URL not configured' }, { status: 503 });
  }

  try {
    const token = request.headers.get('authorization') || '';
    const body = await request.json().catch(() => ({}));

    let backendPath = `/api/admin/users/${id}`;
    if (action === 'premium') backendPath += '/premium';

    const res = await fetch(`${API_BASE}${backendPath}`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'X-Admin-Pin': 'admin',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Proxy error' }, { status: 502 });
  }
}
