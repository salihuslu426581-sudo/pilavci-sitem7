import { NextResponse } from 'next/server';

declare global {
  var globalOrders: any[];
}

const initialOrders = [
  {
    id: '#1004',
    table: 'Masa 1',
    time: '14:32',
    status: 'Yeni',
    total: 205,
    items: [
      { name: 'Tereyağlı Tavuk Pilav', option: '+50 Gr Ekstra Tavuk', qty: 1 },
      { name: 'Ayran (Büyük)', qty: 1 }
    ]
  },
  {
    id: '#1003',
    table: 'Masa 4',
    time: '14:25',
    status: 'Hazırlanıyor',
    total: 340,
    items: [
      { name: 'Mercimek Çorbası', qty: 2 },
      { name: 'Kutu Kola', qty: 1 }
    ]
  },
  {
    id: '#1002',
    table: 'Paket / Yemeksepeti',
    time: '14:15',
    status: 'Teslim Edildi',
    total: 600,
    items: [
      { name: 'Sınırsız Et Pilav', qty: 1 }
    ]
  }
];

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
