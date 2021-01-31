const knex = require('../../../database/connection');
const errorHandler = require('../../../helpers/error-handler');

module.exports = (req, res) => {
    let ret = req.ret;

    try {
        ret.addContent('tenant', req.tenant);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
