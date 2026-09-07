# Personal website — local development

The `html` branch contains the static HTML/CSS website. It needs Python 3 and
Make (both available on this Mac), with no package installation or compilation.
The `main` branch and existing GitHub Actions workflow use a separate Hugo setup.

## Run locally

```sh
cd ~/Code/bytetriper.github.io
make serve
```

Open http://127.0.0.1:8000. Edit `index.html`, `stylesheet.css`, or files in
`imgs/`, then refresh your browser. Stop the server with Ctrl+C.
Choose another port with `make serve PORT=8001`.

## Build and preview

```sh
make build      # Copy the static site into dist/
make preview    # Build and serve dist/ at http://127.0.0.1:8000
```

Stop any existing server on the same port first, or use `make preview PORT=8001`.
The build copies HTML, CSS, images, assets, project files, and resume files.
Markdown files are copied as-is; this branch has no Markdown compilation step.
For a fresh build after deleting or renaming source files, remove `dist/` first.
Generated output and macOS metadata are ignored by Git.

To serve without Make: `python3 -m http.server 8000 --bind 127.0.0.1`.
