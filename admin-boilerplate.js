console.clear();
require('dotenv-safe').config();

const express = require('express');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('views', './src/views');
app.set('view engine', 'ejs');

app.use('/admin', expressLayouts);
app.set('layout', 'admin/layout');

app.use(require('./src/middlewares/json-return'));

app.use(require('./src/routes'));

const port = process.env.APP_PORT;

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
