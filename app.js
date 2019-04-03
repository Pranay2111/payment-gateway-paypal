const express = require("express")
const ejs = require("ejs")
const paypal = require("paypal-rest-sdk")

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': '',
    'client_secret': ''
  });

const app = express()

app.set('view engine','ejs' )

app.get("/", (req, res)=>{
       res.render("index")
})

app.post("/pay", (req, res)=>{
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Bluetooth Dell mouse",
                    "sku": "001",
                    "price": "10.00",
                    "currency": "INR",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "INR",
                "total": "10.00"
            },
            "description": "I have  bought this product now .."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i=0; i < payment.links.length; i++){
                if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href)
                }
            }
        }
    });
})

app.post("/success",(req, res)=>{
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transaction":[{
            "amount": {
                "currency": "INR",
                "total": "10:00",
            }
        }]
    }

    paypal.payment.execute(paymentId, execute_payment_json, function (error ,payment){
        if(error){
            console.log(error.response)
            throw error;
        } else {
            console.log("Get payment Response")
            console.log(JSON.stringify(payment));
            res.send("success")
        }
    } )
})

app.get('/cancel', (req, res)=>{  console.log("Cancelled")})

app.listen(3000, ()=> console.log('server is running ...'))