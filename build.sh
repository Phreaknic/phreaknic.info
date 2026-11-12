#!/bin/sh -x
set -eu
mkdir -p build badge-customizer
for page in badge-customizer; do
  sed 's|<head>|<head>\n  <base href="../">|' index.html > "$page/index.html"
done
for f in index.html \
schedule \
speakers \
badge-customizer \
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
