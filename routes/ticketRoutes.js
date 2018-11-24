var express = require("express");
var common = require("./../utils/common");
var ticket = require("./../modules/ticket/ticketController");
var multer = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/tickets/')
    },
    filename: function (req, file, cb) {
        var body = JSON.parse(req.body.ticket);
        cb(null, body.screenshot);
    }
});
var upload = multer({ storage: storage });
var router = new express.Router();

router.post("/getTicketTypes", common.verifyRequest, ticket.getTicketTypes);
router.post("/addUpdateTicket", upload.any(), ticket.addUpdateTicket);
router.post("/getTickets", common.verifyRequest, ticket.getTickets);
router.post("/getTicket", common.verifyRequest, ticket.getTicket);
router.post("/deleteTicket", common.verifyRequest, ticket.deleteTicket);
router.post("/updateTicketStatus", common.verifyRequest, ticket.updateTicketStatus);
router.post("/getRTickets", common.verifyRequest, ticket.getRTickets);
router.post("/getDashboardData", common.verifyRequest, ticket.getDashboardData);

module.exports = router;