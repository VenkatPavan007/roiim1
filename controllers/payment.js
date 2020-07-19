const User = require('../models/User');
const request = require('request');
const randomString = require('randomstring');



module.exports.getPayment = (req, res, next) => {
    res.render('./index.html');
}


module.exports.postData = (req, res, next) => {
    var merchantCustomerId, customerId;
    var email, result, hasCustomerId = 0;
    const merchantRefNum = randomString.generate(255);
    const token = req.body.token;
    const saveCard = req.body.saveCard;  
    //console.log("Save Card" + saveCard);  
    const amount = parseFloat(req.body.amount) * 100;
    
    email = req.body.email;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {  // user doesnt exists              
                //console.log("User Doesnt exists");   
                const MerchCustID = randomString.generate(10);
                merchantCustomerId = MerchCustID;
                const newUser = new User({
                    email: email,
                    merchantCustomerId: merchantCustomerId
                })
                return newUser.save()
            }
            else {
                //console.log("User already exists");
                if (user.customerId == null) {                    
                    merchantCustomerId = user.merchantCustomerId;
                }
                else {                    
                    hasCustomerId = 1;
                    merchantCustomerId = user.merchantCustomerId;
                    customerId = user.customerId;
                }
                
            }
            
        })
        .then(result => {            
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
                if (customerId === undefined) {                    
                    body.merchantCustomerId = merchantCustomerId;                    
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
                const resp = JSON.parse(response.body);    
                
                if (saveCard === 'ADD') {
                    if(hasCustomerId == 0)
                    {    console.log("Here");                    
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
                    
                    request(options, function (error, response, body) {                        
                        const resp = JSON.parse(response.body);                                                         
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




