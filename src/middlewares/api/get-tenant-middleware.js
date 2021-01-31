const knex = require('../../database/connection');
const errorHandler = require('../../helpers/error-handler');
const { RegisterNotFound } = require('../../helpers/exceptions');

module.exports = async (req, res, next) => {
    let ret = req.ret;

    try {
        const { tenant_id } = req.params;

        const query = `
            SELECT T.tenant_id, T.name, T.inactive_at, T.is_owner
            FROM tenants T
            WHERE T.deleted_at IS NULL
            AND T.tenant_id = ?;
        `;

        const args = [
            tenant_id,
        ];

        const tenant = (await knex.raw(query, args))[0];

        if (!tenant.length) {
            ret.setCode(404);
            throw new RegisterNotFound('Inquilino não encontrado');
        }

        req.tenant = tenant[0];

        next();
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
