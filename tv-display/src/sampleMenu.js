// Generic Algerian restaurant sample menu, used to render appetizing
// layout preview photos (LayoutPreviewPage) and to regenerate the shots.
// Prices are plausible Algiers 2026 ranges (avg meal ≈ 1900 DA), not exact.
export const sampleMenu = {
  name: 'Dar El Baraka',
  tagline: 'Cuisine algérienne traditionnelle',
  currency: 'D.A',
  businessHours: 'LUN–DIM 11H–23H',
  heroImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600&q=80',
  heroName: 'Couscous Royal',
  heroDescription: 'Semoule fine, agneau fondant, légumes de saison et sauce maison',
  heroPrice: '1500',
  heroLabel: 'Spécialité de la maison',
  allergyNote: 'Allergènes : gluten, lait, fruits à coque',
  pricingNote: 'Prix en D.A — service compris',
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
      name: 'Plats Traditionnels',
      items: [
        { name: 'Couscous au poulet', price: '800', description: 'Semoule, poulet fermier, légumes de saison', tag: 'Best Seller', imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80' },
        { name: "Couscous à l'agneau", price: '1200', description: 'Agneau fondant, pois chiches, bouillon parfumé', tag: 'Signature', imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80' },
        { name: 'Tajine poulet citron & olives', price: '900', description: 'Poulet confit, citron confit, olives vertes', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80' },
        { name: 'Rechta algéroise', price: '700', description: 'Pâtes fraîches, poulet, pois chiches, cannelle', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=800&q=80' },
        { name: 'Tchekhtchoukha', price: '600', description: 'Pain déchiré, sauce tomate relevée, poivrons', imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80' },
      ],
    },
    {
      name: 'Entrées',
      items: [
        { name: 'Chorba frik', price: '250', description: 'Soupe au blé vert, tomate, coriandre', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' },
        { name: 'Harira', price: '250', description: 'Soupe algéroise aux herbes et légumes', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80' },
        { name: 'Boureks (3 pcs)', price: '300', description: 'Feuilletés croustillants à la viande', imageUrl: 'https://images.unsplash.com/photo-1633321702518-7feccafb94d5?w=800&q=80' },
        { name: 'Mhadjeb', price: '150', description: 'Crêpe feuilletée farcie à l’oignon et tomate', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80' },
        { name: 'Salade mechouia', price: '200', description: 'Poivrons grillés, tomates, ail, huile d’olive', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' },
      ],
    },
    {
      name: 'Grillades',
      addons: [
        { name: 'Frites', price: '150' },
        { name: 'Sauce maison', price: '50' },
        { name: 'Salade verte', price: '200' },
        { name: 'Boisson gazeuse', price: '100' },
      ],
      items: [
        { name: "Brochettes d'agneau", price: '1000', description: 'Brochettes marinées, servies avec pain', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' },
        { name: 'Merguez grillées', price: '500', description: 'Merguez maison, harissa douce', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' },
        { name: 'Poulet grillé', price: '850', description: 'Poulet entier mariné, frites maison', imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80' },
        { name: 'Entrecôte grillée', price: '2000', description: 'Entrecôte charnue, sauce au poivre', imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80' },
        { name: 'Kefta maison', price: '700', description: 'Boulettes de bœuf épicées, sauce tomate', imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80' },
      ],
    },
    {
      name: 'Sandwichs & Pizzas',
      items: [
        { name: 'Burger maison', price: '600', description: 'Steak haché, cheddar, sauce algérienne', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
        { name: 'Sandwich merguez-frites', price: '400', description: 'Merguez, frites, sauce maison', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80' },
        { name: 'Pizza margherita', price: '700', description: 'Tomate, mozzarella, basilic', imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&q=80' },
        { name: 'Calzone', price: '900', description: 'Pizza fourrée, jambon et fromage', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80' },
        { name: 'Wrap au poulet', price: '500', description: 'Poulet grillé, crudités, sauce blanche', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80' },
      ],
    },
    {
      name: 'Desserts & Boissons',
      items: [
        { name: 'Baklawa', price: '300', description: 'Feuilleté aux amandes, miel', imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=800&q=80' },
        { name: 'Makrout', price: '250', description: 'Semoule, dattes, miel', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80' },
        { name: 'Crêpes au miel', price: '350', description: 'Crêpe chaude, miel, beurre', imageUrl: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=800&q=80' },
        { name: 'Thé à la menthe', price: '150', description: 'Thé vert, menthe fraîche', imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&q=80' },
        { name: "Jus d'orange pressé", price: '300', description: 'Orange fraîche pressée', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80' },
      ],
    },
  ],
}
