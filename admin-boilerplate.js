console.clear();
require('dotenv-safe').config();

const express = require('express');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.use(require('./src/middlewares/json-return'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('views', './src/views');
app.set('view engine', 'ejs');

app.use('/admin', expressLayouts);
app.set('layout', 'admin/layout');

app.use(require('./src/routes'));

app.use((req, res, next) => {
    res.status(404).render('site/error-404');
});

app.use((err, req, res, next) => {
    console.log('err', err);
    res.status(500).render('site/error-500');
});

const port = process.env.APP_PORT;

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
