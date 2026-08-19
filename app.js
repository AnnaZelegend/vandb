// Only one-way hashes are stored here; the actual codes are not published.
const PROFILE_CODE_HASHES = {
  victor: '956d65dd44fb4a521d5b77611205014942db66bc8d84dc7178113579d177c8a8',
  boris: 'a6ab2e9ef8eb0122f306fa09b5167cbfa5e836eee9bf29280124a4d1bb4aaa84'
};

const cards = document.querySelectorAll('.profile-card');
const dialog = document.querySelector('#code-dialog');
const form = document.querySelector('#code-form');
const codeInput = document.querySelector('#profile-code');
const profileName = document.querySelector('#profile-name');
const errorMessage = document.querySelector('#code-error');
const closeButton = document.querySelector('.dialog-close');
let selectedProfile = '';
let selectedDestination = '';

cards.forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.querySelector('.portrait').style.translate = `${x * 8}px ${y * 5}px`;
  });

  card.addEventListener('pointerleave', () => {
    card.querySelector('.portrait').style.translate = '0 0';
  });

  card.addEventListener('click', (event) => {
    event.preventDefault();
    selectedProfile = card.dataset.profile;
    selectedDestination = card.getAttribute('href');
    profileName.textContent = selectedProfile[0].toUpperCase() + selectedProfile.slice(1);
    form.reset();
    clearError();
    dialog.showModal();
    requestAnimationFrame(() => codeInput.focus());
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const enteredCode = codeInput.value.trim().toLowerCase();
  const enteredHash = await sha256(enteredCode);

  if (enteredHash === PROFILE_CODE_HASHES[selectedProfile]) {
    sessionStorage.setItem(`vb-unlocked-${selectedProfile}`, enteredHash);
    window.location.assign(selectedDestination);
    return;
  }

  errorMessage.textContent = `That isn't ${profileName.textContent}'s code. Try again.`;
  codeInput.classList.remove('invalid');
  void codeInput.offsetWidth;
  codeInput.classList.add('invalid');
  codeInput.select();
});

codeInput.addEventListener('input', clearError);
closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

function clearError() {
  errorMessage.textContent = '';
  codeInput.classList.remove('invalid');
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
