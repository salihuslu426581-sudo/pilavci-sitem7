export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

declare global {
  var globalOrders: any[];
}

const initialOrders: any[] = [];

if (!global.globalOrders) {
  global.globalOrders = initialOrders;
}

export async function GET() {
  return NextResponse.json({ orders: global.globalOrders });
}

export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    // Add to beginning of array
    global.globalOrders.unshift(newOrder);
    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    global.globalOrders = global.globalOrders.map((order) =>
      order.id === id ? { ...order, status } : order
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { table } = await request.json();
    // Remove all orders for a specific table
    global.globalOrders = global.globalOrders.filter(order => order.table !== table);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

