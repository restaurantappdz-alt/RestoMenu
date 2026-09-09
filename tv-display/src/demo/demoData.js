// Fixture menu used by the ?demo=1 preview mode (tools/layout-shots).
// Exercises descriptions, tags, addons, and the photo-menu hero fields so
// every layout renders with realistic content.

export const DEMO_MENU = {
  id: 'demo',
  name: 'Salon de Thé Andalus',
  currency: 'DA',
  selectedLayout: 'photoGrid',
  heroImageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=1200&q=80',
  heroName: 'Thé à la Menthe Traditionnel',
  heroDescription: 'Thé vert royal infusé à la menthe fraîche et pignons.',
  heroLabel: 'Spécialité Maison',
  heroPrice: 150,
  boardConfig: {
    slots: [
      {
        title: 'برجر كلاسيك فاخر',
        subtitle: 'Classic Burger Gourmet',
        price: '650',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
        priceType: 'single',
      },
      {
        title: 'بيتزا مارغريتا إيطالية',
        subtitle: 'Pizza Margherita',
        price: '750',
        imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80',
        priceType: 'single',
      },
      {
        title: 'سندويش بانيني دجاج',
        subtitle: 'Panini Poulet Grillé',
        price: '450',
        imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80',
        priceType: 'single',
      },
      {
        title: 'تاكوس فرنسي الأصيل',
        subtitle: 'French Tacos Spécial',
        price: '550',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80',
        priceType: 'single',
      },
      {
        title: 'مشاوي مشكلة فاخرة',
        subtitle: 'Brochettes Mixtes Grillées',
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
        priceType: 'multiple',
        priceRows: [
          { label: 'سياخ لحم غنم', price: '900' },
          { label: 'سياخ دجاج متبل', price: '700' },
          { label: 'طبق عائلي مشكل', price: '1600' },
        ],
      },
      {
        title: 'دجاج محمر مع بطاطا',
        subtitle: 'Poulet Rôti & Frites',
        imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&auto=format&fit=crop&q=80',
        priceType: 'multiple',
        priceRows: [
          { label: 'ربع دجاجة محمرة', price: '350' },
          { label: 'نصف دجاجة محمرة', price: '650' },
          { label: 'دجاجة كاملة عائلية', price: '1200' },
        ],
      },
      {
        title: 'شاورما عربي سبيسيال',
        subtitle: 'Shawarma Royale',
        imageUrl: 'https://images.unsplash.com/photo-1633321702518-7feccafb94d5?w=800&auto=format&fit=crop&q=80',
        priceType: 'multiple',
        priceRows: [
          { label: 'سندويش عادي', price: '300' },
          { label: 'سندويش دوبل جبن', price: '400' },
          { label: 'صحن عربي مع مقبلات', price: '750' },
        ],
      },
      {
        title: 'بطاطا مقلية مقرمشة',
        subtitle: 'Frites & Sauces Maison',
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop&q=80',
        priceType: 'multiple',
        priceRows: [
          { label: 'حجم متوسط', price: '150' },
          { label: 'حجم كبير مع جبن', price: '250' },
          { label: 'بوكس عائلي سبيسيال', price: '450' },
        ],
      },
    ],
  },
  categories: [
    {
      id: 'chaud',
      name: 'Boissons Chaudes & Cafés',
      addons: [
        { id: 'a1', name: 'Avec Cacahuètes / Amandes', price: 100 },
        { id: 'a2', name: 'Supplément Miel Pur', price: 50 },
      ],
      items: [
        {
          id: 's1',
          name: 'Thé à la Menthe Traditionnel',
          price: 150,
          description: 'Thé vert infusé à la menthe fraîche et pignons.',
          tag: 'Incontournable',
          imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=1200&q=80',
        },
        {
          id: 's2',
          name: 'Café Crème / Cappuccino',
          price: 250,
          description: 'Espresso riche, mousse de lait onctueuse et vanille.',
          tag: 'Populaire',
          imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=1200&q=80',
        },
        {
          id: 's3',
          name: 'Crêpe Nutella Banane',
          price: 500,
          description: 'Chocolat noisette généreux, rondelles de banane fraîches.',
          tag: 'Best-Seller',
          imageUrl: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=1200&q=80',
        },
        {
          id: 's4',
          name: 'Gaufre Liégeoise Gourmande',
          price: 450,
          description: 'Gaufre croustillante, sauce chocolat et fraises fraîches.',
          tag: 'Gourmand',
          imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=1200&q=80',
        },
      ],
    },
    {
      id: 'douceurs',
      name: 'Douceurs & Boissons Fraîches',
      addons: [
        { id: 'm_a1', name: 'Supplément Chantilly', price: 50 },
        { id: 'm_a2', name: 'Boule de Glace Vanille', price: 100 },
      ],
      items: [
        {
          id: 'm1',
          name: 'Msemen Miel & Beurre',
          price: 200,
          description: 'Feuilleté traditionnel doré au beurre et miel pur.',
          tag: 'Traditionnel',
          imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80',
          variations: [
            { id: 'v1', name: 'Avec Miel Pur & Beurre', price: 200 },
            { id: 'v2', name: 'Avec Nutella & Banane', price: 350 },
          ],
        },
        {
          id: 'm2',
          name: 'Assortiment Baklawa & Gâteaux',
          price: 300,
          description: 'Baklawa artisanale au miel et amandes grillées.',
          tag: 'Maison',
          imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=1200&q=80',
          variations: [
            { id: 'v3', name: 'Assiette Dégustation (3 pcs)', price: 300 },
            { id: 'v4', name: 'Plateau Prestige (6 pcs)', price: 600 },
          ],
        },
        {
          id: 'm3',
          name: 'Milkshake Fraise Gourmand',
          price: 400,
          description: 'Fraises fraîches mixées, glace vanille et chantilly.',
          tag: 'Frais',
          imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=1200&q=80',
          variations: [
            { id: 'v5', name: 'Grand Verre 400ml', price: 400 },
            { id: 'v6', name: 'Supplément Chantilly & Coulis', price: 50 },
          ],
        },
        {
          id: 'm4',
          name: 'Mojito Frais Fruits Rouges',
          price: 350,
          description: 'Citron vert pilé, menthe fraîche, fraise et soda.',
          tag: 'Fraîcheur',
          imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&q=80',
          variations: [
            { id: 'v7', name: 'Mojito Classique Citron-Menthe', price: 300 },
            { id: 'v8', name: 'Mojito Fruits Rouges Sauvages', price: 350 },
          ],
        },
      ],
    },
  ],
}

export const DEMO_CATEGORIES = DEMO_MENU.categories
export const DEMO_ADDONS = DEMO_MENU.categories.map((c) => c.addons || []).flat()
