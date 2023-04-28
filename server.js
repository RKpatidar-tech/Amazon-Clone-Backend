const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Products = require('./Products');
const Orders = require('./Orders');
const Users  = require("./Users");
const bcrypt = require("bcryptjs")


const stripe = require('stripe')(
  "sk_test_51MmwrPSD00GWPsqeaeB9jnjsKHt5EzBqposv7Owwo52eQ7eQ8iaGdQJqAq7JrC3gEKa0SK0HTgjgNdRLh5JQCbPV00KUNLuDec"
);




const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

const connection_url = "mongodb+srv://RamkrishnaPatidar:Rajesh123&@cluster0.g9qxdlp.mongodb.net/Cluster0?retryWrites=true&w=majority";

mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,

});
// Api

app.get("/", (req, res) => res.status(200).send("Hello World"));

//add Product
app.post("/products/add", (req, res) => {
  const productDetail = req.body;

 // console.log("Product Detail = ", productDetail);
  console.log('Outside if');

  Products.create(productDetail)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log("Error");
    })
});



app.get("/products/get", (req, res) => {

  Products.find()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log("Annn ERROR COMES");
    })
  // Products.find(()=>{

  //   if(err){
  //     res.status(500).send(err);
  //   }
  //   else{
  //     res.status(200).send(data);
  //   }
  // })
})


//      Products.create((productDetail) =>{
//         if(err){
//             console.log("Inside if");
//              res.status(500).send(err.message);

//         }
//         else{
//              res.status(201).send(productDetail);
//          }
//     } )
// });


//API for SignUp

 app.post("/auth/signup", async (req,res)=>{
  const {email, password, fullName} = req.body;
  const encrypt_password = await bcrypt.hash(password,10);

  const userDetail = {
    email: email,
    password: encrypt_password,
    fullName: fullName,
  };

  const user_exist = await Users.findOne({email:email});

  if(user_exist){
    res.send({message: "The Email is already in use !"});
  }
  else{
    Users.create(userDetail)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log("Error");
    })
    // Users.create(userDetail, (err, result)=>{
    //   if(err){
    //     res.status(500),send({message: err.message});

    //   }
    //   else{
    //     res.send({message: "User Created Successfully"});
    //   }
    // });
  }
 });

 //API fpor Login

 app.post("/auth/login", async (req,res)=>{
    const {email,password} = req.body;

    const userDetail = await Users.findOne({email :email});

    if(userDetail){
      if(await bcrypt.compare(password,userDetail.password)){
        res.send(userDetail);
      }else{
        res.send({error: "invalid Password"});
      }
    }
    else{
      res.send({error: "user is not exist"});
    }
 });



// API for Payment
app.post("/payment/create", async (req, res) => {
  const total = req.body.amount;
  //console.log("Payment has benn received", total);

  const payment = await stripe.paymentIntents.create({
    amount: total * 100,
    currency: "inr",
  });

  res.status(201).send({
    clientSecret: payment.client_secret,
  });
});


//Api to add order details

app.post("/orders/add", (req, res) => {
  const products = req.body.basket;
  const price = req.body.price;
  const email = req.body.email;
  
  const address = req.body.address;

  const orderDetail = {
    products: products,
    price: price,
    address: address,
    email: email,

  };
  Orders.create(orderDetail)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log("Error");
    })
  // Orders.create(orderDetail,(err,result)=>{
  //   if(err){
  //     console.log(err);
  //   }else{
  //     console.log("orders added to the database");
  //   }
  // })
 // console.log("Order Detail ->", orderDetail);
});

app.post('/orders/get', (req, res) => {
  const email = req.body.email;

  Orders.find()
    .then((result) => {
      const userOrders = result.filter((order) => order.email === email);
      res.send(userOrders);
    })
    .catch((err) => {
      console.log(err);
    })

  // Orders.find((err, result) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     const userOrders = result.filter((order) => order.email === email);
  //     res.send(userOrders);
  //   }
  // })
})

app.listen(port, () => console.log("listening to the port", port));




