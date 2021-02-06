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

        const acl_role_id = await sql.insert(`
            INSERT INTO acl_roles (name, client_id, is_owner)
            VALUES (?, ?, 0);
        `, [
            name,
            client_id,
        ]);

        const role = await sql.getOne(`
            SELECT
                R.acl_role_id
                , R.name
                , R.is_owner
                , IFNULL(R2.acl_role_id, '') AS parent_acl_role_id
                , IFNULL(R2.name, '') AS parent_name
            FROM acl_roles R
            LEFT JOIN acl_roles R2 ON (R.parent_acl_role_id = R2.acl_role_id AND R2.deleted_at IS NULL)
            WHERE R.deleted_at IS NULL
            AND R.acl_role_id = ?;
        `, [
            acl_role_id,
        ]);

        ret.addContent('role', role);

        ret.addMessage('Peril inserido com sucesso.');

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        return res.status(ret.getCode()).json(ret.generate());
    }
};
