const knex = require('../../../../database/connection');
const errorHandler = require('../../../../helpers/error-handler');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { tenant_id, order_id } = req.params;

        const order = req.order;
        ret.addContent('order', order);

        const queryProducts = `
            SELECT
                P.product_id
                , P.name
                , OP.price
                , OP.amount
                , OP.final_price
                , OP.note
            FROM tenants T
            INNER JOIN orders O ON (T.tenant_id = O.tenant_id AND O.deleted_at IS NULL)
            INNER JOIN order_products OP ON (T.tenant_id = OP.tenant_id AND O.order_id = OP.order_id AND OP.deleted_at IS NULL)
            INNER JOIN products P ON (T.tenant_id = P.tenant_id AND OP.product_id = P.product_id AND P.deleted_at IS NULL)
            WHERE T.deleted_at IS NULL
            AND T.tenant_id = ?
            AND O.order_id = ?
            ORDER BY OP.order_product_id;
        `;

        const args = [
            tenant_id,
            order_id,
        ];

        const products = (await knex.raw(queryProducts, args))[0];
        ret.addContent('products', products);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
