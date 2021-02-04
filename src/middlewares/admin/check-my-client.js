module.exports = (req, res, next) => {
    const { my_client_id } = req.params;
    const { clients } = req.auth;

    const clientExists = clients.filter(client => client.client_id == my_client_id);

    if (!clientExists.length) {
        if (req.route.path != `/my-clients`) {
            return res.redirect(`/admin/my-clients`);
        }
    }

    req.currentClient = clientExists[0];
    res.locals.currentClient = clientExists[0];

    next();
};
