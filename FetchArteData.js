(function () {
  "use strict";
  // NOTE: all `var` should be `const`, but can not for old browser compatibilty

  function createMap(t, a, f) {
    var n = document.createElement(t);
    for (var k in a) {
      n.appendChild(f(k, a[k]));
    }
    return n;
  }

  function createLink(href, text) {
    var a = document.createElement("a");
    a.href = href;
    a.text = text;
    return a;
  }

  function createNode(tag, children) {
    var n = document.createElement(tag);
    for (var i in children) {
      var child = children[i];
      if (["string", "number", "boolean"].indexOf(typeof(child)) != -1) {
        child = document.createTextNode(child);
      }
      n.appendChild(child);
    }
    return n;
  }

  function fetchData(id, output) {
    var apiUrl = "https://api.arte.tv/api/player/v1/config/fr/" + id;
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json"); // no .responseType = "json" in IE
    xobj.open('GET', apiUrl, true);
    xobj.onload = function () {
      function error(msg, cName) {
        var errorNode = createNode("p", [msg]);
        errorNode.className = cName || "";
        return errorNode;
      }
      var jsonResponse = JSON.parse(xobj.responseText);
      var videoJsonPlayer = jsonResponse.videoJsonPlayer;
      var VSR = videoJsonPlayer.VSR;
      if (VSR === undefined) {
        output.appendChild(error("Error: API querry failed to " + apiUrl, "err"));
        return;
      }

      var dataRaw = Object.keys(VSR).map(function (k) {
        return VSR[k];
      }).sort(function (l, r) {
        var priority = [
          r.bitrate - l.bitrate,
          r.mimeType.localeCompare(l.mimeType),
          r.versionShortLibelle.localeCompare(l.versionShortLibelle)];
        for (var i in priority) { // no Array.find in IE
          if (priority[i] != 0) {
            return priority[i];
          }
        }
        return 0;
      });

      var maxBitrate = Math.max.apply(null, dataRaw.map(function (e) {
        return e.bitrate;
      }));
      var data = dataRaw.filter(function (r) {
        return r.bitrate === maxBitrate;
      }).map(function (r) {
        return {
          'URL': r.url,
          'Format': r.mediaType,
          'Version': r.versionLibelle,
          'Bitrate': r.bitrate
        };
      });

      function genRows(data) {
        if (!data[0]) {
          return [error("[No videos]")];
        }

        var rows = data.map(function (v) {
          return createMap("tr", v, function (k, v) {
            return createNode("td", [k === "URL" ? createLink(v, "link") : v]);
          });
        });
        rows.unshift(createMap("tr", data[0], function (k, _) {
          return createNode("th", [k]);
        }));
        return rows;
      }

      var result = createNode("div", [
        createNode("h4", [videoJsonPlayer.VTI || "[No title]"]),
        videoJsonPlayer.subtitle ? createNode("h5", [videoJsonPlayer.subtitle]) : "",
        createNode("p", [videoJsonPlayer.V7T || videoJsonPlayer.VDE || "[No description]"]),
        createNode("p", ["Duration: ", videoJsonPlayer.VDU || "[No duration]", " minutes"]),
        "More info on the ", createLink(videoJsonPlayer.VTR || videoJsonPlayer.VUP || "#", "original page"), ".",
        createNode("table", genRows(data)),
        "Data fetched from ", createLink(apiUrl, "Arte's open API"),
        createNode("hr", [])]);
      output.appendChild(result);
    };
    xobj.send(null);
  }

  function fetchFromHash() {
    var results = document.getElementById("results");
    results.scrollIntoView();
    location.hash.substr(1).split(",").filter(function (id) {
      return id;
    }).forEach(function (id) {
      if (document.getElementById(id)) {
        return;
      }
      var result = document.createElement("div");
      result.id = id;
      results.appendChild(result);
      fetchData(id, result);
    });
  }

  fetchFromHash(); // If loading page with hash
  window.onhashchange = fetchFromHash;

  document.getElementById("urlInput").onchange = function (e) {
    var url = e.target.value;
    var id = url.split("/")[5];
    if (id === undefined) {
      alert("Malformed URL, expected format: \n" +
            "https://www.arte.tv/XX/videos/123456-123-A/XXXXXXXXXXXXXX/");
      return;
    }
    location.hash = id;
    e.target.placeholder = e.target.value;
    e.target.value = "";
  };
})();
