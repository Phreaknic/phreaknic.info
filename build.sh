#!/bin/sh -x
mkdir -p build schedule speakers
for page in schedule speakers; do
  sed 's|<head>|<head>\n  <base href="../">|' index.html > "$page/index.html"
done
for f in index.html \
schedule \
speakers \
api \
fonts \
images \
schemas \
script.js \
styles.css \
videos \
; do
	cp -r "$f" build/
done
