module.exports = (req, res, next) => {
    const { my_client_id, my_project_id } = req.params;
    const { projects, roles } = req.auth;

    const projectExists = projects.filter(project => project.project_id == my_project_id && project.client_id == my_client_id);

    if (!projectExists.length) {
        if (req.route.path != `/my-clients/:my_client_id/my-projects`) {
            return res.redirect(`/admin/my-clients/${my_client_id}/my-projects`);
        }
    }

    req.currentProject = projectExists[0];
    res.locals.currentProject = projectExists[0];

    next();
};
