const sql = require('../../../helpers/sql');
const validator = require('../../../helpers/validator');
const errorHandler = require('../../../helpers/error-handler');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        ret.addFields(['name']);

        const { client_id } = req.params;
        const { name } = req.body;

        if (!validator(ret, {
            name,
        }, {
            name: 'required|string|min:3',
        })) {
            throw new Error('Verifique todos os campos.');
        }

        const role_id = await sql.insert(`
            INSERT INTO roles (name, client_id, is_owner)
            VALUES (?, ?, 0);
        `, [
            name,
            client_id,
        ]);

        const role = await sql.getOne(`
            SELECT
                R.role_id
                , R.name
                , R.is_owner
                , R.is_everyone
                , IFNULL(R2.role_id, '') AS parent_role_id
                , IFNULL(R2.name, '') AS parent_name
            FROM roles R
            LEFT JOIN roles R2 ON (R.parent_role_id = R2.role_id AND R2.deleted_at IS NULL)
            WHERE R.deleted_at IS NULL
            AND R.role_id = ?;
        `, [
            role_id,
        ]);

        ret.addContent('role', role);

        ret.setCode(201);
        ret.addMessage('Peril inserido com sucesso.');

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        return res.status(ret.getCode()).json(ret.generate());
    }
};
