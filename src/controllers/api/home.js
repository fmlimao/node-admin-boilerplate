module.exports = (req, res) => {
    const ret = req.ret;
    ret.addContent('status', 'ok');
    return res.status(ret.getCode()).json(ret.generate());
};
