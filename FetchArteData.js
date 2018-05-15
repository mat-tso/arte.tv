(function() {
  "use strict"

  function fetchData() {
    const id = location.hash.substr(1)
    if (!id) {
      return
    }
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

      const data = dataRaw.map(function(r) {
        return {
          'URL': r.url,
          'Format': r.mediaType,
          'Version': r.versionLibelle,
          'Bitrate': r.bitrate,
        }
      })


      function create(t, a, f) {
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
        const n = document.createElement(tag);
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
          return create("tr", v, function(k, v) {
            return createNode("td", [k === "URL" ? createLink(v, "link") : v])
          })
        })
        rows.unshift(create("tr", data[0], function(k, _) {
          return createNode("th", [k])
        }))
        return rows
      }
      const table = createNode("table", genRows(data))

      const result = createNode("div", [
        createNode("hr", []),
        createNode("h4", [videoJsonPlayer.VTI || "[No title]"]),
        videoJsonPlayer.subtitle ? createNode("h5", [videoJsonPlayer.subtitle]) : "",
        createNode("p", [videoJsonPlayer.VDE || "[No description]" ]),
        createNode("p", ["Duration: ", videoJsonPlayer.VDU || "[No duration]"," minutes"]),
        "Page: ", createLink(videoJsonPlayer.VTR || videoJsonPlayer.VUP || "#", id),
        table,
        "Data fetched from ", createLink(apiUrl, "Arte's open API"),
      ])

      const results = document.getElementById("results")
      results.insertBefore(result, results.firstChild)

    };
    xobj.send(null)
  }

  fetchData() // If loading page with hash
  window.onhashchange = fetchData

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
