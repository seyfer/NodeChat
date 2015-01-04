(function () {
    var textarea = $(".chat-textarea");
    var chatName = $(".chat-name");
    var chatStatus = $(".chat-status span");
    var chatMessages = $(".chat-messages");

    var defaultStatus = chatStatus.html();
    setStatus = function (s) {
        chatStatus.html(s);

        if (s !== defaultStatus) {
            var delay = setTimeout(function () {
                setStatus(defaultStatus);
            }, 3000);
        }
    };

//    setStatus('Test');

    console.log(textarea, chatName, defaultStatus);

    try {
        var socket = io.connect('http://127.0.0.1:8080');
    } catch (e) {
        console.error(e);
    }

    if (socket !== undefined) {
        console.log("Ok");

        //listen for output
        socket.on('output', function (data) {
            console.log(data);

            if (data.length) {
                //Loop
                for (var x = 0; x < data.length; x++) {
                    var message = $("<div></div>").attr({class: "chat-message"}).html(data[x].name + ": " + data[x].message);
                    chatMessages.prepend(message);
                }
            }
        });

        //listen for a status
        socket.on("status", function (data) {
            
            console.log("status", data);
            
            setStatus((typeof data === 'object') ? data.message : data);

            if (data.clear === true) {
                textarea.val('');
            }
        });

        // listen for an input
        textarea.on("keydown", function (event) {
            var self = this;
            var name = chatName.val();

//            console.log(name, event.which);

            if (event.which === 13 && event.shiftKey === false) {
                event.preventDefault();
                console.log("click");

                data = {
                    name: name,
                    message: self.value
                };

                console.log(data);

                socket.emit('input', data);

                return;
            }

        });

        chatName.on("keydown", function (event) {
            if (event.which === 13) {
                event.preventDefault();
                return;
            }
        });
    }
})();