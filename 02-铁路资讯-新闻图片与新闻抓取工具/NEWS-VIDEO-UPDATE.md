# Railway news and video archive update

- `news.html`: expanded to 10 sourced railway/urban-transit stories with dates and source links. Artwork under `assets/news-covers/` is original editorial illustration, not event photography.
- `videos.html`: focused video archive with 42 user-provided Bilibili links plus 2 previously featured videos (44 total).
- `video-metadata.js`: browser-side attempt to retrieve public Bilibili titles, covers, dates and durations via the official view API (fetch first, JSONP fallback). Where access is blocked, cards retain a unique local BV-number cover and the original video link.
- Video media is embedded from Bilibili when a user presses the play control; it is not downloaded or re-hosted.
- All referenced video IDs came from the user-provided URLs.
