let state = {
  cats: 72,
  dogs: 48,
  history: [
    { id: 120, candidate: "Dogs", time: "12 sec ago", status: "Sample" },
    { id: 119, candidate: "Cats", time: "46 sec ago", status: "Sample" },
    { id: 118, candidate: "Cats", time: "2 min ago", status: "Sample" },
    { id: 117, candidate: "Dogs", time: "3 min ago", status: "Sample" }
  ],
  simRunning: false,
  simTimer: null
};

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function render() {
  const total = state.cats + state.dogs;
  const catPct = total === 0 ? 0 : Math.round((state.cats / total) * 100);
  const dogPct = total === 0 ? 0 : 100 - catPct;

  document.getElementById("totalVotes").textContent = total;
  document.getElementById("catVotes").textContent = state.cats;
  document.getElementById("dogVotes").textContent = state.dogs;
  document.getElementById("catPctText").textContent = `${catPct}%`;
  document.getElementById("dogPctText").textContent = `${dogPct}%`;

  const diff = Math.abs(state.cats - state.dogs);
  if (state.cats > state.dogs) {
    document.getElementById("leaderName").textContent = "Cats";
    document.getElementById("leaderLead").textContent = `${diff} vote${diff === 1 ? "" : "s"} ahead`;
    document.getElementById("splitSummary").textContent = `Cats are in the lead by ${diff} vote${diff === 1 ? "" : "s"}`;
  } else if (state.dogs > state.cats) {
    document.getElementById("leaderName").textContent = "Dogs";
    document.getElementById("leaderLead").textContent = `${diff} vote${diff === 1 ? "" : "s"} ahead`;
    document.getElementById("splitSummary").textContent = `Dogs are in the lead by ${diff} vote${diff === 1 ? "" : "s"}`;
  } else {
    document.getElementById("leaderName").textContent = "Tie";
    document.getElementById("leaderLead").textContent = "0 votes apart";
    document.getElementById("splitSummary").textContent = "Cats and Dogs are currently tied";
  }

  document.getElementById("catBarLabel").textContent = `${state.cats} · ${catPct}%`;
  document.getElementById("dogBarLabel").textContent = `${state.dogs} · ${dogPct}%`;
  document.getElementById("catBarFill").style.width = `${catPct}%`;
  document.getElementById("dogBarFill").style.width = `${dogPct}%`;
  document.getElementById("catProgressWrap").setAttribute("aria-valuenow", catPct);
  document.getElementById("dogProgressWrap").setAttribute("aria-valuenow", dogPct);

  const catDeg = total === 0 ? 180 : Math.round((state.cats / total) * 360);
  document.getElementById("donutChart").style.setProperty("--cat-deg", `${catDeg}deg`);
  document.getElementById("donutTotal").textContent = total;
  document.getElementById("legendCatPct").textContent = `${catPct}%`;
  document.getElementById("legendDogPct").textContent = `${dogPct}%`;

  const tbody = document.getElementById("activityBody");
  tbody.innerHTML = "";
  const recent = state.history.slice(0, 6);
  document.getElementById("activityCountTag").textContent = `Last ${recent.length} votes`;

  recent.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>#${item.id}</td>
      <td><span class="cand-pill ${item.candidate}">${item.candidate}</span></td>
      <td>${item.time}</td>
      <td><span class="status-tag">${item.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function castVote(candidate, status = "Manual") {
  if (candidate === "Cats") state.cats += 1;
  if (candidate === "Dogs") state.dogs += 1;

  const nextId = state.cats + state.dogs;
  state.history.unshift({
    id: nextId,
    candidate,
    time: "Just now",
    status
  });
  render();
}

function toggleSimulator() {
  const btn = document.getElementById("toggleSimBtn");
  const badge = document.getElementById("simStateBadge");

  if (state.simRunning) {
    clearInterval(state.simTimer);
    state.simRunning = false;
    btn.textContent = "Start Simulator";
    badge.className = "sim-badge paused";
    badge.innerHTML = '<span class="dot"></span>Paused';
  } else {
    const speed = Number(document.getElementById("simSpeed").value);
    state.simRunning = true;
    btn.textContent = "Pause Simulator";
    badge.className = "sim-badge running";
    badge.innerHTML = '<span class="dot"></span>Running';

    state.simTimer = setInterval(() => {
      const pick = Math.random() < 0.55 ? "Cats" : "Dogs";
      castVote(pick, "Simulated");
    }, speed);
  }
}

function exportCSV() {
  const rows = [
    ["Metric", "Value"],
    ["Total Votes", state.cats + state.dogs],
    ["Cat Votes", state.cats],
    ["Dog Votes", state.dogs],
    [],
    ["Vote ID", "Candidate", "Time", "Status"],
    ...state.history.map((h) => [`#${h.id}`, h.candidate, h.time, h.status])
  ];

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cats-vs-dogs-voting-results.csv";
  link.click();
  URL.revokeObjectURL(url);
}

document.getElementById("voteCatsBtn").addEventListener("click", () => castVote("Cats", "Manual"));
document.getElementById("voteDogsBtn").addEventListener("click", () => castVote("Dogs", "Manual"));
document.getElementById("resetBtn").addEventListener("click", () => {
  state.cats = 72;
  state.dogs = 48;
  state.history = [
    { id: 120, candidate: "Dogs", time: "12 sec ago", status: "Sample" },
    { id: 119, candidate: "Cats", time: "46 sec ago", status: "Sample" },
    { id: 118, candidate: "Cats", time: "2 min ago", status: "Sample" },
    { id: 117, candidate: "Dogs", time: "3 min ago", status: "Sample" }
  ];
  render();
});

document.getElementById("toggleSimBtn").addEventListener("click", toggleSimulator);
document.getElementById("simSpeed").addEventListener("change", () => {
  if (state.simRunning) {
    toggleSimulator();
    toggleSimulator();
  }
});
document.getElementById("exportCsvBtn").addEventListener("click", exportCSV);

setInterval(updateClock, 1000);
updateClock();
render();
