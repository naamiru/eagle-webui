**List Scale Slider**
- AppHeader on `CollectionPage` must expose a Mantine `Slider` control with values `0`–`100` (step `1`). Place it next to the existing layout controls and flank it with a `-` button on the left (decrease by `5`) and a `+` button on the right (increase by `5`). The buttons should clamp at the ends of the range.
- Do not render a visible label or tooltip for the slider; instead set an `aria-label="Scale"` on the slider and `aria-label="Zoom out"/"Zoom in"` on the buttons so the controls stay accessible.
- Keep the slider’s React state in `CollectionPage` and pass it down to `ItemList` via a new `listScale` prop. Initialise the state from persisted settings (see below) and fall back to `0` so the current layout stays the default.
- Update `ItemList` to derive its grid min column width from `listScale`. Use `repeat(auto-fill, minmax(var(--item-min-width), 1fr))` and set `--item-min-width` inline:  
  `const minWidth = scale === 100 ? '100%' : \`\${140 + scale * 4}px\`;`.  
  This preserves the existing 140 px columns at scale `0` and grows them smoothly until `scale === 100`, where the grid must collapse to a single column.
- Persist the slider value under the `listScale` key in `settings.json`. Debounce writes by ~300 ms so we avoid spamming disk. When the page mounts, load the saved value (if any) before rendering the slider.
- Ensure the mobile breakpoint (≤48 em) still respects the slider: use the same CSS variable approach inside the media query so the gap/column size follows the chosen scale.
- Add a quick smoke test: assert that changing the slider updates the CSS variable on `ItemList` and that the debounced persistence helper is called with the expected value.
