Enter an url like https://www.arte.tv/fr/videos/068406-004-A/les-routes-de-l-esclavage-4-4/ and press enter.

<input type="text" name="url" id="urlInput" style="width: 100%;" placeholder="https://www.arte.tv/XX/videos/123456-123-A/XXXXXXXXXXXXXX/">
<div id="results"></div>

---

This website uses [arte.tv](https://www.arte.tv/)'s open API to retreive the video stream URLs.

Nothing is sent to the server and you can read the source code of this page on [github](https://raw.githubusercontent.com/mat-tso/arte.tv/master/index.md).

<script>
(function() {

  window.onhashchange = function() {
    const id = location.hash.substr(1)
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

      function compare(array) {
        for (let i in array) {
          if (array[i] != 0) {
            return array[i];
          }
        }
        return 0;
      }
      const data = Object.values(VSR).sort(function(l, r) {
        return compare([r.bitrate - l.bitrate,
          r.mimeType.localeCompare(l.mimeType),
          r.versionShortLibelle.localeCompare(l.versionShortLibelle)
        ])
      })

      for (let i in data) {
        const r = data[i]
        data[i] = {
          'URL': r.url,
          'Format': r.mediaType,
          'Version': r.versionLibelle,
          'Bitrate': r.bitrate,
        }
      }

      function create(t, a, f) {
        const n = document.createElement(t);
        for (let k in a) {
          n.appendChild(f(k, a[k]))
        }
        return n
      }

      function createLink(href, text) {
        a = document.createElement("a")
        a.href = href
        a.text = text
        return a
      }
      if (!data[0]) {
        alert("empty data");
        return
      }
      const table = create("table", data, function(_, v) {
        return create("tr", v, function(k, v) {
          return create("th", [null], function(_, _) {
            if (k === "URL") {
              return createLink(v, "link")
            }
            return document.createTextNode(v)
          })
        })
      })
      table.prepend(create("tr", data[0], function(k, _) {
        return create("th", [null], function(_, _) {
          return document.createTextNode(k)
        })
      }))

      const result = document.createElement("div")
      result.appendChild(document.createTextNode("Videos for id: "))
      result.appendChild(createLink(videoJsonPlayer.VTR, id))
      result.appendChild(table)
      result.appendChild(document.createTextNode("Data fetched from "))
      result.appendChild(createLink(apiUrl, "Arte's open API"))

      const results = document.getElementById("results")
      results.insertBefore(result, results.firstChild)

    };
    xobj.send(null)
  }

  document.getElementById("urlInput").onchange = function(e) {
    const url = e.target.value;
    const id = url.split("/")[5];
    if (id === undefined) {
      alert("Malformed URL, expected format: \n" + e.target.placeholder);
      return
    }
    location.hash = id;
  }

})()
</script>
