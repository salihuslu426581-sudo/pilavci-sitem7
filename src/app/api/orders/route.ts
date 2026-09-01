export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Vercel ortam değişkenlerinden Redis bağlantısını otomatik alır
const redis = Redis.fromEnv();

export async function GET() {
  try {
    const orders = await redis.get('pilavci_orders') || [];
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ orders: [] }); // Hata olursa boş dizi dön
  }
}

export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    const orders: any[] = (await redis.get('pilavci_orders')) || [];
    
    // Add to beginning of array
    orders.unshift(newOrder);
    await redis.set('pilavci_orders', orders);
    
    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    let orders: any[] = (await redis.get('pilavci_orders')) || [];
    
    orders = orders.map((order) =>
      order.id === id ? { ...order, status } : order
    );
    
    await redis.set('pilavci_orders', orders);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { table } = await request.json();
    let orders: any[] = (await redis.get('pilavci_orders')) || [];
    
    // Remove all orders for a specific table
    orders = orders.filter((order) => order.table !== table);
    
    await redis.set('pilavci_orders', orders);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
