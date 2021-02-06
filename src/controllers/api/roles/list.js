const sql = require('../../../helpers/sql');
const errorHandler = require('../../../helpers/error-handler');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { client_id } = req.params;

        const roles = await sql.getAll(`
            SELECT
                R.acl_role_id
                , R.name
                , R.is_owner
                , IFNULL(R2.acl_role_id, '') AS parent_acl_role_id
                , IFNULL(R2.name, '') AS parent_name
            FROM acl_roles R
            LEFT JOIN acl_roles R2 ON (R.parent_acl_role_id = R2.acl_role_id AND R2.deleted_at IS NULL)
            WHERE R.deleted_at IS NULL
            AND R.client_id = ?
            ORDER BY R.is_owner DESC, R.name;
        `, [
            client_id,
        ]);

        ret.addContent('roles', roles);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        return res.status(ret.getCode()).json(ret.generate());
    }
};
