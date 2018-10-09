const express = require("express");
const app = express();
const http = require("https");
const request = require("request");
const fs = require("fs");
const host = "https://clean.bigbelly.com";
const user = process.env.BIGBELLY_CLEAN_USER;
const pass = process.env.BIGBELLY_CLEAN_PASSWORD;
const email = process.env.BIGBELLY_CLEAN_EMAIL;
const hostname = '0.0.0.0';
const port = process.env.NODE_PORT || 3004;
const env = process.env;

function readLast(current) {
  return new Promise((fulfill, reject) => {
    fs.readFile("./lastReading.json", function read(err, data) {
      if (err) {
        throw err;
      }
      content = data;

      // Invoke the next step here however you like

      let output = compareFile(
        JSON.parse(current),
        JSON.parse(JSON.parse(content))
      ).then(results => fulfill(results)); // Or put the next step in a function and invoke it
    });
  });
}

function compareFile(current, last) {
  return new Promise((fulfill, reject) => {
    let results = null;
    let output = { assets: [] };
    current.assets.forEach(function(item) {
      results = last.assets.filter(asset => Object.compare(item, asset));
      if (results.length === 0) {
        output.assets.push(item);
      }
    }, this);
    fulfill(output);
  });
}

function writeToFile(content) {
  return new Promise((fulfill, reject) => {
    fs.writeFile("./lastReading.json", content, "utf8", function(err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
    fulfill();
  });
}

function authenticate(res) {
  return new Promise((fulfill, reject) => {
    request.post(
      host + "/api/login",
      {
        form: {
          accountFilter: 388,
          username: user,
          password: pass,
          email: email
        }
      },
      (error, response, body) => {
        fulfill(response.headers);
      }
    );
  });
}

function getdata(headers) {
  let obj = {
    url: host + "/api/v1?objectType=assets&action=load&accountFilter=388",
    headers: { Cookie: headers["set-cookie"] }
  };
  return new Promise((fulfill, reject) => {
    request(obj, (error, response, body) => {
      writeToFile(JSON.stringify(body)).then(() => {
      readLast(body).then(results => {
        console.log(body);
        writeToFile(JSON.stringify(body)).then(() => {
          fulfill(results);
        });
      });
       });  // end of writeToFile
    });
  });
}

app.get("/bigbelly", (req, res) =>
  authenticate().then(headers => {
    getdata(headers).then(data => {
      console.log(data);
      //        res.header('last-modified', new Date());
      res.send(data);
    });
  })
);
Object.compare = function(obj1, obj2) {
  for (var p in obj1) {
    if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;
    switch (typeof obj1[p]) {
      case "object":
        if (!Object.compare(obj1[p], obj2[p])) return false;
        break;
      case "function":
        if (
          typeof obj2[p] == "undefined" ||
          (p != "compare" && obj1[p].toString() != obj2[p].toString())
        )
          return false;
        break;
      default:
        if (obj1[p] != obj2[p]) return false;
    }
  }
  for (var p in obj2) {
    if (typeof obj1[p] == "undefined") return false;
  }
  return true;
};
// app.listen(3005, () => {console.log('running on 3005')});
app.listen(port, hostname, () => {
  console.log("Server running at http://" + hostname + ":" + port + "/");
});
