document.getElementById("form1").addEventListener("submit", async function (e) {
  e.preventDefault();

  const response = await fetch("/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const order = await response.json();

  const options = {
    key: "YOUR_KEY_ID_HERE", // replace with Razorpay Key ID
    amount: order.amount,
    currency: order.currency,
    name: "Psports",
    description: "Secure Payment",
    order_id: order.id,
    handler: function (response) {
      alert(
        "Payment Successful!\nPayment ID: " +
          response.razorpay_payment_id
      );
      window.location.href = "buythanks.html";
    },
    theme: {
      color: "#2874f0",
    },
  };

  const rzp = new Razorpay(options);
  rzp.open();
});
