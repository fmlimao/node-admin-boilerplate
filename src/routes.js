const express = require('express');
const router = express.Router();

router.use('/api', require('./controllers/api/routes'));
router.use('/admin', require('./controllers/admin/routes'));
router.use('/', require('./controllers/site/routes'));

router.use((req, res, next) => {
    res.status(404).render('site/error-404');
});

router.use((err, req, res, next) => {
    console.log('err', err);
    res.status(500).render('site/error-500');
});

module.exports = router;
