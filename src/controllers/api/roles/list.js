const sql = require('../../../helpers/sql');
const errorHandler = require('../../../helpers/error-handler');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { client_id } = req.params;

        const roles = await sql.getAll(`
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
            AND R.client_id = ?
            ORDER BY R.is_owner DESC, R.is_everyone, R.name;
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
