module.exports = (req, res, next) => {
    const { projects, roles } = req.auth;

    const clientProjects = projects.filter(project => project.client_id == req.currentClient.client_id);

    if (req.currentClient.is_owner == 0) {
        if (!roles['client-manager']) {
            if (clientProjects.length == 1) {
                if (req.route.path != `/my-clients/:my_client_id/my-projects/:my_project_id`) {
                    return res.redirect(`/admin/my-clients/${req.currentClient.client_id}/my-projects/${clientProjects[0].project_id}`);
                }
            } else {
                if (req.route.path != `/my-clients/:my_client_id/my-projects`) {
                    return res.redirect(`/admin/my-clients/${req.currentClient.client_id}/my-projects`);
                }
            }
        }
    }

    next();
};
