const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middlewares/api/auth');
// const getTenantMiddleware = require('../../middlewares/api/get-tenant-middleware');
// const getTenantUserMiddleware = require('../../middlewares/api/get-tenant-user-middleware');
// const getTenantOrderMiddleware = require('../../middlewares/api/get-tenant-order-middleware');
// const getTenantCategoryMiddleware = require('../../middlewares/api/get-tenant-category-middleware');

// router.get('/', require('./home'));

router.post('/auth', require('./auth/auth'));

router.get('/me', authMiddleware, require('./me'));

router.get('/clients/:client_id/roles', authMiddleware, require('./roles/list'));
router.post('/clients/:client_id/roles', authMiddleware, require('./roles/store'));
router.put('/clients/:client_id/roles/:acl_role_id', authMiddleware, require('./roles/update'));

// router.get('/tenants', authMiddleware, require('./tenants/list'));
// router.get('/tenants/:tenant_id', getTenantMiddleware, require('./tenants/show'));

// router.get('/tenants/:tenant_id/users', getTenantMiddleware, require('./tenants/users/list'));
// router.get('/tenants/:tenant_id/users/:user_id', getTenantMiddleware, getTenantUserMiddleware, require('./tenants/users/show'));

// router.get('/tenants/:tenant_id/orders', getTenantMiddleware, require('./tenants/orders/list'));
// router.get('/tenants/:tenant_id/orders/:order_id', getTenantMiddleware, getTenantOrderMiddleware, require('./tenants/orders/show'));

// router.get('/tenants/:tenant_id/categories', getTenantMiddleware, require('./tenants/categories/list'));
// router.get('/tenants/:tenant_id/categories/:category_id', getTenantMiddleware, getTenantCategoryMiddleware, require('./tenants/categories/show'));

router.use(require('../../middlewares/api/error-404'));
router.use(require('../../middlewares/api/error-500'));

module.exports = router;
