import { loadStats, getDailyCountsLast14 } from "../state.js";

export function renderStats() {
  const stats    = loadStats();
  const today    = new Date().toISOString().slice(0, 10);
  const counts   = getDailyCountsLast14(today);
  const maxCount = Math.max(...counts.map(c => c.count), 1);
  const thisWeek = counts.slice(7).reduce((s, c) => s + c.count, 0);
  const total    = counts.reduce((s, c) => s + c.count, 0);

  const body = document.getElementById("stats-body");
  body.textContent = "";

  // 2x2 stat grid
  const grid = document.createElement("div");
  grid.className = "stats-grid";
  [
    [stats.streak,          "var(--orange)", "Day streak"],
    [stats.mastered.length, "var(--green)",  "Mastered"],
    [thisWeek,              "var(--blue)",   "This week"],
    [total,                 "var(--purple)", "Total reviews"],
  ].forEach(([val, color, label]) => {
    const card  = document.createElement("div");
    card.className = "stat-card";
    const value = document.createElement("div");
    value.className = "value";
    value.style.color = color;
    value.textContent = val;
    const lbl   = document.createElement("div");
    lbl.className = "label";
    lbl.textContent = label;
    card.append(value, lbl);
    grid.appendChild(card);
  });

  // Bar chart
  const chartLbl = document.createElement("div");
  chartLbl.className = "chart-label";
  chartLbl.textContent = "Reviews - last 14 days";
  const chart    = document.createElement("div");
  chart.className = "bar-chart";
  counts.forEach(c => {
    const col = document.createElement("div");
    col.className = "bar-col";
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = (Math.round((c.count / maxCount) * 64) + 2) + "px";
    const day = document.createElement("div");
    day.className = "bar-day";
    day.textContent = c.date.slice(5);
    col.append(bar, day);
    chart.appendChild(col);
  });

  body.append(grid, chartLbl, chart);
}
