var config = {};

config.last = {
  set url (val) {app.storage.write("lasturl", val)},
  get url () {return app.storage.read("lasturl") !== undefined ? app.storage.read("lasturl") : 0}
};

config.welcome = {
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.regx = {
  "useragent": /Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/,
  "url": /^https?:\/\/chrome.google.com\/webstore\/.+?\/([a-z]{32})(?=[\/#?]|$)/
};

config.version = {
  "final": null,
  "current": null,
  "browser": function () {
    var useragent = navigator.userAgent.match(config.regx.useragent);
    if (useragent === null || useragent.length !== 5) {
      return undefined;
    }
    /*  */
    useragent = useragent.map(e => parseInt(e, 10));
    return {
      "major": useragent[1],
      "minor": useragent[2],
      "build": useragent[3],
      "patch": useragent[4]
    };
  }
};

config.convert = {
  "to": {
    "zip": function (buffer, callback) {
      if (buffer) {
        var offset;
        var arr = new Uint8Array(buffer);
        /*  */
        if (arr[4] === 2) {
          var header = 16;
          var key = 0 + arr[8] + (arr[9] << 8) + (arr[10] << 16) + (arr[11] << 24);
          var sig = 0 + arr[12] + (arr[13] << 8) + (arr[14] << 16) + (arr[15] << 24);
          offset = header + key + sig;
        } else {
          var key =  0 + arr[8] + (arr[9] << 8) + (arr[10] << 16) + (arr[11] << 24 >>> 0);
          offset = 12 + key;
        }
        /*  */
        if (offset) {
          var blob = new Blob([new Uint8Array(buffer, offset)], {"type": "application/zip"});
          if (blob) {
            callback(blob);
          }
        }
      }
    }
  }
};

config.download = {
  "base": "https://clients2.google.com/service/update2/crx",
  "as": {
    "crx": function (url, filename, callback) {
      if (url) {
        app.popup.post("progress", {
          "message": "Preparing to download as CRX, please wait...",
        });
        /*  */
        app.downloads.start({
          "url": url,
          "filename": filename ? filename + ".crx" : "result.crx"
        }, callback);
      } else {
        core.error();
      }
    },
    "zip": function (blob, filename, callback) {
      if (blob) {
        app.popup.post("progress", {
          "message": "Preparing to download as ZIP, please wait...",
        });
        /*  */
        var reader = new FileReader();
        /*  */
        reader.onload = function (e) {
          if (e) {
            var url = e.target.result;
            if (url) {
              app.downloads.start({
                "url": url,
                "filename": filename ? filename + ".zip" : "result.zip"
              }, callback);
            }
          } else {
            core.error();
          }
        };
        /*  */
        reader.readAsDataURL(blob);
      } else {
        core.error();
      }
    }
  }
};

config.extension = {
  "id": undefined,
  "progress": false,
  "fetch": async function (url, callback) {    
    if (config.extension.progress === false) {
      config.extension.progress = true;
      /*  */
      try {
        app.popup.post("progress", {
          "message": "Fetching data from the webstore, please wait...",
        });
        /*  */
        var response = await fetch(url, {"responseType": "blob"});
        if (response) {
          if (response.ok) {
            if (response.body) {
              var loaded = 0;
              var chunks = [];
              var reader = response.body.getReader();
              var total = parseInt(response.headers.get("Content-Length") || '0', 10);
              /*  */
              if (reader) {
                while (true) {
                  var result = await reader.read();
                  if (result.done) break;
                  /*  */
                  chunks.push(result.value);
                  loaded += result.value.length;
                  /*  */
                  app.popup.post("progress", {
                    "total": total,
                    "loaded": loaded
                  });
                }
                /*  */
                if (chunks.length) {
                  var blob = new Blob(chunks, {"type": "application/zip"});
                  var buffer = await blob.arrayBuffer();
                  config.convert.to.zip(buffer, callback);
                  /*  */
                  app.popup.post("progress", {
                    "message": "Converting to ZIP, please wait...",
                  });
                }
              } else {
                core.error();
              }
            } else {
              core.error();
            }
          } else {
            core.error();
          }
        } else {
          core.error();
        }
      } catch (e) {
        core.error();
      }
    }
  }
};
