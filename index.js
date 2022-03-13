require("dotenv").config();
const { ObjectId, Db } = require("mongodb");
const { getDB, connect } = require("./MongoUtil.js");

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Trader Stack Starts
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Account Creation
//This function checks if an email is keyed in valid REGEX
//Return true if it is a valid email, return false if it is an invalid email CHECKED
function checkTraderEmailRegex(email) {
    isValid = email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return isValid ? true : false;
}
//This function checks if an password is keyed in valid REGEX (minimum 6 character, 1 letter 1 number)
//Return true if it is a valid password, return false if it is an invalid password CHECKED
function checkTraderPasswordRegex(password) {
    isValid = password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/);
    return isValid ? true : false;
}
//This function takes in a submitted email and if email already being used
//Returns true if its being used, false if its not being used CHECKED
async function checkTraderEmailRepeat(email) {
    let trader = await getDB().collection("trader").findOne({ email });
    return trader ? true : false;
}
//This function takes in validated create account form inputs and inserts a new trader document CHECKED
//Returns the id_ of the newly created trader
async function createTrader(name, country, dateOfBirth, email, password) {
    entry = await getDB().collection("trader").insertOne({ name: name, country: country, dateOfBirth: dateOfBirth, email: email, password: password, timestamp: new Date().getTime() });

    return entry.insertedId.toString();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Account Login
//This function takes in a submitted email and password and retrieves the trader details
//It will return a falsely value of the trader isn't found, otherwise it will be the full trader details CHECKED
async function loginTrader(email, password) {
    let trader = await getDB().collection("trader").findOne({ email, password });
    return trader;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Account Dashboard
//This function takes in a trader Id_ and password and check if it matches the database
//It will return falsely if the trader password is incorrect, otherwise true CHECKED
async function validatePassword(traderId_, password) {
    let trader = await getDB()
        .collection("trader")
        .findOne(
            {
                _id: ObjectId(traderId_),
            },
            {
                projection: {
                    _id: 0,
                    password: 1,
                },
            }
        );
    return trader.password == password;
}
//This function takes in validated email and changes the email of the trader with Id_ CHECKED
async function changeTraderEmail(traderId_, email) {
    await getDB()
        .collection("trader")
        .updateOne(
            {
                _id: ObjectId(traderId_),
            },
            {
                $set: { email },
            }
        );
}
//This function takes in validated password and changes the password of the trader with Id_ CHECKED
async function changeTraderPassword(traderId_, password) {
    await getDB()
        .collection("trader")
        .updateOne(
            {
                _id: ObjectId(traderId_),
            },
            {
                $set: { password },
            }
        );
}
//this function takes in a trader Id_ and delete the account CHECKED
async function deleteTrader(traderId_) {
    await getDB()
        .collection("trader")
        .deleteOne({
            _id: ObjectId(traderId_),
        });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Populate database with fake names
let fakeNames = "Kolt Devyn Marin Axl Ricky Alijah Austin Gerard Eddie Felix Kale Tala Jayda Saphira Kendal Zamir Kelis Destiny Dominic Sunny Jessica Blanca Makiyah Madelynn Chaz Skyla Kaeden Raya Ashtyn Korbin Taha Easton Slade Audrina Dash Graciela Rosemarie Tobin Robin Onyx".split(" ");
let fakeCountries =
    "Afghanistan, Albania, Algeria, American Samoa, Andorra, Angola, Anguilla, Antarctica, Antigua and Barbuda, Argentina, Armenia, Aruba, Australia, Austria, Azerbaijan, Bahamas, Bahrain, Bangladesh, Barbados, Belarus, Belgium, Belize, Benin, Bermuda, Bhutan, Bolivia, Bosnia and Herzegovina, Botswana, Bouvet Island, Brazil, British Indian Ocean Territory, Brunei Darussalam, Bulgaria, Burkina Faso, Burundi, Cambodia, Cameroon, Canada, Cape Verde, Cayman Islands, Central African Republic, Chad, Chile, China, Christmas Island, Cocos (Keeling Islands), Colombia, Comoros, Congo, Cook Islands, Costa Rica, , Cote D'Ivoire (Ivory Coast), Hrvatska, Cuba, Cyprus, Czech Republic, Denmark, Djibouti, Dominica, Dominican Republic, East Timor, Ecuador, Egypt, El Salvador, Equatorial Guinea, Eritrea, Estonia, Ethiopia, Falkland Islands,France, Metropolitan, French Guiana, French Polynesia, French Southern Territories, Gabon, Gambia, Georgia, Germany, Ghana, Gibraltar, Greece, Greenland, Grenada, Guadeloupe, Guam, Guatemala, Guinea, Guinea-Bissau, Guyana, Haiti, Heard and McDonald Islands, Honduras, Hong Kong, Hungary, Iceland, India, Indonesia, Iran, Iraq, Ireland, Israel, Italy, Jamaica, Japan, Jordan, Kazakhstan, Kenya, Kiribati, Korea (North), Korea (South), Kuwait, Kyrgyzstan, Laos, Latvia, Lebanon, Lesotho, Liberia, Libya, Liechtenstein, Lithuania, Luxembourg, Macau, Macedonia, Madagascar, Malawi, Malaysia, Maldives, Mali, Malta, Marshall Islands, Martinique, Mauritania, Mauritius, Mayotte, Mexico, Micronesia, Moldova, Monaco, Mongolia, Montserrat, Morocco, Mozambique, Myanmar, Namibia, Nauru, Nepal, Netherlands, Netherlands Antilles, New Caledonia, New Zealand, Nicaragua, Niger, Nigeria, Niue, Norfolk Island, Northern Mariana Islands, Norway, Oman, Pakistan, Palau, Panama, Papua New Guinea, Paraguay, Peru, Philippines, Pitcairn, Poland, Portugal, Puerto Rico, Qatar, Reunion, Romania, Russian Federation, Rwanda, Saint Kitts and Nevis, Saint Lucia, Saint Vincent and The Grenadines, Samoa, San Marino, Sao Tome and Principe, Saudi Arabia, Senegal, Seychelles, Sierra Leone, Singapore, Slovak Republic, Slovenia, Solomon Islands, Somalia, South Africa, S. Georgia and S. Sandwich Isls., Spain, Sri Lanka".split(
        ","
    );
let start = new Date(1980, 1, 1);
let end = new Date(2002, 1, 1);

function populateFakeTrader(times) {
    for (let i = 0; i < times; i++) {
        let name = fakeNames[Math.floor(Math.random() * fakeNames.length)] + " " + fakeNames[Math.floor(Math.random() * fakeNames.length)];
        let country = fakeCountries[Math.floor(Math.random() * fakeCountries.length)].trim();
        let dateOfBirth = start.getTime() + Math.random() * (end.getTime() - start.getTime());
        let email = fakeNames[Math.floor(Math.random() * fakeNames.length)].toLowerCase() + Math.floor(Math.random() * 1000) + "@gmail.com";
        let password = "rotiprata" + Math.floor(Math.random() * 1000);

        createTrader(name, country, dateOfBirth, email, password);
    }
}
//Trader Stack Ends

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Coin Stack Starts
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//This function takes in ticker and coinName and add an entry
//Return Id_ of newly formed coin
async function createCoin(ticker, coinName, imageURL, coingeckoCoinID) {
    entry = await getDB().collection("coin").insertOne({
        ticker: ticker,
        coinName: coinName,
        balances: [],
        imageURL: imageURL,
        coingeckoCoinID: coingeckoCoinID,
    });

    return entry.insertedId.toString();
}
//This function takes in a coin Id_ and returns the details of the coin
async function getCoinDetails(coinId_) {
    return await getDB()
        .collection("coin")
        .findOne({ _id: ObjectId(coinId_) });
}
//This function deposits coin, with quantity and trader Id_
//The requirement is to update both quantity in coin and deposit transaction collection
async function depositCoin(traderId_, coinId_, quantity) {
    queryCoin = await getDB()
        .collection("coin")
        .findOne({
            _id: ObjectId(coinId_),
            "balances.traderId_": traderId_,
        });
    if (queryCoin) {
        //If The field can be found
        let newQty = queryCoin.balances[0].availableBalance + quantity;
        await getDB()
            .collection("coin")
            .updateOne(
                {
                    _id: ObjectId(coinId_),
                    "balances.traderId_": traderId_,
                },
                {
                    $set: { "balances.$.availableBalance": newQty },
                }
            );
    } else {
        //If the field cannot be found
        await getDB()
            .collection("coin")
            .updateOne(
                {
                    _id: ObjectId(coinId_),
                },
                {
                    $push: { balances: { traderId_: traderId_, availableBalance: quantity, inOrderBalance: 0 } },
                }
            );
    }
    await getDB().collection("depositTransactions").insertOne({
        traderId_: traderId_,
        coinId_: coinId_,
        quantity: quantity,
        timestamp: new Date().getTime(),
    });
}
//This function tries to withdraws coin, with quantity and trader Id_
//This function will return true once withdrawal is completed (case 3)
//This function will return false if available balance is < quantity (case 2)
//this function will return false if the person have never deposited this coin before (case 1)
async function withdrawCoin(traderId_, coinId_, quantity) {
    queryCoin = await getDB()
        .collection("coin")
        .findOne({
            _id: ObjectId(coinId_),
            "balances.traderId_": traderId_,
        });
    if (queryCoin) {
        //Case two: The person does not have enough funds to withdraw
        if (queryCoin.balances[0].availableBalance < quantity) {
            return false;
        } else {
            //Case three: Proceed with withdrawal

            newQty = queryCoin.balances[0].availableBalance - quantity;
            await getDB()
                .collection("coin")
                .updateOne(
                    {
                        _id: ObjectId(coinId_),
                        "balances.traderId_": traderId_,
                    },
                    {
                        $set: { "balances.$.availableBalance": newQty },
                    }
                );
            await getDB().collection("withdrawalTransactions").insertOne({
                traderId_: traderId_,
                coinId_: coinId_,
                quantity: quantity,
                timestamp: new Date().getTime(),
            });
            return true;
        }
    } else {
        //Case one: The person have never deposited
        return false;
    }
}
//This function checks all the coin balances for a trader given the trader Id_
//returns an array of the coins with the balances embedded inside
async function checkCoinBalances(traderId_) {
    queryCoin = await getDB()
        .collection("coin")
        .find({
            "balances.traderId_": traderId_,
        })
        .project({
            _id: 1,
            ticker: 1,
            coinName: 1,
            balances: { $elemMatch: { traderId_: traderId_ } },
            imageURL: 1,
            coingeckoCoinID: 1,
        })
        .toArray();
}
//Coin Stack Ends

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Deposit Transactions Stack Starts
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//This function returns a list of deposit transactions based on time start to time end (unix timestamps)
//If timeend isn't specified, then it is assumed to be today
//If timestart isn't specified, then its assumed to be 1 month
//coinId_ is a optional parameter
async function checkDepositTransactions(traderId_, timeStart = new Date().getTime() - 2629743000, timeEnd = new Date().getTime(), coinId_ = null) {
    if (coinId_) {
        queryObject = {
            traderId_: traderId_,
            coinId_: coinId_,
            timestamp: { $gte: timeStart, $lt: timeEnd },
        };
    } else {
        queryObject = {
            traderId_: traderId_,
            timestamp: { $gte: timeStart, $lt: timeEnd },
        };
    }
    queryCoin = await getDB().collection("depositTransactions").find(queryObject).toArray();
    return queryCoin;
}
//Deposit Transactions Stack Ends

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Withdrawal Transactions Stack Starts
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//This function returns a list of withdrawal transactions based on time start to time end (unix timestamps)
//If timeend isn't specified, then it is assumed to be today
//If timestart isn't specified, then its assumed to be 1 month
//coinId_ is a optional parameter
async function checkWithdrawalTransactions(traderId_, timeStart = new Date().getTime() - 2629743000, timeEnd = new Date().getTime(), coinId_ = null) {
    if (coinId_) {
        queryObject = {
            traderId_: traderId_,
            coinId_: coinId_,
            timestamp: { $gte: timeStart, $lt: timeEnd },
        };
    } else {
        queryObject = {
            traderId_: traderId_,
            timestamp: { $gte: timeStart, $lt: timeEnd },
        };
    }
    queryCoin = await getDB().collection("withdrawalTransactions").find(queryObject).toArray();
    return queryCoin;
}
//Withdrawal Transactions Stack Ends

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Open Order Stack Starts
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//This function
async function createOpenOrder(coinId_, traderId_, price, quantity, type) {
    //check if buy or sell
    if (type == "BUY") {
        //Retrieve the sell side orderbook for that coin
        queryOrders = await getDB()
            .collection("openOrders")
            .find({
                coinId_: coinId_,
                type: "SELL",
            })
            .toArray();
        //Need to lock all read/writes to database while orderbook matching is done
        //From the queries orders, burn down the quantity
        for (let i in queryOrders) {
            
        }
        
    }
}

async function main() {
    const MONGO_URI = process.env.MONGO_URI;
    await connect(MONGO_URI, "pachinko");
    traderId_ = "6229ede73fc6b138a1bcd899";
    coinId_ = "622cde8ecfcf5392d3e96ac5";

    //let coinId_ = await createCoin("CAT", "catcoin", "www.kek.com", "catcoin");
    //await depositCoin(traderId_, coinId_, 8000);
    //await withdrawCoin(traderId_, coinId_, 2000);
    //checkCoinBalances(traderId_);
}

main();
