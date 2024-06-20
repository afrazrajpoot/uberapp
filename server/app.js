require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./db/connection");
const stripe = require("stripe")(
  "sk_test_51PQFreRvJI1ePtmLx8JKaxotxvudFiwNgTg08KQEOwlfAeEd8eTdetDLqUmIQyoFaGkYrbRFBxhrDO77uPxdVXdq00muMh7tnE"
);

const app = express();
const globalErrorHandler = require("./midddelware/error");
const userRoute = require("./route/userRoute");
app.use(express.json());
app.use(cors("*"));
app.get("/", (req, res) => {
  res.send("Hello World!");
});
connection();
// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.
app.use("/api/v1", userRoute);
app.post("/payment-sheet", async (req, res) => {
  const { currency, amount } = req.body;
  console.log(currency, amount);
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2024-04-10" }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: currency,
    customer: customer.id,
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter
    // is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
  });
});
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);
app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
