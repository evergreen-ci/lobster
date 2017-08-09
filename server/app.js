const os = require('os');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const https = require('https');
const http = require('http');
const URL = require('url').Url;
const bodyParser = require('body-parser');

const app = express();

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
})
    
// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
   res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

app.post('/api/log', function(req, res, next) {
    var log_url = req.body.url;
    var filter = req.body.filter;

    if(log_url === undefined) {
        res.send({message: "url cannot be undefined"});
    }
    console.log("url = " + log_url);
    if (filter) {
        console.log("filter = " + filter);
    }
    else {
        console.log("filter is not set");
    }

    https.get(log_url, function(result){
        var str = '';
        console.log('Response is '+result.statusCode);

        result.on('data', function (chunk) {
              //console.log('BODY: ' + chunk);
               str += chunk;
         });

        result.on('end', function () {
//            processResponse(str, filter);
            res.send(str);
            console.log("done");
        });

    });

    var processResponse = function(result, filter) {
        let processed = {}
        try {
            let gitVersionMaster = "master";
            let gitVersion = "master";
            let isGitVersionSet = false;
            const gitPrefix = "https://github.com/mongodb/mongo/blob/";
            const key = "data";
            const gitVersionStr = "git version: ";
            const prefix = "{githash:";
            const prefixLen = prefix.length + 2;
            processed[key] = [];
            
            let lines = result.split(os.EOL);
            
            for (let i in lines) {
               let line = lines[i];
               if (!line.match(filter)) {
                   continue;
               }
               if (!isGitVersionSet) {
                   let gitVersionPos = line.indexOf(gitVersionStr);
                   if (gitVersionPos !== -1) {
                       gitVersion = line.substr(gitVersionPos + gitVersionStr.length);
                       isGitVersionSet = true;
                   }
               }
               const startIdx = line.indexOf(prefix);
               if (startIdx !== -1) {
                  const stopIdx = line.indexOf("}", startIdx);
                  if (stopIdx > startIdx + prefixLen) {
                      const fileLine = line.substr(startIdx+prefixLen, stopIdx-(startIdx+prefixLen)-1);
                      const textLine = line.substr(0, startIdx-1) + line.substr(stopIdx+1);
                      let foobar = line.split('}', 1);
                      processed[key].push({gitRef:gitPrefix + gitVersion + "/" + fileLine, line:textLine}); 
                  }
               }
               else {
                 processed[key].push({line:lines[i]}); 
               }
            }
            res.json(processed);
        }
        catch (error) {
            return next(error);
        }
    }

});

module.exports = app;
