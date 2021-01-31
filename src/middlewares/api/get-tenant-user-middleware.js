const knex = require('../../database/connection');
const errorHandler = require('../../helpers/error-handler');
const { RegisterNotFound } = require('../../helpers/exceptions');

module.exports = async (req, res, next) => {
    let ret = req.ret;

    try {
        const { tenant_id, user_id } = req.params;

        const query = `
            SELECT U.user_id, U.name, U.email
            FROM tenants T
            INNER JOIN tenant_users TU ON (T.tenant_id = TU.tenant_id AND TU.deleted_at IS NULL)
            INNER JOIN users U ON (TU.user_id = U.user_id AND U.deleted_at IS NULL)
            WHERE T.deleted_at IS NULL
            AND T.tenant_id = ?
            AND U.user_id = ?;
        `;

        const args = [
            tenant_id,
            user_id,
        ];

        const user = (await knex.raw(query, args))[0];

        if (!user.length) {
            ret.setCode(404);
            throw new RegisterNotFound('Usuário não encontrado');
        }

        req.user = user[0];

        next();
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
