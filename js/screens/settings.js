import { exportBackup, importBackup } from "../state.js";

export function renderSettings() {
  const body = document.getElementById("settings-body");
  body.textContent = "";

  const backupSec = makeSection("Progress backup");
  backupSec.appendChild(makeBtn("Download backup", "Save your SR progress and bookmarks as a JSON file", () => {
    const blob = new Blob([exportBackup()], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = "deutsch-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }));

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.className = "hidden";
  fileInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        importBackup(ev.target.result);
        alert("Backup restored!");
      } catch (err) {
        alert("Failed: " + err.message);
      }
    };
    reader.readAsText(file);
  };
  backupSec.appendChild(makeBtn("Restore from backup", "Import a previously saved backup file", () => fileInput.click()));
  backupSec.appendChild(fileInput);

  const notifSec = makeSection("Notifications");
  notifSec.appendChild(makeBtn("Enable daily reminders", "Get notified each day when cards are due", async () => {
    if (!("Notification" in window)) {
      alert("Not supported.");
      return;
    }
    const perm = await Notification.requestPermission();
    alert(perm === "granted" ? "Enabled! Set your schedule in OneSignal." : "Permission denied.");
  }));

  body.append(backupSec, notifSec);
}

function makeSection(title) {
  const sec = document.createElement("div");
  sec.className = "settings-section";
  const h3  = document.createElement("h3");
  h3.textContent = title;
  sec.appendChild(h3);
  return sec;
}

function makeBtn(label, desc, onClick) {
  const btn = document.createElement("button");
  btn.className = "settings-btn";
  const l   = document.createElement("div");
  l.className = "btn-label";
  l.textContent = label;
  const d   = document.createElement("div");
  d.className = "btn-desc";
  d.textContent = desc;
  btn.append(l, d);
  btn.onclick = onClick;
  return btn;
}
