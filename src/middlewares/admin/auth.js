const jwt = require('jsonwebtoken');
const axios = require('axios');
const checkAjaxResponse = require('../../helpers/check-ajax-response');

module.exports = async (req, res, next) => {
    try {
        const { auth } = req.cookies;
        if (!auth) throw new Error('Auth vazio');

        const { token } = auth;
        if (!token) throw new Error('Token vazio');

        const key = process.env.TOKEN_SECRET;
        const decodedToken = jwt.verify(token, key);
        if (!decodedToken.id) throw new Error('Token sem usuário');

        const url = `${process.env.APP_HOST}/api/me`;
        const { data } = await axios.get(url, {
            headers: {
                'x-access-token': token,
            },
        });

        const { user, clients, projects } = data.content.me;

        const roles = {
            'client-manager': true,
        };

        const privileges = {
            'client-dashboard': true,
            'client-users-list': true,
            'client-projects-list': true,
        };

        const authData = {
            token,
            user,
            clients,
            projects,
            roles,
            privileges,
        };

        req.auth = authData;
        res.locals.auth = authData;

        next();
    } catch (err) {
        res.clearCookie('auth');
        return res.redirect('/admin/login');
    }

};
