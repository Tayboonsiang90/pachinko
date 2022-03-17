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
    entry = await getDB().collection("trader").insertOne({
        name: name,
        country: country,
        dateOfBirth: dateOfBirth,
        email: email,
        password: password,
        timestamp: new Date().getTime(),
        availableUSD: 0,
        inOrderUSD: 0,
    });

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
                _id: traderId_,
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
    await getDB().collection("trader").updateOne(
        {
            _id: traderId_,
        },
        {
            $set: { email },
        }
    );
}
//This function takes in validated password and changes the password of the trader with Id_ CHECKED
async function changeTraderPassword(traderId_, password) {
    await getDB().collection("trader").updateOne(
        {
            _id: traderId_,
        },
        {
            $set: { password },
        }
    );
}
//this function takes in a trader Id_ and delete the account CHECKED
async function deleteTrader(traderId_) {
    await getDB().collection("trader").deleteOne({
        _id: traderId_,
    });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Account USD Balances
//This function deposits USD, with quantity and trader Id_
async function depositTraderUSD(traderId_, quantity) {
    await getDB()
        .collection("trader")
        .updateOne(
            {
                _id: traderId_,
            },
            {
                $inc: { availableUSD: quantity },
            }
        );
}
//This function withdraws USD, with quantity and trader Id_
//this function will return false if the person don't have this amount of usd
async function withdrawTraderUSD(traderId_, quantity) {
    if (checkTraderUSD(traderId_).availableUSD >= quantity) {
        await getDB()
            .collection("trader")
            .updateOne(
                {
                    _id: traderId_,
                },
                {
                    $inc: { availableUSD: -quantity },
                }
            );
        return true;
    } else {
        return false;
    }
}
//This function adjust USD, with quantity and trader Id_
async function adjustTraderUSD(traderId_, availableUSDQuantity, inOrderUSDQuantity) {
    console.log("Adjust USD has been called for ", traderId_, availableUSDQuantity, inOrderUSDQuantity);
    await getDB()
        .collection("trader")
        .updateOne(
            {
                _id: traderId_,
            },
            {
                $inc: {
                    availableUSD: availableUSDQuantity,
                    inOrderUSD: inOrderUSDQuantity,
                },
            }
        );
}
//This function returns usd amount, given trader Id_
//returns an object with keys availableUSD and inOrderUSD
async function checkTraderUSD(traderId_) {
    let trader = await getDB().collection("trader").findOne({
        _id: traderId_,
    });
    return {
        availableUSD: trader.availableUSD,
        inOrderUSD: trader.inOrderUSD,
    };
}
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
    return await getDB().collection("coin").findOne({ _id: coinId_ });
}
//This function deposits coin, with quantity and trader Id_
//The requirement is to update both quantity in coin and deposit transaction collection
async function depositCoin(traderId_, coinId_, quantity) {
    let queryCoin = await getDB().collection("coin").findOne({
        _id: coinId_,
        "balances.traderId_": traderId_,
    });
    if (queryCoin) {
        //If The field can be found
        let newQty = queryCoin.balances[0].availableBalance + quantity;
        await getDB()
            .collection("coin")
            .updateOne(
                {
                    _id: coinId_,
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
                    _id: coinId_,
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
    queryCoin = await getDB().collection("coin").findOne({
        _id: coinId_,
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
                        _id: coinId_,
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
//This function adjusts coin balances for that trader id_ and that coinId_
//Check if there is an entry for that trader id_ in that coinId_
async function adjustCoin(traderId_, coinId_, availableBalanceQuantity, inOrderBalanceQuantity) {
    let queryCoin = await getDB().collection("coin").findOne({
        _id: coinId_,
        "balances.traderId_": traderId_,
    });
    console.log("Adjust coin has been called with parameters", traderId_, availableBalanceQuantity, inOrderBalanceQuantity);
    if (!queryCoin) {
        await getDB()
            .collection("coin")
            .updateOne(
                {
                    _id: coinId_,
                },
                {
                    $push: { balances: { traderId_: traderId_, availableBalance: 0, inOrderBalance: 0 } },
                }
            );
    }
    await getDB()
        .collection("coin")
        .updateOne(
            {
                _id: coinId_,
                "balances.traderId_": traderId_,
            },
            {
                $inc: {
                    "balances.$.availableBalance": availableBalanceQuantity,
                    "balances.$.inOrderBalance": inOrderBalanceQuantity,
                },
            }
        );
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
//This function changes
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
//Will add to Filled Order Stack
//Will add to Cancelled Order Stack
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//This function matches orders (assuming the trader has enough usd to place the trade)
async function createOpenOrder(coinId_, traderId_, price, quantity, type) {
    //check if buy or sell
    if (type == "BUY") {
        console.log("An incoming BUY order has been detected");
        //Retrieve the sell side orderbook for that coin
        let queryOrders = await getDB()
            .collection("openOrders")
            .find({
                //Only retrieve sell side orderbook to match
                coinId_: coinId_,
                type: "SELL",
            })
            .sort({
                //sort by timestamp first, then sort by price
                price: 1,
                timestamp: 1,
            })
            .toArray();

        //console.log("The SELL side for the orderbook is ", queryOrders);
        //Need to lock all read/writes to database while orderbook matching is done
        //Loop through the orderbook from smallest to largest
        let amountUSDPaid = 0; //keep track of usd paid for final price calculations
        let initialQuantity = quantity; //keep track of initial quantity buy ordered
        for (let order of queryOrders) {
            //Check if the buy order price is more/equals to sell order price
            if (price >= order.price) {
                if (quantity >= order.orderQuantity - order.filledQuantity) {
                    console.log("Remove the lowest SELL order");
                    //amount to buy is more than what order can fill at that price, hence we fill the sell order
                    //Remove the document from the open orders collection since the order has been filled
                    await getDB().collection("openOrders").deleteOne({
                        _id: order._id,
                    });
                    //Copy the order to filled orders collection
                    await getDB()
                        .collection("filledOrders")
                        .insertOne({
                            coinId_: order.coinId_,
                            traderId_: order.traderId_,
                            orderId_: order._id, //The original order id
                            orderPrice: order.price, //The price the order was set at
                            filledPrice: (order.usdTransacted + order.price * (order.orderQuantity - order.filledQuantity)) / order.orderQuantity, //The price the order was filled at
                            quantity: order.orderQuantity, //Amount
                            type: "SELL", //BUY/SELL
                            orderTimestamp: order.timestamp, //Timestamp when order was placed
                            filledTimestamp: new Date().getTime(), //Timestamp when order was filled
                        });
                    //Update Sellers USD (increase)
                    await adjustTraderUSD(order.traderId_, order.price * (order.orderQuantity - order.filledQuantity), 0);
                    //Update Sellers Coin Balance (decrease)
                    await adjustCoin(order.traderId_, order.coinId_, 0, -(order.orderQuantity - order.filledQuantity));
                    //Update Buyers USD (decrease)
                    await adjustTraderUSD(traderId_, -order.price * (order.orderQuantity - order.filledQuantity), 0);
                    //Update Buyers Coin Balance
                    await adjustCoin(traderId_, coinId_, order.orderQuantity - order.filledQuantity, 0);

                    amountUSDPaid += order.price * (order.orderQuantity - order.filledQuantity); //Update amount of usd paid
                    quantity -= order.quantity; //deduct off current quantity

                    console.log("Currently the BUY order has quantity ", quantity, " and amount USD Paid is ", amountUSDPaid);
                    //move on to the next item
                } else {
                    console.log("Partially fill the highest SELL order");
                    //buy quantity is less than the current SELL order size
                    //then we need to finish the buy order and adjust the current SELL order
                    await getDB()
                        .collection("openOrders")
                        .updateOne(
                            {
                                _id: order._id,
                            },
                            {
                                $set: { filledQuantity: order.filledQuantity + quantity }, //increment the filled quantity by the amount sold
                            }
                        );
                    //Update Sellers USD (increase)
                    await adjustTraderUSD(order.traderId_, order.price * quantity, 0);
                    //Update Sellers Coin Balance (decrease)
                    await adjustCoin(order.traderId_, order.coinId_, 0, -quantity);
                    //Update Buyers USD (decrease)
                    await adjustTraderUSD(traderId_, -order.price * quantity, 0);
                    //Update Buyers Coin Balance (increase)
                    await adjustCoin(traderId_, coinId_, quantity, 0);

                    amountUSDPaid += order.price * quantity; //Update amount of usd paid

                    //send BUY order to filled order collection
                    await getDB()
                        .collection("filledOrders")
                        .insertOne({
                            coinId_: coinId_,
                            traderId_: traderId_,
                            orderId_: new ObjectId(), //The original order id
                            orderPrice: price, //The price the order was set at
                            filledPrice: amountUSDPaid / initialQuantity, //The price the order was filled at
                            quantity: initialQuantity, //Amount
                            type: "BUY", //BUY/SELL
                            orderTimestamp: new Date().getTime(), //Timestamp when order was placed
                            filledTimestamp: new Date().getTime(), //Timestamp when order was filled
                        });

                    //completion of the MARKET ORDER. THIS HAS BEEN A MARKET ORDER
                    break;
                }
            } else {
                console.log("No price satisfy, so create a BUY order");
                //since the BID price is less than the LOWEST SELL order price, we make a new BUY limit order as an open order
                await getDB()
                    .collection("openOrders")
                    .insertOne({
                        coinId_: coinId_,
                        traderId_: traderId_,
                        price: price, //The price the order was set at
                        orderQuantity: initialQuantity,
                        filledQuantity: initialQuantity - quantity,
                        usdTransacted: amountUSDPaid,
                        type: "BUY", //BUY/SELL
                        timestamp: new Date().getTime(), //Timestamp when order was placed
                    });
                //Now we need to adjust the available balances
                //Update Buyers USD (move available to in order)
                await adjustTraderUSD(traderId_, -price * quantity, price * quantity);

                break;
            }
            //This part is for the queryorders = null case
            //then we just make a new BUY order!
            if (queryOrders.length == 0) {
                console.log("Empty orderbook detected, create BUY order");
                await getDB().collection("openOrders").insertOne({
                    coinId_: coinId_,
                    traderId_: traderId_,
                    price: price, //The price the order was set at
                    orderQuantity: quantity,
                    filledQuantity: 0,
                    usdTransacted: 0,
                    type: "BUY", //BUY/SELL
                    timestamp: new Date().getTime(), //Timestamp when order was placed
                });
                adjustTraderUSD(traderId_, -quantity * price, price * quantity);
            }
        }
    } else {
        console.log("An incoming SELL order has been detected");
        //For SELL orders
        //Retrieve the buy side orderbook for that coin
        let queryOrders = await getDB()
            .collection("openOrders")
            .find({
                //Only retrieve sell side orderbook to match
                coinId_: coinId_,
                type: "BUY",
            })
            .sort({
                //sort by timestamp first, then sort by price
                price: -1, //highest price first
                timestamp: 1,
            })
            .toArray();
        //console.log("The BUY side for the orderbook is ", queryOrders);
        //Need to lock all read/writes to database while orderbook matching is done
        //Loop through the BUY orderbook from largest price to smallest price
        let amountUSDRecieved = 0; //keep track of usd paid for final price calculations
        let initialQuantity = quantity; //keep track of initial quantity sell ordered
        for (let order of queryOrders) {
            //Check if the SELL order price is less/equals to buy order price
            if (price <= order.price) {
                if (quantity >= order.orderQuantity - order.filledQuantity) {
                    console.log("Remove the lowest BUY order");
                    //amount to sell is more than what order can fill at that price, hence we fill the buy order
                    //Remove the document from the open orders collection since the order has been filled
                    await getDB().collection("openOrders").deleteOne({
                        _id: order._id,
                    });
                    //Copy the order to filled orders collection
                    await getDB()
                        .collection("filledOrders")
                        .insertOne({
                            coinId_: order.coinId_,
                            traderId_: order.traderId_,
                            orderId_: order._id, //The original order id
                            orderPrice: order.price, //The price the order was set at
                            filledPrice: (order.usdTransacted + order.price * (order.orderQuantity - order.filledQuantity)) / order.orderQuantity, //The price the order was filled at
                            quantity: order.orderQuantity, //Amount
                            type: order.type, //BUY/SELL
                            orderTimestamp: order.timestamp, //Timestamp when order was placed
                            filledTimestamp: new Date().getTime(), //Timestamp when order was filled
                        });
                    //Update Buyers USD (decrease)
                    adjustTraderUSD(order.traderId_, 0, -order.price * (order.orderQuantity - order.filledQuantity));
                    //Update Buyers Coin Balance (increase)
                    adjustCoin(order.traderId_, order.coinId_, order.orderQuantity - order.filledQuantity, 0);
                    //Update Sellers USD (increase)
                    adjustTraderUSD(traderId_, order.price * (order.orderQuantity - order.filledQuantity), 0);
                    //Update Sellers Coin Balance (decrease)
                    adjustCoin(order.traderId_, order.coinId_, -(order.orderQuantity - order.filledQuantity), 0);

                    amountUSDRecieved += order.price * (order.orderQuantity - order.filledQuantity); //Update amount of usd recieved
                    quantity -= order.quantity; //deduct off current quantity

                    //move on to the next item
                } else {
                    console.log("Partially fill the lowest buy order");
                    //buy quantity is less than the current SELL order size
                    //then we need to finish the buy order and adjust the current SELL order
                    await getDB()
                        .collection("openOrders")
                        .updateOne(
                            {
                                _id: order._id,
                            },
                            {
                                $set: { filledQuantity: order.filledQuantity + quantity }, //increment the filled quantity by the amount sold
                            }
                        );
                    //Update Buyers USD (decrease)
                    adjustTraderUSD(order.traderId_, 0, -order.price * quantity);
                    //Update Buyers Coin Balance (increase)
                    adjustCoin(order.traderId_, order.coinId_, quantity, 0);
                    //Update Sellers USD (increase)
                    adjustTraderUSD(traderId_, order.price * quantity, 0);
                    //Update Sellers Coin Balance (decrease)
                    adjustCoin(traderId_, coinId_, -quantity, 0);

                    amountUSDRecieved += order.price * quantity; //Update amount of usd paid

                    //send SELL order to filled order collection
                    await getDB()
                        .collection("filledOrders")
                        .insertOne({
                            coinId_: coinId_,
                            traderId_: traderId_,
                            orderId_: new ObjectId(), //The original order id
                            orderPrice: price, //The price the order was set at
                            filledPrice: amountUSDRecieved / initialQuantity, //The price the order was filled at
                            quantity: initialQuantity, //Amount
                            type: "SELL", //BUY/SELL
                            orderTimestamp: new Date().getTime(), //Timestamp when order was placed
                            filledTimestamp: new Date().getTime(), //Timestamp when order was filled
                        });

                    //completion of the MARKET ORDER. THIS HAS BEEN A MARKET ORDER
                    break;
                }
            } else {
                console.log("No price satisfy, so create a SELL order");
                //since the SELL price is more than the HIGHEST BUY order price, we make a new SELL limit order as an open order
                await getDB()
                    .collection("openOrders")
                    .insertOne({
                        coinId_: coinId_,
                        traderId_: traderId_,
                        price: price, //The price the order was set at
                        orderQuantity: initialQuantity,
                        filledQuantity: initialQuantity - quantity,
                        usdTransacted: amountUSDRecieved,
                        type: "SELL", //BUY/SELL
                        timestamp: new Date().getTime(), //Timestamp when order was placed
                    });
                //Now we need to adjust the available balances
                //Update Buyers USD (move available to in order)
                adjustCoin(traderId_, coinId_, -quantity, quantity);
                //then we break out of the loop
                break;
            }
        }
        //This part is for the queryorders = null case
        //then we just make a new SELL order!
        if (queryOrders.length == 0) {
            console.log("Empty orderbook detected, create SELL order");
            await getDB().collection("openOrders").insertOne({
                coinId_: coinId_,
                traderId_: traderId_,
                price: price, //The price the order was set at
                orderQuantity: quantity,
                filledQuantity: 0,
                usdTransacted: 0,
                type: "SELL", //BUY/SELL
                timestamp: new Date().getTime(), //Timestamp when order was placed
            });
            adjustCoin(traderId_, coinId_, -quantity, quantity);
        }
    }
}

async function main() {
    const MONGO_URI = process.env.MONGO_URI;
    await connect(MONGO_URI, "pachinko");
    trader1Id_ = ObjectId("623200bdd2e41013b95ae73e");
    trader2Id_ = ObjectId("623200bdd2e41013b95ae73f");
    coinId_ = ObjectId("623200bdd2e41013b95ae740");

    // await getDB().collection("openOrders").remove();
    // await getDB().collection("coin").remove();
    // await getDB().collection("trader").remove();
    // await getDB().collection("cancelledOrders").remove();
    // await getDB().collection("depositTransactions").remove();
    // await getDB().collection("filledOrders").remove();
    // await getDB().collection("openOrders").remove();
    // await getDB().collection("withdrawalTransactions").remove();

    // populateFakeTrader(2);
    // createCoin("DOGE", "Dogecoin", "www.kek.com", "dogecoin");

    depositTraderUSD(trader1Id_, 10000);
    depositCoin(trader2Id_, coinId_, 10000);

    // await createOpenOrder(coinId_, trader2Id_, 1, 1000, "SELL");
    // await createOpenOrder(coinId_, trader2Id_, 1.1, 1000, "SELL");
    // await createOpenOrder(coinId_, trader2Id_, 1.2, 1000, "SELL");
    // await createOpenOrder(coinId_, trader2Id_, 1.3, 1000, "SELL");
    // await createOpenOrder(coinId_, trader2Id_, 1.4, 1000, "SELL");
    // await createOpenOrder(coinId_, trader2Id_, 1.5, 1000, "SELL");
    // await createOpenOrder(coinId_, trader1Id_, 0.9, 1000, "BUY");
    // await createOpenOrder(coinId_, trader1Id_, 0.8, 1000, "BUY");
    // await createOpenOrder(coinId_, trader1Id_, 0.7, 1000, "BUY");
    await createOpenOrder(coinId_, trader1Id_, 1, 1000, "BUY");
    // await createOpenOrder(coinId_, trader1Id_, 1, 800, "BUY");
    // await createOpenOrder(coinId_, trader1Id_, 1, 100, "BUY");

    console.log("Tests completed");
}

main();
