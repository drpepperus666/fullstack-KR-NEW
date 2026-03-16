const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let products = [
    { id: 1, name: "Энергетик", price: 666 },
    { id: 2, name: "Сок Добрый", price: 666666 },
    { id: 3, name: "Кола Злая", price: 1 }
];

app.get('/', (req, res) => {
    res.send('API товаров работает! Используйте /products');
});

app.get('/products', (req, res) => {
    res.json(products);
});

app.get('/products/:id', (req, res) => {
    const id = Number(req.params.id);           
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json(product);
});

app.post('/products', (req, res) => {
    const { name, price } = req.body;

    if (!name || typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: 'Некорректные данные: name и price обязательны, price ≥ 0' });
    }

    const newProduct = {
        id: Date.now(),   
        name,
        price
    };

    products.push(newProduct);

    res.status(201).json(newProduct);
});

app.patch('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    const { name, price } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) {
        if (typeof price !== 'number' || price < 0) {
            return res.status(400).json({ error: 'price должен быть числом ≥ 0' });
        }
        product.price = price;
    }

    res.json(product);
});

app.delete('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const initialLength = products.length;

    products = products.filter(p => p.id !== id);

    if (products.length === initialLength) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    res.status(204).send();  
});

app.listen(port, () => {
    console.log(`Сервер запущен → http://localhost:${port}`);
});