'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { categories, menuItems, MenuItem, MenuOption } from '@/data/menu';
import Link from 'next/link';

function MenuContent() {
  const searchParams = useSearchParams();
  const table = searchParams.get('table') || 'Bilinmeyen Masa';
  
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [cart, setCart] = useState<any[]>([]);
  const [localMenuItems, setLocalMenuItems] = useState<MenuItem[]>(menuItems);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data && data.menu) {
          const mergedMenu = data.menu.map((item: any) => {
            const sourceItem = menuItems.find(mi => mi.id === item.id);
            if (sourceItem && sourceItem.image && !item.image) {
              return { ...item, image: sourceItem.image };
            }
            return item;
          });
          setLocalMenuItems(mergedMenu);
          localStorage.setItem('pilavci_menu', JSON.stringify(mergedMenu));
        }
      } catch (e) {
        // Fallback to local storage if API fails
        const storedMenu = localStorage.getItem('pilavci_menu');
        if (storedMenu) {
          try {
            setLocalMenuItems(JSON.parse(storedMenu));
          } catch(err) {}
        }
      }
    };

    loadMenu();
    const menuInterval = setInterval(loadMenu, 15000); // Check for updates every 15s

    const storedCart = localStorage.getItem('pilavci_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {}
    }
    
    return () => {
      clearInterval(menuInterval);
    };
  }, []);

  const addToCart = (item: MenuItem, option?: MenuOption) => {
    const newCartItem = { item, option, quantity: 1 };
    const updatedCart = [...cart, newCartItem];
    setCart(updatedCart);
    localStorage.setItem('pilavci_cart', JSON.stringify(updatedCart));
    showToast(`✅ ${item.name} sepete eklendi`);
  };

  return (
    <div className="container flex flex-col gap-xl pb-32">
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
      <header className="menu-header text-center">
        <h1 className="brand-logo" style={{ fontSize: '2rem' }}>Pilav 7'm</h1>
        <p className="text-gold">Masa: {table}</p>
      </header>

      {/* Category Navigation */}
      <nav className="category-nav flex gap-md">
        {categories.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setActiveCategory(cat.id)}
            className={`cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      {/* Menu Items */}
      <div className="menu-list flex flex-col gap-lg">
        {localMenuItems.filter(item => item.categoryId === activeCategory && !item.isSuspended).map(item => (
          <div key={item.id} className="card item-card flex flex-col" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Image Section */}
            {item.image ? (
              <div 
                style={{ 
                  width: '100%', 
                  height: '220px', 
                  backgroundImage: `url(${item.image})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
                }} 
              />
            ) : (
              <div 
                style={{ 
                  width: '100%', 
                  height: '150px', 
                  backgroundColor: 'var(--bg-darker)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                <span className="text-gold font-bold" style={{ fontSize: '1.5rem', opacity: 0.5 }}>Pilav 7'm</span>
              </div>
            )}
            
            {/* Content Section */}
            <div className="flex flex-col gap-sm" style={{ padding: '1.25rem' }}>
              <div className="flex justify-between items-start">
                <h3 style={{ fontSize: '1.3rem', lineHeight: '1.3', maxWidth: '75%', margin: 0 }}>{item.name}</h3>
                <span className="price text-gold font-bold" style={{ fontSize: '1.25rem' }}>{item.price} TL</span>
              </div>
              
              <p className="ingredients text-muted text-sm mt-1">{item.ingredients}</p>
              
              <div className="flex justify-between items-center text-xs text-muted mt-2 pt-3" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
                <span>🔥 {item.calories} kcal</span>
                {item.weight && <span>⚖️ {item.weight}</span>}
              </div>

              {/* Options if exist */}
              {item.options && item.options.length > 0 && (
                <div className="options-box mt-3">
                  <p className="text-sm text-gold font-bold mb-2">Ekstra Ekle:</p>
                  <div className="flex flex-col gap-sm">
                    {item.options.map(opt => (
                      <div key={opt.id} className="flex justify-between items-center bg-dark p-2 rounded border" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                        <span className="text-sm text-white">{opt.name} (+{opt.calories} kcal)</span>
                        <button onClick={() => addToCart(item, opt)} className="btn-outline btn-sm" style={{ padding: '4px 10px' }}>
                          +{opt.price} TL
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button onClick={() => addToCart(item)} className="btn-primary mt-4 w-full" style={{ padding: '12px', fontSize: '1.1rem' }}>
                Sepete Ekle
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="floating-cart">
          <Link href={`/cart?table=${table}`} className="btn-primary w-full shadow-glow">
            Sepeti Görüntüle ({cart.length} Ürün)
          </Link>
        </div>
      )}
      {/* Tarım Bakanlığı Zorunlu QR Kodu (Footer) */}
      <div className="flex flex-col items-center justify-center mt-12 mb-8 opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-xs text-muted mb-2 text-center font-bold" style={{ letterSpacing: '0.5px' }}>
          T.C. Tarım ve Orman Bakanlığı<br/>İşletme Denetim QR Kodu
        </p>
        <img 
          src="/images/bakanlik-qr.png" 
          alt="Güvenilir Gıda QR Kodu" 
          style={{ 
            width: '120px', 
            borderRadius: '8px', 
            border: '2px solid rgba(212, 175, 55, 0.4)' 
          }} 
        />
      </div>

    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="text-center p-4">Yükleniyor...</div>}>
      <MenuContent />
    </Suspense>
  );
}
