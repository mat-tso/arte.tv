<div id="results"></div>

Enter an url like [https://www.arte.tv/fr/videos/068406-001-A/les-routes-de-l-esclavage-1-4/](#068406-001-A) and press enter.

<input type="text" name="url" id="urlInput" style="width: 100%;" placeholder="https://www.arte.tv/XX/videos/123456-123-A/XXXXXXXXXXXXXX/">

<form action=".">
    <input type="submit" value="Reset the page" />
</form>

---

This website uses [arte.tv](https://www.arte.tv/)'s open API to retreive the video metadatas.

Nothing is sent to the server and you can peek at the magic on [github](https://github.com/mat-tso/arte.tv/blob/master/FetchArteData.js).

Pro tip: you can query multiple videos by separating them with `,` in the [URL hash](#068406-001,068406-002,068406-003,068406-004).

All modern browser are supported as well as Internet Explorer 11.

<script src="FetchArteData.js"></script>
