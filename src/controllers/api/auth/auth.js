const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../../../database/connection');
const messagesValidator = require('../../../helpers/validator-messages');
const Validator = require('validatorjs');
const errorHandler = require('../../../helpers/error-handler');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        ret.addFields(['email', 'password']);

        let { email, password } = req.body;

        const dataValidate = new Validator({
            email,
            password,
        }, {
            email: 'required|string|email',
            password: 'required|string',
        }, messagesValidator);

        const fails = dataValidate.fails();
        const errors = dataValidate.errors.all();

        if (fails) {
            for (let field in errors) {
                let messages = errors[field];
                ret.setFieldError(field, true);

                for (let i in messages) {
                    let message = messages[i];
                    ret.addFieldMessage(field, message);
                }
            }

            ret.setCode(400);
            throw new Error('Verifique todos os campos.');
        }

        const queryUserExists = `
            SELECT U.user_id, U.name, U.email, U.password, U.salt
            FROM users U
            WHERE U.deleted_at IS NULL
            AND U.email = ?;
        `;

        const argsUserExists = [
            email,
        ];

        let user = (await knex.raw(queryUserExists, argsUserExists))[0];

        if (!user.length) {
            ret.setCode(400);
            throw new Error('Usuário não encontrado.');
        }

        user = user[0];

        const passwordVerify = bcrypt.compareSync(password, user.password);

        if (!passwordVerify) {
            ret.setCode(400);
            throw new Error('Usuário não encontrado.');
        }

        const login = {
            id: user.user_id,
            name: user.name,
            email: user.email,
            isPublic: false,
        };

        const exp = Number(process.env.TOKEN_EXPIRATION_SEC);
        if (exp) {
            login.exp = Math.floor(Date.now() / 1000) + exp;
        }

        const key = process.env.TOKEN_SECRET;
        const token = jwt.sign(login, key);

        ret.addContent('token', token);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
