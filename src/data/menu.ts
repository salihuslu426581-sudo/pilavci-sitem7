export interface MenuOption {
  id: string;
  name: string;
  price: number;
  calories: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  calories: number;
  weight?: string;
  ingredients: string;
  categoryId: string;
  image?: string;
  options?: MenuOption[];
  isSuspended?: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export const categories: Category[] = [
  { id: 'corba', name: 'Çorba Çeşitleri' },
  { id: 'pilav', name: 'Pilav Aşkına (Ana Yemekler)' },
  { id: 'sinirsiz', name: 'Sınırsız Menüler' },
  { id: 'icecek', name: 'İçeceklerimiz' },
];

export const menuItems: MenuItem[] = [
  // Çorbalar
  {
    id: 'mercimek-corbasi',
    name: 'Mercimek Çorbası',
    price: 100, // Menü görselinde 100 TL, notta 150 TL yazıyor. Görsele uyalım.
    calories: 340,
    weight: '250 ml',
    ingredients: 'Kırmızı mercimek, ayçiçek yağı, tereyağı, tuz, tavuk suyu, kekik, tatlı toz biber.',
    categoryId: 'corba',
    image: '/images/mercimek-corbasi.jpg'
  },
  
  // Pilavlar
  {
    id: 'nohut-pilav',
    name: 'Tereyağlı Nohut Pilav',
    price: 100,
    calories: 220,
    weight: '350 gr',
    ingredients: 'Baldo pirinç, tuz, hakiki tereyağı, nohut.',
    categoryId: 'pilav',
    image: '/images/nohut-pilav.jpg'
  },
  {
    id: 'tavuk-pilav',
    name: 'Tereyağlı Tavuk Pilav',
    price: 150,
    calories: 430,
    weight: '400 gr (300g Pilav + 100g Tavuk)',
    ingredients: 'Baldo pirinç, tuz, hakiki tereyağı, tiftik tavuk göğsü.',
    categoryId: 'pilav',
    image: '/images/tavuk-pilav.jpg',
    options: [
      { id: 'opt-tavuk-50', name: '+50 Gr Ekstra Tavuk', price: 25, calories: 75 },
      { id: 'opt-tavuk-100', name: '+100 Gr Ekstra Tavuk', price: 50, calories: 150 },
      { id: 'opt-tavuk-150', name: '+150 Gr Ekstra Tavuk', price: 75, calories: 225 },
    ]
  },
  {
    id: 'et-pilav',
    name: 'Tereyağlı Et Pilav',
    price: 350,
    calories: 530,
    weight: '350 gr',
    ingredients: 'Baldo pirinç, tuz, tereyağı, dana eti, dana iç yağı.',
    categoryId: 'pilav',
    image: '/images/et-pilav.jpg',
    options: [
      { id: 'opt-et-50', name: '+50 Gr Ekstra Et', price: 100, calories: 125 },
      { id: 'opt-et-100', name: '+100 Gr Ekstra Et', price: 200, calories: 250 },
      { id: 'opt-et-150', name: '+150 Gr Ekstra Et', price: 300, calories: 375 },
    ]
  },
  {
    id: 'kori-soslu-tavuk',
    name: 'Köri Soslu Tavuk Pilav',
    price: 175,
    calories: 315,
    weight: '350 gr',
    ingredients: 'Baldo pirinç, tuz, tereyağı, özel köri sosu, süt, krema, tavuk eti.',
    categoryId: 'pilav',
    image: '/images/kori-soslu-tavuk.jpg'
  },
  {
    id: 'mangal-soslu-tavuk',
    name: 'Mangal Soslu Tavuk Pilav',
    price: 175,
    calories: 315,
    weight: '350 gr',
    ingredients: 'Baldo pirinç, tuz, tereyağı, mangal sosu, süt, krema, tavuk eti.',
    categoryId: 'pilav',
    image: '/images/mangal-soslu-tavuk.jpg'
  },
  {
    id: 'kekik-soslu-tavuk',
    name: 'Kekik Soslu Tavuk Pilav',
    price: 175,
    calories: 310,
    weight: '350 gr',
    ingredients: 'Baldo pirinç, tuz, tereyağı, dağ kekiği, süt, krema, tavuk eti.',
    categoryId: 'pilav',
    image: '/images/kekik-soslu-tavuk.jpg'
  },

  // Sınırsız
  {
    id: 'sinirsiz-tavuk',
    name: 'Sınırsız Tavuk Pilav (Kişi Başı)',
    price: 300,
    calories: 900,
    ingredients: 'Doyana kadar baldo pirinç pilavı ve tiftik tavuk göğsü.',
    categoryId: 'sinirsiz',
    image: '/images/sinirsiz-tavuk.jpg'
  },
  {
    id: 'sinirsiz-et',
    name: 'Sınırsız Et Pilav (Kişi Başı)',
    price: 600,
    calories: 1200,
    ingredients: 'Doyana kadar baldo pirinç pilavı ve kavurma tadında dana eti.',
    categoryId: 'sinirsiz',
    image: '/images/sinirsiz-et.jpg'
  },

  // İçecekler
  {
    id: 'kutu-kola',
    name: 'Kutu Kola',
    price: 40,
    calories: 140,
    weight: '330 ml',
    ingredients: 'Karbonatlı su, şeker, renklendirici, kafein.',
    categoryId: 'icecek',
    image: '/images/kutu-kola.jpg'
  },
  {
    id: 'ayran',
    name: 'Ayran (Büyük)',
    price: 30,
    calories: 80,
    weight: '300 ml',
    ingredients: 'Yoğurt, su, tuz.',
    categoryId: 'icecek',
    image: '/images/ayran.jpg'
  }
];
