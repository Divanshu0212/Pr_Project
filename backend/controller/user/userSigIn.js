const bcrypt = require ('bcryptjs')
const userModel = require('../../models/userModels')
const jwt = require('jsonwebtoken');

async function userSignInController(req,res) {
    try{
        const { email, password } = req.body

        if (!email){
            throw new Error("Please Provide email")
        }
        if (!password){
            throw new Error("Please Provide password")
        }

        const user = await userModel.findOne({email})

        if(!user){
            throw new Error("User not found")
        }

        const checkPassword = await bcrypt.compare(password,user.password)

        if(checkPassword) {
            const tokenData = {
                _id : user._id,
                email : user.email,
            }
            const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: 60 * 60 * 8 });

            const tokenOption = {
                httpOnly : true,
                secure : true
            }

            res.cookie("token",token,tokenOption).status(200).json({
                message : "Login Successfully",
                data : token,
                success : true,
                error : false,
            })

        }else{
            throw new Error("Please check your Password")
        }

    }catch(err){
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = userSignInController