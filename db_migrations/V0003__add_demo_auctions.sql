-- Insert demo auctions with real images
INSERT INTO auctions (
    title, description, image_url, category_id, supplier_id,
    retail_price, purchase_price, current_price, bot_threshold, min_price_limit,
    timer_seconds, status, ships_by
) VALUES
(
    'Apple AirPods Pro 2-го поколения',
    'Беспроводные наушники с активным шумоподавлением и пространственным звуком. Водозащита IPX4, до 6 часов работы с ANC.',
    'https://cdn.poehali.dev/projects/45407f2b-b3a8-410c-bb1b-6b389a904c86/files/28d1a6c2-804f-4fa9-ac16-bb22448e11b3.jpg',
    2, 1,
    129900, 85000, 0, 50000, 1000,
    10, 'active', CURRENT_DATE + INTERVAL '7 days'
),
(
    'Смарт-часы Samsung Galaxy Watch 6',
    'Премиальные смарт-часы с мониторингом здоровья, GPS и NFC. Водозащита 5ATM, AMOLED дисплей 1.5", до 40 часов автономности.',
    'https://cdn.poehali.dev/projects/45407f2b-b3a8-410c-bb1b-6b389a904c86/files/c71ccf7a-a341-45f4-bba8-c309da382321.jpg',
    34, 2,
    179900, 120000, 0, 70000, 1000,
    10, 'active', CURRENT_DATE + INTERVAL '5 days'
),
(
    'Ноутбук ASUS TUF Gaming F15',
    'Игровой ноутбук с Intel Core i7, RTX 4060 8GB, 16GB RAM, 512GB SSD. Экран 15.6" 144Hz, подсветка клавиатуры RGB.',
    'https://cdn.poehali.dev/projects/45407f2b-b3a8-410c-bb1b-6b389a904c86/files/612e29a9-eadd-49f0-b57d-8ed6856fbb7a.jpg',
    3, 3,
    399900, 280000, 0, 150000, 1000,
    10, 'active', CURRENT_DATE + INTERVAL '10 days'
);
