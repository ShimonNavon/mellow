# Mellow

A personal chill room: six slow ambient scenes that never repeat. Every note is synthesised live in the browser with the Web Audio API, so there are no audio files — the app is one HTML file plus a service worker, deployed as its own Cloudflare Worker at **https://mellow.navonsimon.com/**.

## Scenes

Dusk · Rain Window · Slow Tide · Night Drive · First Light · Ember — each with its own chord progression, pad colour, pluck pattern and noise bed. Rain and vinyl can be layered on top of any scene. A sleep timer, volume and the last scene are remembered locally.

## Run it

```bash
python3 -m http.server 8781 --directory public
```

Open http://localhost:8781/ and press play.

## Deploy

```bash
npx wrangler deploy
```

`wrangler.jsonc` names the worker `mellow` and binds the custom domain `mellow.navonsimon.com`. There is no build step.

Bump `CACHE` in `public/sw.js` when shipping UI changes, otherwise phones keep the old shell.

## How the sound works

- **Pads** — detuned triangle/saw oscillators over a slow low-pass LFO, chords crossfading every 13–17 seconds.
- **Plucks** — pentatonic notes with short attacks through a filtered delay and convolution reverb.
- **Beds** — generated pink/brown noise loops with slow gain modulation (air, rain, waves, vinyl crackle).
- **Master** — gain into a soft-clip WaveShaper; peaks stay under 0.9 and scenes sit around −19 LUFS.

`__mellow.renderWav('dusk', 14)` in the console renders a scene offline and returns a WAV. Previews of all six live in `preview/`.

## Verified

- All six scenes render with no clipping (peak ≤ 0.38 at 0.75 master), RMS 0.10–0.12 and spectral centroid 250–730 Hz — warm, low and mellow.
- Live play starts a running AudioContext, the analyser reports signal, and there are no console errors at 1440 px or 390 px.
