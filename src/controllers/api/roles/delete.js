const sql = require('../../../helpers/sql');
const validator = require('../../../helpers/validator');
const errorHandler = require('../../../helpers/error-handler');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { client_id, acl_role_id } = req.params;

        const roleExists = await sql.getOne(`
            SELECT
                R.acl_role_id
                , R.name
                , R.is_owner
                , R.is_everyone
                , IFNULL(R2.acl_role_id, '') AS parent_acl_role_id
                , IFNULL(R2.name, '') AS parent_name
            FROM acl_roles R
            LEFT JOIN acl_roles R2 ON (R.parent_acl_role_id = R2.acl_role_id AND R2.deleted_at IS NULL)
            WHERE R.deleted_at IS NULL
            AND R.client_id = ?
            AND R.acl_role_id = ?
            ORDER BY R.is_owner DESC, R.name;
        `, [
            client_id,
            acl_role_id,
        ]);

        if (!roleExists) {
            ret.setCode(404);
            throw new Error('Perfil não encontrado.');
        }

        if (
            roleExists.is_owner == 1
            || roleExists.is_everyone == 1
        ) {
            ret.setCode(400);
            throw new Error('Este perfil não pode ser editado.');
        }

        await sql.update(`
            UPDATE acl_roles
            SET deleted_at = NOW()
            WHERE acl_role_id = ?;
        `, [
            acl_role_id,
        ]);

        ret.setCode(204);
        ret.addMessage('Peril deletado com sucesso.');

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        return res.status(ret.getCode()).json(ret.generate());
    }
};
