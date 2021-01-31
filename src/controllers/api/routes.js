const express = require('express');
const router = express.Router();
const knex = require('../../database/connection');
const errorHandler = require('../../helpers/error-handler');

const getTenantMiddleware = require('../../middlewares/api/get-tenant-middleware');
const getTenantUserMiddleware = require('../../middlewares/api/get-tenant-user-middleware');
const getTenantOrderMiddleware = require('../../middlewares/api/get-tenant-order-middleware');
const getTenantCategoryMiddleware = require('../../middlewares/api/get-tenant-category-middleware');

router.get('/', (req, res) => {
    const ret = req.ret;
    ret.addContent('status', 'ok');
    return res.status(ret.getCode()).json(ret.generate());
});

router.get('/tenants', async (req, res) => {
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
});

router.get('/tenants/:tenant_id', getTenantMiddleware, (req, res) => {
    let ret = req.ret;

    try {
        ret.addContent('tenant', req.tenant);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
});

router.get('/tenants/:tenant_id/users', getTenantMiddleware, async (req, res) => {
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
});

router.get('/tenants/:tenant_id/users/:user_id', getTenantMiddleware, getTenantUserMiddleware, async (req, res) => {
    let ret = req.ret;

    try {
        const user = req.user;

        ret.addContent('user', user);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
});

router.get('/tenants/:tenant_id/orders', getTenantMiddleware, async (req, res) => {
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
});

router.get('/tenants/:tenant_id/orders/:order_id', getTenantMiddleware, getTenantOrderMiddleware, async (req, res) => {
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
});

router.get('/tenants/:tenant_id/categories', getTenantMiddleware, async (req, res) => {
    let ret = req.ret;

    try {
        const { tenant_id } = req.params;
        const withProducts = parseInt(req.query.withProducts || 0);

        let queryWithProducts = {
            select: ``,
            from: ``,
            orderBy: ``,
        };

        if (withProducts == 1) {
            queryWithProducts = {
                select: `
                    , P.product_id
                    , P.name AS product_name
                    , P.\`order\` AS product_order
                    , P.price AS product_price
                `,
                from: `
                    INNER JOIN products P ON (T.tenant_id = P.tenant_id AND PC.product_category_id = P.product_category_id AND P.deleted_at IS NULL)
                `,
                orderBy: `
                    , P.\`order\`
                `,
            };
        }

        const queryCategories = `
            SELECT
                PC.product_category_id AS category_id
                , PC.name AS category_name
                , PC.\`order\` AS category_order
                ${queryWithProducts.select}
            FROM tenants T
            INNER JOIN product_categories PC ON (T.tenant_id = PC.tenant_id AND PC.deleted_at IS NULL)
            ${queryWithProducts.from}
            WHERE T.deleted_at IS NULL
            AND T.tenant_id = ?
            ORDER BY
                PC.\`order\`
                ${queryWithProducts.orderBy}
            ;
        `;

        const args = [
            tenant_id,
        ];

        const resultCategories = (await knex.raw(queryCategories, args))[0];

        let categories = resultCategories
            .reduce((a, c) => {
                const category_id = c.category_id;
                const category_name = c.category_name;
                const category_order = c.category_order;
                const product_id = c.product_id;
                const product_name = c.product_name;
                const product_order = c.product_order;
                const product_price = c.product_price;

                if (typeof a[`${category_order}_${category_id}`] == 'undefined') {
                    a[`${category_order}_${category_id}`] = {
                        category_id: category_id,
                        name: category_name,
                        order: category_order,
                    };

                    if (withProducts == 1) {
                        a[`${category_order}_${category_id}`].products = {};
                    }
                }

                if (withProducts == 1) {
                    if (typeof a[`${category_order}_${category_id}`].products[`${product_order}_${product_id}`] == 'undefined') {
                        a[`${category_order}_${category_id}`].products[`${product_order}_${product_id}`] = {
                            product_id: product_id,
                            name: product_name,
                            order: product_order,
                            price: product_price,
                        };
                    }
                }

                return a;
            }, {});

        categories = Object.values(categories);

        if (withProducts == 1) {
            categories = categories
                .map(category => {
                    category.products = Object.values(category.products);
                    return category;
                });
        }

        ret.addContent('categories', categories);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
});

router.get('/tenants/:tenant_id/categories/:category_id', getTenantMiddleware, getTenantCategoryMiddleware, async (req, res) => {
    let ret = req.ret;

    try {
        const category = req.category;

        ret.addContent('category', category);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
});

router.use((req, res, next) => {
    const ret = req.ret;
    ret.setError(true);
    ret.setCode(404);
    ret.addMessage('Rota não encontrada');
    res.status(ret.getCode()).json(ret.generate());
});

router.use((err, req, res, next) => {
    const ret = errorHandler(err, req.ret);
    res.status(ret.getCode()).json(ret.generate());
});

module.exports = router;
