# Profile Photo

Profile photo lives at `assets/images/profile.png` and is rendered in the
About section with a square frame and soft rounded corners (`border-radius:
18px`). The container's background uses `var(--bg-color)` so the photo's
white source background blends seamlessly with both light and dark themes
(`mix-blend-mode: multiply` is applied in dark mode to collapse the white
halo into the dark theme background).

## Replacing the photo

Drop a JPEG/PNG (head-and-shoulders, ≥600×600 px) anywhere and run:

```bash
node scripts/process-profile.js path/to/source.jpg
```

This writes a transparent PNG to `assets/images/profile.png`. Without
running the script, you can also just overwrite the file directly — the
existing CSS will still blend the white background with the theme.
