#!/usr/bin/env node
"use strict";
/*
 truwrap (v0.0.5-4)
 */
var renderer = require( "../index.js")({  left: 2,
										  right: process.stderr.columns - 2,
										  mode: 'soft',
										  outStream: process.stderr });

process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    renderer.write(chunk);
  }
});

process.stdin.on('end', function() {
  renderer.end();
});
