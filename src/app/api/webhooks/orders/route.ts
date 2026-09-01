export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function GET() {
  try {
    const orders = await redis.get('pilavci_external_orders') || [];
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate a payload from Yemeksepeti
    // Maps their structure to our internal schema
    const newOrder = {
      id: `#YS-${Math.floor(Math.random() * 9000) + 1000}`,
      table: 'Yemeksepeti',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'Yeni',
      total: body.total || 0,
      items: body.items || []
    };

    const orders: any[] = (await redis.get('pilavci_external_orders')) || [];
    orders.push(newOrder);
    await redis.set('pilavci_external_orders', orders);

    return NextResponse.json({ success: true, message: 'Order received', orderId: newOrder.id });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { orderIds } = await request.json();
    if (Array.isArray(orderIds)) {
      let orders: any[] = (await redis.get('pilavci_external_orders')) || [];
      orders = orders.filter((order) => !orderIds.includes(order.id));
      await redis.set('pilavci_external_orders', orders);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

