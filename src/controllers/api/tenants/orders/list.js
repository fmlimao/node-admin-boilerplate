const knex = require('../../../../database/connection');
const errorHandler = require('../../../../helpers/error-handler');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { tenant_id } = req.params;

        const query = `
            SELECT
                O.order_id
                , O.final_price
                , O.created_at
                , O.received_at
                , O.prepared_at
                , O.delivered_at
                , O.canceled_at
            FROM tenants T
            INNER JOIN orders O ON (T.tenant_id = O.tenant_id AND O.deleted_at IS NULL)
            WHERE T.deleted_at IS NULL
            AND T.tenant_id = ?
            ORDER BY O.order_id;
        `;

        const args = [
            tenant_id,
        ];

        const orders = (await knex.raw(query, args))[0];

        ret.addContent('orders', orders);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
