import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface AuctionItem {
  id: number;
  title: string;
  image: string;
  currentPrice: number;
  totalBids: number;
  timeLeft: number;
  category: string;
  retail: number;
  minPrice: number;
  startTime: Date;
}

const categories = [
  'Все категории',
  'Электроника',
  'Часы',
  'Компьютеры',
  'Бытовая техника',
  'Смартфоны',
  'Телевизоры',
  'Игровые приставки'
];

const loyaltyLevels = [
  { name: 'Hero', minDeposit: 0, color: 'bg-muted', benefits: ['Доступ к базовым аукционам', 'Email поддержка'] },
  { name: 'Noble', minDeposit: 50000, color: 'bg-primary/20', benefits: ['Закрытые аукционы', 'Ежедневные бонусы 100₸', 'Приоритетная поддержка'] },
  { name: 'Monarch', minDeposit: 150000, color: 'bg-accent/20', benefits: ['Эксклюзивные аукционы', 'Ежедневные бонусы 300₸', 'Персональный менеджер', 'Бесплатная доставка'] }
];

const mockAuctions: AuctionItem[] = [
  {
    id: 1,
    title: 'Apple AirPods Pro 2-го поколения',
    image: 'https://cdn.poehali.dev/projects/45407f2b-b3a8-410c-bb1b-6b389a904c86/files/28d1a6c2-804f-4fa9-ac16-bb22448e11b3.jpg',
    currentPrice: 2500,
    totalBids: 48,
    timeLeft: 8,
    category: 'Электроника',
    retail: 129900,
    minPrice: 1000,
    startTime: new Date()
  },
  {
    id: 2,
    title: 'Смарт-часы Samsung Galaxy Watch 6',
    image: 'https://cdn.poehali.dev/projects/45407f2b-b3a8-410c-bb1b-6b389a904c86/files/c71ccf7a-a341-45f4-bba8-c309da382321.jpg',
    currentPrice: 4200,
    totalBids: 82,
    timeLeft: 5,
    category: 'Часы',
    retail: 179900,
    minPrice: 1000,
    startTime: new Date()
  },
  {
    id: 3,
    title: 'Ноутбук ASUS TUF Gaming F15',
    image: 'https://cdn.poehali.dev/projects/45407f2b-b3a8-410c-bb1b-6b389a904c86/files/612e29a9-eadd-49f0-b57d-8ed6856fbb7a.jpg',
    currentPrice: 6750,
    totalBids: 134,
    timeLeft: 3,
    category: 'Компьютеры',
    retail: 399900,
    minPrice: 1000,
    startTime: new Date()
  }
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('Все категории');
  const [balance, setBalance] = useState(5000);
  const [totalDeposit, setTotalDeposit] = useState(5000);
  const [auctions, setAuctions] = useState(mockAuctions);
  const [userBids, setUserBids] = useState<{ [key: number]: number }>({});

  const currentLevel = loyaltyLevels
    .slice()
    .reverse()
    .find(level => totalDeposit >= level.minDeposit) || loyaltyLevels[0];

  const nextLevel = loyaltyLevels.find(level => level.minDeposit > totalDeposit);

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
    
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return;

    if (auction.currentPrice >= auction.minPrice) {
      const hasEarlyBid = userBids[auctionId] && auction.currentPrice < auction.minPrice;
      if (!hasEarlyBid && Object.keys(userBids).length === 0) {
        return;
      }
    }
    
    setBalance(prev => prev - 50);
    setUserBids(prev => ({ ...prev, [auctionId]: (prev[auctionId] || 0) + 50 }));
    setAuctions(prev => prev.map(auc => 
      auc.id === auctionId 
        ? { ...auc, currentPrice: auc.currentPrice + 50, totalBids: auc.totalBids + 1, timeLeft: 10 }
        : auc
    ));
  };

  const topUpWallet = (amount: number) => {
    setBalance(prev => prev + amount);
    setTotalDeposit(prev => prev + amount);
  };

  const filteredAuctions = selectedCategory === 'Все категории' 
    ? auctions 
    : auctions.filter(a => a.category === selectedCategory);

  const calculateDiscount = (current: number, retail: number) => {
    return Math.round((1 - current / retail) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Icon name="Gavel" size={22} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Auktion Flow
              </h1>
            </div>
            <nav className="hidden md:flex gap-6">
              <Button variant="ghost" className="text-foreground hover:text-primary">Аукционы</Button>
              <Button variant="ghost" className="text-foreground hover:text-primary">Категории</Button>
              <Button variant="ghost" className="text-foreground hover:text-primary">Правила</Button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                  <Icon name="Wallet" size={18} />
                  <span className="hidden sm:inline font-semibold">{balance.toLocaleString()} ₸</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Icon name="Wallet" size={24} className="text-primary" />
                    Электронный кошелек
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center border border-primary/20">
                    <p className="text-sm text-muted-foreground">Текущий баланс</p>
                    <p className="text-5xl font-bold text-primary mt-2">{balance.toLocaleString()} ₸</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Всего пополнено: {totalDeposit.toLocaleString()} ₸
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Быстрое пополнение</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[1000, 5000, 10000].map(amount => (
                        <Button
                          key={amount}
                          variant="outline"
                          onClick={() => topUpWallet(amount)}
                          className="h-16 flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5"
                        >
                          <span className="text-lg font-bold">+{amount}</span>
                          <span className="text-xs text-muted-foreground">₸</span>
                        </Button>
                      ))}
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                      <Icon name="CreditCard" size={18} className="mr-2" />
                      Пополнить через CloudPayments
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Каждая ставка = 50 ₸ • Возврат средств при проигрыше
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">История транзакций</h3>
                      <Badge variant="secondary">3 записи</Badge>
                    </div>
                    <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                        <div>
                          <p className="font-medium">Ставка на аукцион #1</p>
                          <p className="text-xs text-muted-foreground">23 дек, 14:32</p>
                        </div>
                        <span className="font-semibold text-destructive">-50 ₸</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                        <div>
                          <p className="font-medium">Возврат средств</p>
                          <p className="text-xs text-muted-foreground">23 дек, 12:15</p>
                        </div>
                        <span className="font-semibold text-success">+350 ₸</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                        <div>
                          <p className="font-medium">Пополнение</p>
                          <p className="text-xs text-muted-foreground">23 дек, 10:00</p>
                        </div>
                        <span className="font-semibold text-success">+5000 ₸</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Icon name="User" size={20} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">
                      {currentLevel.name.charAt(0)}
                    </span>
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Icon name="User" size={24} className="text-primary" />
                    Личный кабинет
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30">
                      <Icon name="User" size={36} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">Пользователь</p>
                      <Badge className={`${currentLevel.color} border-0 mt-1`}>
                        {currentLevel.name}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Всего пополнено: {totalDeposit.toLocaleString()} ₸
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Программа лояльности</p>
                      {nextLevel && (
                        <Badge variant="outline" className="text-xs">
                          До {nextLevel.name}: {(nextLevel.minDeposit - totalDeposit).toLocaleString()} ₸
                        </Badge>
                      )}
                    </div>
                    {nextLevel && (
                      <div>
                        <Progress 
                          value={(totalDeposit / nextLevel.minDeposit) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          {Math.round((totalDeposit / nextLevel.minDeposit) * 100)}% до следующего уровня
                        </p>
                      </div>
                    )}
                    <div className="pt-2 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Ваши привилегии</p>
                      {currentLevel.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Icon name="Check" size={14} className="text-success mt-0.5" />
                          <p className="text-xs">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Tabs defaultValue="bids" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="bids">Мои ставки</TabsTrigger>
                      <TabsTrigger value="wins">Победы</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bids" className="space-y-2 mt-4">
                      {Object.entries(userBids).length > 0 ? (
                        Object.entries(userBids).map(([auctionId, amount]) => {
                          const auction = auctions.find(a => a.id === Number(auctionId));
                          return (
                            <div key={auctionId} className="p-3 rounded-lg border bg-card">
                              <p className="font-medium text-sm">{auction?.title || 'Аукцион'}</p>
                              <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-muted-foreground">Потрачено: {amount} ₸</p>
                                <Badge variant="secondary" className="text-xs">Активно</Badge>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <Icon name="TrendingUp" size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Вы еще не делали ставок
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="wins" className="space-y-2 mt-4">
                      <div className="text-center py-8">
                        <Icon name="Trophy" size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Пока нет побед
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Начните участвовать в аукционах!
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="pt-4 border-t space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2 hover:bg-primary/5">
                      <Icon name="Settings" size={18} />
                      Настройки аккаунта
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 hover:bg-primary/5">
                      <Icon name="Package" size={18} />
                      Мои заказы
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 hover:bg-primary/5">
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

      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
              <Icon name="Sparkles" size={16} />
              Аукционная платформа №1 в Казахстане
            </div>
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Выиграйте товары<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                мечты за копейки
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Участвуйте в аукционах и получайте премиальные товары по минимальной цене. 
              Честная система с возвратом средств и гарантией доставки.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-6">
              <div className="text-center px-6 py-4 rounded-xl bg-card border border-primary/10">
                <p className="text-4xl font-bold text-primary">50 ₸</p>
                <p className="text-sm text-muted-foreground mt-1">За одну ставку</p>
              </div>
              <div className="text-center px-6 py-4 rounded-xl bg-card border border-primary/10">
                <p className="text-4xl font-bold text-accent">24 ч</p>
                <p className="text-sm text-muted-foreground mt-1">Buy It Now</p>
              </div>
              <div className="text-center px-6 py-4 rounded-xl bg-card border border-primary/10">
                <p className="text-4xl font-bold text-success">100%</p>
                <p className="text-sm text-muted-foreground mt-1">Возврат средств</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 shadow-lg">
                <Icon name="Rocket" size={20} />
                Начать участие
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Icon name="PlayCircle" size={20} />
                Как это работает
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 container">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold">Активные аукционы</h3>
          <Badge variant="secondary" className="gap-1">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            {filteredAuctions.length} лотов
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => {
            const discount = calculateDiscount(auction.currentPrice, auction.retail);
            const isLocked = auction.currentPrice >= auction.minPrice && !userBids[auction.id];
            
            return (
              <Card key={auction.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-scale-in group border-2 hover:border-primary/30">
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <img 
                    src={auction.image} 
                    alt={auction.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 right-4 bg-card/90 backdrop-blur text-foreground border-0 shadow-md">
                    {auction.category}
                  </Badge>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-accent text-white border-0 shadow-md">
                      -{discount}%
                    </Badge>
                  </div>
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="text-center text-white p-4">
                        <Icon name="Lock" size={32} className="mx-auto mb-2" />
                        <p className="text-sm font-semibold">No Jumper</p>
                        <p className="text-xs opacity-90">Лимит {auction.minPrice}₸ достигнут</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2 min-h-[56px]">{auction.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-sm text-muted-foreground line-through">
                        {auction.retail.toLocaleString()} ₸
                      </p>
                      <Badge variant="outline" className="text-xs border-success text-success">
                        Экономия {(auction.retail - auction.currentPrice).toLocaleString()} ₸
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Текущая цена</p>
                        <p className="text-3xl font-bold text-primary">{auction.currentPrice.toLocaleString()} ₸</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Всего ставок</p>
                        <p className="text-2xl font-semibold">{auction.totalBids}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-muted to-muted/50 border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="Clock" size={20} className="text-primary animate-pulse-slow" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Осталось</p>
                          <p className="font-mono font-bold text-xl">{formatTime(auction.timeLeft)}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => placeBid(auction.id)}
                        disabled={balance < 50 || isLocked}
                        className="gap-2 bg-primary hover:bg-primary/90 shadow-md"
                        size="lg"
                      >
                        <Icon name="Gavel" size={18} />
                        {isLocked ? 'Закрыто' : '50 ₸'}
                      </Button>
                    </div>

                    {userBids[auction.id] && (
                      <div className="text-center p-2 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-xs text-primary font-medium">
                          Вы в игре! Потрачено: {userBids[auction.id]} ₸
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-gradient-to-br from-muted/50 to-muted/30 py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-3">Как это работает</h2>
              <p className="text-muted-foreground">Простая и честная система аукционов</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto border border-primary/20 group-hover:scale-110 transition-transform">
                  <Icon name="Wallet" size={32} className="text-primary" />
                </div>
                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center mx-auto text-lg">1</div>
                <h3 className="font-bold text-xl">Пополните кошелек</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Добавьте средства через CloudPayments любым удобным способом. Поддержка карт, Google Pay и Apple Pay.
                </p>
              </div>
              
              <div className="text-center space-y-4 group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto border border-primary/20 group-hover:scale-110 transition-transform">
                  <Icon name="Gavel" size={32} className="text-primary" />
                </div>
                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center mx-auto text-lg">2</div>
                <h3 className="font-bold text-xl">Делайте ставки</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Каждая ставка стоит 50 ₸ и увеличивает цену товара. Таймер сбрасывается до 10 секунд при каждой новой ставке.
                </p>
              </div>
              
              <div className="text-center space-y-4 group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mx-auto border border-accent/20 group-hover:scale-110 transition-transform">
                  <Icon name="Trophy" size={32} className="text-accent" />
                </div>
                <div className="w-10 h-10 rounded-full bg-accent text-white font-bold flex items-center justify-center mx-auto text-lg">3</div>
                <h3 className="font-bold text-xl">Выиграйте товар</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Последний участник забирает товар по текущей цене. Остальным автоматически возвращаются потраченные средства.
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-card border-2 border-primary/20">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Shield" size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">No Jumper защита</h4>
                    <p className="text-sm text-muted-foreground">
                      При достижении 1000₸ только ранние участники могут продолжать делать ставки
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="RotateCcw" size={20} className="text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">100% возврат средств</h4>
                    <p className="text-sm text-muted-foreground">
                      Если вы не выиграли, все потраченные деньги вернутся на ваш кошелек
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Clock" size={20} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">24 часа Buy It Now</h4>
                    <p className="text-sm text-muted-foreground">
                      Победитель может выкупить товар в течение суток по финальной цене
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Truck" size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Доставка по РК</h4>
                    <p className="text-sm text-muted-foreground">
                      Быстрая доставка по всему Казахстану с трекингом и возможностью возврата
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 container">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3">Программа лояльности</h2>
            <p className="text-muted-foreground">Больше участвуете — больше привилегий</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {loyaltyLevels.map((level, index) => (
              <Card key={level.name} className={`p-6 space-y-4 ${currentLevel.name === level.name ? 'border-2 border-primary shadow-lg' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{level.name}</h3>
                  {currentLevel.name === level.name && (
                    <Badge className="bg-primary">Текущий</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  От {level.minDeposit.toLocaleString()} ₸ пополнений
                </p>
                <div className="space-y-2">
                  {level.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{benefit}</p>
                    </div>
                  ))}
                </div>
                {index < loyaltyLevels.length - 1 && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={totalDeposit >= loyaltyLevels[index + 1].minDeposit}
                  >
                    {totalDeposit >= loyaltyLevels[index + 1].minDeposit ? 'Достигнуто' : 'Получить'}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t bg-card py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Icon name="Gavel" size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-lg">Auktion Flow</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Честная аукционная платформа для Казахстана с возвратом средств
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Компания</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-primary cursor-pointer">О нас</p>
                <p className="hover:text-primary cursor-pointer">Правила</p>
                <p className="hover:text-primary cursor-pointer">Блог</p>
                <p className="hover:text-primary cursor-pointer">Вакансии</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Поддержка</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-primary cursor-pointer">FAQ</p>
                <p className="hover:text-primary cursor-pointer">Доставка</p>
                <p className="hover:text-primary cursor-pointer">Возвраты</p>
                <p className="hover:text-primary cursor-pointer">Контакты</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Контакты</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Icon name="Mail" size={14} />
                  support@auktion.kz
                </p>
                <p className="flex items-center gap-2">
                  <Icon name="Phone" size={14} />
                  +7 (777) 123-45-67
                </p>
                <div className="flex gap-2 pt-2">
                  <Button size="icon" variant="outline" className="w-8 h-8">
                    <Icon name="Facebook" size={14} />
                  </Button>
                  <Button size="icon" variant="outline" className="w-8 h-8">
                    <Icon name="Instagram" size={14} />
                  </Button>
                  <Button size="icon" variant="outline" className="w-8 h-8">
                    <Icon name="Twitter" size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 Auktion Flow. Все права защищены. ТОО "Auktion Flow", РК, г. Алматы</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
