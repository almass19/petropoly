import type { GameCard } from '@/types/game';

export const THEME = {
  boardName: 'ПетроПолия',
  currency: '₸',
  currencyName: 'тенге',
  startingCash: 15000,
  goSalary: 2000,
  jailName: 'У Начальника',
  goToJailName: 'К Начальнику!',
  freeParkingName: 'Перекур',
  chanceName: 'Жизнь',
  communityChestName: 'Братан',
  bailPrice: 500,
};

export const CHANCE_CARDS: GameCard[] = [
  {
    id: 'c1',
    text: 'Не отписал клиентам — иди к Начальнику!',
    action: { type: 'go_to_jail' },
  },
  {
    id: 'c2',
    text: 'Проиграла ставка — плати 1 000₸ в банк',
    action: { type: 'pay_bank', amount: 1000 },
  },
  {
    id: 'c3',
    text: 'Хороший день — получи 500₸ от каждого',
    action: { type: 'collect_each_player', amount: 500 },
  },
  {
    id: 'c4',
    text: 'Купил машину — получи 100₸ от каждого',
    action: { type: 'collect_each_player', amount: 100 },
  },
  {
    id: 'c5',
    text: 'Продвинулся на работе — получи 2 000₸ из банка',
    action: { type: 'collect_bank', amount: 2000 },
  },
  {
    id: 'c6',
    text: 'Иди на Перекур',
    action: { type: 'move_to', position: 20, collect_salary: false },
  },
  {
    id: 'c7',
    text: 'Иди на Получку',
    action: { type: 'move_to', position: 0, collect_salary: true },
  },
  {
    id: 'c8',
    text: 'Штраф за опоздание — заплати 500₸',
    action: { type: 'pay_bank', amount: 500 },
  },
  {
    id: 'c9',
    text: 'Сезонная премия — получи 1 500₸ из банка',
    action: { type: 'collect_bank', amount: 1500 },
  },
  {
    id: 'c10',
    text: 'Выиграл спор — получи 500₸ от каждого',
    action: { type: 'collect_each_player', amount: 500 },
  },
];

export const COMMUNITY_CARDS: GameCard[] = [
  {
    id: 'b1',
    text: 'Набухался и угостил всех — отдай 10% кэша каждому',
    action: { type: 'pay_percent', percent: 10 },
  },
  {
    id: 'b2',
    text: 'Не пьёшь на тусе — плати 300₸ каждому',
    action: { type: 'pay_each_player', amount: 300 },
  },
  {
    id: 'b3',
    text: 'День рождения — получи 500₸ от каждого',
    action: { type: 'collect_each_player', amount: 500 },
  },
  {
    id: 'b4',
    text: 'Залип в телефон на работе — иди к Начальнику!',
    action: { type: 'go_to_jail' },
  },
  {
    id: 'b5',
    text: 'Починил машину — заплати 800₸',
    action: { type: 'pay_bank', amount: 800 },
  },
  {
    id: 'b6',
    text: 'Выиграл в покер — получи 2 500₸ из банка',
    action: { type: 'collect_bank', amount: 2500 },
  },
  {
    id: 'b7',
    text: 'Ошибка в отчёте — заплати 600₸',
    action: { type: 'pay_bank', amount: 600 },
  },
  {
    id: 'b8',
    text: 'Накопил на отпуск — получи 1 000₸ из банка',
    action: { type: 'collect_bank', amount: 1000 },
  },
  {
    id: 'b9',
    text: 'Угостил шефа — получи 500₸ из банка',
    action: { type: 'collect_bank', amount: 500 },
  },
  {
    id: 'b10',
    text: 'Сломал принтер — заплати 300₸',
    action: { type: 'pay_bank', amount: 300 },
  },
];
