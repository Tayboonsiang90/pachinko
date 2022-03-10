require("dotenv").config();
const { getDB, connect } = require("./MongoUtil.js");

//Trader Stack Starts
//This function takes in validated create account form inputs and inserts a new trader document
async function createTrader(name, country, dateOfBirth, email, password) {
    await getDB().collection("trader").insertOne({ name, country, dateOfBirth, email, password });
}
//This function takes in a submitted email and password and retrieves the trader details
async function loginTrader(email, password) {
    await getDB().collection("trader").find

}
//This function takes in a submitted email and if email already being used
async function checkTraderEmail(email) {
    await getDB().collection("trader").find({
        
    })

}
//This function takes in validated email and changes the email of the trader with Id_
async function changeTraderEmail(traderId_, email) {
    await getDB().collection("trader").updateOne({
        '_id': ObjectId(traderId_)
    }, {
        '$set': {email}
    })
}
//This function takes in validated password and changes the password of the trader with Id_
async function changeTraderPassword(traderId_, password) {
    await getDB().collection("trader").updateOne({
        '_id': ObjectId(traderId_)
    }, {
        '$set': {password}
    })
}





//Create Account Stack Ends

async function main() {
    const MONGO_URI = process.env.MONGO_URI;
    await connect(MONGO_URI, "pachinko");
    console.log(getDB);

    allCoins = await getDB().collection("coin").find().toArray();
    console.log(allCoins);
}

main();
