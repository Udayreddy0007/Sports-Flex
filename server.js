const express = require("express");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const razorpay = new Razorpay({
  key_id: "rzp_test_S8834bSVfPWYvo",
  key_secret: "0bBGhKSLrhqOgZH0L2jY8tjY",
});

app.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: 50000, // ₹500 in paise
      currency: "INR",
      receipt: "psports_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating order");
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
