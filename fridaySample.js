'use strict';

function say(words) {
  //print out words
  let normalized = normalize(words);
  render(normalized);
}

function normalize(str) {
  //format our words
  return str.toUpperCase;
}

function render(something) {
//put our words on the page
console.log(something);
}

say(name);
