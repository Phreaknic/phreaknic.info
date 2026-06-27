#!/bin/sh -x
mkdir build
for f in index.html \
Orbitron-VariableFont_wght.ttf \
script.js \
ShareTechMono-Regular.ttf \
speakers.json \
styles.css \
topics.json \
; do
	cp "$f" build/
done
