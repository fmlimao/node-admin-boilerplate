const sql = require('../../helpers/sql');
const errorHandler = require('../../helpers/error-handler');
const { RegisterNotFound } = require('../../helpers/exceptions');
const RoleModel = require('../../models/roles');

module.exports = async (req, res, next) => {
    let ret = req.ret;

    try {
        const { client_id, role_id } = req.params;

        const role = await RoleModel.findById(client_id, role_id);

        if (!role) {
            ret.setCode(404);
            throw new RegisterNotFound('Perfil não encontrado.');
        }

        req.role = role;

        next();
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
