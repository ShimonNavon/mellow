# Mellow

A personal listening room: six generative ambient scenes that never repeat, plus a set of AI-generated focus streams to work to. Everything runs in one HTML file and streams from a Cloudflare Worker at **https://mellow.navonsimon.com/**.

## What's inside

**Scenes** — Dusk, Rain Window, Slow Tide, Night Drive, First Light, Ember. Pads, plucks and noise beds are synthesised live with the Web Audio API; rain and vinyl can be layered on any scene.

**Focus** — six generated soundscapes: Deep Focus, Rain Study, Café Hush, Night Library, Brown Noise, Slow Keys. Each is a 41-second seamless loop generated once with [Stable Audio 3](https://huggingface.co/spaces/stabilityai/stable-audio-3), streamed as MP3 and looped in the player. Focus sessions run 25, 50 or 90 minutes.

**Mac volume keys** — a tiny helper posts your Mac's output volume to the worker, so F10/F11/F12 (and the menu-bar slider) move Mellow's volume and show a macOS-style HUD. The worker stores the latest value in a Durable Object; the app polls it every 2.5 seconds.

Sleep timer, volume, last scene, textures and focus track are remembered locally. Installs as a PWA and keeps working offline (focus audio excepted).

## Run it

```bash
python3 -m http.server 8781 --directory public
```

Then open http://localhost:8781/ and press play.

## Deploy

```bash
npx wrangler deploy
```

- Static app in `public/`, served through the Worker's assets binding.
- `src/worker.js` only handles `/api/volume` (GET public, POST with `x-mellow-key`).
- `MELLOW_KEY` is a Worker secret; the helper reads the same key from `~/.config/mellow/volume-bridge.json`.
- Durable Object `VolumeStore` keeps the latest reading strongly consistent.

Bump `CACHE` in `public/sw.js` when shipping UI changes. The service worker deliberately ignores `/api/` and `/focus/`.

## Mac volume helper

```bash
bin/mellow-keys --once       # send the current volume
bin/mellow-keys              # run in the foreground
bin/mellow-keys --install    # LaunchAgent, starts at login
bin/mellow-keys --uninstall
```

It reads `get volume settings` (read-only), so it never changes your Mac. Config:

```json
{ "url": "https://mellow.navonsimon.com/api/volume", "key": "<MELLOW_KEY>" }
```

Set the secret with `wrangler secret put MELLOW_KEY`, then put the same value in `~/.config/mellow/volume-bridge.json` (mode 600). The token is intentionally not in the repo.

## How the sound works

- **Pads** — detuned triangle/saw oscillators over a slow low-pass LFO, chords crossfading every 13–17 seconds.
- **Plucks** — pentatonic notes with short attacks through a filtered delay and convolution reverb.
- **Beds** — generated pink/brown noise loops with slow gain modulation (air, rain, waves, vinyl crackle).
- **Master** — gain into a soft-clip WaveShaper; peaks stay under 0.9 and scenes sit around −19 LUFS.
- **Focus** — AI-generated 45-second takes, end-to-start crossfaded into 41-second loops, levelled to about −19.5 LUFS. Prompts and seeds are in `focus-prompts.json`.

`__mellow.renderWav('dusk', 14)` in the console renders a scene offline and returns a WAV. Previews of the six scenes live in `preview/` (not committed).

## Verified

- Six scenes render with no clipping (peak ≤ 0.38 at 0.75 master), RMS 0.10–0.12, spectral centroid 250–730 Hz.
- Focus loops stream with a live analyser signal, correct durations, media-key metadata, and no console errors at 1440 px or 390 px.
- Mac bridge: system volume changes are stored by the Durable Object and adopted by the open app within a few seconds, with the HUD labelled “Mac volume”.
