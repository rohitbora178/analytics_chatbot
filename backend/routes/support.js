const express = require("express");
const router = express.Router();
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  resolveTicket,
  getActivity,
} = require("../controllers/supportController");

router.get("/tickets", getTickets);
router.get("/tickets/open", (req, res) => {
  req.query.status = "open";
  return getTickets(req, res);
});
router.get("/tickets/:id", getTicketById);
router.post("/tickets", createTicket);
router.patch("/tickets/:id/status", updateTicketStatus);
router.post("/tickets/:id/resolve", resolveTicket);
router.get("/activity", getActivity);

module.exports = router;
