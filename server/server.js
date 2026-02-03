// Load environment variables
require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =======================
// ROOT ROUTE (IMPORTANT)
// =======================
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// =======================
// CREATE ORDER
// =======================
app.post("/create-order", async (req, res) => {
  try {
    const { price, productName } = req.body;

    if (!price) {
      return res.status(400).json({ error: "Price is required" });
    }

    const USD_TO_INR = 83;
    const amountInPaise = price * USD_TO_INR * 100;

    const options = {
      amount: Math.round(amountInPaise),
      currency: "INR",
      receipt: "sportsflex_" + Date.now(),
      notes: {
        product: productName || "Sports-Flex Product",
      },
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// =======================
// VERIFY PAYMENT
// =======================
app.post("/verify-payment", (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const hmac = crypto.createHmac(
    "sha256",
    process.env.RAZORPAY_KEY_SECRET
  );

  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === razorpay_signature) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
});

// =======================
// START SERVER (DEPLOY SAFE)
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
