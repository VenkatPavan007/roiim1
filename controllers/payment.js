const User = require('../models/User');
const request = require('request');
const randomString = require('randomstring');

var merchantCustomerId, customerId;
var email, result, hasCustomerId = 0;;

module.exports.getPayment = (req, res, next) => {
    res.render('./index.html');
}


module.exports.postData = (req, res, next) => {
    const merchantRefNum = randomString.generate(255);
    const token = req.body.token;
    const saveCard = req.body.saveCard;
    console.log("This is saveCard" + saveCard + typeof(saveCard));
    const amount = parseFloat(req.body.amount) * 100;
    
    email = req.body.email;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {  // user doesnt exists 
                console.log("User doesnt exists"); 
                const MerchCustID = randomString.generate(10);
                merchantCustomerId = MerchCustID;
                const newUser = new User({
                    email: email,
                    merchantCustomerId: merchantCustomerId
                })
                return newUser.save()
            }
            else {

                if (user.customerId == null) {
                    console.log("no CID");
                    merchantCustomerId = user.merchantCustomerId;
                }
                else {
                    console.log("YEs CID");
                    hasCustomerId = 1;
                    merchantCustomerId = user.merchantCustomerId;
                    customerId = user.customerId;
                }

            }
        })
        .then(result => {
            console.log(result);
            const body = {
                "merchantRefNum": merchantRefNum,
                "amount": amount,
                "currencyCode": "USD",
                "dupCheck": true,
                "settleWithAuth": true,
                "paymentHandleToken": token,
                "customerIp": "10.10.12.64",
                "description": "Magazine subscription"
            };
            if (saveCard === 'ADD') {
                console.log("Save Card");
                if (customerId === undefined) {
                    console.log("Here" + merchantCustomerId);
                    body.merchantCustomerId = merchantCustomerId;
                    console.log("No customer ID");
                }
                else {
                    body.customerId = customerId;
                }

            }
            const options = {
                method: 'POST',
                url: 'https://api.test.paysafe.com/paymenthub/v1/payments',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic cHJpdmF0ZS03NzUxOkItcWEyLTAtNWYwMzFjZGQtMC0zMDJkMDIxNDQ5NmJlODQ3MzJhMDFmNjkwMjY4ZDNiOGViNzJlNWI4Y2NmOTRlMjIwMjE1MDA4NTkxMzExN2YyZTFhODUzMTUwNWVlOGNjZmM4ZTk4ZGYzY2YxNzQ4',
                    'Simulator': 'EXTERNAL'
                },
                body: JSON.stringify(body)
            }
            console.log(options.body);
            request(options, function (error, response, body) {
                //console.log(response.statusCode);
                const resp = JSON.parse(response.body);
                console.log(resp);
                console.log(resp.customerId);
                console.log(resp.multiUsePaymentHandleToken);
                //console.log(email);
                if (saveCard === 'ADD') {
                    if(hasCustomerId == 0)
                    {
                        console.log("resp  no customer id");
                        User.findOne({ email: email })
                        .then(user => {
                            user.customerId = resp.customerId;
                            user.multiUsePaymentHandleToken = resp.multiUsePaymentHandleToken;
                            return user.save()
                        })
                        .then(result => {
                            console.log("Updated");
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    }
                    
                }
                res.send(JSON.stringify(response.statusCode));
            });

        })
        .catch(err => {
            console.log(err);
        })

}

module.exports.postToken = (req, res, next) => {
    const email = req.body.email;
    console.log("THIS SHOULD BE PRINTED FIRST");
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                res.send("NotFound");
            }
            else {

                if (user.customerId == null) {
                    res.send("NotFound");
                }
                else {
                    var customerId = user.customerId;
                    const merchantRefNum = randomString.generate(255);
                    const body = {
                        "merchantRefNum": merchantRefNum,
                        "paymentTypes": ["CARD"]
                    };
                    const options = {
                        method: 'POST',
                        url: `https://api.test.paysafe.com/paymenthub/v1/customers/${customerId}/singleusecustomertokens`,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Basic cHJpdmF0ZS03NzUxOkItcWEyLTAtNWYwMzFjZGQtMC0zMDJkMDIxNDQ5NmJlODQ3MzJhMDFmNjkwMjY4ZDNiOGViNzJlNWI4Y2NmOTRlMjIwMjE1MDA4NTkxMzExN2YyZTFhODUzMTUwNWVlOGNjZmM4ZTk4ZGYzY2YxNzQ4',
                            'Simulator': 'EXTERNAL'
                        },
                        body: JSON.stringify(body)
                    }
                    console.log("options.body" + options.body);
                    request(options, function (error, response, body) {                        
                        const resp = JSON.parse(response.body);          
                        console.log(resp.singleUseCustomerToken);                                   
                        res.send(resp.singleUseCustomerToken);
                    });                    
                }
            
            }
        })  
        .catch(err => {
            res.send("NotFound");
            console.log(err);
        })
        
        
}




