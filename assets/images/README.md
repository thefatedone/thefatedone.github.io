# Profile Photo

Profile photo lives at `assets/images/profile.png` and is rendered in
the About section with a square frame and soft rounded corners
(`border-radius: 18px`). The container's background uses `var(--bg-color)`
so the photo's transparent PNG blends seamlessly with both the dark
and light themes — no `mix-blend-mode` or filters needed.

## Replacing the photo

Drop a JPEG/PNG (head-and-shoulders, ≥600×600 px) anywhere and run:

```bash
node scripts/process-profile.js path/to/source.jpg
```

This writes a transparent PNG to `assets/images/profile.png`. Skip the
script and just overwrite the file directly if your source already has
a transparent background.
