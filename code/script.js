const routeDetail = document.getElementById("routeDetail");
const routeButtons = Array.from(document.querySelectorAll(".route-step"));
const thanksForm = document.querySelector(".thanks-form");
const thanksInput = document.getElementById("thanks");
const thanksWall = document.getElementById("thanksWall");
const thanksCount = document.getElementById("thanksCount");
const peopleCount = document.getElementById("peopleCount");
const plusPeople = document.getElementById("plusPeople");
const minusPeople = document.getElementById("minusPeople");

const routeSteps = {
  1: "Farm (Corbana partner farm, Limon Province): Bananas are harvested near Guapiles and tagged to keep the lot traceable.",
  2: "Packhouse (Siquirres, Costa Rica): Fruit is washed, sorted by quality, and boxed for export.",
  3: "Export Port (Puerto Moin, Costa Rica): Refrigerated containers are loaded for Caribbean shipping.",
  4: "U.S. Port (Port of Wilmington, Delaware): Containers are inspected and cleared before inland transport.",
  5: "Ripening Center (Chelsea, Massachusetts): Temperature and ethylene are controlled to reach ideal shelf color.",
  6: "Whole Foods Market (Cambridge, Massachusetts): Staff monitor ripeness and rotate stock for customers."
};

const storageKey = "banana-thanks-wall";
let entries = loadEntries();

routeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    routeButtons.forEach((b) => b.classList.remove("is-active"));
    button.classList.add("is-active");

    const step = Number(button.dataset.step);
    routeDetail.textContent = routeSteps[step] || "";
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
      message
    };

    entries.unshift(item);
    entries = entries.slice(0, 8);
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

renderEntries(entries);

function loadEntries() {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(value) {
  localStorage.setItem(storageKey, JSON.stringify(value));
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
}
