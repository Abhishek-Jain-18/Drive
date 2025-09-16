const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.models');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// this route will be : /user/register
router.get('/register', (req, res) => {
    res.render('register');
})

router.post('/register',
    body('email').trim().isEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('username').trim().isLength({ min: 3 }),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) { // error has occured
            return res.status(400).json({ // return
                errors: errors.array(),
                message: "Invalid data"
            })
        }
        const { username, email, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10); // 10 means 10 rounds of hashing, if this number is too high -> performance issue, too low -> security issue
        // 10 maintains the balance between performance and security
        const newUser = await userModel.create({
            username,
            email,
            password: hashPassword // password is stored in the form of hash, so that even if the database is compromised, hacker cannot access the accounts of users
        })
        res.json(newUser); // send in json format
    })

router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/login',
    body('username').trim().isLength({ min: 3 }),
    body('password').trim().isLength({ min: 5 }),

    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: "Invalid Data"
            })
        }

        const { username, password } = req.body;

        const user = await userModel.findOne({username: username});
        if(!user){
            res.status(400).json({
                message: "Username or Password is incorrect"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            res.status(400).json({
                message: "Username or Password is incorrect" // printing same message in both case for security reasons, so that hacker cannot get to know which one is wrong
            })
        }

        const token = jwt.sign({
            userId: user._id,
            username: user.username,
            email: user.email
        }, process.env.JWT_SECRET
        )
        
        res.cookie('token', token);
        
        res.send('Logged in')

        

    })

module.exports = router;
