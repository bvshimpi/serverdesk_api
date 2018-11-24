exports.getResponse = function (status, msg, records) {

    var response = {
        "Status" : status,
        "Message" : msg,
        "Data" : records,
    }
    return response;
}