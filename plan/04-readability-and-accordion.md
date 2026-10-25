# Readability and exclusive methodology accordion

Follow-up requested 25 October 2026, with a screenshot of the methodology section.

## Plan

1. Raise the page's smallest labels, metadata, controls and footnotes from the existing 7–13px rules to a shared 14px minimum. Use 16px for explanatory prose and candidate/price text where appropriate. Keep a clear heading hierarchy.
2. Widen dense columns and reflow cards/metadata earlier at smaller widths rather than making fonts small again. Keep map state abbreviations readable independently of SVG scaling.
3. Give only the four methodology `details` elements the same native `name` group. Preserve the initially open polling section and allow the active section to close. Opening another section must close the previous one. Recent-poll disclosures on race cards stay independent.
4. Run the existing checks and production Pages build. Inspect desktop and narrow layouts, verify all accordion transitions including keyboard use, and check wrapping at 390px and 320px. Keep proof screenshots and update the progress ledger before committing and pushing.

## Notes

The native grouped-details behavior is documented by [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details#name). No dependency or new accordion state layer is needed for the current browser target. The user's requested change is page typography and methodology disclosure behavior; polling, market adapters and backend contracts stay unchanged.

## Result

- Added shared 14px/16px text tokens, removed all sub-14px font declarations, and increased metadata, controls, poll names/prices, footnotes and explanatory prose. Muted text has stronger contrast.
- Reflowed the map panel/cards earlier, allowed metadata wrapping, and shortened the market column heading without changing its meaning. Map labels now use fixed-size HTML overlays with readable backplates instead of scaling down with SVG text.
- The four methodology disclosures share `name="methodology"`; the first remains open initially. Browser checks cover all four sections, opening via Enter, automatic closure of the preceding section, and closing the active section. No new client state or dependency was added.
- `npm run check` passes (strict TypeScript, lint and all nine existing tests); the final `npm run build:pages` passes. This reversible presentation change was verified in the browser rather than with implementation-mirroring unit tests.
- At the 942px desktop viewport, the browser reports 14px as the smallest visible text and 16px for methodology paragraphs, with no page overflow. Inspected 390px and 320px layouts in temporary iframe viewports; larger text wraps and each document keeps only one methodology section open.
- The temporary QA page was removed by final packaging. The user's pre-existing development server was left running. It retained a six-race backend bundle; the fresh Pages runtime returns all nine. Restarting the development command refreshes that cached local bundle.
