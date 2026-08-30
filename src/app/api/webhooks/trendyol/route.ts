import { NextResponse } from 'next/server';

// @ts-ignore
if (!global.webhookOrders) {
  // @ts-ignore
  global.webhookOrders = [];
}

export async function POST(req: Request) {
  try {
    // Trendyol'dan gelen orijinal isteği alıyoruz
    const data = await req.json();

    // Trendyol API'den gelen karmaşık veri yapısını bizim sade sisteme (Admin panele) çeviriyoruz
    const formattedOrder = {
      id: '#TY' + (data.orderId || Math.floor(Math.random() * 10000)),
      table: 'Paket / Trendyol',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'Yeni',
      total: data.totalPrice || 0,
      items: data.lines?.map((line: any) => ({
        name: line.productName || 'Trendyol Siparişi',
        qty: line.quantity || 1
      })) || [{ name: 'İçerik çekilemedi (Trendyol)', qty: 1 }]
    };

    // Sistemi haberdar et (Admin panelindeki zil çalacak)
    // @ts-ignore
    global.webhookOrders.push(formattedOrder);

    return NextResponse.json({ success: true, message: 'Trendyol siparişi başarıyla sisteme aktarıldı' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Hata oluştu' }, { status: 400 });
  }
}
