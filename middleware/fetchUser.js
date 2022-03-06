const jwt = require("jsonwebtoken");
const JWT_SECRET = "ye_ander_ki_baat_hai";

const fetchUser = (req, res, next) =>{
    //GET USER FROM JWT-TOKEN AND ADD User.id TO req OBJECT
    const token = req.header('auth-token');

    if(!token){
        res.status(401).send({error : "Please authenticate using valid token"});
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({error : "Please authenticate using valid token"});
    }
    
}

module.exports = fetchUser;