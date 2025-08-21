//                          I M P O R T I N G   M O D U L E S   A N D   M O D E L S

import express from 'express';
const router = express.Router()
import jwt from 'jsonwebtoken';
import bcrypt, { genSalt } from 'bcrypt';
import User from '../models/User.js';
import { minPassword } from '../config/utils.js';

//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

//                          R E G I S T E R
router.post('/register', async(req, res) => {
    try{
        const {name, email, password} = req.body;
        const token = req.cookies.AuthToken;

        //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        //                          V A L I D A T I O N S

        if(token){
            try{
                const decoded = jwt.verify(token);
                const userActual = await User.findById(decoded.id);
                if(!userActual){
                    res.clearCookie('AuthToken');
                    return res.status(404).json({ success: false, msg: 'User not found!'});
                };
                return res.status(200).json({ success: true, msg: "You are already logged in!" });
            }catch(e){
                res.clearCookie('AuthToken');
                return res.status(401).json({ success: false, msg: "Invalid token!" });
            };
        };

        // Validating if all fields are being filled in
        if(!name?.trim() || !email?.trim() || !password?.trim()) return res.status(400).json({status: false, msg: 'Fill in all fields'});

        // Validating password length
        if(password.length < minPassword) return res.status(400).json({status: false, msg: 'The minimum number of characters is '+minPassword+' characters.'})

        // Validating if the email is in use
        const userExist = await User.findOne({email: email});
        if(userExist) return res.status(401).json({status: false, msg: 'Email in use!'})

        // Hashing the password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        //                          C R E A T I N G

        const newUser = new User({
            name,
            email,
            password: passwordHash
        });
        try {
            await newUser.save();
            res.status(201).json({success: true, msg:'User successfully created!'});
        } catch(e) {
            res.status(500).json({success: false, msg: 'There was a server error: '+e})
        };
    }catch(e){
        res.status(500).json({status: false, msg: 'Error in server: '+e})
    };
});


//                          L O G I N
router.post('/login', async (req, res) => {
    try{
        const {name, email, password} = req.body;
        const token = req.cookies.AuthToken;
        const secret = process.env.SECRET;

        //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        //                          V A L I D A T I O N S

        if(token){
            try{
                const decoded = jwt.verify(token, secret);
                const userActual = await User.findById(decoded.id);
                if(!userActual){
                    res.clearCookie('AuthToken');
                    return res.status(404).json({ success: false, msg: 'User not found!'});
                };
                return res.status(200).json({ success: true, msg: "You are already logged in!" });
            }catch(e){
                res.clearCookie('AuthToken');
                return res.status(401).json({ success: false, msg: "Invalid token!" });
            };
        };

        // Validating if all fields are being filled in
        if(!name?.trim() || !email?.trim() || !password?.trim()) return res.status(400).json({status: false, msg: 'Fill in all fields'});
        
        // Validating if the email exists
        const userLogged = await User.findOne({email: email});
        if(!userLogged) return res.status(401).json({status: false, msg: 'Email not found!'});

        // Password validation  with hashed password
        const checkPassword = await bcrypt.compare(password, userLogged.password);
        if (!checkPassword) return res.status(401).json({ success: false, msg: "Invalid password!" });

        //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        //                          L O G I N   P R O C E S S
        try{
            const token = jwt.sign({id: userLogged._id, name: userLogged.name}, secret, {expiresIn: '604800s'});
            res.cookie('AuthToken', token, {
                httpOnly: true,
                secure: process.env.SECURE,
                maxAge: 604800 * 1000
            });
            return res.status(200).json({
                success: true,
                msg: "Authentication successfully!",
                data: {
                    user: {
                        id: userLogged._id,
                        name: userLogged.name,
                        email: userLogged.email
                    }
            }, token})
        }catch(e){
            return res.status(500).json({ success: false, msg: 'There was a server error: '+e });
        }
    }catch(e){
        res.status(500).json({status: false, msg: 'Error in server: '+e})
    };
});

router.post('/logout', async (req, res) => {
    try{
        const token = req.cookies.AuthToken;

        if(token){
            try{
                res.clearCookie('AuthToken');
                return res.status(404).json({ success: true, msg: 'User successfully logged out!'});
            }catch(e){
                return res.status(401).json({ success: false, msg: "Failed to log out!" });
            };
        }else{
            return res.status(401).json({ success: false, msg: "You are not logged in to log out!" });
        }
    }catch(e){
        res.status(500).json({status: false, msg: 'Error in server: '+e})
    };
});


export default router;