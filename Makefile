PYTHON ?= python3
PORT ?= 8000

.PHONY: serve build preview

# Serve source files; refresh the browser after editing HTML or CSS.
serve:
	$(PYTHON) -m http.server $(PORT) --bind 127.0.0.1

# This branch is a static site: building packages its files without compilation.
build:
	mkdir -p dist
	cp index.html stylesheet.css dist/
	cp -R imgs assets projects resume milktea-leaderboard dist/
	find dist -name .DS_Store -delete

preview: build
	$(PYTHON) -m http.server $(PORT) --bind 127.0.0.1 --directory dist
