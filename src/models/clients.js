const sql = require('../helpers/sql');

async function findById(client_id) {
    try {
        const client = await sql.getOne(`
            SELECT
                C.client_id
                , C.name
                , C.is_owner
            FROM clients C
            WHERE C.deleted_at IS NULL
            AND C.inactive_at IS NULL
            AND C.client_id = ?;
        `, [
            client_id,
        ]);

        if (!client) {
            return false;
        }

        return client;
    } catch (err) {
        return false;
    }
}

module.exports = {
    findById,
};
