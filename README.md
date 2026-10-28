# Mika Williamson: Systems Portfolio

I optimise systems, physical and digital, and I build AI that runs them. This is my portfolio: a single page that walks from CNC routers and 3D-print production to robotics, machine learning and agentic AI.

**Live:** https://mikachamp.github.io/portfolio/

## What's inside

- `index.html`: the portfolio. Selected work (Mika OS, BPD Capture, Dime3 hardware), work history, skills and education.
- `BPD-Capture/`: a case study of the offline Android and Windows field-photo app I built for Blueprint Digital, plus the interactive startup-animation gallery and the colour-scheme comparison. Client names and job numbers in the demos and screenshots are replaced with placeholders.
- `Concepts/`: four interactive three.js pieces. A career flow (hero and detailed), a career graph, a CNC router controller you can run and a dual-nozzle 3D printer that prints each project.
- `media/`: screenshots used on the page.

## How it's built and tested

Plain HTML, CSS and JavaScript, no build step. The 3D parts use three.js (loaded from a CDN) and fall back gracefully when WebGL is not available. Every page is checked in headless Chrome at 1440x900 and 390x844 for console errors, failed requests, images that don't load and sideways scrolling, both from `file://` and over a local web server. All links are relative so it works from a GitHub Pages sub-path.

To run it locally, serve the folder with any static server (for example `npx http-server`) and open it in a browser.

## Licence

Code is MIT. Images and content are (c) Mika Williamson. See `LICENSE`.
