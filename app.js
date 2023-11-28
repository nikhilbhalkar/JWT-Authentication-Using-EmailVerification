const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
//const User = require('./models/user_model'); // Import your user model
require("dotenv").config();
const connectdb = require("./server/database/connection");
const User = require("./server/models/user_model");
const app = express();
const port = process.env.PORT || 3000;


connectdb();
// Configure session middleware
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
app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

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

app.get('/success', (req, res) => {
  res.send('Login successful!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
