const express = require('express');
const db = require('../../config/initDatabase');
const Joi = require('joi');
const router = express.Router();
const ensureAuth = require("../../middlewares/auth");
const bcrypt = require('bcrypt')

router.put('/resetpassword/', ensureAuth(), async(req, res)=>{
    try{
        const user = await db.user.findOne({
            where : {
                id : req.user.id
            }
        });
        if(user){
            const passwordObject = await validatePassword(req.body)

            const isValidPassword = await bcrypt.compare(
                passwordObject.password,
                user.password
            );

            if(!isValidPassword){
                return res.status(400).json({err : 'Ivalid credintials.'})
            }

            if(passwordObject.newPassword === passwordObject.newPasswordAgain){
                // First param in update is the new data.
                // If I need to change specify field; I should to write it in new data.
                // For example I just need to change only password, so I'll write field name (in object => {pass : ex})
                const saltRounds = 10;
                const myPlaintextPassword = req.body.newPassword;
                const hashedPassword = await bcrypt.hash(myPlaintextPassword, saltRounds);
                user.password = hashedPassword;
                await db.user.update({password : hashedPassword}, {
                    where : {
                        id : req.user.id
                    }
                });
                // where is the target data that I'll replace it with new.
                console.log(`PASS: ${user.password}`)
                
                return res.status(200).send('Reset password successfully.')
            }else{
                return res.status(400).send('Ivalid credintials')
            }
        }
    }catch(err){
        res.send(err.message);
        console.log(err);
    }
})
async function validatePassword(user) {
    const schema = Joi.object({
        password: Joi.string().required().alphanum().min(8).max(30),
        // .regex(/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,30}$/),
        newPassword: Joi.string().required().alphanum().min(8).max(30),
        newPasswordAgain: Joi.string().required().alphanum().min(8).max(30)
    });
    try {
        return await schema.validateAsync(user);
    } catch (err) {
        throw err;
    }
}

module.exports = router;