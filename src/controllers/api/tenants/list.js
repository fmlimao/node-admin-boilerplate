const knex = require('../../../database/connection');
const errorHandler = require('../../../helpers/error-handler');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const query = `
            SELECT T.tenant_id, T.name, T.inactive_at, T.is_owner
            FROM tenants T
            WHERE T.deleted_at IS NULL
            ORDER BY T.is_owner DESC, T.name;
        `;

        const tenants = (await knex.raw(query))[0];

        ret.addContent('tenants', tenants);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
