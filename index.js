var path    = require("path");
var fs      = require("fs");
var express = require("express");
var gm      = require("gm").subClass({imageMagick: true});
var mkdirp  = require("mkdirp");

var app = express();
var dir = process.env.BIN || path.join(__dirname, "bin");
var cache = process.env.CACHE || path.join(__dirname, "cache");
var pass = process.env.FORCE_PASS || undefined;

app.get("/*", (req, res, next)=> {
  var size = req.query.image_width;
  var force = req.query.hasOwnProperty('force') && req.query.force == pass;
  if (!size || !isValidSize(size)) {
    return next();
  }

  var filePath = path.join(dir, req.path);
  var cachedPath = path.join(cache, path.join(
      path.dirname(req.path), 
      size + "_" + path.basename(req.path)));

  fs.access(filePath, fs.constants.R_OK, (err)=> {
    if (err) {
      next();
      return;
    }
    if (force) {
      doit();
    } else {
      fs.access(cachedPath, fs.constants.R_OK, (err) => {
        if (err) return doit();
        res.sendFile(cachedPath);
      });
    }
  });

  function doit() {
    mkdirp(path.dirname(cachedPath), (err)=> {
      if (err) {
        console.error(err);
        next();
        return;
      }
      gm(filePath)
      .resize(size)
      .stream(function (err, stdout, stderr) {
        if (err) {
          console.error(err);
          next();
          return;
        }
        var writeStream = fs.createWriteStream(cachedPath);
        writeStream.on("error", console.error);
        stdout.pipe(writeStream);
        stdout.pipe(res);
        stderr.pipe(process.stderr);
      });
    });
  }
});

// Allow sizes in power of 2 up to 4k
function isValidSize(size) {
  return !(size & (size - 1)) && size <= 4096;
}

app.use(function (err, req, res, next) {
    console.error(err.stack);
    next();
});

app.use(express.static(dir));
app.listen(process.env.PORT || 8080);
