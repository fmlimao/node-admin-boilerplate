const express = require('express');
const router = express.Router();

router.use('/api', require('./controllers/api/routes'));
router.use('/admin', require('./controllers/admin/routes'));
router.use('/', require('./controllers/site/routes'));

module.exports = router;
