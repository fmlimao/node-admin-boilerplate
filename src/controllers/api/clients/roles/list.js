const errorHandler = require('../../../../helpers/error-handler');
const RoleModel = require('../../../../models/roles');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { client_id } = req.params;

        const roles = await RoleModel.findAll(client_id);

        ret.addContent('roles', roles);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        return res.status(ret.getCode()).json(ret.generate());
    }
};
