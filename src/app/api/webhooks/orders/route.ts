import { NextResponse } from 'next/server';

// In-memory queue for incoming external orders
// In production, this would be a real database like PostgreSQL
declare global {
  var externalOrdersQueue: any[];
}

if (!global.externalOrdersQueue) {
  global.externalOrdersQueue = [];
}

export async function GET() {
  // Admin panel fetches pending external orders
  return NextResponse.json({ orders: global.externalOrdersQueue });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate a payload from Yemeksepeti
    // Maps their structure to our internal schema
    const newOrder = {
      id: `#YS-${Math.floor(Math.random() * 9000) + 1000}`,
      table: 'Paket / Yemeksepeti',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'Yeni',
      total: body.total || 0,
      items: body.items || []
    };

    global.externalOrdersQueue.push(newOrder);

    return NextResponse.json({ success: true, message: 'Order received', orderId: newOrder.id });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { orderIds } = await request.json();
    if (Array.isArray(orderIds)) {
      global.externalOrdersQueue = global.externalOrdersQueue.filter(
        (order) => !orderIds.includes(order.id)
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
