-- Insert default categories
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES
('Электроника', 'electronics', NULL, 1),
('Смартфоны', 'smartphones', 1, 1),
('Ноутбуки', 'laptops', 1, 2),
('Телевизоры', 'tvs', 1, 3),
('Аудио', 'audio', 1, 4),
('Фото и видео', 'photo-video', 1, 5),

('Бытовая техника', 'appliances', NULL, 2),
('Крупная техника', 'large-appliances', 7, 1),
('Мелкая техника', 'small-appliances', 7, 2),
('Климатическая техника', 'climate', 7, 3),

('Мода и аксессуары', 'fashion', NULL, 3),
('Одежда', 'clothing', 11, 1),
('Обувь', 'shoes', 11, 2),
('Аксессуары', 'accessories', 11, 3),

('Красота и здоровье', 'beauty-health', NULL, 4),
('Косметика', 'cosmetics', 15, 1),
('Парфюмерия', 'perfume', 15, 2),
('Здоровье', 'health', 15, 3),

('Дом и сад', 'home-garden', NULL, 5),
('Мебель', 'furniture', 19, 1),
('Декор', 'decor', 19, 2),
('Инструменты', 'tools', 19, 3),

('Спорт и отдых', 'sports', NULL, 6),
('Спортивное оборудование', 'sports-equipment', 23, 1),
('Туризм', 'tourism', 23, 2),

('Игры и хобби', 'games-hobbies', NULL, 7),
('Видеоигры', 'videogames', 26, 1),
('Настольные игры', 'board-games', 26, 2),

('Авто и мото', 'auto-moto', NULL, 8),
('Автомобили', 'cars', 29, 1),
('Мотоциклы', 'motorcycles', 29, 2),
('Автоаксессуары', 'auto-accessories', 29, 3),

('Ювелирные изделия', 'jewelry', NULL, 9),
('Часы', 'watches', NULL, 10);

-- Insert default loyalty badges
INSERT INTO badges (name, description, icon_url, requirement_type, requirement_value) VALUES
('Новичок', 'Первая регистрация', NULL, 'registration', 1),
('Первая ставка', 'Сделал первую ставку', NULL, 'bid', 1),
('Первая победа', 'Выиграл первый аукцион', NULL, 'win', 1),
('Активный участник', '100 ставок', NULL, 'bid', 100),
('Коллекционер', '10 побед', NULL, 'win', 10),
('Миллионер', 'Пополнил на 1,000,000₸', NULL, 'deposit', 1000000),
('Hero', 'Базовый уровень лояльности', NULL, 'loyalty', 0),
('Noble', 'Уровень Noble', NULL, 'loyalty', 50000),
('Monarch', 'Уровень Monarch', NULL, 'loyalty', 150000);

-- Insert demo supplier
INSERT INTO suppliers (name, description, logo_url, rating) VALUES
('Официальный магазин Apple', 'Сертифицированный продавец техники Apple', NULL, 4.95),
('Samsung Store KZ', 'Официальный дилер Samsung в Казахстане', NULL, 4.87),
('Sulpak', 'Крупнейшая сеть электроники в Казахстане', NULL, 4.72);
