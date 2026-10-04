# BergenBike

Concept app by TU/e Team 19 for De Bergen, Eindhoven: find secure bike parking, register your bike, and report or
check a stolen bike.

**Live demo:** https://tonil00.github.io/bergenbike/

Open it on a phone to get the app. On a desktop you get the project page with a QR code; "Open the app" there shows
the phone app in a preview frame.

## What works

- **Map** of De Bergen with guarded storage, lockers and racks. Filter by type, search, tap a pin, and open
  directions in your maps app.
- **Spot details** with the reasons for a rating, where the information came from, and a confirm button.
- **Add or update a spot.** New spots show as unverified until other riders confirm them.
- **My bike:** register a bike with frame number, photo, description and tracker.
- **Report stolen** and **check a bike** by frame number. Reporting your bike makes its frame number show up as
  stolen in the check.
- **Alerts** for your bike and the neighbourhood.

This is a prototype. There is no server: everything is stored in the browser on your own device, and other
riders, the tracker and the frame-number scanner are simulated. "Reset demo data" at the bottom of the Alerts
tab restores the starting state. The frame number `BK 7731 0452` is the sample stolen bike.

## Develop

```sh
npm install
npm run dev      # local dev server
npm run build    # type-check and build to dist/
```

Built with Vite, React, TypeScript and Leaflet. Map data and tiles © OpenStreetMap contributors.

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.
