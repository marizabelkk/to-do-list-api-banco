const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// ===============================================
// CONEXÃO COM O BANCO DE DADOS
// ===============================================

const pool = mysql.createPool({
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'todo_list',
    waitForConnections: true,
    connectionLimit: 10
});

// Teste de conexão com o banco
pool.query('SELECT 1')
    .then(() => {
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
    })
    .catch((erro) => {
        console.error('Erro ao conectar ao banco de dados:', erro.message);
    });

// Middleware CORS
app.use(cors());

// Middleware para processar JSON nas requisições
app.use(express.json());

// ===============================================
// DADOS MOCKADOS
// TEMPORARIAMENTE MANTIDOS
// ===============================================

let mockTarefas = [
    {
        id: 1361434473096,
        texto: 'Configurar a API Node.js com Express',
        concluida: true
    },
    {
        id: 1461434473096,
        texto: 'Testar a busca de dados no componente App.jsx',
        concluida: false
    },
    {
        id: 1561434473096,
        texto: 'Começar a estilização dos componentes com Bootstrap',
        concluida: false
    },
];

// ===============================================
// ROTA 1: GET /tarefas (BUSCAR TODAS)
// ===============================================

app.get('/tarefas', (req, res) => {
    console.log('Requisição GET recebida em /tarefas');

    // Temporariamente retorna o array mockado
    return res.json(mockTarefas);
});

// ===============================================
// ROTA 2: POST /tarefas (CRIAR NOVA TAREFA)
// ===============================================

app.post('/tarefas', (req, res) => {
    const { texto } = req.body;

    if (!texto) {
        return res.status(400).json({
            erro: 'O campo texto é obrigatório.'
        });
    }

    const novaTarefa = {
        id: Date.now(),
        texto,
        concluida: false
    };

    // Temporariamente adiciona ao array
    mockTarefas.push(novaTarefa);

    return res.status(201).json(novaTarefa);
});

// ===============================================
// ROTA 3: DELETE /tarefas/:id
// ===============================================

app.delete('/tarefas/:id', (req, res) => {
    const { id } = req.params;

    const tamanhoOriginal = mockTarefas.length;

    mockTarefas = mockTarefas.filter(
        t => t.id.toString() !== id.toString()
    );

    if (mockTarefas.length === tamanhoOriginal) {
        return res.status(404).json({
            erro: 'Tarefa não encontrada.'
        });
    }

    return res.status(204).send();
});

// ===============================================
// ROTA DE TESTE
// ===============================================

app.get('/', (req, res) => {
    res.send(`API de Tarefas rodando na porta ${PORT}`);
});

// ===============================================
// INICIALIZAÇÃO DO SERVIDOR
// ===============================================

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log('Pronto para atender requisições do seu Front-End React.');
});