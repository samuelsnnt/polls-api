import jwt from 'jsonwebtoken';

const AuthMiddleware = function(req, res, next){
    const token = req.cookies.AuthToken;

    if(!token){
        return res.status(401).json({status: false, msg: 'Access denied!'});
    };
    try{
        const secret = process.env.SECRET;
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next()
    }catch(e){
        res.status(400).json({status: false, msg: 'Token invalid! Log in again.'});
    };
};

export default AuthMiddleware;