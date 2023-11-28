const express = require("express");
const User = require("../models/user_model").User;
const Product = require("../models/product")
const jwt = require("jsonwebtoken");
const passport = require("passport");
const product = require("../models/product");
const validator = require('email-validator');
// GET Requests--------------------------------------------------------------
const index = (req, res) => {
  res.render("index");
};

const cart_get = (req, res) => {
  res.render("cart");
};

const content_get =async (req, res) => {
  const search= req.body;
  console.log(search);
  const productall = await Product.find({});
  console.log(productall);
  res.render('content', { productall });
  //res.render("content");
};

const sighUp_get = (req, res) => {
  res.render("./handel_users/sighUp");
};

const login_get = (req, res) => {
  res.render("./handel_users/login");
};

const logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
// End Get Requests--------------------------------------------------------------
// ******************************************************************************
// Start Post Requests-----------------------------------------------------------
const content_post =async (req, res) => {
  const search= req.body;
  console.log("in search field");
  console.log(search);
  const searchValue = search['search'];
  console.log(searchValue);  
  if(searchValue == ''){
    console.log("null");
    const productall = await Product.find({});
    console.log(productall);
  res.render('content', { productall });
  }
  else{
    console.log("not null");
    const productall = await Product.find({category:searchValue});
    console.log(productall);
  res.render('content', { productall });
  }
  
  
  //res.render("content");
};


const sighUp_post = async (req, res) => {
  console.log("in register models");
  const { email, password } = req.body;
  /*if (!validator.validate(email)) {
   res.status(400).json({ message: 'Invalid email address' });
  }*/
  try {
    const user = await User.create({ email, password });
    console.log("user created sucessfully");
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.redirect("login");
  } catch (err) {
    const error = handelError(err);
    console.log(err);
    res.redirect("login");
  }
};

const login_post = async (req, res) => {
  console.log("in login ");
  const { email, password } = req.body;
  try {
    
    const user = await User.login(email, password);
    if(user.verified === true){
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      //const productall = await Product.find({});
      //console.log(productall);
      //res.render('content', { productall });
       res.redirect("content");
    }else{
      res.send("not veridied");
    }
    
  } catch (err) {
    console.log("in error of login");
    const error = handelError(err);
    res.status(400).json({ error });
  }
};
// End Post Requests-----------------------------------------------------------
// ******************************************************************************
//general functions------------------------------------------------------------
//handel error
const handelError = (err) => {
  let error = { email: "", password: "" };
  if (err.message === "incorrect Email") {
    error.email = "That email is not registerd";
  }
  if (err.message === "incorrect Password") {
    error.password = "That password is not correct";
  }
  if (err.code === 11000) {
    error.email = "this email is already exist";
    return error;
  }
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      error[properties.path] = properties.message;
    });
  }
  return error;
};
//product

const product_get = async (req, res) => {
   console.log("in product");
  try {
    const productall = await Product.find({});
    console.log(productall);
    res.render('content', { productall });
  } catch (err) {
    const error = handelError(err);
    res.status(400).json({ error });
  }
};





// jwt func
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "saad secret test", {
    expiresIn: maxAge,
  });
};



module.exports = {
  index,
  content_get,
  sighUp_get,
  login_get,
  sighUp_post,
  login_post,
  logout_get,
  content_post,
  product_get,
  
  cart_get
};
