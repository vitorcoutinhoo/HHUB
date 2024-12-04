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
    password: '1234', // Substitua com a sua senha do MySQL
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

    const query = 'SELECT * FROM QUARTO WHERE valor_quarto < 300';
    db.query(query, (err, results) => {
        if (err) {
            console.log('Erro na consulta:', err);
            return res.send('Erro ao acessar o banco de dados');
        }
        res.render('index', { quartos: results, isLoggedIn });
    });
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
            req.session.userEmail = results[0].email;

            if(req.session.userName === 'ADM' && req.session.userEmail === 'adm@adm.com')
                return res.redirect('/admin')

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

// Rota para processar o cadastro do usuário
// Rota para processar o cadastro do usuário
app.post('/cadastro', (req, res) => {
    const { email, password, name } = req.body;

    // Verificar se o e-mail já existe no banco de dados
    const checkQuery = 'SELECT * FROM CLIENTE WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.log('Erro ao verificar e-mail:', err);
            return res.send('Erro ao acessar o banco de dados');
        }

        // Se o e-mail já existe
        if (results.length > 0) {
            return res.render('cadastro', { errorMessage: 'E-mail já cadastrado' });
        }

        // Inserir o novo usuário no banco de dados (não inclui 'id_cliente' na consulta)
        const insertQuery = 'INSERT INTO CLIENTE (email, senha, user_name) VALUES (?, ?, ?)';
        db.query(insertQuery, [email, password, name], (err, result) => {
            if (err) {
                console.log('Erro ao cadastrar usuário:', err);
                return res.send('Erro ao cadastrar usuário');
            }

            // Redireciona para a página de login após o cadastro
            res.redirect('/login');
        });
    });
});

// Rota para reservas
app.get('/reservas', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    const query = 'SELECT * FROM QUARTO WHERE statusQuarto = "Disponível"';
    db.query(query, [req.session.userId], (err, results) => {
        if (err) {
            console.log('Erro na consulta de reservas:', err);
            return res.send('Erro ao acessar o banco de dados');
        }
        res.render('reservas', { reservas: results });
    });
});

// Rota para o carrinho
app.get('/carrinho', (req, res) => {
    const isLoggedIn = req.session.userId ? true : false;
    if (!isLoggedIn) {
        return res.redirect('/login'); // Redireciona para o login caso não esteja logado
    }

    const carrinho = req.session.carrinho || [];
    res.render('carrinho', { isLoggedIn, carrinho });
});

// Rota para o quarto
app.get('/quarto/:id', (req, res) => {
    const isLoggedIn = req.session.userId ? true : false;

    // Consulta incluindo a coluna 'descricao'
    const idQuarto = req.params.id;

    const query = `
        SELECT 
            quarto.id_quarto,
            quarto.numeroQuarto, 
            quarto.tipoQuarto, 
            quarto.statusQuarto, 
            quarto.valor_quarto, 
            quarto.descricao, 
            hotel.id_hotel, 
            hotel.nome_hotel, 
            hotel.estado_hotel, 
            hotel.cidade_hotel, 
            hotel.endereco_hotel 
        FROM quarto 
        INNER JOIN hotel ON quarto.fk_id_hotel = hotel.id_hotel 
        WHERE quarto.id_quarto = ?;
    `;


    db.query(query, [idQuarto], (err, results) => {
        if (err) {
            console.log('Erro ao consultar quarto:', err);
            return res.send('Erro ao acessar o banco de dados');
        }
        if (results.length > 0) {
            const quarto = results[0]
            res.render('quarto', { isLoggedIn, quarto});
        } else {
            res.send('Quarto não encontrado');
        }
    });
});

app.post('/carrinho', (req, res) => {
    const isLoggedIn = req.session.userId ? true : false;
    if (!isLoggedIn) {
        return res.status(401).json({ message: 'É necessário estar logado para adicionar ao carrinho.' });
    }

    const { idQuarto, tipoQuarto, valor_quarto, idHotel} = req.body;

    // Inicializa o carrinho se ainda não existir
    if (!req.session.carrinho) {
        req.session.carrinho = [];
    }

    // Adiciona o quarto ao carrinho
    req.session.carrinho.push({ idQuarto, tipoQuarto, valor_quarto, idHotel});

    res.status(200).json({ message: 'Quarto adicionado ao carrinho com sucesso!' });
});

app.delete('/carrinho/:id', (req, res) => {
    const id = req.params.id; // Obtém o ID do quarto a partir da URL

    if (!req.session.carrinho || req.session.carrinho.length === 0) {
        return res.status(404).json({ message: 'Carrinho vazio ou não inicializado' });
    }

    // Encontra o índice do item no carrinho
    console.log(req.session.carrinho)
    const itemIndex = req.session.carrinho.findIndex(item => item.idQuarto === id);
    console.log(itemIndex)

    if (itemIndex !== -1) {
        // Remove o item do carrinho
        req.session.carrinho.splice(itemIndex, 1);
        return res.status(200).json({ message: 'Item removido do carrinho' });
    } else {
        return res.status(404).json({ message: 'Item não encontrado no carrinho' });
    }
});

app.post('/finalizar-reserva', (req, res) => {
    const carrinho = req.body; // Recebe o array com os itens do carrinho
    const userId = req.session.userId;

    if (!carrinho || carrinho.length === 0) {
        return res.status(400).json({ message: 'Carrinho vazio.' });
    }

    // Query base para inserir os dados da reserva
    const queryReserva = `
        INSERT INTO RESERVA (fk_id_cliente, fk_id_quarto, dataCheckIn, dataCheckOut, statusReserva)
        VALUES (?, ?, ?, ?, ?)
    `;

    // Query para atualizar o status do quarto
    const queryQuarto = `
        UPDATE QUARTO 
        SET statusQuarto = 'Ocupado' 
        WHERE id_quarto = ?
    `;

    // Inicia uma transação para garantir que todas as operações sejam feitas de forma segura
    db.beginTransaction((err) => {
        if (err) {
            console.error('Erro ao iniciar transação:', err);
            return res.status(500).json({ message: 'Erro ao processar sua compra.' });
        }

        // Itera pelos itens do carrinho e insere no banco e atualiza o status do quarto
        carrinho.forEach(item => {
            const dataCheckIn = new Date().toISOString().slice(0, 19).replace('T', ' '); // Formato YYYY-MM-DD HH:MM:SS
            const dataCheckOut = new Date(Date.now() + item.days * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

            db.query(queryReserva, [userId, item.idQuarto, dataCheckIn, dataCheckOut, 'em Andamento'], (err) => {
                if (err) {
                    // Se ocorrer erro na inserção da reserva, desfaz a transação
                    return db.rollback(() => {
                        console.error('Erro ao salvar compra no banco:', err);
                        res.status(500).json({ message: 'Erro ao processar sua compra.' });
                    });
                }

                // Atualiza o status do quarto
                db.query(queryQuarto, [item.idQuarto], (err) => {
                    if (err) {
                        // Se ocorrer erro ao atualizar o quarto, desfaz a transação
                        return db.rollback(() => {
                            console.error('Erro ao atualizar status do quarto:', err);
                            res.status(500).json({ message: 'Erro ao processar sua compra.' });
                        });
                    }
                });
            });
        });

        // Se todas as operações forem bem-sucedidas, comita a transação
        db.commit((err) => {
            if (err) {
                // Se ocorrer erro no commit, desfaz a transação
                return db.rollback(() => {
                    console.error('Erro ao finalizar transação:', err);
                    res.status(500).json({ message: 'Erro ao processar sua compra.' });
                });
            }

            // Retorna sucesso ao cliente
            res.status(200).json({ message: 'Compra finalizada com sucesso!' });
        });
    });
});

app.get('/admin', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    const query1 = 'SELECT * FROM QUARTO';
    const query2 = 'SELECT *, nome_completo FROM RESERVA, CLIENTE WHERE id_cliente = fk_id_cliente';
    
    try {
        // Realiza ambas as consultas de forma paralela
        const [quartos, reservas] = await Promise.all([
            new Promise((resolve, reject) => {
                db.query(query1, (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            }),
            new Promise((resolve, reject) => {
                db.query(query2, (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            })
        ]);

        // Associa o número do quarto às reservas
        const reservasComNumeroQuarto = reservas.map(reserva => {
            // Encontra o quarto correspondente à reserva
            const quarto = quartos.find(q => q.idQuarto === reserva.idQuarto);
            return {
                ...reserva,
                numeroQuarto: quarto ? quarto.numeroQuarto : null, // Se encontrado, adiciona o número do quarto
            };
        });

        // Renderiza a página com as reservas atualizadas
        res.render('admin', { quartos, reservas: reservasComNumeroQuarto });
    } catch (err) {
        console.log('Erro ao consultar banco de dados:', err);
        res.send('Erro ao acessar o banco de dados');
    }
});

// Rota para promoções
app.get('/#promo', (req, res) => {
    res.render('promo');
});

app.get('/sobre', (req, res) => {
    // Verificar se o usuário está logado
    const isLoggedIn = req.session && req.session.user ? true : false;
    // Renderizar a página "sobre", passando a variável isLoggedIn
    res.render('sobre', { isLoggedIn: isLoggedIn });
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
