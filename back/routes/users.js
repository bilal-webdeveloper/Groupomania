const express = require("express")
const app = express.Router()
const bcrypt = require("bcrypt")
const saltRounds = 10
const jwt = require("jsonwebtoken")
const multer = require("multer")

const db = require("../config/db.js")

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };
  

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./../front/images/profile-pictures")
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(" ").join("_")
        const extension = MIME_TYPES[file.mimetype]
        callback(null, name + Date.now() + '.' + extension)
    }
})

const upload = multer({storage})

app.post("/signup", (req, res) => {
    const { username, email, password } = req.body

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if(err) {
            console.log(err, "Something went wrong")
        } else {
            console.log("successfully registered")
        }
        db.query(
            "INSERT INTO Users (username, email, password, phone, job, website, github, linkedin, role) VALUES (?, ?, ?, '', '', '', '', '', 'visitor');",
            [username, email, hash],
            (err, result) => {
                if(err) {
                    res.status(403).json(err)
                } else {
                    res.status(200).json(result)
                }
            }
        )
    })
})

const verifyJWT = (req, res, next) => {
    const token = req.header("x-access-token")

    if(!token) {
        res.send("NEED A TOKEN !!!")
    } else {
        jwt.verify(token, "jwtSecret", (err, decoded) => {
            if(err) {
                res.json({ auth: false, message: "Authentification failed !!!"})
            } else {
                req.userId = decoded.id
                next()
            }
        })
    }
}

app.get("/userAuth", verifyJWT, (req, res) => {
    res.send("You are authentificated !!!!")
})

app.get("/login", (req, res) => {
    if (req.session.username) {
        res.send({ loggedIn: true, username: req.session.username })
    } else {
        res.send({ loggedIn: false })
    }
})

app.post("/login", (req, res) => {
    const { email, password } = req.body

    db.query(
        "SELECT * FROM Users WHERE email = ?",
        email,
        (err, result) => {
            if(err) {
                res.send({ err: err })
            }
            if(result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        const id = result[0].id
                        const token = jwt.sign({id}, "jwtSecret", {
                            expiresIn: 300,
                        })
                        req.session.username = result
                        res.json({ auth: true, token: token, email: email, result: result})
                        res.status(200)
                    } else {
                        res.json({ auth: false, message: "Email or password invalid" })
                        res.status(404)
                    }
                })
            }
            else {
                res.json({ auth: false, message: "this user does not exist" })
                res.status(404)
            }
        }
    )
})

app.get("/profile", (req, res) => {
    db.query("SELECT * FROM Users;", (err, result) => {
        if (err) {
            res.status(404).json(err)
        } else {
            res.status(200).json(result)
        }
    })
})

app.put("/edit-profile", (req, res) => {
    const { username, email, phone, job, website, github, linkedin, id } = req.body

    db.query(
        `UPDATE Users SET username = ?, email = ?, phone = ?, job = ?, website = ?, github = ?, linkedin = ? WHERE id = ${id};`,
        [username, email, phone, job, website, github, linkedin, id],
        (err, result) => {
            if(err) {
                res.status(400).json(err)
            } else {
                res.status(200).json({ result: result, username: username, email: email, phone: phone, job: job, website: website, github: github, linkedin: linkedin })
            }
        }
    )
})

app.put("/edit-picture", upload.single("file"), function(req, res) {
    const id = req.body.id
    const file = "images/profile-pictures/" + req.file.filename

    db.query(
        `UPDATE Users SET file = '${file}' WHERE id = ${id};`,
        [id, file],
        (err, result) => {
            if(err) {
                res.status(404).json(err)
            } else {
                res.status(200).json({ result: result, file: file })
            }
        }
    )
})

app.put("/remove", (req, res) => {
    const id = req.body.id
    db.query(
        `DELETE FROM Users WHERE id = ${id};`,
        id,
        (err, result) => {
            if(err) {
                res.status(401).json(err)
            } else {
                res.status(200).json(result)
            }
        }
    )
})

module.exports = app