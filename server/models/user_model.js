const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const findOrCreate = require('mongoose-findorcreate');
const nodemailer = require("nodemailer");
const crypto = require('crypto');
require("dotenv").config();

const Schema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter an email"],
    lowercase: true,
    //validate: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter an password"],
    minlength: [6, "Minimum password length is 6 characters "],
  },
  verified:{
    type:Boolean,
    default: false
  }
});

const userVerificationTokens = {};

// fire before user save to db
Schema.pre("save", async function (next) {
  const Salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, Salt);
  next();
});

Schema.plugin(findOrCreate);

Schema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect Password");
  }
  throw Error("incorrect Email");
};

Schema.post("save", async function (doc) {
  try {
    console.log("in email sending processes");
      console.log("DOC : ", doc)

      // transporter
      const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS
          },
      })

      // send mail 
      const memail = doc.email;
      const verificationToken = crypto.randomBytes(20).toString('hex');
      userVerificationTokens[memail] = verificationToken;
      const verificationLink = `http://localhost:3000/verify-email?email=${encodeURIComponent(memail)}&token=${verificationToken}`;

      const info = await transporter.sendMail({
          from: 'From Nikhil',
          to: doc.email,
          subject: "New Account is created succesfully",
          html: `<h1> Welcome to our website</h1><br><h2>Your Account has been created</h2><br><h2>Please click on the following link to verify your email:</h2><a href="${verificationLink}">${verificationLink}</a> `,
          //text: `Please click on the following link to verify your email: ${verificationLink}`
      })

      console.log("Info : ", info)
      console.log("in email sending processes ending ");
  }
  catch (err) {
      console.log(err);
  }
})




const User = mongoose.model("user", Schema);

module.exports = {User, userVerificationTokens};
