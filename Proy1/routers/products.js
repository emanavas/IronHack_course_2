
const config = require("#config/main_config.js")
const path = require('path');
const db = require("#root/config/db.js")
const { query } = require('express-validator');
const uuid = require('uuid')
const {mw_check_session} = require("#root/config/middleware.js")



// PRODUCTS
config.router.get("/products/", 
    async (req, res) => {
    
    //actions
    console.log("GET /products")
    try {
        const querry_res = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM products", (err, rows) => {
                if (err) {
                    res.status(500).send(err);
                    console.error('Error retrieving data:', err);
                    reject(err)
                    throw new Error(err);     
                }
                resolve(rows)
            });
        }); 
        console.log(querry_res)

        //response
        res.render('products', {session:req?.session, products:querry_res})
    } catch (error) {
        res.status(500).send(error);
    }
})

config.router.get("/products/new", 
    async (req, res) => {

    //actions
    console.log("GET /products/new")
    try {
        if(req?.token?.admin != true){
            res.status(400).json("no allowed access, need to be admin")
            return
        }
        res.render('products_new', {session:req.session})
    } catch (error) {
        res.status(500).send(error);
    }
})


config.router.post("/products/new",
    //validators 
    query('name').notEmpty().trim().isAscii(),
    query('description').notEmpty().isAscii(),
    query('price').notEmpty().isInt({min:1}),
    query('stock').notEmpty().isInt({min:1}),
    // query('role').notEmpty().isAscii().custom((value, { req }) => {
    //     return value.toLowerCase();
    // }).isIn(['admin', 'user']),
    async (req, res) => {

    //actions
    console.log("POST /products/new")
    try {
        if(req?.token?.admin != true){
            res.status(400).json("no allowed access, need to be admin")
            return
        }
        const name = req.body.name
        const description = req.body.description
        const price = req.body.price * 100
        const stock = req.body.stock
        await db.run("INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)", [name, description, price, stock]);
        console.log('Data inserted successfully');
        
        res.redirect('/products')
    } catch (error) {
        res.status(500).send(error);
    }
})


//delete
config.router.get("/products/delete/:id",
    async (req, res) => {

    //actions
    console.log("DEL /products/delete/:"+req.params.id)
    try {
        if(req?.token?.admin != true){
            res.status(400).json("no allowed access, need to be admin")
            return
        }
        const id = req.params.id
        await db.run("DELETE FROM products WHERE id = ?", [id]);
        console.log('Data deleted successfully');
        
        res.redirect('/products')
    } catch (error) {
        res.status(500).send(error);
    }
})


//EDIT
config.router.get("/products/edit/:id",
    async (req, res) => {

        //actions
        console.log("GET /products/edit/:"+req.params.id)
        try {
            if(req?.token?.admin != true){
                res.status(400).json("no allowed access, need to be admin")
                return
            }
            const id = req.params.id
            const querry_res = await new Promise((resolve, reject) => {
                //get record
                db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
                    if (err) {
                        res.status(500).send(err);
                        console.error('Error retrieving data:', err);
                        reject(err)
                        throw new Error(err);     
                    }
                    resolve(row)
                });
            }); 
            console.log(querry_res)
            
            //response
            res.render('products_edit', {session:req.session, product:querry_res})

        } catch (error) {
            res.status(500).send(error);
            console.error('Error inserting data:', error)
        }

});

config.router.post("/products/edit/:id",
    //validators 
    query('name').notEmpty().trim().isAscii(),
    query('description').notEmpty().isAscii(),
    query('price').notEmpty().isInt({min:1}),
    query('stock').notEmpty().isInt({min:1}),
    async (req, res) => {

        //actions
        console.log("POST /products/edit/:"+req.params.id)
        try {
            if(req?.token?.admin != true){
                res.status(400).json("no allowed access, need to be admin")
                return
            }
            const id = req.params.id
            const querry_res = await new Promise((resolve, reject) => {
                //edit record
                db.run("UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?", 
                    [req.body.name, req.body.description, req.body.price * 100, req.body.stock, id], (err, row) => {
                        if (err) {
                            res.status(500).send(err);
                            console.error('Error retrieving data:', err);
                            reject(err)
                            throw new Error(err);     
                        }
                        resolve(row)
                    });
            }); 
            console.log(querry_res)
            
            //response
            res.redirect('/products')
        } catch (error) {
            res.status(500).send(error);
            console.error('Error inserting data:', error)
        }

});
        

module.exports = config.router;



