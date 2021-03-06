const express = require('express')
const app = express()

// pegar o banco de dados
const db = require('./database/db.js')

// habilitar o uso do req.body na nossa aplicação
app.use(express.urlencoded({
    extended: true
}))

//configurar rotas(caminhos)
//página inicial
app.get('/', (req, res) => {
    console.log(__dirname)
    return res.render('index.html', {
        title: "Um título"
    })
})

app.get('/create-point', (req, res) => {

    //req.query: Query strings da url
    //console.log(req.query)

    return res.render('create-point.html')
})

app.post('/savepoint', (req, res) => {

    //req.body: o corpo do nosso formulário
    //console.log(req.body)

    //Inserir dados na tabela
    const query = `
    INSERT INTO places (
        image, 
        name,
        address,
        address2,
        state,
        city,
        items
        ) VALUES (?,?,?,?,?,?,?);`


    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if (err) {
            console.log(err)
            res.send('Erro no cadastro')
        }
        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render('create-point.html', {
            saved: true
        })
    }

    //Executa a callback quando terminar o que foi pedido
    db.run(query, values, afterInsertData)

})

app.get('/search', (req, res) => {

    const search = req.query.search

    if (search == '') {
        //pesquisa vazia
        // mostrar a página html com os dados do banco de dados
        return res.render('search-results.html', {
            total: 0
        })
    }

    // pegar os dados do banco de dados
    // '%${search}%' -> qualquer coisa antes ou depois do valor de 'search'
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
        if (err)
            return console.log(err)


        const total = rows.length

        console.log('Aqui estão os registros: ')
        console.log(rows)

        // mostrar a página html com os dados do banco de dados
        return res.render('search-results.html', {
            places: rows,
            total: total
        })

    })


})

//Configurar pasta pública
app.use(express.static('public'))

// Utilizando template engine
const nunjucks = require('nunjucks')
nunjucks.configure('src/views', {
    express: app,
    noCache: true
})

const porta = 3000
app.listen(3000, () => {
    console.log('Servidor executando na porta ', porta)
})