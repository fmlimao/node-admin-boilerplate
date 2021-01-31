const knex = require('../../../../database/connection');
const errorHandler = require('../../../../helpers/error-handler');

module.exports = async (req, res) => {
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
};
