# Motion Graphics

Motion graphics drawn with code on an HTML5 canvas. There are no dependencies and no build step.

## Run

ES modules don't load over `file://`, so serve the folder:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Scenes

1. **Logo reveal**: expanding rings, an accent wipe and a title reveal
2. **Kinetic type**: words pop in with overshoot and elastic easing
3. **Particle network**: drifting points joined by lines when they're close
4. **Geometric loop**: a grid of squares rotating on a radial wave
5. **Lower third**: a broadcast-style name strap

## Controls

- Space: play / pause
- ← / →: previous / next scene
- Scrub bar: move through the current scene (this pauses playback)
- Loop scene: repeat the current scene

## Customise with URL parameters

| Param      | Example                     | Used by     |
|------------|-----------------------------|-------------|
| `title`    | `?title=GURUKUL`            | Logo reveal |
| `subtitle` | `&subtitle=Publications`    | Logo reveal |
| `name`     | `&name=Asha%20Rao`          | Lower third |
| `role`     | `&role=Editor`              | Lower third |
| `accent`   | `&accent=00c2a8` (hex, no #)| All scenes  |
| `scene`    | `&scene=2` (0-based)        | Start scene |

## Adding a scene

Add an object to `src/scenes.js` and include it in the exported `scenes` array:

```js
const myScene = {
  name: 'My scene',
  duration: 5,                 // seconds
  setup(ctx, W, H) {},         // optional, runs once
  draw(ctx, t, W, H) {},       // t = seconds into the scene
};
```

`src/ease.js` has easing functions and a `range(t, start, end)` helper for timing keyframes.

## Exporting video

To export a clip, use a screen recorder, or record the canvas with
`canvas.captureStream()` and `MediaRecorder` to get a `.webm` file.
