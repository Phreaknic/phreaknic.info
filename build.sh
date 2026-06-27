#!/bin/sh -x
mkdir build
for f in index.html \
api \
fonts \
images \
schemas \
script.js \
styles.css \
; do
	cp -r "$f" build/
done
