import { NextResponse } from 'next/server';
import { menuItems as initialMenuItems } from '@/data/menu';

declare global {
  var globalMenu: any[];
}

if (!global.globalMenu) {
  global.globalMenu = initialMenuItems;
}

export async function GET() {
  return NextResponse.json({ menu: global.globalMenu });
}

export async function POST(request: Request) {
  try {
    const { menu } = await request.json();
    global.globalMenu = menu;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function DELETE() {
  // Reset menu
  global.globalMenu = initialMenuItems;
  return NextResponse.json({ success: true });
}
