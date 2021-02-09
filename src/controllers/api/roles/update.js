const sql = require('../../../helpers/sql');
const validator = require('../../../helpers/validator');
const errorHandler = require('../../../helpers/error-handler');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        ret.addFields(['name', 'parent_role_id']);

        const { client_id, role_id } = req.params;
        const { name, parent_role_id } = req.body;

        const roleExists = await sql.getOne(`
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
            AND R.role_id = ?
            ORDER BY R.is_owner DESC, R.name;
        `, [
            client_id,
            role_id,
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

        if (!validator(ret, {
            name,
            parent_role_id,
        }, {
            name: 'string|min:3',
            parent_role_id: 'integer',
        })) {
            throw new Error('Verifique todos os campos.');
        }

        if (role_id == parent_role_id) {
            ret.setCode(404);
            ret.setFieldError('parent_role_id', true);
            ret.addFieldMessage('parent_role_id', 'Perfil Pai não pode ser igual ao perfil editado.');
            throw new Error('Verifique todos os campos.');
        }

        if (parent_role_id) {
            const parentRoleExists = await sql.getOne(`
                SELECT R.role_id, R.is_owner, R.is_everyone
                FROM roles R
                WHERE R.deleted_at IS NULL
                AND R.client_id = ?
                AND R.role_id = ?;
            `, [
                client_id,
                parent_role_id,
            ]);

            if (!parentRoleExists) {
                ret.setCode(404);
                ret.setFieldError('parent_role_id', true);
                ret.addFieldMessage('parent_role_id', 'Perfil Pai não encontrado.');
                throw new Error('Verifique todos os campos.');
            }

            if (
                parentRoleExists.is_owner == 1
                || parentRoleExists.is_everyone == 1
            ) {
                ret.setCode(400);
                ret.setFieldError('parent_role_id', true);
                ret.addFieldMessage('parent_role_id', 'Perfil Pai não pode ser usado.');
                throw new Error('Verifique todos os campos.');
            }
        }

        const fieldsUpdate = [];
        const argsUpdate = [];

        if (name) {
            fieldsUpdate.push('name = ?');
            argsUpdate.push(name);
        }

        if (roleExists.is_owner == 0) {
            if (typeof parent_role_id !== 'undefined') {
                fieldsUpdate.push('parent_role_id = ?');
                argsUpdate.push(parent_role_id ? parent_role_id : null);
            }
        }

        if (!fieldsUpdate.length) {
            ret.setCode(400);
            throw new Error('Nenhum campo para editar.');
        }

        argsUpdate.push(role_id);

        await sql.update(`
            UPDATE roles
            SET ${fieldsUpdate.join(', ')}
            WHERE role_id = ?;
        `, argsUpdate);

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
            AND R.role_id = ?
            ORDER BY R.is_owner DESC, R.name;
        `, [
            role_id,
        ]);

        ret.addContent('role', role);

        ret.addMessage('Peril editado com sucesso.');

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        return res.status(ret.getCode()).json(ret.generate());
    }
};
