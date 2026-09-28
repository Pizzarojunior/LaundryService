# Suds & Fold: laundry services website

A static website for a laundry business: services, a price estimator (in Ghana cedis), a pickup booking form, and an admin page for booked services.

## Files

```
index.html        page structure
css/style.css     all styling
js/script.js      menu, price estimator, booking form, admin page
images/           SVG illustrations (replace with your own photos)
```

## Run it

Open `index.html` in a browser. No build step or install is needed.

## Put it online with GitHub Pages

1. Create a new repository on GitHub and upload everything in this folder (keep the folders as they are).
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and the `/ (root)` folder, then save.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

## Change things

- **Prices:** edit the labels and the `data-p` values in the price estimator in `index.html`.
- **Business name and hours:** edit `index.html`.
- **Photos:** save your photos in `images/` and point the `src` or `background-image` in `index.html` (and `--bubbles` in `css/style.css`) at them.

## Bookings and the admin page

- Open `index.html#admin` (or use the "Admin login" button) to reach the admin login.
- **Important:** on GitHub Pages there is no server, so bookings are saved in the customer's own browser only. The admin page can only show bookings made in the same browser. To receive real bookings, connect the form to a service such as Formspree, EmailJS or Firebase.
- The admin login is checked in the browser, so it only hides the page and is not real security. To change the password, generate a new SHA-256 hash of `username:password` (username in lowercase) and replace the `HASH` value in `js/script.js`. In the browser console:

```js
crypto.subtle.digest("SHA-256", new TextEncoder().encode("admin:YourNewPassword"))
  .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("")));
```
