# Creepypasta Store 👹

Полнофункциональное **Fullstack-приложение** для управления каталогом товаров с современным интерфейсом магазина мистических сущностей и городских легенд. Проект реализует полноценную систему аутентификации, авторизации на основе ролей (RBAC), безопасное хранение пароля и управление токенами доступа.

---

## Технологический стек

### Frontend
- **React 18+** — основной фреймворк
- **Axios** — HTTP клиент с перехватчиками (interceptors)
- **React Router** — маршрутизация
- **SCSS/CSS** — стилизация и анимации
- **localStorage** — безопасное хранение токенов

### Backend
- **Node.js & Express.js** — веб-фреймворк
- **bcrypt@5.1.1** — хеширование паролей
- **jsonwebtoken@9.0.0** — работа с JWT токенами
- **nanoid@5.1.6** — генерация уникальных ID
- **Swagger (swagger-jsdoc, swagger-ui-express)** — интерактивная документация API
- **CORS** — обработка кросс-доменных запросов

---

## Структура проекта

```
fullstar-KR1-NEW/
├── backend/
│   ├── app.js              # Основное приложение Express
│   └── package.json        # Зависимости
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiClient.js    # Axios клиент с interceptors
│   │   │   └── index.js        # API методы
│   │   ├── components/         # React компоненты
│   │   ├── pages/
│   │   │   ├── Login.jsx       # Страница входа
│   │   │   ├── Register.jsx    # Страница регистрации
│   │   │   ├── ProductsPage/   # Управление товарами
│   │   │   └── UsersPage/      # Управление пользователями (admin)
│   │   ├── App.js
│   │   ├── index.js
│   │   └── App.css
│   ├── public/
│   │   ├── index.html
│   │   └── img/
│   └── package.json
│
└── README.md
```

---

## 🌐 Окружение и API

Приложение использует следующую конфигурацию:

| Сервис          | URL                            | Описание                       |
| --------------- | ------------------------------ | ------------------------------ |
| **Frontend**    | http://localhost:3000          | Основной интерфейс приложения  |
| **Backend API** | http://localhost:3001/api      | Базовый URL для API запросов   |
| **Swagger UI**  | http://localhost:3001/api-docs | Интерактивная документация API |

---

## Безопасность

1. **Пароли**: хешируются с **bcrypt** + автоматическая соль (10 раундов)
2. **Токены**: подписаны **JWT_SECRET** (должен быть изменён в production)
3. **Access Token**: коротко живущий (15 минут) для минимизации риска компрометации
4. **Refresh Token**: долго живущий (7 дней) + хранится в памяти сервера для ревокации
5. **Bearer схема**: `Authorization: Bearer {token}`
6. **RBAC**: строгий контроль доступа на основе ролей пользователя
7. **localStorage**: безопасное хранение токенов на клиенте
8. **Interceptors**: автоматическое обновление токенов при истечении

---

## Запуск приложения

### 1. Запуск Backend (сервера)

```bash
cd backend
npm install
npm start
```

Сервер запустится на `http://localhost:3001`

**Доступные endpoints:**
- API: `http://localhost:3001/api`
- Swagger UI: `http://localhost:3001/api-docs`

### 2. Запуск Frontend (клиента)

```bash
cd ../frontend
npm install
npm start
```

Приложение откроется на `http://localhost:3000`

---

## API Эндпоинты

### Аутентификация

| Метод    | Эндпоинт             | Описание                              | Доступ              |
| -------- | -------------------- | ------------------------------------- | ------------------- |
| **POST** | `/api/auth/register` | Регистрация нового пользователя       | Общий               |
| **POST** | `/api/auth/login`    | Авторизация пользователя              | Общий               |
| **GET**  | `/api/auth/me`       | Получить данные текущего пользователя | Аутентифицированный |
| **POST** | `/api/auth/refresh`  | Обновить access и refresh токены      | Общий               |

### Товары (Products)

| Метод      | Эндпоинт            | Описание                       | Требуемая роль |
| ---------- | ------------------- | ------------------------------ | -------------- |
| **GET**    | `/api/products`     | Получить полный список товаров | Любая          |
| **GET**    | `/api/products/:id` | Получить товар по ID           | Любая          |
| **POST**   | `/api/products`     | Создать новый товар            | seller, admin  |
| **PUT**    | `/api/products/:id` | Обновить товар                 | seller, admin  |
| **DELETE** | `/api/products/:id` | Удалить товар                  | admin          |

### Управление пользователями (Users)

| Метод      | Эндпоинт         | Описание                     | Требуемая роль |
| ---------- | ---------------- | ---------------------------- | -------------- |
| **GET**    | `/api/users`     | Список всех пользователей    | admin          |
| **GET**    | `/api/users/:id` | Получить пользователя по ID  | admin          |
| **PUT**    | `/api/users/:id` | Обновить данные пользователя | admin          |
| **DELETE** | `/api/users/:id` | Заблокировать пользователя   | admin          |

---

## Примеры использования API

### 1. Регистрация пользователя
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "first_name": "Иван",
    "last_name": "Петров",
    "password": "qwerty123",
    "role": "user"
  }'
```

### 2. Вход в систему
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "qwerty123"
  }'

{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Получить список товаров (требует token)
```bash
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer {accessToken}"
```

### 4. Создать новый товар (требует seller/admin)
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {accessToken}" \
  -d '{
    "name": "Jeff the Killer",
    "category": "Killers",
    "description": "Insane murderer with a carved smile",
    "price": 299,
    "stock": 5,
    "rating": 4.7
  }'
```

### 5. Обновить токены (refresh)
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### 6. Получить список пользователей (требует admin)
```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer {adminAccessToken}"
```

---

## Пользовательский интерфейс

- **Страница логина** — вход в систему с email и паролем
- **Страница регистрации** — создание нового аккаунта с выбором роли
- **Страница товаров** — основной каталог с возможностью:
  - Просмотра всех товаров (все пользователи)
  - Создания товаров (seller, admin)
  - Редактирования товаров (seller, admin)
  - Удаления товаров (admin)
- **Страница управления пользователями** — доступна только администраторам:
  - Просмотр списка всех пользователей
  - Редактирование ролей
  - Блокировка пользователей

---

## Роли и права доступа

| Роль       | Просмотр товаров | Создание товаров | Редактирование | Удаление | Управление пользователями |
| ---------- | ---------------- | ---------------- | -------------- | -------- | ------------------------- |
| **user**   | ✅                | ❌                | ❌              | ❌        | ❌                         |
| **seller** | ✅                | ✅                | ✅              | ❌        | ❌                         |
| **admin**  | ✅                | ✅                | ✅              | ✅        | ✅                         |
