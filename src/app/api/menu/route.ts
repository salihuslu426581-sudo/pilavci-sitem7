export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { menuItems as initialMenuItems } from '@/data/menu';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function GET() {
  try {
    const menu = await redis.get('pilavci_menu') || initialMenuItems;
    return NextResponse.json({ menu });
  } catch (error) {
    return NextResponse.json({ menu: initialMenuItems });
  }
}

export async function POST(request: Request) {
  try {
    const { menu } = await request.json();
    await redis.set('pilavci_menu', menu);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    await redis.set('pilavci_menu', initialMenuItems);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

