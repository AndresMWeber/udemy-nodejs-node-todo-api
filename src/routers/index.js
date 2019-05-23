const express = require('express')
const router = new express.Router()

router.get('/', async (req, res) => {
    try {
        res.status(200).send('Main')
    } catch (e) {
        res.status(400).send(e)
    }
});

module.exports = router