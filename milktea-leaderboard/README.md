# Milk tea leaderboard

Edit `entries.json`, then refresh the page. `make build` copies the entire page,
including data and images, to `dist/milktea-leaderboard/` for hosting.

- `stores` holds a name and logo per store. Reuse the same store ID across drinks.
- Each item in `entries` is one store + one drink, with a unique `id`.
- `tier` must be `S+`, `S`, `A`, `B`, `C`, or `D`. Each entry uses its tier’s color and badge.
  The list retains the order of entries in the file, without grouping by tier or numeric scores.
  Use `null` for an entry that has not been rated yet.
- `order` and `notes` are optional. Keep personal wording here.
- Set `sample` to `false` after replacing the example rankings.

## Logos and optional drink photos

Put store logos and drink photos in `images/`. Store logos appear on the left and
are shared by all entries from that store. Each entry can have a different photo.
Photos appear between the drink name and order preferences on desktop, and below
the name on narrow screens. The store logo links to the entry's Google Maps location.

Store example (replace the file and source with the verified brand asset):

```json
"store-id": {
  "name": "Actual store name",
  "logo": "images/store-logo.png",
  "logoSource": "https://official-store-website.example/"
}
```

Add to an entry:

```json
"image": "images/my-drink.jpg",
"imageAlt": "My roasted oolong milk tea with pearls",
"location": {
  "label": "Store branch / neighborhood",
  "url": "https://www.google.com/maps/search/?api=1&query=STORE+AND+ADDRESS"
}
```

Use an actual Google Maps place/share link for the chosen branch, or a search URL
with its store name and address. Set `image`, `imageAlt`, or `location` to `null`
(or omit them) to hide them. Missing photos leave no empty photo frame.

HEYTEA logo source: https://photos.prnasia.com/prnh/20200511/2800047-1LOGO?lang=0
The source credits HEYTEA. The asset is saved locally in `images/heytea-logo.jpg`.

## Price

Set `"price": {"amount": 6, "currency": "USD"}` on an entry to display $6 between order preferences and its tier. Omit `price` for an unknown price (shown as —).

## Tracks

Set `track` on each entry to `milktea`, `fruittea`, `hk-milktea`, `pure-tea`, or
`ready-to-drink-tea`. Each tab displays only its entries. An omitted track defaults to `milktea`.

## Health rating

`healthRating` is independent of taste: `A`, `B`, `C`, `D`, `E`, `F`, or `null`.
The page explains the sugar thresholds and personal E/F extension to Singapore's
A–D scale. Ratings are entered manually; they are not official certifications.

## Local editing

The private rating server and buttons live in `.local-tools/`, excluded from Git
and the static build. Only saved ratings in `entries.json` are published. The
public layout sliders save preferences in the visitor's browser, not on a server.
