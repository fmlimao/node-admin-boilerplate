const errorHandler = require('../../../../helpers/error-handler');
const PrivilegeModel = require('../../../../models/privileges');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { client_id } = req.params;

        const privileges = await PrivilegeModel.findAll(client_id);

        ret.addContent('privileges', privileges);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        return res.status(ret.getCode()).json(ret.generate());
    }
};
