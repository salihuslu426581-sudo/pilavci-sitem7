export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// @ts-ignore
if (!global.webhookOrders) {
  // @ts-ignore
  global.webhookOrders = [];
}

export async function POST(req: Request) {
  try {
    // Uber'den gelen orijinal isteği alıyoruz
    const data = await req.json();

    // Uber API'den gelen karmaşık veri yapısını bizim sade sisteme (Admin panele) çeviriyoruz
    const formattedOrder = {
      id: `#UBER-${Math.floor(Math.random() * 9000) + 1000}`,
      table: 'Paket / UberEats',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'Yeni',
      total: data.totalPrice || 0,
      items: data.lines?.map((line: any) => ({
        name: line.productName || 'Uber Siparişi',
        qty: line.quantity || 1
      })) || [{ name: 'İçerik çekilemedi (Uber)', qty: 1 }]
    };

    // Sistemi haberdar et (Admin panelindeki zil çalacak)
    // @ts-ignore
    global.webhookOrders.push(formattedOrder);

    return NextResponse.json({ success: true, message: 'Trendyol siparişi başarıyla sisteme aktarıldı' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Hata oluştu' }, { status: 400 });
  }
}

