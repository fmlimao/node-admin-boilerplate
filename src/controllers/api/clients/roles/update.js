const validator = require('../../../../helpers/validator');
const errorHandler = require('../../../../helpers/error-handler');
const RoleModel = require('../../../../models/roles');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        ret.addFields(['name']);

        const { client_id, role_id } = req.params;
        const { name } = req.body;

        if (
            req.role.is_owner == 1
            || req.role.is_everyone == 1
        ) {
            ret.setCode(400);
            throw new Error('Este perfil não pode ser editado.');
        }

        if (!validator(ret, {
            name,
        }, {
            name: 'string|min:3',
        })) {
            throw new Error('Verifique todos os campos.');
        }

        let fieldsCount = 0;
        const fieldsUpdate = {};

        if (name) {
            fieldsCount++;
            fieldsUpdate.name = name;
        }

        if (!fieldsCount) {
            ret.setCode(400);
            throw new Error('Nenhum campo para editar.');
        }

        await RoleModel.update(client_id, role_id, fieldsUpdate);

        const role = await RoleModel.findById(client_id, role_id);

        ret.addContent('role', role);

        ret.addMessage('Peril editado com sucesso.');

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        return res.status(ret.getCode()).json(ret.generate());
    }
};
