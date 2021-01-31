const knex = require('../../database/connection');
const errorHandler = require('../../helpers/error-handler');
const { RegisterNotFound } = require('../../helpers/exceptions');

module.exports = async (req, res, next) => {
    let ret = req.ret;

    try {
        const { tenant_id, order_id } = req.params;

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
            AND O.order_id = ?
            ORDER BY O.order_id;
        `;

        const args = [
            tenant_id,
            order_id,
        ];

        const order = (await knex.raw(query, args))[0];

        if (!order.length) {
            ret.setCode(404);
            throw new RegisterNotFound('Pedido não encontrado');
        }

        req.order = order[0];

        next();
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
