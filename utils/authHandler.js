let jwt = require('jsonwebtoken')
let fs = require('fs')
let userController = require('../controllers/users')

const publicKey = fs.readFileSync('./public.key')

exports.checkLogin = async function(req,res,next){

    try{

        let authHeader = req.headers.authorization

        if(!authHeader){
            return res.status(401).send("khong co token")
        }

        let token = authHeader.split(" ")[1]

        let decoded = jwt.verify(token, publicKey,{
            algorithms:["RS256"]
        })

        let user = await userController.FindById(decoded.id)

        req.user = user

        next()

    }catch(err){
        res.status(401).send("token khong hop le")
    }

}