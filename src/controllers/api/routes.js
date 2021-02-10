const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middlewares/api/auth');
const getClientMiddleware = require('../../middlewares/api/get-client-middleware');
const getClientRoleMiddleware = require('../../middlewares/api/get-client-role-middleware');

// router.get('/', require('./home'));

router.post('/auth', require('./auth/auth'));

router.get('/me', authMiddleware, require('./me'));

router.get('/clients/:client_id/roles', authMiddleware, getClientMiddleware, require('./clients/roles/list'));
router.post('/clients/:client_id/roles', authMiddleware, getClientMiddleware, require('./clients/roles/store'));
router.get('/clients/:client_id/roles/:role_id', authMiddleware, getClientMiddleware, getClientRoleMiddleware, require('./clients/roles/show'));
router.put('/clients/:client_id/roles/:role_id', authMiddleware, getClientMiddleware, getClientRoleMiddleware, require('./clients/roles/update'));
router.delete('/clients/:client_id/roles/:role_id', authMiddleware, getClientMiddleware, getClientRoleMiddleware, require('./clients/roles/delete'));
router.get('/clients/:client_id/privileges', authMiddleware, getClientMiddleware, require('./clients/privileges/list'));

router.use(require('../../middlewares/api/error-404'));
router.use(require('../../middlewares/api/error-500'));

module.exports = router;
