const mongoose = require("mongoose");
require("dotenv").config();
const connectdb = async () => {
  mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser : true,
    useUnifiedTopology:true
}).then(()=>{console.log("DB connection successfully")})
.catch((err)=>{
    console.log(err);
    console.error(err);
});
};
mongoose.set("strictQuery", false);

module.exports = connectdb;

