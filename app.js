// server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const path = require('path');
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

//Request用的Log Rotate
//來來來，log都來
const fs = require('fs');
global.logDirectory = path.resolve(__dirname) + '/logs';
// ensure log directory exists
fs.existsSync(global.logDirectory) || fs.mkdirSync(global.logDirectory);
const morgan = require('morgan');
const FileStreamRotator = require('file-stream-rotator');
server.use(morgan('combined', {
    stream: FileStreamRotator.getStream({
        date_format: 'YYYYMMDD',
        filename: global.logDirectory + '/access-%DATE%.log',
        frequency: 'daily',
        verbose: false
    })
})); // setup the Request用的Log

function isAuthorized(req) {
    //權限控管
    return true;
}

//增加權限控管
server.use((req, res, next) => {
    if (isAuthorized(req)) { // add your authorization logic here
        next() // continue to JSON Server router
    } else {
        res.sendStatus(401)
    }
})

server.use(middlewares);

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
    res.jsonp(req.query)
})

// Use default router
server.use(router);
//Alternatively, you can also mount the router on /api.
//server.use('/api', router);

let PORT = 3000;
server.listen(PORT, () => {
    var ifaces = require('os').networkInterfaces();
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log(ifname + ':' + alias, " http://" + iface.address + ":" + PORT);
            } else {
                // this interface has only one ipv4 adress
                console.log(ifname, " http://" + iface.address + ":" + PORT);
            }
            ++alias;
        });
    });

    //console.log('JSON Server is running on %s', PORT);
});