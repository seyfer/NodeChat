console.log("Work");

var mongo = require("mongodb").MongoClient;
var client = require("socket.io").listen(8080).sockets;

mongo.connect("mongodb://127.0.0.1/chat", function (err, db) {
    if (err) {
        throw err;
    }

    client.on('connection', function (socket) {
        console.info("new connection");

        var collection = db.collection("messages");

        //emit all messages
        collection.find().limit(100).sort({_id: 1}).toArray(function (err, res) {
            if (err)
                throw err;

            socket.emit('output', res);
        });

        //wait for input
        socket.on("input", function (data) {
            console.info(data);

            sendStatus = function (s) {
                socket.emit('status', s);
            };

            var name = data.name;
            var message = data.message;
            var whitespacePattern = /^\s*$/;

            if (whitespacePattern.test(name) || whitespacePattern.test(message)) {
                console.error("Invalid values");

                sendStatus("Name and message required");
            } else {
                collection.insert({name: name, message: message}, function () {
                    console.log('inserted');

                    client.emit('output', [data]);

                    sendStatus({
                        message: "Sent",
                        clear: true
                    });
                });
            }

        });
    });


});



