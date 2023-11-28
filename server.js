const express = require("express");
const app = express();
const connectdb = require("./server/database/connection");
const userRouter = require("./server/router/user_router");
const cookieParser = require("cookie-parser");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const passport = require("passport");
const User = require("./server/models/user_model").User;
const bodyParser = require("body-parser");
const session = require('express-session');
const Product = require("./server/models/product");

const userVerificationTokens = require("./server/models/user_model").userVerificationTokens;

require("dotenv").config();

app.use(bodyParser.json());
//usecookies
app.use(cookieParser());
// view engine
app.set("view engine", "ejs");
// url encoded
app.use(express.urlencoded({ extended: false }));
// json middelware
app.use(express.json());
// database
connectdb();
// assets
app.use(express.static("assets"));

app.use(userRouter);

app.use(bodyParser.urlencoded({
  extended: true
}));

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log("server is listening on 3000");
});



// cookies
app.get("/set-cookies", (req, res) => {
  //   res.setHeader("Set-Cookie", "newUser=true");
  res.cookie("newUser", false);
  res.cookie("isEmployee", true, { maxAge: 1000 * 60 * 60 * 24, secure: true });
  res.send("you got the cookie!");
});

app.get("/read-cookies", (req, res) => {
  const cookies = req.cookies;
  console.log(cookies.newUser);
  res.json(cookies);
});

/*

passport.use(User.createStrategy());
*/
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Configure the Google OAuth2.0 strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/secrets',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if the user already exists in the database based on their Google ID
    let user = await User.findOne({ email: profile.id });

    if (!user) {
        const user = await User.create({ email: profile.id, password:"123456" });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Define routes
//app.get('/', (req, res) => {
  //res.send('<a href="/auth/google">Login with Google</a>');
//});

// Initiate the Google OAuth2.0 authentication
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

// Callback route for handling the Google OAuth response
app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Redirect to a success page or perform additional actions here
    res.redirect('/success');
  }
);

app.get('/success', async(req, res) => {
  //res.send('Login successful!');
  const productall = await Product.find({});
  console.log(productall);
  res.render('content', { productall });
  
});

// Start the server
app.get('/verify-email', async(req, res) => {
  const { email, token } = req.query;

  // Check if the token matches the one stored for the user
  if (userVerificationTokens[email] === token) {
    // Perform email verification logic (e.g., update user status in the database)
    // In a real-world scenario, you would use a database to store user information and handle verification

    // Remove the token from memory after verification
    delete userVerificationTokens[email];
    console.log('Email verified successfully!');
    /*const user = await User.findOne({ email });
    user.verified = true;
    await user.save();*/
    const updatedUser = await User.findOneAndUpdate(
      { email, verified: false }, // Find the user by email and only update if "verified" is false
      { $set: { verified: true } }, // Update "verified" to true
      { new: true } // Return the updated document
    );

    return res.send('Email verified successfully!');
  }
  console.log('Invalid verification link.');
  return res.status(400).send('Invalid verification link.');
});



