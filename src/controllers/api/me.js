module.exports = (req, res) => {
    const ret = req.ret;
    ret.addContent('me', req.auth);
    return res.status(ret.getCode()).json(ret.generate());
};
