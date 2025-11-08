const jwt = require('jsonwebtoken');
const config = require('config');
const string_decoder = require("node:string_decoder");


module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({"success": false, "message": "No token provided"});
    }
    const token = authHeader.split(' ');

    if (!token) {
        return res.status(401).json({
            error: 'No token provided',
        })
    }
    if (token[0].toLowerCase() !== "bearer") {
        return res.status(401).json({"error": "Only accept Bearer token"})
    }
    if (!token[1]) {
        return res.status(401).json({error: 'No token provided'})
    }
    try{
        req.user = jwt.verify(token[1], process.env.SECRET_KEY)
        next()
    }catch (err){
        return res.status(500).json({"error": "Cant decode token", err: err.message})
    }
}

