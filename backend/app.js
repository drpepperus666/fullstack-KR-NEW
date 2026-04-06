const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3001;

// JWT конфигурация
const JWT_SECRET = "your_secret_key_change_in_production";
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_SECRET = "your_refresh_secret_key_change_in_production";
const REFRESH_EXPIRES_IN = "7d";

// Хранилище refresh-токенов в памяти
const refreshTokens = new Set();

let products = [
    { id: nanoid(6), name: 'Ben Drowned', category: 'Viruses', description: 'Haunted video game character who drowns his victims in digital nightmares', price: 299, stock: 1, rating: 4.6, photoUrl: 'https://i.pinimg.com/736x/d6/50/a4/d650a449abddc8df43a70d8f39cafbdd.jpg' },
    { id: nanoid(6), name: 'Bloody Painter', category: 'Killers', description: 'Artistic murderer who paints with the blood of his victims', price: 349, stock: 1, rating: 4.4, photoUrl: 'https://i.pinimg.com/736x/3c/fa/7b/3cfa7b10eaaa76e96cc8ca3243667583.jpg' },
    { id: nanoid(6), name: 'Cabadath', category: 'Entities', description: 'Mysterious tall figure from alternate dimensions', price: 499, stock: 1, rating: 4.7, photoUrl: 'https://i.pinimg.com/1200x/59/21/06/592106bcab8c63c9d1670b019076922a.jpg' },
    { id: nanoid(6), name: 'Clockwork', category: 'Killers', description: 'Time-obsessed killer with a clock for an eye', price: 279, stock: 1, rating: 4.5, photoUrl: 'https://i.pinimg.com/736x/f4/17/94/f41794fce4db3a3df4ea982b570b94b6.jpg' },
    { id: nanoid(6), name: 'Eyeless Jack', category: 'Monsters', description: 'Kidney-eating creature with empty eye sockets', price: 399, stock: 1, rating: 4.8, photoUrl: 'https://i.pinimg.com/736x/a7/fa/21/a7fa212f4d72c639df8f8f20583834f6.jpg' },
    { id: nanoid(6), name: 'Fluttershy', category: 'Animals', description: 'Twisted version of a pony turned into a horror entity', price: 199, stock: 1, rating: 4.2, photoUrl: 'https://i.pinimg.com/736x/08/2f/36/082f36443b16197d647091e37793c3fc.jpg' },
    { id: nanoid(6), name: 'Grinny Cat', category: 'Animals', description: 'Grinning demonic cat that brings misfortune', price: 249, stock: 1, rating: 4.3, photoUrl: 'https://i.pinimg.com/736x/16/d5/4c/16d54c70e4cb185b64ce5085b13e77a7.jpg' },
    { id: nanoid(6), name: 'Homicidal Liu', category: 'Killers', description: 'Brother of Jeff, seeking revenge with deadly intent', price: 329, stock: 1, rating: 4.5, photoUrl: 'https://i.pinimg.com/736x/6f/2c/77/6f2c770d42e8376f27f9807231a03e56.jpg' },
    { id: nanoid(6), name: 'Hoodie', category: 'Proxies', description: 'Silent hooded figure working for Slenderman', price: 259, stock: 1, rating: 4.4, photoUrl: 'https://i.pinimg.com/736x/50/ec/e3/50ece376a5ee2f0b3abcc0c52c0efd39.jpg' },
    { id: nanoid(6), name: 'Jane the Killer', category: 'Killers', description: 'Vengeful woman hunting down Jeff the Killer', price: 369, stock: 1, rating: 4.6, photoUrl: 'https://i.pinimg.com/736x/5a/ba/a2/5abaa2117bc6271111b651ebe5ac631f.jpg' },
    { id: nanoid(6), name: 'Jeff the Killer', category: 'Killers', description: 'Insane murderer with a carved smile', price: 299, stock: 1, rating: 4.7, photoUrl: 'https://i.pinimg.com/736x/29/02/14/2902145a85ffddf2415329f46a7a30ae.jpg' },
    { id: nanoid(6), name: 'Kagekao', category: 'Demons', description: 'Japanese demon who plays deadly games', price: 449, stock: 1, rating: 4.8, photoUrl: 'https://i.pinimg.com/1200x/ad/1e/0d/ad1e0de02724dd048b085cbda851dda3.jpg' },
    { id: nanoid(6), name: 'Laughing Jack', category: 'Clowns', description: 'Monochrome clown who turns fun into terror', price: 319, stock: 1, rating: 4.5, photoUrl: 'https://i.pinimg.com/736x/a6/ef/fe/a6effe6e5e11d11548cddc83e7827292.jpg' },
    { id: nanoid(6), name: 'Masky', category: 'Proxies', description: 'Masked proxy serving Slenderman\'s will', price: 269, stock: 1, rating: 4.3, photoUrl: 'https://i.pinimg.com/736x/d6/ab/3f/d6ab3f98cf9adda3d3910d02bc13abf3.jpg' },
    { id: nanoid(6), name: 'Nina the Killer', category: 'Killers', description: 'Fanatical admirer and killer inspired by Jeff', price: 339, stock: 1, rating: 4.4, photoUrl: 'https://i.pinimg.com/736x/43/f1/70/43f1700d983f7e027d8aac394ae64072.jpg' },
    { id: nanoid(6), name: 'Offenderman', category: 'Entities', description: 'Perverted brother of Slenderman who offers roses', price: 499, stock: 1, rating: 4.6, photoUrl: 'https://i.pinimg.com/736x/77/9a/e5/779ae52063016d737759da6e554a48d4.jpg' },
    { id: nanoid(6), name: 'Pinkie Pie', category: 'Animals', description: 'Deranged pony baker from a horrific tale', price: 229, stock: 1, rating: 4.2, photoUrl: 'https://i.pinimg.com/736x/3f/70/a4/3f70a424e9096bcd5b621bf687d65cc3.jpg' },
    { id: nanoid(6), name: 'Sally Older', category: 'Ghosts', description: 'Ghostly little girl seeking playmates eternally', price: 289, stock: 1, rating: 4.5, photoUrl: 'https://i.pinimg.com/736x/47/36/15/4736158640e38ad5f0ec668a459715f2.jpg' },
    { id: nanoid(6), name: 'Slenderman', category: 'Entities', description: 'Tall faceless man who stalks and abducts', price: 599, stock: 1, rating: 4.9, photoUrl: 'https://i.pinimg.com/736x/0a/1a/33/0a1a338195542337c859d9bda1a582b1.jpg' },
    { id: nanoid(6), name: 'Smile Dog', category: 'Animals', description: 'Cursed image of a dog that spreads madness', price: 199, stock: 1, rating: 4.1, photoUrl: 'https://i.pinimg.com/736x/b7/29/d6/b729d645972d0a15eeee9e8274e9a009.jpg' },
    { id: nanoid(6), name: 'Sonic.exe', category: 'Viruses', description: 'Demonic version of Sonic who traps souls in games', price: 349, stock: 1, rating: 4.7, photoUrl: 'https://i.pinimg.com/736x/9d/3d/65/9d3d65860b17b38085b5d13e08b951a8.jpg' },
    { id: nanoid(6), name: 'Splendorman', category: 'Entities', description: 'Joyful brother of Slenderman spreading happiness darkly', price: 459, stock: 1, rating: 4.5, photoUrl: 'https://i.pinimg.com/1200x/e0/fa/99/e0fa99a2911f910c2fe247ec025a42cc.jpg' },
    { id: nanoid(6), name: 'The Rake', category: 'Monsters', description: 'Pale humanoid creature that lurks in the night', price: 429, stock: 1, rating: 4.8, photoUrl: 'https://i.pinimg.com/736x/7b/d1/0c/7bd10c1ef298dd77c158b1708a8ea38a.jpg' },
    { id: nanoid(6), name: 'Ticci-Toby', category: 'Proxies', description: 'Axe-wielding proxy with uncontrollable tics', price: 309, stock: 1, rating: 4.6, photoUrl: 'https://i.pinimg.com/736x/1f/c6/ac/1fc6acf6487da9981e4b6c54db5ecba0.jpg' },
    { id: nanoid(6), name: 'X-Virus', category: 'Viruses', description: 'Deadly virus entity that corrupts everything it touches', price: 379, stock: 1, rating: 4.5, photoUrl: 'https://i.pinimg.com/736x/7f/42/9a/7f429a50fa74ddc42648bc58c669d42a.jpg' },
    { id: nanoid(6), name: 'Zalgo', category: 'Demons', description: 'Corrupter of all things, bringing chaos and decay', price: 699, stock: 1, rating: 4.9, photoUrl: 'https://i.pinimg.com/736x/b9/45/70/b945707233161b8220c68ac95f549900.jpg' }
];

let users = [];

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3002"], methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }));
app.use(express.json());

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

function findProductOr404(id, res) {
    const product = products.find(p => p.id === id);
    if (!product) {
        res.status(404).json({ error: "Entity not found" });
        return null;
    }
    return product;
}

function findUserOr404(email, res) {
    const user = users.find(u => u.email === email);
    if (!user) {
        res.status(404).json({ error: "user not found" });
        return null;
    }
    return user;
}

async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role || 'user',
        },
        JWT_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role || 'user',
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN,
        }
    );
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
}

// ────────────────────────────────────────────────
// Swagger конфигурация
// ────────────────────────────────────────────────
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Creepypasta Entity Store API',
            version: '1.0.0',
            description: 'API магазина мистических сущностей и городских легенд. Полный CRUD над товарами (entities).',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер разработки',
            },
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    required: ['id', 'email', 'first_name', 'last_name'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Уникальный идентификатор пользователя',
                            example: 'aBcDeF',
                        },
                        email: {
                            type: 'string',
                            description: 'Email пользователя (используется как логин)',
                            example: 'ivan@example.com',
                        },
                        first_name: {
                            type: 'string',
                            description: 'Имя пользователя',
                            example: 'Ivan',
                        },
                        last_name: {
                            type: 'string',
                            description: 'Фамилия пользователя',
                            example: 'Petrov',
                        },
                        password: {
                            type: 'string',
                            description: 'Хешированный пароль',
                            example: '$2b$10$kO6Hq7ZKfV4cPzGm8u7mEuR7r4Xx2p9mP0q3t1yZbCq9Lh5a8b1QW',
                        },
                    },
                },
                UserRegister: {
                    type: 'object',
                    required: ['email', 'first_name', 'last_name', 'password'],
                    properties: {
                        email: { type: 'string', example: 'ivan@example.com' },
                        first_name: { type: 'string', example: 'Ivan' },
                        last_name: { type: 'string', example: 'Petrov' },
                        password: { type: 'string', example: 'qwerty123' },
                    },
                },
                UserLogin: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', example: 'ivan@example.com' },
                        password: { type: 'string', example: 'qwerty123' },
                    },
                },
                Product: {
                    type: 'object',
                    required: ['id', 'name', 'category', 'price', 'stock'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Уникальный идентификатор сущности (nanoid 6 символов)',
                            example: 'aBcDeF',
                        },
                        name: {
                            type: 'string',
                            description: 'Имя сущности или название объекта',
                            example: 'Slenderman',
                        },
                        category: {
                            type: 'string',
                            description: 'Классификация (Killers, Entities, Ghosts и т.д.)',
                            example: 'Entities',
                        },
                        description: {
                            type: 'string',
                            description: 'История происхождения или описание угрозы',
                            example: 'Tall faceless man who stalks and abducts children',
                        },
                        price: {
                            type: 'number',
                            description: 'Стоимость призыва или артефакта',
                            example: 599,
                        },
                        stock: {
                            type: 'integer',
                            description: 'Доступность в текущем измерении',
                            example: 1,
                        },
                        rating: {
                            type: 'number',
                            description: 'Уровень опасности/популярности (0–5)',
                            example: 4.9,
                        },
                        photoUrl: {
                            type: 'string',
                            description: 'Ссылка на изображение (фото или зарисовка свидетелей)',
                            example: 'https://via.placeholder.com/150',
                        },
                    },
                },
                ProductInput: {
                    type: 'object',
                    required: ['name', 'category', 'price', 'stock'],
                    properties: {
                        name: { type: 'string', example: 'Jeff the Killer' },
                        category: { type: 'string', example: 'Killers' },
                        description: { type: 'string', example: 'Insane murderer with a carved smile...' },
                        price: { type: 'number', example: 299 },
                        stock: { type: 'integer', example: 1 },
                        rating: { type: 'number', example: 4.7 },
                        photoUrl: { type: 'string', example: 'https://via.placeholder.com/150' },
                    },
                },
                ProductUpdate: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Eyeless Jack' },
                        category: { type: 'string', example: 'Monsters' },
                        description: { type: 'string', example: 'Updated threat assessment' },
                        price: { type: 'number', example: 399 },
                        stock: { type: 'integer', example: 1 },
                        rating: { type: 'number', example: 4.8 },
                        photoUrl: { type: 'string', example: 'https://via.placeholder.com/200' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Entity not found' },
                    },
                },
            },
        },
    },
    apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { background-color: #0b0f19; }',
    customSiteTitle: 'Creepypasta Store API Docs',
}));

// ────────────────────────────────────────────────
// CRUD роуты
// ────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     description: Создает нового пользователя с хешированным паролем
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Некорректные данные
 */
app.post("/api/auth/register", async (req, res) => {
    const { email, first_name, last_name, password, role } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: "email, first_name, last_name and password are required" });
    }

    // Проверка, что пользователь с таким email не существует
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: "User with this email already exists" });
    }

    const newUser = {
        id: nanoid(6),
        email: email,
        first_name: first_name,
        last_name: last_name,
        password: await hashPassword(password),
        role: role || 'user',
        isBlocked: false
    };

    users.push(newUser);
    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role
    });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     description: Проверяет email и пароль пользователя, возвращает access и refresh токены
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 *       404:
 *         description: Пользователь не найден
 */
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }

    const user = findUserOr404(email, res);
    if (!user) return;

    // Проверка блокировки
    if (user.isBlocked) {
        return res.status(403).json({ error: "User is blocked" });
    }

    const isAuthenticated = await verifyPassword(password, user.password);
    if (isAuthenticated) {
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.add(refreshToken);

        res.status(200).json({ accessToken, refreshToken });
    } else {
        res.status(401).json({ error: "not authenticated" });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить текущего пользователя
 *     description: Возвращает информацию о пользователе на основе JWT токена
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "aBcDeF"
 *                 email:
 *                   type: string
 *                   example: "ivan@example.com"
 *                 first_name:
 *                   type: string
 *                   example: "Ivan"
 *                 last_name:
 *                   type: string
 *                   example: "Petrov"
 *       401:
 *         description: Отсутствует или неверный токен
 *       404:
 *         description: Пользователь не найден
 */
app.get("/api/auth/me", authMiddleware, (req, res) => {
    const userId = req.user.sub;
    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role || 'user',
    });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновить токены доступа
 *     description: Генерирует новую пару access и refresh токенов на основе текущего refresh токена
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Новые токены успешно сгенерированы
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Отсутствует refreshToken
 *       401:
 *         description: Неверный или истекший refresh токен
 */
app.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: "refreshToken is required" });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: "Invalid refresh token" });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find(u => u.id === payload.sub);

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // Ротация refresh-токена: старый удаляем, новый создаём
        refreshTokens.delete(refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
});

// ────────────────────────────────────────────────
// Products CRUD роуты
// ────────────────────────────────────────────────

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     description: Возвращает список всех сущностей, доступных в магазине. Требует аутентификации.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Отсутствует или неверный токен
 */
app.get("/api/products", authMiddleware, (req, res) => res.json(products));

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     description: Требует аутентификации через JWT токен
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Найденный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Отсутствует или неверный токен
 *       404:
 *         description: Товар не найден
 */
app.get("/api/products/:id", authMiddleware, (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Некорректные данные
 */
app.post("/api/products", authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    const { name, category, description, price, stock, rating = 0, photoUrl = 'https://via.placeholder.com/150' } = req.body;
    if (!name?.trim() || !category?.trim() || price <= 0 || stock < 0) {
        return res.status(400).json({ error: "Invalid data" });
    }
    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description?.trim() || '',
        price: Number(price),
        stock: Number(stock),
        rating: Number(rating),
        photoUrl
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить данные товара
 *     description: Требует аутентификации через JWT токен
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Некорректные данные или нечего обновлять
 *       401:
 *         description: Отсутствует или неверный токен
 *       404:
 *         description: Товар не найден
 */
app.put("/api/products/:id", authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;

    const { name, category, description, price, stock, rating, photoUrl } = req.body;
    let updated = false;

    if (name !== undefined) {
        if (!name.trim()) return res.status(400).json({ error: "Name cannot be empty" });
        product.name = name.trim();
        updated = true;
    }
    if (category !== undefined) {
        if (!category.trim()) return res.status(400).json({ error: "Category cannot be empty" });
        product.category = category.trim();
        updated = true;
    }
    if (description !== undefined) {
        product.description = description.trim();
        updated = true;
    }
    if (price !== undefined) {
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice <= 0) return res.status(400).json({ error: "Price must be positive" });
        product.price = numPrice;
        updated = true;
    }
    if (stock !== undefined) {
        const numStock = Number(stock);
        if (isNaN(numStock) || numStock < 0) return res.status(400).json({ error: "Stock must be non-negative" });
        product.stock = numStock;
        updated = true;
    }
    if (rating !== undefined) {
        const numRating = Number(rating);
        if (isNaN(numRating) || numRating < 0 || numRating > 5) return res.status(400).json({ error: "Rating must be 0-5" });
        product.rating = numRating;
        updated = true;
    }
    if (photoUrl !== undefined) {
        product.photoUrl = photoUrl.trim();
        updated = true;
    }

    if (!updated) return res.status(400).json({ error: "Nothing to update" });
    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     description: Требует роль администратора
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удален
 *       401:
 *         description: Отсутствует или неверный токен
 *       403:
 *         description: Недостаточно прав доступа
 *       404:
 *         description: Товар не найден
 */
app.delete("/api/products/:id", authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const id = req.params.id;
    if (!products.some(p => p.id === id)) return res.status(404).json({ error: "Entity not found" });
    products = products.filter(p => p.id !== id);
    res.status(204).send();
});

// ────────────────────────────────────────────────
// User Management Routes (Admin Only)
// ────────────────────────────────────────────────

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     description: Доступно только администраторам
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 *       401:
 *         description: Отсутствует или неверный токен
 *       403:
 *         description: Недостаточно прав доступа
 */
app.get("/api/users", authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const userList = users.map(u => ({
        id: u.id,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        role: u.role,
        isBlocked: u.isBlocked || false
    }));
    res.json(userList);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     description: Доступно только администраторам
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       401:
 *         description: Отсутствует или неверный токен
 *       403:
 *         description: Недостаточно прав доступа
 *       404:
 *         description: Пользователь не найден
 */
app.get("/api/users/:id", authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isBlocked: user.isBlocked || false
    });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить данные пользователя
 *     description: Доступно только администраторам
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *     responses:
 *       200:
 *         description: Пользователь успешно обновлен
 *       401:
 *         description: Отсутствует или неверный токен
 *       403:
 *         description: Недостаточно прав доступа
 *       404:
 *         description: Пользователь не найден
 */
app.put("/api/users/:id", authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { first_name, last_name, role } = req.body;
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (role) user.role = role;

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isBlocked: user.isBlocked || false
    });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя
 *     description: Доступно только администраторам
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       204:
 *         description: Пользователь успешно заблокирован
 *       401:
 *         description: Отсутствует или неверный токен
 *       403:
 *         description: Недостаточно прав доступа
 *       404:
 *         description: Пользователь не найден
 */
app.delete("/api/users/:id", authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isBlocked = true;
    res.status(204).send();
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу: http://localhost:${port}/api-docs`);
});