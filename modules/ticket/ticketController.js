var path = require("path");
var config = require("../../config");
var db = require("../dbConnector");
var errorMsg = require("../../utils/errorMessages");
var responseGenerator = require("../../utils/responseGenerator");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
var emailHandler = require("../../utils/emailHandler");

exports.getTicketTypes = function(req, res) {
    var result = res.locals.result;
    if(result) {
        var qry = "SELECT * FROM ticket_types where is_active='1'";
        db.query(qry, function(errQuery, resQuery) {
            if(errQuery)
                res.send(responseGenerator.getResponse(500, "Failed to process your ticket", []));
            else 
                res.send(responseGenerator.getResponse(200, "Ticket types found.", resQuery));
        });
    }
    else {
        res.send(responseGenerator.getResponse(500, "Failed to get ticket types", []))
    }
}

exports.addUpdateTicket = function(req, res) {
    var reqData = JSON.parse(req.body.ticket);
    var token = reqData.token;
    if(token) {
        jwt.verify(token, config.privateKey, function(err, result) {
            if(err) {
                res.send(responseGenerator.getResponse(501, errorMsg.tokenInvalid, []))
            }
            else {
                var id = reqData.id != null ? parseInt(reqData.id) : 0;
                var uid = result.id;
                var title = typeof reqData.title != "undefined" ? reqData.title : "";
                var description = typeof reqData.description != "undefined" ? reqData.description : "";
                var ticket_type = typeof reqData.ticket_type != "undefined" ? reqData.ticket_type : "";
                var priority = typeof reqData.priority != "undefined" ? reqData.priority : "";
                var contact_type = typeof reqData.contact_type != "undefined" ? reqData.contact_type : "";
                var email = typeof reqData.email != "undefined" ? reqData.email : "";
                var phone = typeof reqData.phone != "undefined" ? reqData.phone : "";
                var name = typeof reqData.name != "undefined" ? reqData.name : "";
                var ticket_id = typeof reqData.ticket_id != "undefined" ?reqData.ticket_id : null;
                var fileUpload = typeof reqData.fileUpload != "undefined" ?reqData.fileUpload : 0;
                var screenshot = typeof reqData.screenshot != "undefined" ?reqData.screenshot : "";

                if((phone != "" || email != "") && priority != "" && ticket_type != "" && title != "" && description != "" && contact_type != "") {
                    
                    if(ticket_id == null || id == null) {
                        var random_no = Math.floor(Math.random() * 90 + 10);
                        ticket_id = "T"+random_no+Date.now();
                    }
                    
                    var values = [id,uid,title,description,ticket_type,priority,email,phone,screenshot,ticket_id,contact_type,name];
                    db.query("CALL add_update_ticket(?,?,?,?,?,?,?,?,?,?,?,?);", values, function(errQuery, resQuery) {
                        if(errQuery)
                            res.send(responseGenerator.getResponse(500, "Failed to process ticket", []));
                        else  {
                            var msg = "Ticket posted succesfully.";
                            msg = id != null ? "Ticket updated succesfully.": msg;
                            res.send(responseGenerator.getResponse(200, msg, resQuery));
                        }
                    });
                }
                else 
                    res.send(responseGenerator.getResponse(500, errorMsg.fieldMissing, []))
            }
        });
    }
    else {
        res.send(responseGenerator.getResponse(501, errorMsg.tokenInvalid, []))
    }
}

exports.getTickets = function(req, res) {
    var result = res.locals.result;
    if(result) {
        var uid = result.id;
        var qry = "SELECT t.id, ticket_id,title,UCASE(status) as status,UCASE(priority) as priority,assignee,tt.name FROM ticket t INNER JOIN ticket_types tt ON t.ticket_type = tt.id WHERE t.user_id = ? ORDER BY t.id DESC";
        db.query(qry, result.id, function(errQuery, resQuery) {
            if(errQuery)
                res.send(responseGenerator.getResponse(500, "Failed to get ticket details", []));
            else {
                if(resQuery.length > 0)
                    res.send(responseGenerator.getResponse(200, "Ticket found.", resQuery));
                else
                    res.send(responseGenerator.getResponse(500, "Ticket not found.", resQuery));
            }
        });
    }
    else {
        res.send(responseGenerator.getResponse(500, "Failed to get ticket details", []))
    }
}

exports.getTicket = function(req, res) {
    var result = res.locals.result;
    if(result) {
        var uid = result.id;
        var id = typeof req.body.id != "undefined" ? req.body.id : null;
        if(id != null) {
            var qry = "SELECT t.*,tc.contact_type,tc.email,tc.phone FROM ticket t INNER JOIN ticket_contact tc ON t.ticket_id = tc.tid WHERE t.id = ? AND t.user_id = ?";
            var values = [id, uid];
            db.query(qry, values, function(errQuery, resQuery) {
                if(errQuery)
                    res.send(responseGenerator.getResponse(500, "Failed to get tickets", []));
                else {
                    if(resQuery.length > 0)
                        res.send(responseGenerator.getResponse(200, "Ticket found.", resQuery[0]));
                    else
                        res.send(responseGenerator.getResponse(500, "Ticket not found.", resQuery));
                }
            });
        }
        else {
            res.send(responseGenerator.getResponse(500, errorMsg.fieldMissing, []))
        }
    }
    else {
        res.send(responseGenerator.getResponse(500, "Failed to get ticket", []))
    }
}

exports.deleteTicket = function(req, res) {
    var result = res.locals.result;
    if(result) {
        var uid = result.id;
        var id = typeof req.body.id != "undefined" ? req.body.id : null;
        var ticket_id = typeof req.body.ticket_id != "undefined" ? req.body.ticket_id : null;
        if(id != null && ticket_id != null) {
            var qry = "DELETE FROM ticket WHERE id = ?;DELETE FROM ticket_contact WHERE tid = ?";
            var values = [id, ticket_id];
            db.query(qry, values, function(errQuery, resQuery) {
                if(errQuery)
                    res.send(responseGenerator.getResponse(500, "Failed to delete tickets", []));
                else {
                    res.send(responseGenerator.getResponse(200, "Ticket deleted successfully.", resQuery[0]));
                }
            });
        }
        else {
            res.send(responseGenerator.getResponse(500, errorMsg.fieldMissing, []))
        }
    }
    else {
        res.send(responseGenerator.getResponse(500, "Failed to delete ticket", []))
    }
}

exports.updateTicketStatus = function(req, res) {
    var result = res.locals.result;
    if(result) {
        var id = typeof req.body.id != "undefined" ? req.body.id : null;
        var status = typeof req.body.status != "undefined" ? req.body.status : "";
        var user_id = typeof req.body.user_id != "undefined" && req.body.user_id != "" ? req.body.user_id : 0;

        var status = typeof req.body.status != "undefined" ? req.body.status : null;
        if(id != null && status != "") {
            var qry = "UPDATE ticket SET status = ?, assignee = ? WHERE id = ?";
            var values = [status, user_id, id];
            db.query(qry, values, function(errQuery, resQuery) {
                if(errQuery)
                    res.send(responseGenerator.getResponse(500, "Failed to update ticket status", []));
                else {
                    res.send(responseGenerator.getResponse(200, "Ticket status updated successfully.", resQuery[0]));
                }
            });
        }
        else {
            res.send(responseGenerator.getResponse(500, errorMsg.fieldMissing, []))
        }
    }
    else {
        res.send(responseGenerator.getResponse(500, "Failed to update ticket status", []))
    }
}

exports.getRTickets = function(req, res) {
    var result = res.locals.result;
    if(result) {
        var uid = result.id;
        var qry = "SELECT ticket_id,title,description,screenshot,UCASE(status) as status,UCASE(priority) as priority,DATE_FORMAT(t.created_at, '%Y-%m-%d') as posted_date, tt.name, tc.contact_name,tc.email,tc.phone FROM ticket t INNER JOIN ticket_types tt ON t.ticket_type = tt.id INNER JOIN ticket_contact tc ON t.ticket_id = tc.tid WHERE t.user_id != ? AND t.status IN ('open', 'in process') ORDER BY t.id DESC";
        db.query(qry, result.id, function(errQuery, resQuery) {
            if(errQuery)
                res.send(responseGenerator.getResponse(500, "Failed to get ticket details", []));
            else {
                if(resQuery.length > 0)
                    res.send(responseGenerator.getResponse(200, "Tickets found.", resQuery));
                else
                    res.send(responseGenerator.getResponse(500, "Tickets not found.", resQuery));
            }
        });
    }
    else {
        res.send(responseGenerator.getResponse(500, "Failed to get ticket details", []))
    }
}

exports.getDashboardData = function(req, res) {
    var result = res.locals.result;
    if(result) {
        var uid = result.id;
        db.query("CALL get_dashboard(?)", uid, function(errQuery, resQuery) {
            if(errQuery)
                res.send(responseGenerator.getResponse(500, "Failed to get ticket details", []));
            else {
                var tickets_summary = {};
                if(resQuery[0].length > 0) {
                    tickets_summary = resQuery[0][0];
                }

                var priority_summary = [{priority: "high", count: 0 }, {priority: "low", count: 0 }, {priority: "medium", count: 0 }];

                if(resQuery[1].length > 0) {
                    
                    priority_summary.forEach(element => {
                        let tiggerData = resQuery[1].find(obj => obj.priority == element.priority);
                        if(typeof tiggerData != "undefined")
                            element.count = tiggerData.count;
                    });
                }

                var status_summary = [{"status": "open", "count": 0},{"status": "closed", "count": 0},{"status": "in process", "count": 0},{"status": "resolved", "count": 0},{"status": "invalid", "count": 0}];
                if(resQuery[2].length > 0) {
                    status_summary.forEach(element => {
                        let tiggerData = resQuery[2].find(obj => obj.status == element.status);
                        if(typeof tiggerData != "undefined")
                            element.count = tiggerData.count;
                    });
                }

                var ticket_details = {
                    "tickets_summary": tickets_summary,
                    "priority_summary": priority_summary,
                    "status_summary": status_summary
                }
                res.send(responseGenerator.getResponse(200, "Tickets found.", ticket_details));
            }
        });
    }
    else {
        res.send(responseGenerator.getResponse(500, "Failed to get ticket details", []))
    }
}