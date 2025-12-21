import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuctionItem {
  id: number;
  title: string;
  image: string;
  currentPrice: number;
  totalBids: number;
  timeLeft: number;
  category: string;
  retail: number;
}

const categories = [
  'Все категории',
  'Электроника',
  'Часы',
  'Компьютеры',
  'Бытовая техника',
  'Смартфоны',
  'Аксессуары'
];

const mockAuctions: AuctionItem[] = [
  {
    id: 1,
    title: 'Беспроводные наушники премиум класса',
    image: 'https://cdn.poehali.dev/projects/45407f2b-b3a8-410c-bb1b-6b389a904c86/files/28d1a6c2-804f-4fa9-ac16-bb22448e11b3.jpg',
    currentPrice: 2500,
    totalBids: 48,
    timeLeft: 8,
    category: 'Электроника',
    retail: 89900
  },
  {
    id: 2,
    title: 'Роскошные часы с металлическим браслетом',
    image: 'https://cdn.poehali.dev/projects/45407f2b-b3a8-410c-bb1b-6b389a904c86/files/c71ccf7a-a341-45f4-bba8-c309da382321.jpg',
    currentPrice: 4200,
    totalBids: 82,
    timeLeft: 5,
    category: 'Часы',
    retail: 149900
  },
  {
    id: 3,
    title: 'Современный ноутбук для работы',
    image: 'https://cdn.poehali.dev/projects/45407f2b-b3a8-410c-bb1b-6b389a904c86/files/612e29a9-eadd-49f0-b57d-8ed6856fbb7a.jpg',
    currentPrice: 6750,
    totalBids: 134,
    timeLeft: 3,
    category: 'Компьютеры',
    retail: 299900
  }
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('Все категории');
  const [balance, setBalance] = useState(5000);
  const [auctions, setAuctions] = useState(mockAuctions);

  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions(prev => prev.map(auction => ({
        ...auction,
        timeLeft: auction.timeLeft > 0 ? auction.timeLeft - 1 : 10
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    return `00:${seconds.toString().padStart(2, '0')}`;
  };

  const placeBid = (auctionId: number) => {
    if (balance < 50) return;
    
    setBalance(prev => prev - 50);
    setAuctions(prev => prev.map(auction => 
      auction.id === auctionId 
        ? { ...auction, currentPrice: auction.currentPrice + 50, totalBids: auction.totalBids + 1, timeLeft: 10 }
        : auction
    ));
  };

  const filteredAuctions = selectedCategory === 'Все категории' 
    ? auctions 
    : auctions.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-primary">Auktion Flow</h1>
            <nav className="hidden md:flex gap-6">
              <Button variant="ghost" className="text-foreground">Аукционы</Button>
              <Button variant="ghost" className="text-foreground">Категории</Button>
              <Button variant="ghost" className="text-foreground">Как это работает</Button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Icon name="Wallet" size={18} />
                  <span className="hidden sm:inline">{balance.toLocaleString()} ₸</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Электронный кошелек</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="rounded-lg bg-primary/10 p-6 text-center">
                    <p className="text-sm text-muted-foreground">Текущий баланс</p>
                    <p className="text-4xl font-bold text-primary mt-2">{balance.toLocaleString()} ₸</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Пополнить кошелек
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Каждая ставка = 50 ₸
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">История транзакций</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 rounded bg-muted">
                        <span>Ставка на аукцион #1</span>
                        <span className="text-destructive">-50 ₸</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-muted">
                        <span>Пополнение</span>
                        <span className="text-success">+5000 ₸</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icon name="User" size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Личный кабинет</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Icon name="User" size={32} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Пользователь</p>
                      <Badge variant="secondary">Hero</Badge>
                    </div>
                  </div>

                  <Tabs defaultValue="bids">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="bids">Ставки</TabsTrigger>
                      <TabsTrigger value="wins">Победы</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bids" className="space-y-2 mt-4">
                      <div className="p-3 rounded-lg border">
                        <p className="font-medium text-sm">Беспроводные наушники</p>
                        <p className="text-xs text-muted-foreground">Ставок: 12</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="wins" className="space-y-2 mt-4">
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Пока нет побед
                      </p>
                    </TabsContent>
                  </Tabs>

                  <div className="pt-4 border-t space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Icon name="Settings" size={18} />
                      Настройки
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Icon name="HelpCircle" size={18} />
                      Поддержка
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-4 animate-fade-in">
            <h2 className="text-5xl font-bold">Выиграйте товары мечты</h2>
            <p className="text-lg text-muted-foreground">
              Участвуйте в аукционах и получайте премиальные товары по минимальной цене
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">50 ₸</p>
                <p className="text-sm text-muted-foreground">За ставку</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">24 часа</p>
                <p className="text-sm text-muted-foreground">Buy It Now</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">Возврат средств</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 container">
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow animate-scale-in">
              <div className="relative aspect-square bg-muted">
                <img 
                  src={auction.image} 
                  alt={auction.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 right-4">{auction.category}</Badge>
              </div>
              
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">{auction.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Розница: {auction.retail.toLocaleString()} ₸
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Текущая цена</p>
                      <p className="text-2xl font-bold text-primary">{auction.currentPrice.toLocaleString()} ₸</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Ставок</p>
                      <p className="text-xl font-semibold">{auction.totalBids}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <Icon name="Clock" size={18} className="text-primary animate-pulse-slow" />
                      <span className="font-mono font-semibold">{formatTime(auction.timeLeft)}</span>
                    </div>
                    <Button 
                      onClick={() => placeBid(auction.id)}
                      disabled={balance < 50}
                      className="gap-2"
                    >
                      <Icon name="Gavel" size={18} />
                      Сделать ставку
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Icon name="Wallet" size={28} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Пополните кошелек</h3>
                <p className="text-muted-foreground">
                  Добавьте средства через CloudPayments и начните участвовать
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Icon name="Gavel" size={28} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Делайте ставки</h3>
                <p className="text-muted-foreground">
                  Каждая ставка 50 ₸, таймер сбрасывается до 10 секунд
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Icon name="Trophy" size={28} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Выиграйте товар</h3>
                <p className="text-muted-foreground">
                  Последний участник забирает товар, остальным возвращаются средства
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Auktion Flow</h3>
              <p className="text-sm text-muted-foreground">
                Онлайн-аукционная платформа для Казахстана
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Компания</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>О нас</p>
                <p>Как это работает</p>
                <p>Блог</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Поддержка</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>FAQ</p>
                <p>Доставка</p>
                <p>Возвраты</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Контакты</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>support@auktion.kz</p>
                <p>+7 (777) 123-45-67</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 Auktion Flow. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
