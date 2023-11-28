const mongoose = require("mongoose");

const product = new mongoose.Schema(
    {
        category:{
            type:String,
            required:true,
            maxLength:50,
        },
        image: {
            type:String,
            required:true,
           
        },
        name:{
            type:String,
            required:true,
            maxLength:50,
        },
        price:{
            type:String,
            required:true,
            maxLength:50,
        }
    }
);

module.exports = mongoose.model("Product", product);