// Load environment variables
require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Razorpay instance using .env keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =======================
// CREATE ORDER (DYNAMIC)
// =======================
app.post("/create-order", async (req, res) => {
  try {
    const { price, productName } = req.body;

    // ❗ validation
    if (!price) {
      return res.status(400).json({ error: "Price is required" });
    }

    // Convert USD → INR (example rate)
    const USD_TO_INR = 83;
    const amountInPaise = price * USD_TO_INR * 100;

    const options = {
      amount: amountInPaise, // ✅ dynamic amount
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

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false });
  }

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
// START SERVER
// =======================
app.listen(5000, () => {
  console.log("✅ Server running at http://localhost:5000");
});
