const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar o middleware de sessão
app.use(session({
    secret: 'secreto', // Chave secreta para assinar o ID da sessão
    resave: false,
    saveUninitialized: true,
}));

// Conexão com o banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'senia', // Substitua com a sua senha do MySQL
    database: 'hotel_hub',
});

db.connect((err) => {
    if (err) {
        console.log('Erro de conexão:', err);
    } else {
        console.log('Conectado ao banco de dados MySQL');
    }
});

// Rota para página inicial
app.get('/', (req, res) => {
    const isLoggedIn = req.session.userId ? true : false;
    res.render('index', { isLoggedIn });
});

// Rota para login
app.get('/login', (req, res) => {
    const isLoggedIn = req.session.userId ? true : false;
    res.render('login', { isLoggedIn });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Verificar se o usuário existe no banco de dados
    const query = 'SELECT * FROM CLIENTE WHERE email = ? AND senha = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.log('Erro na consulta:', err);
            return res.send('Erro ao acessar o banco de dados');
        }
        if (results.length > 0) {
            // Usuário autenticado, salvar dados na sessão
            req.session.userId = results[0].id_cliente;
            req.session.userName = results[0].user_name;
            return res.redirect('/');
        } else {
            return res.send('Credenciais inválidas');
        }
    });
});

// Rota para logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Erro ao encerrar a sessão');
        }
        res.redirect('/');
    });
});

// Rota para cadastro
app.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

app.post('/cadastro', (req, res) => {
    const { user_name, nome_completo, cpf, idade, senha, email, telefone } = req.body;

    // Verificar se o usuário já existe
    const checkQuery = 'SELECT * FROM CLIENTE WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.log('Erro na consulta:', err);
            return res.send('Erro ao acessar o banco de dados');
        }
        if (results.length > 0) {
            return res.send('Usuário já cadastrado');
        }

        // Inserir o novo usuário no banco de dados
        const insertQuery = 'INSERT INTO CLIENTE (user_name, nome_completo, cpf, idade, senha, email, telefone) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(insertQuery, [user_name, nome_completo, cpf, idade, senha, email, telefone], (err, results) => {
            if (err) {
                console.log('Erro ao cadastrar:', err);
                return res.send('Erro ao cadastrar o usuário');
            }
            res.redirect('/login');
        });
    });
});

// Rota para reservas
app.get('/reservas', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    const query = 'SELECT * FROM RESERVA WHERE fK_id_cliente = ?';
    db.query(query, [req.session.userId], (err, results) => {
        if (err) {
            console.log('Erro na consulta de reservas:', err);
            return res.send('Erro ao acessar o banco de dados');
        }
        res.render('reservas', { reservas: results });
    });
});

// Rota para sobre
app.get('/sobre', (req, res) => {
    res.render('sobre');
});

// Rota para o carrinho
app.get('/carrinho', (req, res) => {
    const isLoggedIn = req.session.userId ? true : false;
    if (!isLoggedIn) {
        return res.redirect('/login'); // Redireciona para o login caso não esteja logado
    }
    res.render('carrinho', { isLoggedIn });
});

// Rota para admin (exemplo de outra página)
app.get('/admin', (req, res) => {
    res.render('admin');
});

// Rota para promoções
app.get('/#promo', (req, res) => {
    res.render('promo');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
