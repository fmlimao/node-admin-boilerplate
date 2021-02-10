const sql = require('../helpers/sql');

async function findAll(client_id) {
    try {
        const privileges = await sql.getAll(`
            SELECT
                R.resource_id
                , R.name AS resource_name
                , R.order AS resource_order
                , AP.privilege_id
                , AP.name AS privilege_name
                , AP.description AS privilege_description
                , AP.key AS privilege_key
                , AP.order AS privilege_order
            FROM resources R
            INNER JOIN privileges AP ON (R.resource_id = AP.resource_id AND AP.deleted_at IS NULL)
            WHERE R.deleted_at IS NULL
            AND R.client_id = ?
            ORDER BY R.order, AP.order;
        `, [
            client_id,
        ]);

        return privileges;
    } catch (err) {
        return false;
    }
}

module.exports = {
    findAll,
};
