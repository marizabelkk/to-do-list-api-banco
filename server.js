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
    charset: 'utf8mb4',
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

// ===============================================
// MIDDLEWARES
// ===============================================

app.use(cors());
app.use(express.json());

// ===============================================
// ROTA 1: GET /tarefas
// BUSCAR TODAS AS TAREFAS
// ===============================================

app.get('/tarefas', async (req, res) => {
    console.log('Requisição GET recebida em /tarefas');

    try {
        const [tarefas] = await pool.query(
            'SELECT * FROM tarefas'
        );

        return res.json(tarefas);
    } catch (erro) {
        console.error('Erro ao buscar tarefas:', erro.message);

        return res.status(500).json({
            erro: 'Erro ao buscar tarefas no banco de dados.'
        });
    }
});

// ===============================================
// ROTA 2: POST /tarefas
// CRIAR UMA NOVA TAREFA
// ===============================================

app.post('/tarefas', async (req, res) => {
    const { texto } = req.body;

    if (!texto) {
        return res.status(400).json({
            erro: 'O campo texto é obrigatório.'
        });
    }

    try {
        const [resultado] = await pool.query(
            'INSERT INTO tarefas (texto, concluida) VALUES (?, ?)',
            [texto, false]
        );

        const novaTarefa = {
            id: resultado.insertId,
            texto: texto,
            concluida: false
        };

        return res.status(201).json(novaTarefa);
    } catch (erro) {
        console.error('Erro ao criar tarefa:', erro.message);

        return res.status(500).json({
            erro: 'Erro ao criar tarefa no banco de dados.'
        });
    }
});

// ===============================================
// ROTA 3: DELETE /tarefas/:id
// EXCLUIR UMA TAREFA
// ===============================================

app.delete('/tarefas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [resultado] = await pool.query(
            'DELETE FROM tarefas WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: 'Tarefa não encontrada.'
            });
        }

        return res.status(204).send();
    } catch (erro) {
        console.error('Erro ao excluir tarefa:', erro.message);

        return res.status(500).json({
            erro: 'Erro ao excluir tarefa do banco de dados.'
        });
    }
});

// ===============================================
// ROTA 4: PUT /tarefas/:id
// ALTERAR CONCLUSÃO DA TAREFA
// ===============================================

app.put('/tarefas/:id', async (req, res) => {
    const { id } = req.params;
    const { concluida } = req.body;

    try {
        const [resultado] = await pool.query(
            'UPDATE tarefas SET concluida = ? WHERE id = ?',
            [concluida, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: 'Tarefa não encontrada.'
            });
        }

        const [tarefas] = await pool.query(
            'SELECT * FROM tarefas WHERE id = ?',
            [id]
        );

        return res.json(tarefas[0]);

    } catch (erro) {
        console.error('Erro ao atualizar tarefa:', erro.message);

        return res.status(500).json({
            erro: 'Erro ao atualizar tarefa no banco de dados.'
        });
    }
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

