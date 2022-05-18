var core = {
  "error": function () {
    app.popup.send("error");
    config.extension.progress = false;
  },
  "success": function () {
    app.popup.send("success");
    config.extension.progress = false;
    /*  */
    app.popup.post("progress", {
      "message": "Download complete! ZIP file is ready.",
    });
  },
  "process": function (url) {
    var id = core.extract.id(url);
    if (id) {
      app.popup.send("render", {"id": id, "url": url});
    } else {
      app.popup.send("render", {"id": "N/A", "url": ''});
    }
  },
  "extract": {
    "id": function (url) {
      if (url) {
        if (url.indexOf("http") === 0) {
          var result = config.regx.url.exec(url);
          if (result && result.length) {
            if (result[1]) {
              var id = result[1];
              if (id) return id;
            }
          }
        } 
      }
      /*  */
      return null;
    }
  },
  "download": function (url, format) {
    config.extension.id = core.extract.id(url);
    if (config.extension.id) {
      app.popup.post("progress", {
        "message": "Preparing to download, please wait...",
      });
      /*  */
      config.version.current = config.version.browser();
      if (config.version.current) {
        config.version.final = config.version.current.major + '.' + config.version.current.minor + '.' + config.version.current.build + '.' + config.version.current.patch;
        if (config.version.final) {
          if (format === "crx") {
            var a = "%26uc&acceptformat=crx2,crx3";
            var b = config.download.base + "?response=redirect&prodversion=";
            var c = config.version.final + "&acceptformat=crx2,crx3&x=id%3D" + config.extension.id;
            /*  */
            config.download.as.crx((b + c + a), config.extension.id, core.success);
          } else if (format === "zip") {
            var a = config.version.final + "&x=id%3D" + config.extension.id;
            var b = config.download.base + "?response=redirect&prodversion=";
            var c = "%26installsource%3Dondemand%26uc&acceptformat=crx2,crx3";
            /*  */
            config.extension.fetch((b + a + c), function (blob) {
              config.download.as.zip(blob, config.extension.id, core.success);
            });
          }
          /*  */
          return;
        }
      }
    }
    /*  */
    app.popup.send("error");
  }
};

app.popup.receive("download", function (e) {
  core.download(e.url, e.format);
});

app.popup.receive("reload", function () {
  app.tab.query.active(function (tab) {
    app.tab.reload(tab);
  });
});

app.popup.receive("extract", function (e) {
  if (e.url) {
    var id = core.extract.id(e.url);
    if (id) config.last.url = e.url;
  } else config.last.url = '';
  /*  */
  app.popup.send("id", {"id": id ? id : "N/A"});
});

app.popup.receive("load", function () {
  app.tab.query.active(function (tab) {    
    if (tab) {
      if (tab.url) {
        var id = core.extract.id(tab.url);
        if (id) config.last.url = tab.url;
        /*  */
        core.process(id ? tab.url : config.last.url);
      }
    }
  });
});

app.popup.receive("support", function () {app.tab.open(app.homepage())});
app.popup.receive("donation", function () {app.tab.open(app.homepage() + "?reason=support")});