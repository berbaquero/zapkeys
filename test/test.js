import { ZapKeys } from './index.js';

const shortcuts = new ZapKeys();

shortcuts.init();

// Generate a bunch of links for testing of sequences

const words =
  'These are a large amount of words and each one is a link which leads nowhere but it is really helpful to test that ZapKeys is able to handle many interactive elements at once, by using sequences.';
const wordList = `${words} ${words} ${words}`.split(' ');

wordList.forEach(word => {
  const link = document.createElement('a');
  link.innerText = word;
  link.href = `#${word}`;
  link.className = 'word-link';

  document.getElementById('sequence-testing').appendChild(link);
});
