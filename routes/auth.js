const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');

const JWT_SECRET = "ye_ander_ki_baat_hai";



// ROUTE 1 : CREATE USER USING POST: 'localhost:3000/api/auth/createuser' (NO LOGIN REQUIRED)
router.post('/createuser',
    // VALIDATOR (check for properness/correctness of values entered)
    [
        body('name', 'name should not be empty or length less than 3 characters!').isLength({ min: 3 }),
        body('email', 'email must be valid!').isEmail(),
        body('password', 'should not be less than 5 characters!').isLength({ min: 5 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // CREATING USER IF NO ERROR OR INVALIDITY FOUND
        try {
            // CHECK FOR UNIQUE USER
            let theUser = await User.findOne({ email: req.body.email })
            if (theUser) {
                return res.status(400).json({ errors: "Sorry a user already exists with the given Email." });
            }
            // CREATE THE USER
            // 1. SECURING PASSWORD BY CREATING HASH OF PASSWORD USING 'bcrypt' npm package
            const salt = await bcrypt.genSalt(10);
            const securedPass = await bcrypt.hash(req.body.password, salt);

            theUser = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: securedPass
            })
            // 2. Using JsonWebToken HERE I AM CREATING TOKEN AND PASSING IT INSTEAD OF PASSING USER (FOR USER SECURITY)
            const tokenData = {
                user: {
                    id: theUser.id
                }
            }
            const authToken = jwt.sign(tokenData, JWT_SECRET)
            res.json({ authToken });

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error!");
        }
    }
)


// ROUTE 2 : USER LOGIN USING POST: 'localhost:3000/api/auth/login' (LOGIN REQUIRED)
router.post('/login',
    // VALIDATOR (check for properness/correctness of values entered)
    [
        body('email', 'Please enter a valid email').isEmail(),
        body('password', 'Password should not be empty').exists()
    ],
    async (req, res) => {
        // CHECKING FOR ERRORS
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //IF NO ERROR OCCURED
        try {
            // CHECKING FOR THE USER EXIST OR NOT
            // CHECKING WITH EMAIL
            const { email, password } = req.body
            let theUser = await User.findOne({ email })
            if (!theUser) {
                return res.status(400).json({ errors: "Please try to login with correct credentials!" });
            }
            //CHECKING WITH PASSWORD
            const comparePassword = await bcrypt.compare(password, theUser.password);
            if (!comparePassword) {
                return res.status(400).json({ errors: "Pkease try to login with correct credentials!" });
            }

            // 2. HERE I AM CREATING TOKEN AND PASSING IT INSTEAD OF SENDING/PASSING ALL USER DETAILS ON LOGIN 
            //    SENDING/PASSING A TOKEN TO USER USING JsonWebToken (FOR USER SECURITY)
            const tokenData = {
                user: {
                    id: theUser.id
                }
            }
            const authToken = jwt.sign(tokenData, JWT_SECRET)
            res.json({ authToken });

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error!");
        }
    }
)

// ROUTE 3: GET LOGGEDIN USER DETAILS USING POST: 'localhost:3000/api/auth/getuser' (login required)
router.post('/getuser', fetchUser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error!");
    }
}
)


module.exports = router;