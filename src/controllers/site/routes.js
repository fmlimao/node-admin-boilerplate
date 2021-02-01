const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('site/index');
});

router.use((req, res, next) => {
    res.status(404).render('site/error-404');
});

router.use((err, req, res, next) => {
    console.log('err', err);
    res.status(500).render('site/error-500');
});

module.exports = router;
