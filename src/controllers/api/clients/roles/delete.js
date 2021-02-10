const moment = require('moment-timezone');
moment.locale('pt-br');
moment.tz('America/Sao_Paulo');

const errorHandler = require('../../../../helpers/error-handler');
const RoleModel = require('../../../../models/roles');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { client_id, role_id } = req.params;

        if (
            req.role.is_owner == 1
            || req.role.is_everyone == 1
        ) {
            ret.setCode(400);
            throw new Error('Este perfil não pode ser editado.');
        }

        await RoleModel.update(client_id, role_id, {
            deleted_at: moment().format('YYYY-MM-DD HH:mm:ss'),
        });

        ret.setCode(204);
        ret.addMessage('Peril deletado com sucesso.');

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        return res.status(ret.getCode()).json(ret.generate());
    }
};
