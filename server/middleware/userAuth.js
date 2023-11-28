const jwt = require("jsonwebtoken");
const User = require('../models/user_model').User;

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "saad secret test", (err, decodedtToken) => {
      if (err) {
        console.log(err);
        res.redirect("/login");
      } else {
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

const userCurrent =  (req , res , next) => {
  const token = req.cookies.jwt;
  if(token) {
    jwt.verify(token , "saad secret test" , async(err , decodedtToken) => {
      if(err){
        console.log(err);
        res.locals.user = null;
        next()
      }else{
        const user = await User.findById(decodedtToken.id);
        res.locals.user = user;
        next()
      }
    })
  }else {
    res.locals.user = null
    next()
  }
}
module.exports = {
    requireAuth,
    userCurrent 
};
