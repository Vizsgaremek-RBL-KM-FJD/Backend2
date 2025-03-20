const express = require("express");
const router = express.Router();
const users = require("../services/users");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const SECRETKEY = process.env.SECRETKEY;

if (!SECRETKEY) {
    throw new Error("Missing SECRETKEY");
}

function authenticationToken(req, res, next) {
    const token = req.cookies?.token;
    console.log("Token:", req.cookies);

    if (!token) return res.status(401).json({ message: "Hozzáférés megtagadva, nincs token!" });

    jwt.verify(token, SECRETKEY, (err, user) => {
        if (err) return res.status(401).json({ message: "Hozzáférés megtagadva, érvénytelen token!" });
        req.user = user;
        console.log("User", req.user);
        next();
    });
}

router.get("/", async (req, res, next) => {
    try {
        res.json(await users.getUsers());
    } catch (err) {
        next(err);
    }
});

router.post("/register", async function (req, res, next) {
    let user = req.body;
    console.log(user);

    user.password = await bcrypt.hash(user.password, 10);
    try {
        res.json(await users.createUser(user));
    } catch (err) {
        next(err);
    }
});

router.post("/login", async function (req, res, next) {
    let { email, password } = req.body;
    console.log("email", email);

    try {
        const user = await users.getMail(email); 
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign({ id: user.id }, SECRETKEY, { expiresIn: "24h" }); 
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 3600000
            });

            const resUser = { ...user };
            res.status(200).json(resUser);
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } catch (err) {
        next(err);
    }
});

router.post("/logout", authenticationToken, async function (req, res, next) {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 0
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        next(err);
    }
});

router.get("/me", authenticationToken, async (req, res) => {
    try {
        const user = await users.getUserById(req.user.id);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Hiba történt!" });
    }
});

module.exports = router;
