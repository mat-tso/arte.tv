Enter an url like https://www.arte.tv/fr/videos/068406-004-A/les-routes-de-l-esclavage-4-4/ and press enter.
    <input type="text" name="url" id="urlInput" style="width: 100%;" placeholder="https://www.arte.tv/XX/videos/123456-123-A/XXXXXXXXXXXXXX/">
    <div id="result" />
    <script>
      document.getElementById("urlInput").onchange = function(e) {

        const url = e.target.value;
        const id = url.split("/")[5];
        if (id === undefined) {
          alert("Malformed URL");
          return
        }
        // https://www.arte.tv/fr/videos/068406-004-A/les-routes-de-l-esclavage-4-4/
        const xobj = new XMLHttpRequest();
        xobj.responseType = 'json';
        xobj.open('GET', "https://api.arte.tv/api/player/v1/config/fr/" + id);
        xobj.onload = function() {
          function comp(array) {
            for (let i in array) {
              if (array[i] != 0) {
                return array[i];
              }
            }
            return 0;
          }
          const data = Object.values(xobj.response.videoJsonPlayer.VSR).sort(function(l, r) {
            return comp([r.bitrate - l.bitrate,
              r.mimeType.localeCompare(l.mimeType),
              r.versionShortLibelle.localeCompare(l.versionShortLibelle)
            ])
          })

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
                if (k === "url") {
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
          const result = document.getElementById("result")
          result.prepend(table)
          result.prepend(createLink(url, url))
        };
        xobj.send(null)
      }
    </script>

  </body>
</html>