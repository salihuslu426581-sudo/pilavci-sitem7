'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function CartContent() {
  const searchParams = useSearchParams();
  const table = searchParams.get('table') || 'Bilinmeyen Masa';
  const router = useRouter();
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  // Load cart on mount
  useEffect(() => {
    const stored = localStorage.getItem('pilavci_cart');
    if (stored) {
      const parsedCart = JSON.parse(stored);
      // Geriye dönük uyumluluk için, quantity'si olmayanlara 1 ekle
      const normalizedCart = parsedCart.map((c: any) => ({ ...c, quantity: c.quantity || 1 }));
      setCartItems(normalizedCart);
      recalculateTotal(normalizedCart);
    }
  }, []);

  const recalculateTotal = (cartData: any[]) => {
    let sum = 0;
    cartData.forEach((c: any) => {
      sum += (c.item.price + (c.option ? c.option.price : 0)) * c.quantity;
    });
    setTotal(sum);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cartItems];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCartItems(newCart);
    localStorage.setItem('pilavci_cart', JSON.stringify(newCart));
    recalculateTotal(newCart);
  };

  const removeItem = (index: number) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
    localStorage.setItem('pilavci_cart', JSON.stringify(newCart));
    recalculateTotal(newCart);
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) return;

    const formattedTable = table.toLowerCase().includes('masa') || table.toLowerCase().includes('paket') 
      ? table 
      : `Masa ${table}`;

    // Format cart items for the order
    const orderItems = cartItems.map(c => ({
      name: c.item.name,
      option: c.option ? c.option.name : undefined,
      qty: c.quantity
    }));

    const newOrder = {
      id: '#' + Math.floor(1000 + Math.random() * 9000),
      table: formattedTable,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'Yeni',
      total: total,
      items: orderItems
    };

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (e) {
      console.error('API sipariş hatası:', e);
    }

    // Fallback: Also save to local storage for offline resilience
    const existingOrdersStr = localStorage.getItem('pilavci_orders');
    let existingOrders = [];
    if (existingOrdersStr) {
      existingOrders = JSON.parse(existingOrdersStr);
    }
    
    existingOrders.unshift(newOrder);
    localStorage.setItem('pilavci_orders', JSON.stringify(existingOrders));
    
    // Clear cart
    localStorage.removeItem('pilavci_cart');
    setCartItems([]);
    
    // Dispatch event for same-window updates
    window.dispatchEvent(new Event('orders_updated'));

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="container flex flex-col gap-lg items-center justify-center text-center pb-32" style={{minHeight: '80vh'}}>
        <div style={{fontSize: '4rem'}}>✅</div>
        <h2 className="text-gold">Siparişiniz Alındı!</h2>
        <p className="text-muted">Masa: {table}</p>
        <p>Siparişiniz hazırlanıyor. Afiyet olsun!</p>
        <Link href={`/menu?table=${table}`} className="btn-outline mt-4">
          Menüye Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="container flex flex-col gap-lg pb-32">
      <header className="menu-header">
        <h1 className="brand-logo" style={{ fontSize: '1.5rem' }}>Sepetim</h1>
        <p className="text-gold text-center">Masa: {table}</p>
      </header>

      <div className="card flex flex-col gap-sm">
        <h3 className="text-gold">Sipariş Özeti</h3>
        {cartItems.length === 0 ? (
          <p className="text-muted text-sm text-center py-4">Sepetiniz boş. Lütfen menüden ürün seçin.</p>
        ) : (
          <>
            {cartItems.map((c, idx) => (
              <div key={idx} className="flex flex-col gap-sm border-b pb-3 mb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{c.item.name}</p>
                    {c.option && <p className="text-xs text-muted">Ekstra: {c.option.name}</p>}
                    <p className="text-gold font-bold text-sm mt-1">{(c.item.price + (c.option ? c.option.price : 0))} TL <span className="text-muted font-normal">(Birim Fiyat)</span></p>
                  </div>
                  <button onClick={() => removeItem(idx)} className="text-muted hover:text-red-500 transition-colors" style={{ padding: '4px' }}>
                    🗑️
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-md bg-darker rounded border" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                    <button onClick={() => updateQuantity(idx, -1)} className="px-3 py-1 text-gold hover:bg-gold hover:text-dark rounded-l transition-colors" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>-</button>
                    <span className="font-bold" style={{ minWidth: '20px', textAlign: 'center' }}>{c.quantity}</span>
                    <button onClick={() => updateQuantity(idx, 1)} className="px-3 py-1 text-gold hover:bg-gold hover:text-dark rounded-r transition-colors" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</button>
                  </div>
                  <span className="text-gold font-bold" style={{ fontSize: '1.1rem' }}>
                    {(c.item.price + (c.option ? c.option.price : 0)) * c.quantity} TL
                  </span>
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center mt-4">
              <h3 className="text-gold">Toplam</h3>
              <h3 className="font-bold">{total} TL</h3>
            </div>
          </>
        )}
      </div>

      <button onClick={handleSubmit} disabled={cartItems.length === 0} className="btn-primary w-full text-center mt-4" style={{ opacity: cartItems.length === 0 ? 0.5 : 1 }}>
        Siparişi Onayla
      </button>

      <Link href={`/menu?table=${table}`} className="btn-outline w-full text-center mt-2" style={{display: 'block'}}>
        Menüye Dön ve Ekleme Yap
      </Link>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="text-center p-4">Yükleniyor...</div>}>
      <CartContent />
    </Suspense>
  );
}
