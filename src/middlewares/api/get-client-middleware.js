const errorHandler = require('../../helpers/error-handler');
const { RegisterNotFound } = require('../../helpers/exceptions');
const ClientModel = require('../../models/clients');

module.exports = async (req, res, next) => {
    let ret = req.ret;

    try {
        const { client_id } = req.params;

        const client = await ClientModel.findById(client_id);

        if (!client) {
            ret.setCode(404);
            throw new RegisterNotFound('Cliente não encontrado.');
        }

        req.client = client;

        next();
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
