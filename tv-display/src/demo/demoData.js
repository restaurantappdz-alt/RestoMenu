// Fixture menu used by the ?demo=1 preview mode (tools/layout-shots).
// Exercises descriptions, tags, addons, and the photo-menu hero fields so
// every layout renders with realistic content.

export const DEMO_MENU = {
  id: 'demo',
  name: 'RestoMenu Demo',
  selectedLayout: 'classic',
  heroImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80',
  heroName: 'Grilled Salmon Bowl',
  heroDescription: 'Fresh salmon, quinoa, avocado and citrus dressing.',
  heroLabel: "Chef's Recommendation",
  heroPrice: 14.9,
  categories: [
    {
      id: 'starters',
      name: 'Starters',
      addons: [
        { id: 'a1', name: 'Extra cheese', price: 1.0 },
        { id: 'a2', name: 'Side salad', price: 2.0 },
      ],
      items: [
        { id: 's1', name: 'Bruschetta', price: 4.5, description: 'Tomato, basil, olive oil on toasted bread.', tag: 'Vegetarian' },
        { id: 's2', name: 'Calamari Fritti', price: 7.9, description: 'Crispy squid rings with garlic aioli.', tag: 'Best Seller' },
        { id: 's3', name: 'Soupe du Jour', price: 4.0, description: 'Daily seasonal soup, served with bread.' },
        { id: 's4', name: 'Carpaccio de Bœuf', price: 9.5, description: 'Thin-sliced beef, parmesan, rocket.' },
        { id: 's5', name: 'Falafel Plate', price: 6.5, description: 'Chickpea falafel, tahini, pickles.', tag: 'Vegetarian' },
        { id: 's6', name: 'Garlic Bread', price: 3.5, description: 'Baked baguette with garlic butter.' },
      ],
    },
    {
      id: 'mains',
      name: 'Main Courses',
      items: [
        { id: 'm1', name: 'Grilled Salmon Bowl', price: 14.9, description: 'Salmon, quinoa, avocado, citrus dressing.', tag: "Chef's Choice" },
        { id: 'm2', name: 'Steak Frites', price: 16.5, description: 'Sirloin steak, hand-cut fries, peppercorn sauce.' },
        { id: 'm3', name: 'Tagine Royal', price: 13.0, description: 'Lamb, prunes, almonds, slow-cooked.', tag: 'Spicy' },
        { id: 'm4', name: 'Margherita Pizza', price: 9.9, description: 'San Marzano tomato, mozzarella, basil.', tag: 'Vegetarian' },
        { id: 'm5', name: 'Chicken Caesar', price: 11.5, description: 'Grilled chicken, romaine, parmesan, croutons.' },
        { id: 'm6', name: 'Pasta Carbonara', price: 12.0, description: 'Guanciale, egg, pecorino, black pepper.' },
        { id: 'm7', name: 'Couscous Royal', price: 13.5, description: 'Semolina, seasonal vegetables, merguez.' },
        { id: 'm8', name: 'Grilled Sea Bass', price: 17.0, description: 'Whole bass, lemon butter, herbs.' },
      ],
    },
    {
      id: 'desserts',
      name: 'Desserts',
      items: [
        { id: 'd1', name: 'Crème Brûlée', price: 5.5, description: 'Vanilla custard, caramelized sugar.' },
        { id: 'd2', name: 'Baklava', price: 4.0, description: 'Layered pastry, pistachio, honey syrup.', tag: 'House Special' },
        { id: 'd3', name: 'Fondant au Chocolat', price: 6.0, description: 'Warm chocolate cake, vanilla ice cream.' },
        { id: 'd4', name: 'Fruit Salad', price: 4.5, description: 'Seasonal fruit, mint, lime.' },
      ],
    },
  ],
}

export const DEMO_CATEGORIES = DEMO_MENU.categories
export const DEMO_ADDONS = DEMO_MENU.categories.map((c) => c.addons || []).flat()
