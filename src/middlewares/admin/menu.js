module.exports = (req, res, next) => {
    const { my_client_id, my_project_id } = req.params;
    res.locals.menu = res.locals.menu || [];

    if (req.auth.clients.length > 1 || req.url == '/admin/my-clients') {
        res.locals.menu.push({ html: `<li class="header">SELECIONAR CLIENTE</li>` });
        res.locals.menu.push({ html: `<li><a href="/admin/my-clients"><i class="fa fa-list"></i> <span>Meus Clientes</span></a></li>` });
    }

    if (req.currentClient) {
        if (req.currentClient.is_owner == 1) {
            res.locals.menu.push({ html: `<li class="header">MENU ADMIN</li>` });
            res.locals.menu.push({ html: `<li><a href="/admin/my-clients/${my_client_id}/dashboard"><i class="fa fa-dashboard"></i> <span>Dashboard</span></a></li>` });
            res.locals.menu.push({ html: `
                <li class="treeview" style="height: auto;">
                    <a href="#">
                        <i class="fa fa-lock"></i> <span>Permissões</span>
                            <span class="pull-right-container">
                            <i class="fa fa-angle-left pull-right"></i>
                        </span>
                    </a>
                    <ul class="treeview-menu" style="display: none;">
                        <li><a href="/admin/my-clients/${my_client_id}/roles"><i class="fa fa-circle-o"></i> Perfis</a></li>
                    </ul>
                </li>
            ` });
            res.locals.menu.push({ html: `<li><a href="/admin/my-clients/${my_client_id}/users"><i class="fa fa-users"></i> <span>Usuários</span></a></li>` });
            res.locals.menu.push({ html: `<li><a href="/admin/my-clients/${my_client_id}/clients"><i class="fa fa-users"></i> <span>Clientes</span></a></li>` });
        } else {
            if (
                req.auth.privileges['client-dashboard']
                || req.auth.privileges['client-users-list']
                || req.auth.privileges['client-projects-list']
            ) res.locals.menu.push({ html: `<li class="header">CLIENTE - ${req.currentClient.name.toUpperCase()}</li>` });
            if (req.auth.privileges['client-dashboard']) res.locals.menu.push({ html: `<li><a href="/admin/my-clients/${my_client_id}/dashboard"><i class="fa fa-dashboard"></i> <span>Dashboard</span></a></li>` });
            if (req.auth.privileges['client-users-list']) res.locals.menu.push({ html: `<li><a href="/admin/my-clients/${my_client_id}/users"><i class="fa fa-users"></i> <span>Usuários</span></a></li>` });
            if (req.auth.privileges['client-projects-list']) res.locals.menu.push({ html: `<li><a href="/admin/my-clients/${my_client_id}/projects"><i class="fa fa-list"></i> <span>Projetos</span></a></li>` });

            const clientProjects = req.auth.projects.filter(project => project.client_id == my_client_id);
            if (clientProjects.length > 1 || req.url == '/admin/my-clients/:my_client_id/my-projects') {
                res.locals.menu.push({ html: `<li class="header">SELECIONAR PROJETO</li>` });
                res.locals.menu.push({ html: `<li><a href="/admin/my-clients/${my_client_id}/my-projects"><i class="fa fa-list"></i> <span>Meus Projetos</span></a></li>` });
            }
        }
    }

    if (req.currentProject) {
        res.locals.menu.push({ html: `<li class="header">${req.currentClient.name.toUpperCase()} - ${req.currentProject.name.toUpperCase()}</li>` });
        res.locals.menu.push({ html: `<li><a href="/admin/my-clients/${my_client_id}/my-projects/${my_project_id}/dashboard"><i class="fa fa-dashboard"></i> <span>Dashboard</span></a></li>` });
    }

    next();
};
