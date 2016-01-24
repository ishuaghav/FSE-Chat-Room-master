    var socket = io();

    socket.on('inputMessage', function(msg) {
        var emittedAtom = JSON.parse(msg.toString());
        prepareChatBubble(emittedAtom);
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    });

    $(function() {
        renderLoginPage();
    })

    function renderLoginPage() {
        $('#chatroom').hide();
        $('#logout').hide();
        $('#username').hide();
        $('#login').show();
        $('#m1').val('');
    }

    function checkEmpty(input) {
        return (input.length === 0 || !input.trim());
    }

    function OnSubmit(from) {
        if (from == "fromChatWindow") {

            if (checkEmpty($('#m').val())) {
                return;
            }
            var atom = {
                what: $('#m').val(),
                who: $('#m1').val(),
                when: (new Date).getTime()
            }
            socket.emit('inputMessage', JSON.stringify(atom));
            $('#m').val('');

        } else if (from == "fromLogin") {

            if (checkEmpty($('#m1').val())) {
                return;
            }
            socket.connect();
            renderChatroom();
            $('#username').text('Hi ' + $('#m1').val() + '!');
            $('#messages').scrollTop($('#messages')[0].scrollHeight);

        } else if (from == "fromLogout") {

            socket.disconnect();
            renderLoginPage();

        }
    }

    function renderChatroom() {
        $('#chatroom').show();
        $('#logout').show();
        $('#username').show();
        $('#login').hide();
    }

    function prepareChatBubble(emittedAtom) {
        var d = new Date(0);
        d.setUTCMilliseconds(emittedAtom.when);

        var when = "<li><div style=\"color:grey; text-align:center; font-size:x-small\">" + d.toDateString() +" "+ d.toLocaleTimeString(); + "</div>";
        var who = "<div style=\"color:Red; text-align:center; font-size:x-small\">" + emittedAtom.who + "</div>";
        var what = "<div style=\"font-size:small\">" + emittedAtom.what + "</div></li>";

        $('#messages').append(when + who + what);
    }