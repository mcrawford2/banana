const routeDetail = document.getElementById("routeDetail");
const routeButtons = Array.from(document.querySelectorAll(".route-step"));
const mapPinpoints = Array.from(document.querySelectorAll(".map-pinpoint"));
const thanksForm = document.querySelector(".thanks-form");
const thanksInput = document.getElementById("thanks");
const thanksWall = document.getElementById("thanksWall");
const thanksCount = document.getElementById("thanksCount");
const shareButton = document.getElementById("shareButton");
const peopleCount = document.getElementById("peopleCount");
const plusPeople = document.getElementById("plusPeople");
const minusPeople = document.getElementById("minusPeople");
const guessButton = document.getElementById("guessButton");
const guessWall = document.getElementById("guessWall");
const guessCount = document.getElementById("guessCount");
const farmPhotoButtons = Array.from(document.querySelectorAll(".farm-photo-button"));
const galleryLightbox = document.getElementById("galleryLightbox");
const galleryLightboxImage = document.getElementById("galleryLightboxImage");
const galleryLightboxCaption = document.getElementById("galleryLightboxCaption");
const galleryLightboxClose = document.getElementById("galleryLightboxClose");

const entryLifetimeMs = 24 * 60 * 60 * 1000;

const routeSteps = {
  1: "Farm (Corbana partner farm, Limon Province): Bananas are harvested near Guapiles and tagged to keep the lot traceable.",
  2: "Packhouse (Siquirres, Costa Rica): Fruit is washed, sorted by quality, and boxed for export.",
  3: "Export Port (Puerto Moin, Costa Rica): Refrigerated containers are loaded for Caribbean shipping.",
  4: "U.S. Port (Port of Wilmington, Delaware): Containers are inspected and cleared before inland transport.",
  5: "Ripening Center (Chelsea, Massachusetts): Temperature and ethylene are controlled to reach ideal shelf color.",
  6: "Whole Foods Market (Cambridge, Massachusetts): Staff monitor ripeness and rotate stock for customers."
};

const storageKey = "banana-thanks-wall";
const guessStorageKey = "banana-guesses-wall";
let entries = loadEntries();
let guesses = loadGuesses();

routeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    routeButtons.forEach((b) => b.classList.remove("is-active"));
    button.classList.add("is-active");

    const step = Number(button.dataset.step);
    routeDetail.textContent = routeSteps[step] || "";

    mapPinpoints.forEach((pinpoint) => pinpoint.classList.remove("is-active"));
    const activePinpoint = mapPinpoints.find((p) => Number(p.dataset.step) === step);
    if (activePinpoint) {
      activePinpoint.classList.add("is-active");
    }
  });
});

mapPinpoints.forEach((pinpoint) => {
  pinpoint.addEventListener("click", () => {
    const step = Number(pinpoint.dataset.step);
    const correspondingButton = routeButtons.find((b) => Number(b.dataset.step) === step);
    if (correspondingButton) {
      correspondingButton.click();
    }
  });
});

if (thanksForm) {
  thanksForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = thanksInput.value.trim();
    if (!message) {
      return;
    }

    const item = {
      id: Date.now(),
      message,
      createdAt: new Date().toISOString()
    };

    entries.unshift(item);
    entries = pruneExpiredEntries(entries).slice(0, 8);
    saveEntries(entries);
    renderEntries(entries);

    thanksInput.value = "";
    thanksInput.focus();
  });
}

plusPeople?.addEventListener("click", () => {
  const current = Number(peopleCount.textContent) || 0;
  peopleCount.textContent = String(Math.min(current + 1, 30));
});

minusPeople?.addEventListener("click", () => {
  const current = Number(peopleCount.textContent) || 0;
  peopleCount.textContent = String(Math.max(current - 1, 1));
});

guessButton?.addEventListener("click", () => {
  const value = Number(peopleCount.textContent) || 0;

  if (guesses.some((entry) => entry.value === value)) {
    return;
  }

  const item = {
    id: Date.now(),
    value,
    createdAt: new Date().toISOString()
  };

  guesses.unshift(item);
  guesses = pruneExpiredEntries(guesses).slice(0, 8);
  saveGuesses(guesses);
  renderGuesses(guesses);
});

farmPhotoButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!galleryLightbox || !galleryLightboxImage || !galleryLightboxCaption) {
      return;
    }

    const image = button.querySelector("img");
    const fullSrc = button.dataset.fullSrc || image?.src || "";
    const caption = button.dataset.caption || "";
    const alt = image?.alt || caption;

    galleryLightboxImage.src = fullSrc;
    galleryLightboxImage.alt = alt;
    galleryLightboxCaption.textContent = caption;
    galleryLightbox.hidden = false;
    document.body.classList.add("is-lightbox-open");
  });
});

galleryLightboxClose?.addEventListener("click", closeGalleryLightbox);

galleryLightbox?.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) {
    closeGalleryLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && galleryLightbox && !galleryLightbox.hidden) {
    closeGalleryLightbox();
  }
});

renderEntries(entries);
renderGuesses(guesses);
alignActionButtons();

window.addEventListener("resize", alignActionButtons);

function closeGalleryLightbox() {
  if (!galleryLightbox || !galleryLightboxImage || !galleryLightboxCaption) {
    return;
  }

  galleryLightbox.hidden = true;
  galleryLightboxImage.src = "";
  galleryLightboxImage.alt = "";
  galleryLightboxCaption.textContent = "";
  document.body.classList.remove("is-lightbox-open");
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    const normalized = Array.isArray(parsed)
      ? parsed.map((entry) => ({
          ...entry,
          createdAt: entry.createdAt || new Date().toISOString()
        }))
      : [];
    const activeEntries = pruneExpiredEntries(normalized);
    saveEntries(activeEntries);
    return activeEntries;
  } catch {
    return [];
  }
}

function saveEntries(value) {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

function loadGuesses() {
  try {
    const raw = localStorage.getItem(guessStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    const normalized = Array.isArray(parsed)
      ? parsed.map((entry) => ({
          ...entry,
          createdAt: entry.createdAt || new Date().toISOString()
        }))
      : [];
    const activeGuesses = pruneExpiredEntries(normalized);
    saveGuesses(activeGuesses);
    return activeGuesses;
  } catch {
    return [];
  }
}

function saveGuesses(value) {
  localStorage.setItem(guessStorageKey, JSON.stringify(value));
}

function renderEntries(value) {
  if (!thanksWall || !thanksCount) {
    return;
  }

  thanksWall.innerHTML = "";

  if (!value.length) {
    const empty = document.createElement("p");
    empty.className = "small";
    empty.textContent = "No shared messages yet. Be the first.";
    thanksWall.appendChild(empty);
  } else {
    value.forEach((entry) => {
      const note = document.createElement("article");
      note.className = "thank-note";
      note.textContent = `\"${entry.message}\"`;
      thanksWall.appendChild(note);
    });
  }

  const total = value.length;
  thanksCount.textContent = `${total} shared message${total === 1 ? "" : "s"} today`;

  alignActionButtons();
}

function renderGuesses(value) {
  if (!guessWall || !guessCount) {
    return;
  }

  guessWall.innerHTML = "";

  if (!value.length) {
    const empty = document.createElement("p");
    empty.className = "small";
    empty.textContent = "No shared guesses yet. Be the first.";
    guessWall.appendChild(empty);
  } else {
    value.forEach((entry) => {
      const note = document.createElement("article");
      note.className = "thank-note";

      note.textContent = `"${entry.value} people"`;
      guessWall.appendChild(note);
    });
  }

  const total = value.length;
  guessCount.textContent = `${total} shared guess${total === 1 ? "" : "es"} today`;

  alignActionButtons();
}

function alignActionButtons() {
  if (!shareButton || !guessButton) {
    return;
  }

  // Disable cross-column alignment when sections stack on small screens.
  if (window.innerWidth <= 560) {
    guessButton.style.marginTop = "0.75rem";
    return;
  }

  // Reset before measuring to avoid compounding margin changes.
  guessButton.style.marginTop = "0px";

  const shareRect = shareButton.getBoundingClientRect();
  const guessRect = guessButton.getBoundingClientRect();
  const delta = shareRect.top - guessRect.top;

  if (Math.abs(delta) < 1) {
    return;
  }

  guessButton.style.marginTop = `${delta}px`;
}

function pruneExpiredEntries(value) {
  const now = Date.now();

  return value.filter((entry) => {
    const createdAt = Date.parse(entry.createdAt || "");
    return Number.isFinite(createdAt) && now - createdAt < entryLifetimeMs;
  });
}
