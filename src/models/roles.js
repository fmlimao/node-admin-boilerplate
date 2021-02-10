const sql = require('../helpers/sql');

async function findAll(client_id) {
    try {
        const privileges = await sql.getAll(`
            SELECT
                R.resource_id
                , R.name AS resource_name
                , P.privilege_id
                , P.name AS privilege_name
                , P.key AS privilege_key
            FROM privileges P
            INNER JOIN resources R ON (P.resource_id = R.resource_id AND P.deleted_at IS NULL)
            WHERE P.deleted_at IS NULL
            AND R.client_id = ?
            ORDER BY R.order, P.order;
        `, [
            client_id,
        ]);

        const roles = (await sql.getAll(`
            SELECT
                R.role_id
                , R.name
                , R.is_owner
                , R.is_everyone
                , R.privileges
            FROM roles R
            WHERE R.deleted_at IS NULL
            AND R.client_id = ?
            ORDER BY R.is_owner DESC, R.is_everyone, R.name;
        `, [
            client_id,
        ])).map(role => {
            const value = role.privileges;
            role.privileges = {};

            for (let i in privileges) {
                role.privileges[privileges[i].privilege_key] = !!(value & Math.pow(2, privileges[i].privilege_id));
            }

            return role;
        });

        return roles;
    } catch (err) {
        return false;
    }
}

async function findById(client_id, role_id) {
    try {
        const role = await sql.getOne(`
            SELECT
                R.role_id
                , R.name
                , R.is_owner
                , R.is_everyone
                , R.privileges
            FROM roles R
            WHERE R.deleted_at IS NULL
            AND R.client_id = ?
            AND R.role_id = ?;
        `, [
            client_id,
            role_id,
        ]);

        if (!role) {
            return false;
        }

        const privileges = await sql.getAll(`
            SELECT
                R.resource_id
                , R.name AS resource_name
                , P.privilege_id
                , P.name AS privilege_name
                , P.key AS privilege_key
            FROM privileges P
            INNER JOIN resources R ON (P.resource_id = R.resource_id AND P.deleted_at IS NULL)
            WHERE P.deleted_at IS NULL
            AND R.client_id = ?
            ORDER BY R.order, P.order;
        `, [
            client_id,
        ]);

        const value = role.privileges;
        role.privileges = {};

        for (let i in privileges) {
            role.privileges[privileges[i].privilege_key] = !!(value & Math.pow(2, privileges[i].privilege_id));
        }

        return role;
    } catch (err) {
        return false;
    }
}

async function insert(client_id, fields) {
    try {
        const fieldsInsert = ['client_id'];
        const valuesInsert = ['?'];
        const argsInsert = [client_id];

        for (let i in fields) {
            fieldsInsert.push(i);
            valuesInsert.push('?');
            argsInsert.push(fields[i]);
        }

        return await sql.insert(`
            INSERT INTO roles (${fieldsInsert.join(', ')})
            VALUES (${valuesInsert.join(', ')});
        `, argsInsert);
    } catch (err) {
        return false;
    }
}

async function update(client_id, role_id, fields) {
    try {
        const fieldsUpdate = [];
        const argsUpdate = [];

        for (let i in fields) {
            fieldsUpdate.push(`${i} = ?`);
            argsUpdate.push(fields[i]);
        }

        argsUpdate.push(client_id);
        argsUpdate.push(role_id);

        await sql.update(`
            UPDATE roles
            SET ${fieldsUpdate.join(', ')}
            WHERE client_id = ? AND role_id = ?;
        `, argsUpdate);
    } catch (err) {
        return false;
    }
}

module.exports = {
    findAll,
    findById,
    insert,
    update,
};
