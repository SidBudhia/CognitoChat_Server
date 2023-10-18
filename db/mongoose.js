const mongoose = require("mongoose")


const url =process.env.DATABASE;

mongoose.connect(url, {
    //useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //useFindAndModify: false
}).then(()=>{
    console.log("Connect to database...");
}).catch((err)=>{
    console.log(err);
}) 