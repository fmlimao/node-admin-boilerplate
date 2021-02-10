const validator = require('../../../../helpers/validator');
const errorHandler = require('../../../../helpers/error-handler');
const RoleModel = require('../../../../models/roles');

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

        const role_id = await RoleModel.insert(client_id, {
            name,
        });

        const role = await RoleModel.findById(client_id, role_id);

        ret.addContent('role', role);

        ret.setCode(201);
        ret.addMessage('Peril inserido com sucesso.');

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        return res.status(ret.getCode()).json(ret.generate());
    }
};
