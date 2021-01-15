var express = require("express");
var router = express.Router();
const {
  generateRazorPay,
  createOrder,
  verifyPayment,
  confirmPurchase,
  paypalPay,
  verifyPaypal,
  paypalConfirmPurchase,
} = require("../helpers/order-helpers");

router.post("/razorpay", (req, res) => {
  createOrder(req.session.student._id, req.body.id, "razorpay").then(
    (orderId) => {
      generateRazorPay(req.body, orderId).then((order) => {
        res.json(order);
      });
    }
  );
});

router.post("/razorpay/verify", (req, res) => {
  verifyPayment(req.body)
    .then(() => {
      confirmPurchase(
        req.body["order[receipt]"],
        req.body["payment[razorpay_order_id]"]
      ).then((ticketId) => {
        console.log("ticketId: ", ticketId);
        req.session.student.lastPurchasedTicket = ticketId;
        res.json({ status: true });
      });
    })
    .catch(() => {
      res.json({ status: false });
    });
});

router.post("/paypal", (req, res) => {
  console.log(req.body);
  console.log(req.body["event[title]"]);
  createOrder(
    req.session.student._id,
    req.body["event[eventId]"],
    "paypal"
  ).then((orderId) => {
    req.session.student.lastTicketOrderId = orderId;
    req.session.student.lastTicketPrice = req.body["event[price]"];
    paypalPay(req.body, orderId).then((approvalUrl) => {
      res.json({ url: approvalUrl });
    });
  });
});

router.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const price = req.session.student.lastTicketPrice;
  const orderId = req.session.student.lastTicketOrderId;
  console.log(payerId, paymentId, price, orderId);

  verifyPaypal(payerId, paymentId, price).then((response) => {
    if (response.status) {
      paypalConfirmPurchase(orderId, paymentId).then((ticketNum) => {
        req.session.student.lastPurchasedTicket = ticketNum;
        res.redirect("/purchased-event");
      });
    }
  });
});
module.exports = router;
