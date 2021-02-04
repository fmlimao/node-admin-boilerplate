const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middlewares/admin/auth');
const checkIfShouldBeClientMiddleware = require('../../middlewares/admin/check-if-should-be-client');
const checkMyClientMiddleware = require('../../middlewares/admin/check-my-client');
const checkIfShouldBeProjectMiddleware = require('../../middlewares/admin/check-if-should-be-project');
const checkMyProjectMiddleware = require('../../middlewares/admin/check-my-project');
const menuMiddleware = require('../../middlewares/admin/menu');

router.get('/login', require('./login/get'));
router.post('/login', require('./login/post'));
router.get('/logout', require('./login/logout'));

router.use(authMiddleware);

router.get('/', checkIfShouldBeClientMiddleware, (req, res) => {
    res.redirect('/admin/my-clients');
});

router.get('/my-clients', checkIfShouldBeClientMiddleware, menuMiddleware, (req, res) => {
    res.render('admin/my-clients');
});

router.get('/my-clients/:my_client_id', checkMyClientMiddleware, checkIfShouldBeProjectMiddleware, (req, res) => {
    const { my_client_id } = req.params;
    res.redirect(`/admin/my-clients/${my_client_id}/dashboard`);
});

router.get('/my-clients/:my_client_id/dashboard', checkMyClientMiddleware, checkIfShouldBeProjectMiddleware, menuMiddleware, (req, res) => {
    res.render('admin/dashboard');
});

router.get('/my-clients/:my_client_id/users', checkMyClientMiddleware, checkIfShouldBeProjectMiddleware, menuMiddleware, (req, res) => {
    res.render('admin/users');
});

router.get('/my-clients/:my_client_id/clients', checkMyClientMiddleware, checkIfShouldBeProjectMiddleware, menuMiddleware, (req, res) => {
    res.render('admin/clients');
});

router.get('/my-clients/:my_client_id/projects', checkMyClientMiddleware, checkIfShouldBeProjectMiddleware, menuMiddleware, (req, res) => {
    res.render('admin/projects');
});

router.get('/my-clients/:my_client_id/my-projects', checkMyClientMiddleware, checkIfShouldBeProjectMiddleware, menuMiddleware, (req, res) => {
    res.render('admin/my-projects');
});

router.get('/my-clients/:my_client_id/my-projects/:my_project_id', checkMyClientMiddleware, checkMyProjectMiddleware, (req, res) => {
    const { my_client_id, my_project_id } = req.params;
    res.redirect(`/admin/my-clients/${my_client_id}/my-projects/${my_project_id}/dashboard`);
});

router.get('/my-clients/:my_client_id/my-projects/:my_project_id/dashboard', checkMyClientMiddleware, checkMyProjectMiddleware, menuMiddleware, (req, res) => {
    res.render('admin/dashboard');
});


router.use((req, res, next) => {
    res.locals.menu = [];
    res.status(404).render('admin/error-404');
});

router.use((err, req, res, next) => {
    console.log('err', err);
    res.locals.menu = [];
    res.status(500).render('admin/error-500');
});

module.exports = router;
