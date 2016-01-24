var http = require('http');
var express = require('express');

var app = express();
app.set('port', 3000);

var appServer = http.createServer(app);
var io = require('socket.io')(appServer);

app.use(express.static('public'));

var cors = require('cors');
app.use(cors());

app.get('/ping', function(req, res) {
});

app.get('/chat', function(req, res) {
    res.render('index.jade');
});

var fileSystem = require("fs");
var file = "chatBackup.db";
var exists = fileSystem.existsSync(file);

if (!exists) {
    console.log("Creating database file.");
    fileSystem.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

appServer.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

io.on('connection', function(socket) {
    
    console.log(socket.handshake.address + ' ' + socket.id + ' connected');
    db.serialize(function() {
        if (exists) {
            db.each("SELECT rowid AS id, chatAtom FROM ChatHistory", function(err, row) {
                socket.emit('inputMessage', row.chatAtom);
            });
        }
    });

    socket.on('disconnect', function() {
        console.log(socket.handshake.address + ' ' + socket.id + ' disconnected');
    });

    socket.on('inputMessage', function(msg) {

        console.log('Received input: ' + msg + ' from ' + socket.id);
        io.emit('inputMessage', msg);

        db.serialize(function() {
            if (!exists) {
                db.run("CREATE TABLE ChatHistory (chatAtom TEXT)");
            }
            var stmt = db.prepare("INSERT INTO ChatHistory VALUES (?)");
            stmt.run(msg);
            stmt.finalize();

        });
    });
});