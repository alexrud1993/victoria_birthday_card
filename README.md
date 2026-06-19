# victoria-birthday-card

Інтерактивний Vite + Vanilla JavaScript сайт-привітання з днем народження для Вікторії.

## Локальний запуск

Встановити залежності:

```bash
npm install
```

Запустити dev-сервер:

```bash
npm run dev
```

Vite покаже локальну адресу, зазвичай:

```text
http://localhost:5173/
```

Локальний запуск не ламається через GitHub Pages `base`: Vite коректно працює в dev-режимі.

## Фото

Фото для фотоісторії додаються в:

```text
public/assets/photos/
```

У `src/main.js` масив `slides` очікує базові файли:

```text
/assets/photos/photo1.jpg
/assets/photos/photo2.jpg
/assets/photos/photo3.jpg
/assets/photos/photo4.jpg
/assets/photos/photo5.jpg
/assets/photos/photo6.jpg
```

Якщо фото ще немає, сайт покаже красивий fallback і не впаде.

## Подарунки

Зображення подарунків додаються в:

```text
public/assets/gifts/
```

Поточні очікувані файли:

```text
/assets/gifts/comb.png
/assets/gifts/necklace.png
```

Якщо картинка подарунка відсутня, сайт покаже fallback-іконку.

## Музика

Фонова музика очікується тут:

```text
public/assets/music/music.mp3
```

Музика не запускається автоматично. Користувач вмикає її кнопкою на сайті.

## Build і preview

Зібрати production-версію:

```bash
npm run build
```

Переглянути production build локально:

```bash
npm run preview
```

## GitHub Pages

Проєкт налаштований для репозиторію:

```text
victoria_birthday_card
```

У `vite.config.js` встановлено:

```js
base: '/victoria_birthday_card/'
```

Автоматичний деплой налаштований у:

```text
.github/workflows/deploy.yml
```

Workflow запускається при push у гілку `main`, встановлює залежності, запускає `npm run build` і публікує папку `dist`.

Щоб увімкнути GitHub Pages:

1. Відкрийте репозиторій на GitHub.
2. Перейдіть у `Settings` -> `Pages`.
3. У `Build and deployment` виберіть `GitHub Actions`.
4. Зробіть push у гілку `main`.

Після деплою сайт буде доступний за адресою:

```text
https://alexrud1993.github.io/victoria_birthday_card/
```
