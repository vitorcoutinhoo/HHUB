const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/sobre', (req, res) => {
    res.render('sobre');
});

app.get('/reservas', (req, res) => {
    res.render('reservas');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

app.get('/carrinho', (req, res) => {
    res.render('carrinho');
});

app.get('/quarto', (req, res) => {
    res.render('quarto');
});

app.get('/admin', (req, res) => {
    res.render('admin');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
