module.exports = (req, res, next) => {
    const { clients } = req.auth;

    if (clients.length == 1) {
        if (req.route.path != `/my-clients/:my_client_id`) {
            return res.redirect(`/admin/my-clients/${clients[0].client_id}`);
        }
    } else {
        if (req.route.path != `/my-clients`) {
            return res.redirect(`/admin/my-clients`);
        }
    }

    next();
};
