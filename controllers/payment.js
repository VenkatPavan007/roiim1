const User = require('../models/User');
const request = require('request');
const randomString = require('randomstring');

var merchantCustomerId, customerId;
var email;

module.exports.getPayment = (req, res, next) => {
    res.render('./index.html');
}


module.exports.postData = (req, res, next) => {
    const merchantRefNum = randomString.generate(255);
    const token = req.body.token;
    const saveCard = req.body.saveCard;
    const amount = parseFloat(req.body.amount)*100;

    email = req.body.email;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {  // user doesnt exists  
                const MerchCustID = randomString.generate(10);
                merchantCustomerId = MerchCustID;
                const user = new User({
                    email: email,
                    merchantCustomerId: merchantCustomerId
                })
                return user.save()
            }
            else {
                console.log(user);

                if (user.customerId == null) {                    
                    merchantCustomerId = user.merchantCustomerId;
                }
                else{         
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
                if (!customerId) {
                    console.log("Here" + merchantCustomerId);
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
                console.log(response.statusCode);
                const resp = JSON.parse(response.body);
                console.log(resp);
                console.log(email);
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
                res.send(JSON.stringify(response.statusCode));
            });
            
        })
        .catch(err => {
            console.log(err);
        })

    

}

