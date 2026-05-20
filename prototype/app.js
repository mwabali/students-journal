const titles = {
  home: "Today",
  checkin: "Check-in",
  care: "Self-care",
  booking: "Booking",
  chat: "Anonymous chat",
  progress: "Progress",
  sos: "Urgent support",
};

const storageKey = "calmCampusStateV2";
const moodScores = {
  Low: 35,
  Overwhelmed: 25,
  Anxious: 45,
  Stressed: 55,
  Calm: 85,
};

const defaultMessages = [
  { from: "other", text: "Hi, I am Peer 12. What feels heavy today?" },
  { from: "me", text: "I feel anxious about exams and I cannot focus." },
  { from: "other", text: "That sounds difficult. Would a short grounding step help first?" },
];

const screens = [...document.querySelectorAll(".screen")];
const navItems = [...document.querySelectorAll(".nav-item")];
const screenTitle = document.querySelector("#screenTitle");

let state = loadState();
let selectedMood = "";
let selectedSlot = "";

function loadState() {
  const fallback = {
    checkins: [],
    careActions: [],
    appointments: [],
    messages: defaultMessages,
    reports: 0,
  };

  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(storageKey)) };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
  render();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(dateValue) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function showScreen(id) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.go === id));
  screenTitle.textContent = titles[id] || "CalmCampus";
  render();
}

function selectedReasons() {
  return [...document.querySelectorAll(".chip.selected")].map((chip) => chip.textContent.trim());
}

function addListMessage(list, emptyText) {
  if (!list.children.length) {
    const item = document.createElement("li");
    item.textContent = emptyText;
    list.appendChild(item);
  }
}

function renderHome() {
  const todaysCheckins = state.checkins.filter((item) => item.day === todayKey());
  const todaysCare = state.careActions.filter((item) => item.day === todayKey());
  const lastMood = todaysCheckins.at(-1);
  const upcoming = state.appointments.find((appointment) => appointment.status === "confirmed");

  document.querySelector("#todayMood").textContent = lastMood ? lastMood.mood : "No check-in yet";
  document.querySelector("#todayActions").textContent = todaysCare.length;

  const nextCard = document.querySelector("#nextAppointment");
  if (upcoming) {
    nextCard.hidden = false;
    document.querySelector("#nextAppointmentText").textContent = `${upcoming.counselor} on ${upcoming.slot}`;
  } else {
    nextCard.hidden = true;
  }
}

function renderCareLog() {
  const list = document.querySelector("#careLog");
  list.innerHTML = "";

  state.careActions
    .filter((item) => item.day === todayKey())
    .slice(-5)
    .reverse()
    .forEach((action) => {
      const item = document.createElement("li");
      item.textContent = `${action.name} completed at ${formatTime(action.createdAt)}`;
      list.appendChild(item);
    });

  addListMessage(list, "No self-care actions completed today.");
}

function renderAppointments() {
  const list = document.querySelector("#appointmentList");
  list.innerHTML = "";

  state.appointments
    .slice()
    .reverse()
    .forEach((appointment) => {
      const item = document.createElement("li");
      const text = document.createElement("span");
      text.textContent = `${appointment.counselor}, ${appointment.slot} (${appointment.status})`;
      item.appendChild(text);

      if (appointment.status === "confirmed") {
        const cancel = document.createElement("button");
        cancel.className = "mini-action";
        cancel.type = "button";
        cancel.textContent = "Cancel";
        cancel.addEventListener("click", () => {
          appointment.status = "cancelled";
          saveState();
        });
        item.appendChild(cancel);
      }

      list.appendChild(item);
    });

  addListMessage(list, "No appointments yet.");
}

function renderChat() {
  const chatWindow = document.querySelector("#chatWindow");
  chatWindow.innerHTML = "";

  state.messages.forEach((message) => {
    const bubble = document.createElement("div");
    bubble.className = `bubble ${message.from}`;
    bubble.textContent = message.text;
    chatWindow.appendChild(bubble);
  });

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function renderProgress() {
  const bars = document.querySelector("#moodBars");
  const days = [...Array(7)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });

  bars.innerHTML = "";
  days.forEach((day) => {
    const mood = state.checkins.filter((item) => item.day === day).at(-1)?.mood;
    const bar = document.createElement("span");
    bar.style.height = `${mood ? moodScores[mood] : 8}%`;
    bar.title = mood || "No check-in";
    bars.appendChild(bar);
  });

  document.querySelector("#checkinCount").textContent = state.checkins.length;
  document.querySelector("#careCount").textContent = state.careActions.length;
  document.querySelector("#bookingCount").textContent = state.appointments.filter((item) => item.status === "confirmed").length;

  const history = document.querySelector("#moodHistory");
  history.innerHTML = "";
  state.checkins
    .slice(-6)
    .reverse()
    .forEach((checkin) => {
      const item = document.createElement("li");
      const reasons = checkin.reasons.length ? `; ${checkin.reasons.join(", ")}` : "";
      item.textContent = `${checkin.mood} at ${formatTime(checkin.createdAt)}${reasons}`;
      history.appendChild(item);
    });

  addListMessage(history, "No check-ins saved yet.");
}

function render() {
  renderHome();
  renderCareLog();
  renderAppointments();
  renderChat();
  renderProgress();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-go]");
  if (target) {
    showScreen(target.dataset.go);
  }
});

document.querySelector("#sosButton").addEventListener("click", () => showScreen("sos"));

document.querySelectorAll(".mood-card").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mood-card").forEach((card) => card.classList.remove("selected"));
    button.classList.add("selected");
    selectedMood = button.dataset.mood;
  });
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => chip.classList.toggle("selected"));
});

document.querySelector("#saveMood").addEventListener("click", () => {
  const result = document.querySelector("#moodResult");

  if (!selectedMood) {
    document.querySelector("#moodHeadline").textContent = "Choose a mood first";
    document.querySelector("#moodAdvice").textContent = "Select the mood closest to how you feel, then save your check-in.";
    result.hidden = false;
    return;
  }

  state.checkins.push({
    mood: selectedMood,
    reasons: selectedReasons(),
    note: document.querySelector("#checkinNote").value.trim(),
    day: todayKey(),
    createdAt: new Date().toISOString(),
  });

  document.querySelector("#moodHeadline").textContent = `${selectedMood} check-in saved`;
  document.querySelector("#moodAdvice").textContent = selectedMood === "Overwhelmed"
    ? "Consider urgent support or booking a counselor. You do not have to handle this alone."
    : "Try one short self-care action now, then decide if you want to talk to someone.";
  result.hidden = false;
  saveState();
});

function completeCareAction(name, message) {
  state.careActions.push({
    name,
    day: todayKey(),
    createdAt: new Date().toISOString(),
  });

  const timerBox = document.querySelector("#timerBox");
  timerBox.hidden = false;
  document.querySelector("#timerText").textContent = message;
  saveState();
}

document.querySelector(".timer-start").addEventListener("click", () => {
  completeCareAction(
    "3-minute breathing",
    "Breathe in for 4, hold for 4, breathe out for 6. This action has been added to your progress."
  );
});

document.querySelectorAll(".complete-action").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest("[data-care]");
    completeCareAction(
      card.dataset.care,
      `${card.dataset.care} completed. Notice one small change in your body or thoughts.`
    );
  });
});

document.querySelectorAll(".slot").forEach((slot) => {
  slot.addEventListener("click", () => {
    document.querySelectorAll(".slot").forEach((item) => item.classList.remove("selected"));
    slot.classList.add("selected");
    selectedSlot = slot.textContent;
  });
});

document.querySelector("#bookButton").addEventListener("click", () => {
  const result = document.querySelector("#bookingResult");
  const bookingText = document.querySelector("#bookingText");

  if (!selectedSlot) {
    bookingText.textContent = "Please choose a time slot before confirming.";
    result.hidden = false;
    return;
  }

  state.appointments.push({
    counselor: "Ms. Njeri W.",
    slot: selectedSlot,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  });

  bookingText.textContent = `Your appointment with Ms. Njeri W. is confirmed for ${selectedSlot}.`;
  result.hidden = false;
  saveState();
});

document.querySelector("#sendChat").addEventListener("click", () => {
  const input = document.querySelector("#chatInput");
  const text = input.value.trim();

  if (!text) {
    return;
  }

  state.messages.push({ from: "me", text });
  input.value = "";

  const reply = text.toLowerCase().includes("exam")
    ? "Exams can feel heavy. Try one 20-minute study block, then take a short break."
    : "Thank you for sharing that. What is one small thing that would make the next ten minutes easier?";
  state.messages.push({ from: "other", text: reply });

  document.querySelector("#chatResult").hidden = false;
  saveState();
});

document.querySelector("#chatInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.querySelector("#sendChat").click();
  }
});

document.querySelector("#reportChat").addEventListener("click", () => {
  state.reports += 1;
  const result = document.querySelector("#chatResult");
  result.hidden = false;
  result.querySelector("strong").textContent = "Report received";
  result.querySelector("p").textContent = "A moderator would review this conversation in the real system.";
  saveState();
});

document.querySelector("#resetData").addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  state = loadState();
  selectedMood = "";
  selectedSlot = "";
  document.querySelectorAll(".selected").forEach((item) => item.classList.remove("selected"));
  document.querySelector("#checkinNote").value = "";
  document.querySelector("#moodResult").hidden = true;
  document.querySelector("#bookingResult").hidden = true;
  document.querySelector("#chatResult").hidden = true;
  document.querySelector("#timerBox").hidden = true;
  render();
});

render();
