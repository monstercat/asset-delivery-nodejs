const path    = require('path');
const fs      = require('fs');
const express = require('express');
const gm      = require('gm').subClass({imageMagick: true});
const mkdirp  = require('mkdirp');

const app = express();
const dir = process.env.BIN || path.join(__dirname, 'bin');
const cache = process.env.CACHE || path.join(__dirname, 'cache');
const pass = process.env.FORCE_PASS || undefined;

app.get('/*', (req, res, next)=> {
  let size = req.query.image_width;
  let force = req.query.hasOwnProperty('force') && req.query.force == pass;
  if (!size || !isValidSize(size)) {
    return next();
  }

  let xpath = decodeURI(req.path);
  let filePath = path.join(dir, xpath);
  let cachedPath = path.join(cache, path.join(
      path.dirname(xpath), 
      size + "_" + path.basename(xpath)));

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
