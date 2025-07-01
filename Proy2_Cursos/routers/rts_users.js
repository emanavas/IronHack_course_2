
const config = require("#config/main_config.js")
const path = require('path');
const db = require("#root/config/db.js")
const { query } = require('express-validator');
const uuid = require('uuid')
const jwt = require('jsonwebtoken');



config.router.post("/api/users/register", 
    //validators 
    query('name').notEmpty().trim().isAscii(),
    query('user').notEmpty().trim().isAscii(),
    query('password').notEmpty().isAscii(),
    query('role').notEmpty().isAscii().custom((value, { req }) => {
        return value.toLowerCase();
    }).isIn(['admin', 'user']),
    async (req, res) => {
    
    const name = req.body.name
    const user = req.body.user
    const password = req.body.password
    const role = req.body.role

    //actions
    try {
        await db.run("INSERT INTO users (name, user, password, role) VALUES (?, ?, ?, ?)", [name, user, password, role]);
        console.log('Data inserted successfully');
        req.session.user = name
        req.session.admin = role === 'admin' ? true : false
        req.session.save()

        //response
        res.send({name:name})
    } catch (error) {
        res.status(500).send(error);
        console.error('Error inserting data:', error)
    }
})


config.router.post("/api/users/login", 
    //validators 
    query('user').notEmpty().trim().isAscii(),
    query('password').notEmpty().isAscii(),
    async (req, res) => {
    
    const user = req.body.user
    const password = req.body.password

    //actions
    try {
        let querry_res = null
        await new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE user = ? AND password = ?", [user, password], (err, row) => {
                if (err) {
                    res.status(500).send(err);
                    console.error('Error retrieving data:', err);
                    reject(err)
                    throw new Error(err);     
                }
                if (row) {
                    querry_res = row

                    //create token
                    const token = jwt.sign({
                        name: row.name,
                        admin: row.role === 'admin' ? true : false,
                    }, process.env.TOKEN_SECRET)
                    req.session.user = row.name
                    req.session.admin = row.role === 'admin' ? true : false
                    req.session.token = token
                    req.session.save();
                    resolve("ok")
                }
            });
        }); 
        //response
        res.send({name:querry_res?.name})
    } catch (error) {
        res.status(500).send(error);
        console.error('Error inserting data:', error)
    }
})

config.router.get("/api/users/logout", async (req, res) => {
        req.session.destroy()
    res.redirect('/')
})

module.exports = config.router;



