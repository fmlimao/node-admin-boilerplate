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

        const queryUserExists = `
            SELECT U.user_id, U.name, U.email, U.is_owner
            FROM users U
            WHERE U.deleted_at IS NULL
            AND U.user_id = ?;
        `;

        const argsUserExists = [
            decodedToken.id,
        ];

        const userExists = (await knex.raw(queryUserExists, argsUserExists))[0];

        if (!userExists.length) {
            ret.setCode(401);
            throw new Error('Token inválido.');
        }

        const user = userExists[0];

        const queryClients = `
            SELECT C.client_id, C.name, C.is_owner
            FROM users U
            INNER JOIN user_clients UC ON (U.user_id = UC.user_id AND UC.deleted_at IS NULL)
            INNER JOIN clients C ON (UC.client_id = C.client_id AND C.deleted_at IS NULL)
            WHERE U.deleted_at IS NULL
            AND U.user_id = ?
            ORDER BY C.name;
        `;

        const argsClients = [
            user.user_id,
        ];

        const clients = (await knex.raw(queryClients, argsClients))[0];

        const queryProjects = `
            SELECT P.project_id, P.client_id, P.name
            FROM users U
            INNER JOIN user_projects UP ON (U.user_id = UP.user_id AND UP.deleted_at IS NULL)
            INNER JOIN projects P ON (UP.project_id = P.project_id AND P.deleted_at IS NULL)
            WHERE U.deleted_at IS NULL
            AND U.user_id = ?
            ORDER BY P.name
        `;

        const argsProjects = [
            user.user_id,
        ];

        const projects = (await knex.raw(queryProjects, argsProjects))[0];

        req.auth = {
            user,
            clients,
            projects,
        };

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
