import Link from 'next/link';

export default function Home() {
  return (
    <div className="container flex flex-col">
      <header>
        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <h1 className="brand-logo">Pilav 7'm</h1>
        </Link>
        <p className="brand-subtitle">— Pilav Aşkına —</p>
      </header>
      
      <div className="card flex flex-col gap-md items-center text-center">
        <h2>Hoş Geldiniz</h2>
        <p className="text-muted">Lütfen masanızdaki QR kodu okuttuğunuzdan emin olun.</p>
        
        <Link href="/menu?table=1" className="btn-primary">
          Menüyü İncele
        </Link>
      </div>
    </div>
  );
}
