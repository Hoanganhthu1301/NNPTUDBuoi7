const fs = require('fs')

const privateKey = fs.readFileSync('./private.key')
var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
let { RegisterValidator, handleResultValidator } = require('../utils/validatorHandler')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let {checkLogin} = require('../utils/authHandler')
/* GET home page. */
router.post('/register', RegisterValidator, handleResultValidator, async function (req, res, next) {
    let newUser = userController.CreateAnUser(
        req.body.username,
        req.body.password,
        req.body.email,
        "69aa8360450df994c1ce6c4c"
    );
    await newUser.save()
    res.send({
        message: "dang ki thanh cong"
    })
});
router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let getUser = await userController.FindByUsername(username);
    if (!getUser) {
        res.status(403).send("tai khoan khong ton tai")
    } else {
        if (getUser.lockTime && getUser.lockTime > Date.now()) {
            res.status(403).send("tai khoan dang bi ban");
            return;
        }
        if (bcrypt.compareSync(password, getUser.password)) {
            await userController.SuccessLogin(getUser);
        let token = jwt.sign(
    { id: getUser._id },
    privateKey,
    {
        algorithm: "RS256",
        expiresIn: "30d"
    }
)
            res.send(token)
        } else {
            await userController.FailLogin(getUser);
            res.status(403).send("thong tin dang nhap khong dung")
        }
    }

});
router.get('/me',checkLogin,function(req,res,next){
    res.send(req.user)
})
router.post('/changepassword',checkLogin,async function(req,res){

    let {oldpassword,newpassword} = req.body

    if(!oldpassword || !newpassword){
        return res.status(400).send("thieu password")
    }

    if(newpassword.length < 6){
        return res.status(400).send("password moi phai >= 6 ky tu")
    }

    let user = req.user

    if(!bcrypt.compareSync(oldpassword,user.password)){
        return res.status(403).send("old password sai")
    }

    let hashPassword = bcrypt.hashSync(newpassword,10)

    user.password = hashPassword

    await user.save()

    res.send({
        message:"doi mat khau thanh cong"
    })

})

module.exports = router;