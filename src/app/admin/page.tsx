'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { menuItems as initialMenuItems, categories, MenuItem } from '@/data/menu';

// Mock orders for the admin panel
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

export default function AdminDashboard() {
  const [orders, setOrders] = useState<{ id: string, table: string, time: string, status: string, total: number, items: { name: string, option?: string, qty: number }[] }[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const lastOrderIdRef = useRef<string | null>(null);
  
  // Menu Management State
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'report' | 'qr'>('orders');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState(categories[0].id);
  const [newProductIngredients, setNewProductIngredients] = useState('');
  const [newProductImage, setNewProductImage] = useState('');

  // Global AudioContext referansı (Limit aşımını önlemek için)
  const audioCtxRef = useRef<any>(null);

  // Generate 20 tables + 1 Paket
  const tables = Array.from({ length: 20 }, (_, i) => `Masa ${i + 1}`).concat(['Paket / Yemeksepeti']);

  const updateStatus = async (id: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
    } catch(e) {}
  };

  const handleTestOrder = async () => {
    try {
      await fetch('/api/webhooks/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total: 250,
          items: [{ name: 'Yemeksepeti Test Siparişi', qty: 2 }, { name: 'Kola', qty: 1 }]
        })
      });
      alert('Test siparişi Yemeksepeti API\'sinden başarıyla gönderildi. 5 saniye içinde sisteme düşecektir.');
    } catch(e) {
      alert('Sipariş gönderilirken hata oluştu');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'PilavcıAdmin7M') {
      setIsAuthenticated(true);
      sessionStorage.setItem('pilavci_admin_auth', 'true');
      setError('');
    } else {
      setError('Hatalı şifre');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('pilavci_admin_auth');
  };

  useEffect(() => {
    const authStatus = sessionStorage.getItem('pilavci_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    const playNotification = (table: string) => {
      try {
        const isPaket = table.toLowerCase().includes('paket') || table.toLowerCase().includes('yemeksepeti');
        
        if (isPaket) {
          // Bu MP3 senin bilgisayarında kesin çalışıyordu (Zırrr telefon sesi gibi)
          const audio = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3');
          audio.volume = 1.0;
          audio.play().catch(e => console.log(e));
        } else {
          // Masa için asla engellenmeyen, tarayıcının kendi ürettiği pırıl pırıl bir Otel Zili (Çın-Çın-Çın!)
          if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const ctx = audioCtxRef.current;
          if (ctx.state === 'suspended') ctx.resume();
          
          const playDing = (startTime: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle'; // Zile en çok benzeyen dalga
            osc.frequency.setValueAtTime(1046.50, startTime); // C6 notası (Parlak ve net)
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            // Kısık kaldığı için sesi arttırdık (0.35). 3 kere üst üste binince yaklaşık 1.0 seviyesine gelir (Patlamaz ama gür çıkar).
            gain.gain.setValueAtTime(0.35, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3); // Hızlı sönümleme
            
            osc.start(startTime);
            osc.stop(startTime + 0.3);
          };

          // Zamanlama hatasını (DOMException) önlemek için tampon
          const now = ctx.currentTime + 0.05;
          
          // 1. Grup (Hızlı 3'lü)
          playDing(now);        
          playDing(now + 0.15); 
          playDing(now + 0.30); 
          
          // Yarım saniye bekle -> 2. Grup (Hızlı 3'lü)
          playDing(now + 0.80); 
          playDing(now + 0.95); 
          playDing(now + 1.10); 
          
          // Yarım saniye bekle -> 3. Grup (Hızlı 3'lü)
          playDing(now + 1.60); 
          playDing(now + 1.75); 
          playDing(now + 1.90); 
        }
      } catch (e) {}
    };

    const loadOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.orders) {
          if (data.orders.length > 0) {
            const latestOrder = data.orders[0];
            // Eğer ilk yükleme değilse ve yeni bir sipariş geldiyse
            if (lastOrderIdRef.current !== null && latestOrder.id !== lastOrderIdRef.current) {
              playNotification(latestOrder.table);
            }
            lastOrderIdRef.current = latestOrder.id;
          }
          setOrders(data.orders);
          localStorage.setItem('pilavci_orders', JSON.stringify(data.orders));
        }
      } catch(e) {
        const stored = localStorage.getItem('pilavci_orders');
        if (stored) {
          const parsed = JSON.parse(stored);
          setOrders(parsed);
          if (parsed.length > 0) lastOrderIdRef.current = parsed[0].id;
        }
      }
    };

    const loadMenu = async () => {
      try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data.menu) {
          setMenuItems(data.menu);
          localStorage.setItem('pilavci_menu', JSON.stringify(data.menu));
        }
      } catch(e) {
        const stored = localStorage.getItem('pilavci_menu');
        if (stored) setMenuItems(JSON.parse(stored));
      }
    };

    loadOrders();
    loadMenu();

    // Polling for all orders (internal + external)
    const pollInterval = setInterval(async () => {
      try {
        await loadOrders(); // Fetch active internal orders
        
        // Also check if any external webhooks arrived and merge them in
        const whRes = await fetch('/api/webhooks/orders');
        const whData = await whRes.json();
        if (whData && whData.orders && whData.orders.length > 0) {
          for (const o of whData.orders) {
             await fetch('/api/orders', { 
               method: 'POST', 
               headers: { 'Content-Type': 'application/json' }, 
               body: JSON.stringify(o) 
             });
          }
          // Acknowledge webhooks
          const orderIds = whData.orders.map((o: any) => o.id);
          await fetch('/api/webhooks/orders', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIds })
          });
          await loadOrders(); // Refresh again
        }
      } catch (e) {
        // silently ignore network errors during polling
      }
    }, 5000);

    return () => {
      window.removeEventListener('storage', loadOrders);
      window.removeEventListener('orders_updated', loadOrders);
      window.removeEventListener('menu_updated', loadMenu);
      clearInterval(pollInterval);
    };
  }, []);

  const clearAllOrders = async () => {
    if (confirm("GÜN SONU YAPILIYOR! Tüm geçmiş siparişler silinecek. Ciro ve rapor sıfırlanacak. Onaylıyor musunuz?")) {
      setOrders([]);
      localStorage.removeItem('pilavci_orders');
      try {
        await fetch('/api/orders', { method: 'DELETE' }); // Optional, if we want to clear server side too
      } catch (e) {}
    }
  };

  const syncMenu = async (updatedMenu: MenuItem[]) => {
    setMenuItems(updatedMenu);
    localStorage.setItem('pilavci_menu', JSON.stringify(updatedMenu));
    window.dispatchEvent(new Event('menu_updated'));
    try {
      await fetch('/api/menu', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ menu: updatedMenu }) });
    } catch(e) {}
  };

  const updateMenuPrice = (id: string, newPriceStr: string) => {
    const newPrice = Number(newPriceStr);
    if (isNaN(newPrice)) return;
    const updated = menuItems.map(item => item.id === id ? { ...item, price: newPrice } : item);
    syncMenu(updated);
  };

  const updateMenuImage = (id: string, newImage: string) => {
    const updated = menuItems.map(item => item.id === id ? { ...item, image: newImage || undefined } : item);
    syncMenu(updated);
  };

  const updateMenuIngredients = (id: string, newIngredients: string) => {
    const updated = menuItems.map(item => item.id === id ? { ...item, ingredients: newIngredients } : item);
    syncMenu(updated);
  };

  const deleteMenuProduct = (id: string) => {
    if (confirm('Bu ürünü tamamen silmek istediğinize emin misiniz? (Mevcut siparişlerde bu ürün varsa silinmez, sadece menüden kalkar).')) {
      const updated = menuItems.filter(item => item.id !== id);
      syncMenu(updated);
    }
  };

  const toggleSuspendProduct = (id: string) => {
    const updated = menuItems.map(item => {
      if (item.id === id) {
        return { ...item, isSuspended: !item.isSuspended };
      }
      return item;
    });
    syncMenu(updated);
  };

  const handleResetMenu = () => {
    if (confirm("Tüm menü (eklediğin yeni ürünler dahil) silinecek ve orijinal fotoğraflı haline geri dönecektir. Emin misin?")) {
      setMenuItems(initialMenuItems);
      localStorage.setItem('pilavci_menu', JSON.stringify(initialMenuItems));
      window.dispatchEvent(new Event('menu_updated'));
      alert("Menü başarıyla orijinal ayarlarına sıfırlandı!");
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;
    
    const item: MenuItem = {
      id: 'item-' + Date.now(),
      name: newProductName,
      price: Number(newProductPrice),
      calories: 250, // default
      ingredients: newProductIngredients,
      categoryId: newProductCategory,
      image: newProductImage || undefined
    };
    
    const updated = [...menuItems, item];
    syncMenu(updated);
    
    setNewProductName('');
    setNewProductPrice('');
    setNewProductIngredients('');
    setNewProductImage('');
  };

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('pilavci_orders', JSON.stringify(orders));
    }
  }, [orders]);

  const handleCloseTable = async (table: string) => {
    if (confirm(`${table} siparişlerini hesabı alıp kapatmak istediğinize emin misiniz?`)) {
      const remainingOrders = orders.filter(o => o.table !== table);
      setOrders(remainingOrders);
      localStorage.setItem('pilavci_orders', JSON.stringify(remainingOrders));
      try {
        await fetch('/api/orders', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table }) });
      } catch(e) {}
      window.dispatchEvent(new Event('orders_updated'));
      setSelectedTable(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-lg">
        <div className="card w-full max-w-sm flex flex-col gap-md">
          <h1 className="brand-logo text-gold text-center" style={{ fontSize: '1.8rem' }}>Admin Girişi</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-sm text-muted">Şifre</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-dark border border-gray rounded p-2 text-white"
                placeholder="Şifreyi giriniz..."
                autoFocus
              />
              {error && <span className="text-red-500 text-xs">{error}</span>}
            </div>
            <button type="submit" className="btn-primary w-full text-center">Giriş Yap</button>
          </form>
        </div>
        <Link href="/" className="text-muted text-sm underline">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  // Filter out completed orders from the main count
  const activeOrders = orders.filter(o => o.status !== 'Teslim Edildi');

  return (
    <div className="flex flex-col pb-32" style={{ padding: '2rem' }}>
      <header className="menu-header border-b" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div className="flex justify-between items-center">
          <h1 className="brand-logo text-gold m-0" style={{ fontSize: '1.8rem', textAlign: 'left' }}>Admin Paneli</h1>
          <div className="flex gap-sm">
            <button onClick={handleTestOrder} className="btn-outline btn-sm hover:scale-105 transition-transform" style={{ background: 'var(--gold-primary)', color: '#000', borderColor: 'var(--gold-primary)', fontWeight: 'bold' }}>Test Et (Yemeksepeti)</button>
            <button onClick={handleLogout} className="btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }}>Çıkış Yap</button>
            <Link href="/" className="btn-outline btn-sm">Ana Sayfa</Link>
          </div>
        </div>
        <p className="text-muted text-sm mt-2">Masalar & Aktif Siparişler</p>
        
        <div className="flex gap-md mt-4">
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`btn-outline ${activeTab === 'orders' ? 'bg-gold text-dark' : ''}`}
            style={activeTab === 'orders' ? { background: 'var(--gold-primary)', color: '#000' } : {}}
          >
            Siparişler
          </button>
          <button 
            onClick={() => setActiveTab('menu')} 
            className={`btn-outline ${activeTab === 'menu' ? 'bg-gold text-dark' : ''}`}
            style={activeTab === 'menu' ? { background: 'var(--gold-primary)', color: '#000' } : {}}
          >
            Menü Yönetimi
          </button>
          <button 
            onClick={() => setActiveTab('report')} 
            className={`btn-outline ${activeTab === 'report' ? 'bg-gold text-dark' : ''}`}
            style={activeTab === 'report' ? { background: 'var(--gold-primary)', color: '#000' } : {}}
          >
            Günlük Rapor
          </button>
          <button 
            onClick={() => setActiveTab('qr')} 
            className={`btn-outline ${activeTab === 'qr' ? 'bg-gold text-dark' : ''}`}
            style={activeTab === 'qr' ? { background: 'var(--gold-primary)', color: '#000' } : {}}
          >
            QR Kodlar
          </button>
        </div>
      </header>

      {(() => {
        // Compute Sales Data
        const salesData: Record<string, { qty: number }> = {};
        let totalRevenue = 0;
        
        orders.forEach(order => {
          if (order.status === 'Tamamlandı') {
            totalRevenue += order.total;
          }
          
          order.items.forEach(item => {
            const key = item.option ? `${item.name} (${item.option})` : item.name;
            if (!salesData[key]) {
              salesData[key] = { qty: 0 };
            }
            salesData[key].qty += item.qty;
          });
        });

        const sortedSales = Object.entries(salesData).sort((a, b) => b[1].qty - a[1].qty);

        if (activeTab === 'qr') {
          return (
            <div className="flex flex-col gap-lg mx-auto w-full max-w-[900px]">
              <div className="card flex flex-col gap-md" style={{ border: '1px solid var(--border-color)', padding: '2rem' }}>
                <h2 className="text-gold font-bold text-center" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Masa QR Kodları</h2>
                <p className="text-muted text-center mb-4">Aşağıdaki QR kodları telefonunuzla veya yazıcıyla kolayca alıp masalara yerleştirebilirsiniz.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-xl">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
                    const tableUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/menu?table=Masa ${num}`;
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableUrl)}`;
                    
                    return (
                      <div key={num} className="flex flex-col items-center gap-sm p-4 rounded" style={{ background: 'var(--bg-darker)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                        <h3 className="text-gold font-bold" style={{ fontSize: '1.2rem' }}>Masa {num}</h3>
                        <div style={{ background: '#fff', padding: '10px', borderRadius: '8px' }}>
                          <img src={qrUrl} alt={`Masa ${num} QR Kod`} style={{ width: '150px', height: '150px', objectFit: 'contain' }} />
                        </div>
                        <a href={qrUrl} target="_blank" download className="btn-outline btn-sm mt-2" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                          Büyüt
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }

        if (activeTab === 'report') {
          return (
            <div className="flex flex-col gap-lg max-w-[600px] mx-auto w-full">
              <div className="card flex flex-col gap-sm" style={{ border: '1px solid var(--border-color)', padding: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
                <h2 className="text-gold font-bold text-center" style={{ fontSize: '1.4rem', marginBottom: '1rem', letterSpacing: '0.5px' }}>Günlük Satış Raporu</h2>
                
                <div className="flex flex-col items-center justify-center rounded-lg mb-4" style={{ padding: '1.5rem 1rem', background: 'linear-gradient(145deg, var(--bg-darker) 0%, rgba(212, 175, 55, 0.05) 100%)', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, var(--gold-primary), transparent)' }}></div>
                  <span className="text-muted font-bold uppercase tracking-wider mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1.5px' }}>GÜNLÜK TOPLAM CİRO (Sadece Tamamlananlar)</span>
                  <span className="text-gold font-bold" style={{ fontSize: '2.5rem', lineHeight: '1', textShadow: '0 2px 8px rgba(212, 175, 55, 0.2)' }}>{totalRevenue} <span style={{ fontSize: '1.2rem', verticalAlign: 'super' }}>TL</span></span>
                </div>

                <button 
                  onClick={clearAllOrders}
                  className="btn-primary w-full mb-4 hover:bg-red-600 hover:text-white transition-all"
                  style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}
                >
                  🧹 Gün Sonu Yap (Tüm Siparişleri ve Ciroyu Sıfırla)
                </button>

                <div className="flex flex-col gap-sm">
                  <h3 className="text-gold font-bold mb-2" style={{ fontSize: '1.1rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>En Çok Satan Ürünler</h3>
                  {sortedSales.length === 0 ? (
                    <p className="text-center text-muted py-4">Henüz hiç sipariş yok.</p>
                  ) : (
                    sortedSales.map(([name, data], idx) => (
                      <div key={idx} className="flex justify-between items-center rounded" style={{ background: 'var(--bg-darker)', border: '1px solid rgba(212, 175, 55, 0.15)', padding: '0.75rem 1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <span className="text-white font-bold" style={{ fontSize: '1rem' }}>{name}</span>
                        <div className="flex items-center">
                          <strong className="text-gold" style={{ fontSize: '1.1rem' }}>{data.qty}</strong>
                          <span className="text-muted ml-1 uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>adet</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        }

        if (activeTab === 'orders') {
          return (
            <>
          {/* Tables Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-xl">
        {tables.map(table => {
          const tableOrders = activeOrders.filter(o => o.table === table);
          const hasOrder = tableOrders.length > 0;
          
          return (
            <button 
              key={table}
              onClick={() => setSelectedTable(table)}
              className={`card flex flex-col items-center justify-center aspect-square text-center transition-all cursor-pointer ${
                hasOrder ? 'bg-gold text-dark shadow-glow hover:scale-105' : 'bg-dark text-muted hover:border-gold hover:scale-105'
              }`}
              style={{ 
                border: hasOrder ? 'none' : '1px solid var(--border-color)', 
                padding: '1rem',
                transform: 'transition 0.3s'
              }}
            >
              <span className={`font-bold ${hasOrder ? 'text-dark' : 'text-gold'}`} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {table.replace('Masa ', '')}
              </span>
              {table.includes('Paket') ? (
                <span className="text-sm font-bold">Paket</span>
              ) : (
                <span className="text-xs">Masa</span>
              )}

              {hasOrder && (
                <div className="mt-2 bg-darker px-3 py-1 rounded-full text-xs font-bold text-white border" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  {tableOrders.length} Sipariş
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal for Selected Table */}
      {selectedTable && (
        <div className="modal-overlay" onClick={() => setSelectedTable(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-4 mb-4" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex gap-md items-center">
                <h2 className="text-gold m-0" style={{ fontSize: '1.5rem' }}>{selectedTable} Siparişleri</h2>
                {orders.some(o => o.table === selectedTable) && (
                  <button 
                    onClick={() => handleCloseTable(selectedTable)} 
                    className="btn-outline btn-sm hover:bg-red-500 hover:text-white transition-all" 
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    Masayı Kapat
                  </button>
                )}
              </div>
              <button onClick={() => setSelectedTable(null)} className="text-muted" style={{ fontSize: '2rem', lineHeight: '1' }}>&times;</button>
            </div>
            
            {orders.filter(o => o.table === selectedTable).length === 0 ? (
              <p className="text-center text-muted py-8">Bu masaya ait geçmiş veya aktif sipariş bulunmamaktadır.</p>
            ) : (
              <div className="flex flex-col gap-lg">
                {orders.filter(o => o.table === selectedTable).map(order => (
                  <div key={order.id} className="card flex flex-col" style={{ border: '1px solid var(--border-color)', padding: '1rem' }}>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>{order.id} • {order.time}</p>
                      <span className="rounded font-bold" style={{ 
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        background: order.status === 'Yeni' ? 'var(--gold-primary)' : 'transparent', 
                        color: order.status === 'Yeni' ? '#000' : 'inherit',
                        border: order.status === 'Yeni' ? 'none' : '1px solid var(--border-color)'
                      }}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-sm mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col rounded" style={{ background: 'var(--bg-darker)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '0.75rem 1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                          <div className="flex items-center">
                            <strong className="text-gold" style={{ fontSize: '1.1rem', marginRight: '0.5rem' }}>{item.qty}x</strong> 
                            <span className="text-white font-bold" style={{ fontSize: '1.1rem' }}>{item.name}</span>
                          </div>
                          {item.option && <p className="text-sm text-muted mt-2" style={{ marginLeft: '1.75rem' }}>Ekstra: {item.option}</p>}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-4" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <span className="font-bold text-gold" style={{ fontSize: '1.2rem' }}>{order.total} TL</span>
                      <div className="flex gap-sm">
                        {order.status === 'Yeni' && (
                          <button onClick={() => updateStatus(order.id, 'Hazırlanıyor')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                            Onayla
                          </button>
                        )}
                        {order.status === 'Hazırlanıyor' && (
                          <button onClick={() => updateStatus(order.id, 'Teslim Edildi')} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                            Tamamla
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
        </>
        );
      } // end activeTab === 'orders'
      
      return (
        <div className="flex flex-col gap-xl max-w-[800px] mx-auto w-full">
          {/* Add Product Form */}
          <div className="card flex flex-col gap-md" style={{ border: '2px solid var(--gold-primary)', padding: '1.25rem' }}>
            <h2 className="text-gold font-bold" style={{ fontSize: '1.5rem' }}>Yeni Ürün Ekle</h2>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                <input 
                  type="text" 
                  value={newProductName} 
                  onChange={e => setNewProductName(e.target.value)} 
                  placeholder="Ürün Adı" 
                  className="bg-dark border border-gray rounded" 
                  style={{ padding: '0.75rem', color: '#fff', fontSize: '1rem' }}
                  required 
                />
                <input 
                  type="number" 
                  value={newProductPrice} 
                  onChange={e => setNewProductPrice(e.target.value)} 
                  placeholder="Fiyat (TL)" 
                  className="bg-dark border border-gray rounded" 
                  style={{ padding: '0.75rem', color: '#fff', fontSize: '1rem' }}
                  required 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                <select 
                  value={newProductCategory} 
                  onChange={e => setNewProductCategory(e.target.value)} 
                  className="bg-dark border border-gray rounded"
                  style={{ padding: '0.75rem', color: '#fff', fontSize: '1rem' }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  value={newProductIngredients} 
                  onChange={e => setNewProductIngredients(e.target.value)} 
                  placeholder="İçindekiler (İsteğe bağlı)" 
                  className="bg-dark border border-gray rounded" 
                  style={{ padding: '0.75rem', color: '#fff', fontSize: '1rem' }}
                />
              </div>
              <div className="flex flex-col gap-sm">
                  <input 
                    type="text" 
                    value={newProductImage} 
                    onChange={e => setNewProductImage(e.target.value)} 
                    placeholder="Görsel URL (Örn: /images/tavuk.jpg veya https://...)" 
                    className="bg-dark border border-gray rounded" 
                    style={{ padding: '0.75rem', color: '#fff', fontSize: '1rem' }}
                  />
                </div>
                <button type="submit" className="btn-primary mt-2" style={{ padding: '0.75rem', fontSize: '1.1rem' }}>Ürünü Ekle</button>
            </form>
          </div>

          {/* Edit Existing Products */}
          <div className="card flex flex-col gap-lg" style={{ border: '1px solid var(--border-color)', padding: '2rem' }}>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-gold font-bold" style={{ fontSize: '1.8rem' }}>Mevcut Ürünler (Düzenleme & Kaldırma)</h2>
              <button 
                onClick={handleResetMenu} 
                className="btn-outline btn-sm hover:bg-red-500 hover:text-white transition-all"
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
              >
                Menüyü Orijinale Sıfırla (Bozulan Resimleri Kurtar)
              </button>
            </div>
            <div className="flex flex-col gap-sm">
              {menuItems.map(item => (
                <div key={item.id} className="flex justify-between items-center rounded" style={{ background: 'var(--bg-darker)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '0.75rem 1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  <div className="flex-1 mr-4 opacity-100 transition-opacity" style={{ opacity: item.isSuspended ? 0.5 : 1 }}>
                    <h3 className="font-bold text-white" style={{ fontSize: '1.1rem' }}>
                      {item.name} {item.isSuspended && <span className="text-red-500 text-xs">(Askıda)</span>}
                    </h3>
                    <p className="text-xs text-muted mt-1">{categories.find(c => c.id === item.categoryId)?.name}</p>
                    <input 
                      type="text"
                      defaultValue={item.image || ''}
                      placeholder="Görsel URL Ekle (örn: /images/corba.jpg)"
                      onBlur={(e) => updateMenuImage(item.id, e.target.value)}
                      className="bg-dark border rounded mt-2 w-full text-sm"
                      style={{ padding: '0.4rem 0.75rem', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                    />
                    <input 
                      type="text"
                      defaultValue={item.ingredients || ''}
                      placeholder="İçindekiler (örn: Pirinç, Tavuk, Karabiber...)"
                      onBlur={(e) => updateMenuIngredients(item.id, e.target.value)}
                      className="bg-dark border rounded mt-2 w-full text-sm"
                      style={{ padding: '0.4rem 0.75rem', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                    />
                  </div>
                  
                  {/* Right Side: Controls & Price */}
                  <div className="flex items-center gap-md ml-4">
                    
                    {/* Controls (Askıya Al / Sil) */}
                    <div className="flex flex-col gap-xs" style={{ minWidth: '90px' }}>
                      <button 
                        onClick={() => toggleSuspendProduct(item.id)}
                        className="btn-outline btn-sm"
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '0.75rem',
                          borderColor: item.isSuspended ? 'var(--gold-primary)' : 'rgba(255,255,255,0.3)',
                          color: item.isSuspended ? 'var(--gold-primary)' : '#fff'
                        }}
                      >
                        {item.isSuspended ? 'Aktif Et' : 'Askıya Al'}
                      </button>
                      <button 
                        onClick={() => deleteMenuProduct(item.id)}
                        className="btn-outline btn-sm hover:bg-red-500 hover:text-white transition-all"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444' }}
                      >
                        Sil
                      </button>
                    </div>

                    {/* Price (En Sağda) */}
                    <div className="flex items-center gap-sm">
                      <input 
                        type="number" 
                        defaultValue={item.price} 
                        onBlur={(e) => updateMenuPrice(item.id, e.target.value)}
                        className="text-center font-bold"
                        style={{ 
                          background: 'rgba(0,0,0,0.3)', 
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          borderRadius: '6px', 
                          color: 'var(--gold-primary)', 
                          padding: '0.5rem', 
                          width: '70px', 
                          fontSize: '1.1rem',
                          outline: 'none',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                        }}
                      />
                      <span className="text-gold font-bold" style={{ fontSize: '1.1rem' }}>TL</span>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </div>
      );
      })()}
    </div>
  );
}
