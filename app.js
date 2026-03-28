const MAX_LEN = 200;
/** English plaintext / Caesar ciphertext: letters and spaces only */
const ENGLISH_ONLY = /^[A-Za-z ]*$/;

const els = {
  tabs: document.querySelectorAll(".tab"),
  key: document.getElementById("key"),
  textLabel: document.getElementById("text-label"),
  text: document.getElementById("text"),
  charCount: document.getElementById("char-count"),
  run: document.getElementById("run"),
  copy: document.getElementById("copy"),
  output: document.getElementById("output"),
  status: document.getElementById("status"),
};

/** @type {'encrypt' | 'decrypt'} */
let mode = "encrypt";

function setStatus(message, kind = "") {
  els.status.textContent = message;
  els.status.classList.remove("is-error", "is-success");
  if (kind === "error") els.status.classList.add("is-error");
  if (kind === "success") els.status.classList.add("is-success");
}

/**
 * @param {string} raw
 * @returns {number | null}
 */
function parseKey(raw) {
  const s = raw.trim();
  if (s === "" || !/^\d+$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isSafeInteger(n) || n <= 1) return null;
  return n;
}

/**
 * @param {string} c
 * @param {number} shift 0–25 effective shift
 * @param {boolean} decrypt
 */
function shiftLetter(c, shift, decrypt) {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    const base = 65;
    const x = code - base;
    const s = ((decrypt ? -shift : shift) % 26 + 26) % 26;
    return String.fromCharCode(base + ((x + s) % 26));
  }
  if (code >= 97 && code <= 122) {
    const base = 97;
    const x = code - base;
    const s = ((decrypt ? -shift : shift) % 26 + 26) % 26;
    return String.fromCharCode(base + ((x + s) % 26));
  }
  return c;
}

/**
 * @param {string} input
 * @param {number} key
 * @param {boolean} decrypt
 */
function caesar(input, key, decrypt) {
  const shift = key % 26;
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    out += ch === " " ? " " : shiftLetter(ch, shift, decrypt);
  }
  return out;
}

function updateCharCount() {
  const n = els.text.value.length;
  els.charCount.textContent = `${n} / ${MAX_LEN}`;
}

function updateModeUI() {
  const encrypt = mode === "encrypt";
  els.tabs.forEach((t) => {
    const active = t.dataset.mode === mode;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", String(active));
  });
  els.textLabel.textContent = encrypt ? "Text to encrypt" : "Text to decrypt";
  els.text.placeholder = encrypt
    ? "English letters and spaces only, up to 200 characters..."
    : "Caesar ciphertext: letters and spaces only, up to 200 characters...";
  els.run.textContent = encrypt ? "Encrypt" : "Decrypt";
  els.copy.textContent = encrypt ? "Copy the text" : "Copy the result";
}

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    mode = /** @type {'encrypt' | 'decrypt'} */ (tab.dataset.mode);
    els.output.textContent = "";
    els.copy.disabled = true;
    updateModeUI();
    setStatus("");
  });
});

els.text.addEventListener("input", updateCharCount);

els.run.addEventListener("click", () => {
  const keyVal = parseKey(els.key.value);
  const input = els.text.value;
  els.output.textContent = "";
  els.copy.disabled = true;

  if (keyVal === null) {
    setStatus("Enter a whole number key greater than 1 (digits only).", "error");
    return;
  }
  if (input.length === 0) {
    setStatus("Enter some text.", "error");
    return;
  }
  if (input.length > MAX_LEN) {
    setStatus(`Text must be at most ${MAX_LEN} characters.`, "error");
    return;
  }
  if (!ENGLISH_ONLY.test(input)) {
    setStatus("Use English letters (A–Z, a–z) and spaces only—no numbers or punctuation.", "error");
    return;
  }

  try {
    const decrypt = mode === "decrypt";
    els.output.textContent = caesar(input, keyVal, decrypt);
    setStatus(decrypt ? "Decrypted." : "Encrypted.", "success");
    els.copy.disabled = false;
  } catch (e) {
    setStatus(e instanceof Error ? e.message : "Something went wrong.", "error");
  }
});

els.copy.addEventListener("click", async () => {
  const text = els.output.textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    setStatus("Copied to clipboard.", "success");
  } catch {
    setStatus("Could not copy automatically. Select the result and copy manually.", "error");
  }
});

updateModeUI();
updateCharCount();
