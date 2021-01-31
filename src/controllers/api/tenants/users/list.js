const knex = require('../../../../database/connection');
const errorHandler = require('../../../../helpers/error-handler');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { tenant_id } = req.params;

        const query = `
            SELECT U.user_id, U.name, U.email
            FROM tenants T
            INNER JOIN tenant_users TU ON (T.tenant_id = TU.tenant_id AND TU.deleted_at IS NULL)
            INNER JOIN users U ON (TU.user_id = U.user_id AND U.deleted_at IS NULL)
            WHERE T.deleted_at IS NULL
            AND T.tenant_id = ?
            ORDER BY U.name;
        `;

        const args = [
            tenant_id,
        ];

        const users = (await knex.raw(query, args))[0];

        ret.addContent('users', users);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
