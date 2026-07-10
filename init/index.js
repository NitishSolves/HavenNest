const mongoose = require("mongoose");
const initData = require("./data.js"); 
const Listing = require("../models/listing.js"); 

main()
   .then(() => {
    console.log("connected to db");
    initDB(); 
   })
   .catch((err) => console.log(err));

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) =>({
        ...obj,
        owner: "6a4dcf9a8367a612e024a825"
    }));
    await Listing.insertMany(initData.data); 
    console.log("data was initialized");
};
