const jwt = require('jsonwebtoken');
const knex = require('../../database/connection');
const errorHandler = require('../../helpers/error-handler');

module.exports = async (req, res, next) => {
    let ret = req.ret;

    try {
        const token = req.header('x-access-token');

        if (!token) {
            ret.setCode(401);
            throw new Error('Token inválido.');
        }

        const key = process.env.TOKEN_SECRET;
        const decodedToken = jwt.verify(token, key);

        let user = [];

        if (decodedToken.id) {
            const queryUserExists = `
                SELECT U.user_id, U.name, U.email, U.password, U.salt
                FROM users U
                WHERE U.deleted_at IS NULL
                AND U.user_id = ?;
            `;

            const argsUserExists = [
                decodedToken.id,
            ];

            user = (await knex.raw(queryUserExists, argsUserExists))[0];

            if (!user.length) {
                ret.setCode(401);
                throw new Error('Token inválido.');
            }

            user = user[0];

            req.auth = {
                user,
            };

        } else if (decodedToken.isPublic) {

        } else {
            ret.setCode(401);
            throw new Error('Token inválido.');
        }

        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            err.message = 'Token inválido.';
            ret.setCode(401);
            ret = errorHandler(err, ret);
            return res.status(ret.getCode()).json(ret.generate());
        } else if (err.name === 'TokenExpiredError') {
            ret.setCode(401);
            ret.addMessage('Token expirado.');
            return res.status(ret.getCode()).json(ret.generate());
        }

        ret = errorHandler(err, ret);
        return res.status(ret.getCode()).json(ret.generate());
    }
};
