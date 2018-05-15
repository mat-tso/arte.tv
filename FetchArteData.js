(function() {
  "use strict"

  function fetchData(id, output) {
    const apiUrl = "https://api.arte.tv/api/player/v1/config/fr/" + id
    const xobj = new XMLHttpRequest();
    xobj.responseType = 'json';
    xobj.open('GET', apiUrl);
    xobj.onload = function() {
      const videoJsonPlayer = xobj.response.videoJsonPlayer
      const VSR = xobj.response.videoJsonPlayer.VSR
      if (VSR === undefined) {
        alert("API querry failed to " + apiUrl)
        return
      }

      const dataRaw = Object.values(VSR).sort(function(l, r) {
        return [
          r.bitrate - l.bitrate,
          r.mimeType.localeCompare(l.mimeType),
          r.versionShortLibelle.localeCompare(l.versionShortLibelle)
        ].find(function(x) {
          return x != 0
        }) || 0
      })

      const maxBitrate = Math.max.apply(null, dataRaw.map(function(e) {
        return e.bitrate
      }))
      const data = dataRaw
        .filter(function(r) {
          return r.bitrate == maxBitrate
        }).map(function(r) {
          return {
            'URL': r.url,
            'Format': r.mediaType,
            'Version': r.versionLibelle,
            'Bitrate': r.bitrate,
          }
        })

      function createMap(t, a, f) {
        const n = document.createElement(t);
        for (let k in a) {
          n.appendChild(f(k, a[k]))
        }
        return n
      }

      function createLink(href, text) {
        const a = document.createElement("a")
        a.href = href
        a.text = text
        return a
      }

      function createNode(tag, children) {
        const n = document.createElement(tag)
        for (let i in children) {
          let child = children[i]
          if (["string", "number", "boolean"].includes(typeof(child))) {
            child = document.createTextNode(child)
          }
          n.appendChild(child)
        }
        return n
      }

      function genRows(data) {
        if (!data[0]) {
          alert("No video found");
          return []
        }

        const rows = data.map(function(v) {
          return createMap("tr", v, function(k, v) {
            return createNode("td", [k === "URL" ? createLink(v, "link") : v])
          })
        })
        rows.unshift(createMap("tr", data[0], function(k, _) {
          return createNode("th", [k])
        }))
        return rows
      }

      const result = createNode("div", [
        createNode("h4", [videoJsonPlayer.VTI || "[No title]"]),
        videoJsonPlayer.subtitle ? createNode("h5", [videoJsonPlayer.subtitle]) : "",
        createNode("p", [videoJsonPlayer.V7T || videoJsonPlayer.VDE || "[No description]"]),
        createNode("p", ["Duration: ", videoJsonPlayer.VDU || "[No duration]", " minutes"]),
        "More info on the ", createLink(videoJsonPlayer.VTR || videoJsonPlayer.VUP || "#", "original page"), ".",
        createNode("table", genRows(data)),
        "Data fetched from ", createLink(apiUrl, "Arte's open API"), createNode("hr", []),

      ])
      result.id = id
      output.appendChild(result)
    };
    xobj.send(null)
  }

  function fetchFromHash() {
    const ids = location.hash.substr(1).split(",")
      .filter(function(e) {
        return e
      })
    const results = document.getElementById("results")
    for (let i in ids) {
      const result = document.createElement("div")
      results.appendChild(result)
      fetchData(ids[i], result)
    }
  }

  fetchFromHash() // If loading page with hash
  window.onhashchange = fetchFromHash

  document.getElementById("urlInput").onchange = function(e) {
    const url = e.target.value;
    const id = url.split("/")[5];
    if (id === undefined) {
      alert("Malformed URL, expected format: \n" +
        "https://www.arte.tv/XX/videos/123456-123-A/XXXXXXXXXXXXXX/");
      return
    }
    location.hash = id;
    e.target.placeholder = e.target.value
    e.target.value = ""
  }
})()
