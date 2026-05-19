import type { Square } from '@/types/board';
import { THEME } from './theme';

export const BOARD: Square[] = [
  // 0 — GO
  { index: 0, type: 'go', name: 'Получка', salary: THEME.goSalary },

  // 1-4 — Коричневая группа (Офис)
  {
    index: 1, type: 'property', name: 'Кабинет начальства',
    color: 'brown', price: 600, mortgageValue: 300, houseCost: 500,
    rent: [60, 200, 600, 1400, 1700, 2500],
  },
  { index: 2, type: 'tax', name: 'Штраф', amount: 200 },
  { index: 3, type: 'railroad', name: 'Lexus ES250', price: 2000, mortgageValue: 1000 },
  {
    index: 4, type: 'property', name: 'Туалет',
    color: 'brown', price: 600, mortgageValue: 300, houseCost: 500,
    rent: [60, 200, 600, 1400, 1700, 2500],
  },

  // 5-9 — Голубая группа (Добрый путь)
  { index: 5, type: 'chance', name: THEME.chanceName },
  {
    index: 6, type: 'property', name: 'Курилка',
    color: 'cyan', price: 1000, mortgageValue: 500, houseCost: 500,
    rent: [60, 300, 900, 2500, 3000, 4500],
  },
  {
    index: 7, type: 'property', name: 'Парковка',
    color: 'cyan', price: 1000, mortgageValue: 500, houseCost: 500,
    rent: [60, 300, 900, 2500, 3000, 4500],
  },
  { index: 8, type: 'utility', name: 'Усадьба', price: 1500, mortgageValue: 750 },
  {
    index: 9, type: 'property', name: 'ВИП кабинки',
    color: 'cyan', price: 1200, mortgageValue: 600, houseCost: 500,
    rent: [80, 400, 1000, 3000, 3600, 5000],
  },

  // 10 — Тюрьма
  { index: 10, type: 'jail', name: THEME.jailName },

  // 11-15 — Розовая группа (Бишкуль)
  {
    index: 11, type: 'property', name: 'Часы',
    color: 'pink', price: 1400, mortgageValue: 700, houseCost: 1000,
    rent: [100, 500, 1500, 4500, 6000, 7500],
  },
  { index: 12, type: 'utility', name: 'Mont Blanc', price: 1500, mortgageValue: 750 },
  {
    index: 13, type: 'property', name: 'Сантабарбара',
    color: 'pink', price: 1400, mortgageValue: 700, houseCost: 1000,
    rent: [100, 500, 1500, 4500, 6000, 7500],
  },
  { index: 14, type: 'chance', name: THEME.chanceName },
  {
    index: 15, type: 'property', name: 'Горка',
    color: 'pink', price: 1600, mortgageValue: 800, houseCost: 1000,
    rent: [120, 600, 1800, 5000, 7000, 9000],
  },

  // 16-19 — Оранжевая группа (Достык)
  { index: 16, type: 'railroad', name: 'Changan Uni-v', price: 2000, mortgageValue: 1000 },
  {
    index: 17, type: 'property', name: 'Кинотеатр',
    color: 'orange', price: 1800, mortgageValue: 900, houseCost: 1000,
    rent: [140, 700, 2000, 5500, 7500, 9500],
  },
  { index: 18, type: 'tax', name: 'Корпоратив', amount: 1000 },
  {
    index: 19, type: 'property', name: 'Aimer',
    color: 'orange', price: 1800, mortgageValue: 900, houseCost: 1000,
    rent: [140, 700, 2000, 5500, 7500, 9500],
  },

  // 20 — Free Parking
  { index: 20, type: 'free_parking', name: THEME.freeParkingName },

  // 21-24 — Красная группа (Бензострой)
  {
    index: 21, type: 'property', name: 'Двухэтажки',
    color: 'red', price: 2200, mortgageValue: 1100, houseCost: 1500,
    rent: [180, 900, 2500, 7000, 8750, 10500],
  },
  { index: 22, type: 'community_chest', name: THEME.communityChestName },
  {
    index: 23, type: 'property', name: 'Стекляшка',
    color: 'red', price: 2200, mortgageValue: 1100, houseCost: 1500,
    rent: [180, 900, 2500, 7000, 8750, 10500],
  },
  {
    index: 24, type: 'property', name: 'Северный',
    color: 'red', price: 2400, mortgageValue: 1200, houseCost: 1500,
    rent: [200, 1000, 3000, 7500, 9250, 11000],
  },

  // 25-29 — Жёлтая группа (Гиппо)
  { index: 25, type: 'railroad', name: 'Mercedes-Benz E350', price: 2000, mortgageValue: 1000 },
  {
    index: 26, type: 'property', name: 'Евразийский',
    color: 'yellow', price: 2600, mortgageValue: 1300, houseCost: 1500,
    rent: [220, 1100, 3300, 8000, 9750, 11500],
  },
  {
    index: 27, type: 'property', name: 'Фудкорт',
    color: 'orange', price: 2000, mortgageValue: 1000, houseCost: 1000,
    rent: [160, 800, 2200, 6000, 8000, 10000],
  },
  {
    index: 28, type: 'property', name: 'Мебельвиль',
    color: 'yellow', price: 2600, mortgageValue: 1300, houseCost: 1500,
    rent: [220, 1100, 3300, 8000, 9750, 11500],
  },
  {
    index: 29, type: 'property', name: 'Сокол',
    color: 'yellow', price: 2800, mortgageValue: 1400, houseCost: 1500,
    rent: [240, 1200, 3600, 8500, 10250, 12000],
  },

  // 30 — Иди в тюрьму
  { index: 30, type: 'go_to_jail', name: THEME.goToJailName },

  // 31-34 — Зелёная группа (Ленина)
  {
    index: 31, type: 'property', name: 'Стелла',
    color: 'green', price: 3000, mortgageValue: 1500, houseCost: 2000,
    rent: [260, 1300, 3900, 9000, 11000, 12750],
  },
  {
    index: 32, type: 'property', name: 'Старый парк',
    color: 'green', price: 3000, mortgageValue: 1500, houseCost: 2000,
    rent: [260, 1300, 3900, 9000, 11000, 12750],
  },
  { index: 33, type: 'community_chest', name: THEME.communityChestName },
  {
    index: 34, type: 'property', name: 'Фонтан',
    color: 'green', price: 3200, mortgageValue: 1600, houseCost: 2000,
    rent: [280, 1500, 4500, 10000, 12000, 14000],
  },

  // 35-39 — Тёмно-синяя группа (НИШ)
  { index: 35, type: 'railroad', name: 'Toyota Camry', price: 2000, mortgageValue: 1000 },
  { index: 36, type: 'chance', name: THEME.chanceName },
  {
    index: 37, type: 'property', name: 'Столовая',
    color: 'blue', price: 3500, mortgageValue: 1750, houseCost: 2000,
    rent: [350, 1750, 5000, 11000, 13000, 15000],
  },
  { index: 38, type: 'community_chest', name: THEME.communityChestName },
  {
    index: 39, type: 'property', name: 'Библиотека',
    color: 'blue', price: 4000, mortgageValue: 2000, houseCost: 2000,
    rent: [500, 2000, 6000, 14000, 17000, 20000],
  },
];

export const COLOR_GROUPS: Record<string, number[]> = {
  brown: [1, 4],
  cyan: [6, 7, 9],
  pink: [11, 13, 15],
  orange: [17, 19, 27],
  red: [21, 23, 24],
  yellow: [26, 28, 29],
  green: [31, 32, 34],
  blue: [37, 39],
};

export const RAILROADS = [3, 16, 25, 35];
export const UTILITIES = [8, 12];
