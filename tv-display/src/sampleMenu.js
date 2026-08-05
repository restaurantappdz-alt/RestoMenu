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
  categories: [
    {
      name: 'Plats Traditionnels',
      items: [
        { name: 'Couscous au poulet', price: '800', description: 'Semoule, poulet fermier, légumes de saison', tag: 'Best Seller' },
        { name: "Couscous à l'agneau", price: '1200', description: 'Agneau fondant, pois chiches, bouillon parfumé', tag: 'Signature' },
        { name: 'Tajine poulet citron & olives', price: '900', description: 'Poulet confit, citron confit, olives vertes' },
        { name: 'Rechta algéroise', price: '700', description: 'Pâtes fraîches, poulet, pois chiches, cannelle' },
        { name: 'Tchekhtchoukha', price: '600', description: 'Pain déchiré, sauce tomate relevée, poivrons' },
      ],
    },
    {
      name: 'Entrées',
      items: [
        { name: 'Chorba frik', price: '250', description: 'Soupe au blé vert, tomate, coriandre' },
        { name: 'Harira', price: '250', description: 'Soupe algéroise aux herbes et légumes' },
        { name: 'Boureks (3 pcs)', price: '300', description: 'Feuilletés croustillants à la viande' },
        { name: 'Mhadjeb', price: '150', description: 'Crêpe feuilletée farcie à l’oignon et tomate' },
        { name: 'Salade mechouia', price: '200', description: 'Poivrons grillés, tomates, ail, huile d’olive' },
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
        { name: "Brochettes d'agneau", price: '1000', description: 'Brochettes marinées, servies avec pain' },
        { name: 'Merguez grillées', price: '500', description: 'Merguez maison, harissa douce' },
        { name: 'Poulet grillé', price: '850', description: 'Poulet entier mariné, frites maison' },
        { name: 'Entrecôte grillée', price: '2000', description: 'Entrecôte charnue, sauce au poivre' },
        { name: 'Kefta maison', price: '700', description: 'Boulettes de bœuf épicées, sauce tomate' },
      ],
    },
    {
      name: 'Sandwichs & Pizzas',
      items: [
        { name: 'Burger maison', price: '600', description: 'Steak haché, cheddar, sauce algérienne' },
        { name: 'Sandwich merguez-frites', price: '400', description: 'Merguez, frites, sauce maison' },
        { name: 'Pizza margherita', price: '700', description: 'Tomate, mozzarella, basilic' },
        { name: 'Calzone', price: '900', description: 'Pizza fourrée, jambon et fromage' },
        { name: 'Wrap au poulet', price: '500', description: 'Poulet grillé, crudités, sauce blanche' },
      ],
    },
    {
      name: 'Desserts & Boissons',
      items: [
        { name: 'Baklawa', price: '300', description: 'Feuilleté aux amandes, miel' },
        { name: 'Makrout', price: '250', description: 'Semoule, dattes, miel' },
        { name: 'Crêpes au miel', price: '350', description: 'Crêpe chaude, miel, beurre' },
        { name: 'Thé à la menthe', price: '150', description: 'Thé vert, menthe fraîche' },
        { name: "Jus d'orange pressé", price: '300', description: 'Orange fraîche pressée' },
      ],
    },
  ],
}
