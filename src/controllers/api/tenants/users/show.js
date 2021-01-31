const knex = require('../../../../database/connection');
const errorHandler = require('../../../../helpers/error-handler');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const user = req.user;

        ret.addContent('user', user);

        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
