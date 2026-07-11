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
    await mongoose.connect(process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/havennest");
}

const inferCategory = (listing) => {
    const text = `${listing.title} ${listing.description} ${listing.location}`.toLowerCase();
    if (text.includes("castle")) return "castles";
    if (text.includes("pool") || text.includes("villa")) return "pools";
    if (text.includes("camp") || text.includes("cabin") || text.includes("treehouse")) return "camping";
    if (text.includes("mountain") || text.includes("ski") || text.includes("banff") || text.includes("aspen")) return "mountains";
    if (text.includes("island") || text.includes("beach") || text.includes("boat")) return "boats";
    if (text.includes("city") || text.includes("downtown") || text.includes("apartment") || text.includes("loft")) return "iconic-cities";
    return "trending";
};

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) =>({
        ...obj,
        category: inferCategory(obj),
        owner: "6a4dcf9a8367a612e024a825"
    }));
    await Listing.insertMany(initData.data); 
    console.log("data was initialized");
};
