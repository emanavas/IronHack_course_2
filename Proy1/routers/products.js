
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
    if(req?.token?.admin != true){
        res.status(400).json("no allowed access, need to be admin")
        return
    }

    //actions
    console.log("GET /products/new")
    

    res.render('products_new', {session:req.session, error:message})

});

module.exports = config.router;



