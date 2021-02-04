module.exports = (req, res) => {
    if (req.cookies.token) {
        return res.redirect('/admin');
    }

    res.render('admin/login', {
        layout: false,
    });
};
