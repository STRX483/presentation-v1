export type Deck = 'survive' | 'proizvedenie'

export type Slide = {
  image: string
  deck: Deck
  kicker?: string
  title: string
  body?: string[]
  frames?: string[]   // ← new: when present, slide renders as a grid
}

export const DECKS: Record<Deck, { label: string; accent: string }> = {
  survive: { label: 'HSE: SURVIVE', accent: '#ff4d3d' },
  proizvedenie: { label: 'ПРОИЗВЕДЕНИЕ', accent: '#4d9bff' },
}

export const slides: Slide[] = [
  {
    image: '/slides/s01.png',
    deck: 'survive',
    kicker: 'Питч-пак',
    title: 'HSE: SURVIVE',
    body: ['Пиксельный сериал про  день в  Школе Дизайна.', 'Формат 21:9, 9:16 · Жанр — Приключение · Хронометраж: 30-60 сек'],
  },
  {
    image: '/slides/s02.png',
    deck: 'survive',
    kicker: 'Концепция',
    title: 'О чём это',
    body: ['Ключевая идея.', 'Второй тезис.'],
  },
  {
    image: '/slides/s03.png',
    deck: 'survive',
    kicker: 'Мир',
    title: 'Локации и атмосфера',
  },
  {
    image: '/slides/s04.png',
    deck: 'survive',
    kicker: 'Герои',
    title: 'Персонажи',
    body: ['Герой 1 — описание.', 'Герой 2 — описание.'],
  },
  {
    image: '/slides/s05.png',
    deck: 'survive',
    kicker: 'Визуал',
    title: 'Референсы',
  },
  {
    image: '/slides/s06.png',
    deck: 'survive',
    kicker: 'Структура',
    title: 'Сезон / эпизоды',
  },
  {
    image: '/slides/s07.png',
    deck: 'proizvedenie',
    kicker: 'Питч-пак',
    title: 'ПРОИЗВЕДЕНИЕ',
    body: ['Логлайн второго проекта.'],
  },
  {
    image: '/slides/s08.png',
    deck: 'proizvedenie',
    kicker: 'Концепция',
    title: 'Идея',
  },
  {
    image: '/slides/s09.png',
    deck: 'proizvedenie',
    kicker: 'Мир',
    title: 'Пространство',
  },
  {
    image: '/slides/s10.png',
    deck: 'proizvedenie',
    kicker: 'Герои',
    title: 'Персонажи',
  },
  {
    image: '/slides/s11.png',
    deck: 'proizvedenie',
    kicker: 'Визуал',
    title: 'Референсы',
  },
  {
    image: '/slides/s12.png',
    deck: 'proizvedenie',
    kicker: 'Продакшн',
    title: 'Реализация',
  },
  {
    image: '/slides/s13.png',
    deck: 'proizvedenie',
    kicker: 'Финал',
    title: 'Раскадровка',
    body: ['тестовая общая раскадровка'],
    frames: [
      '/slides/s09.png',
      '/slides/s10.png',
      '/slides/s11.png',
      '/slides/s12.png',
      '/slides/s13.png',
      '/slides/s14.png',
      '/slides/s15.png',
      '/slides/s07.png',
      '/slides/s08.png',
    ],
  },
]