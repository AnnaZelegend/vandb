const profile = document.documentElement.dataset.profile;
const allowedHashes = {
  victor: '956d65dd44fb4a521d5b77611205014942db66bc8d84dc7178113579d177c8a8',
  boris: 'a6ab2e9ef8eb0122f306fa09b5167cbfa5e836eee9bf29280124a4d1bb4aaa84'
};

if (sessionStorage.getItem(`vb-unlocked-${profile}`) !== allowedHashes[profile]) {
  window.location.replace('index.html');
} else {
  document.documentElement.classList.add('profile-unlocked');
}
