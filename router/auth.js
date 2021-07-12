const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {

    //For Passport JWT Strategy

    // res.status(200).json({
    //     name: req.user.name,
    //     email: req.user.email
    // });

    // For Custom Passport Strategy

    res.status(200).json({
        name: req.user.data.name,
        email: req.user.data.email
    });
    
});

module.exports = router