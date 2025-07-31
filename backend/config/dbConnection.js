const mongoose=require("mongoose");

const connectdb=async()=>{
    try{
        const connect=await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("Connection to the Database",connect.connection.host,connect.connection.name);
    }
    catch(err){
        console.log("some error occured",err);
        process.exit(1);
    }
}

module.exports=connectdb;