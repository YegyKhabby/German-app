import assert from "node:assert/strict";
import { test } from "node:test";
import { computeNext, isDue } from "../js/sr.js";

const TODAY = "2026-04-25";

test("new card: Good schedules 1 day out", () => {
  const card = { interval: 1, easiness: 2.5, repetitions: 0, next_review: TODAY };
  const next = computeNext(card, 4, TODAY);
  assert.equal(next.repetitions, 1);
  assert.equal(next.interval, 1);
  assert.equal(next.next_review, "2026-04-26");
});

test("second rep: Good schedules 6 days out", () => {
  const card = { interval: 1, easiness: 2.5, repetitions: 1, next_review: TODAY };
  const next = computeNext(card, 4, TODAY);
  assert.equal(next.repetitions, 2);
  assert.equal(next.interval, 6);
  assert.equal(next.next_review, "2026-05-01");
});

test("third rep: Good uses interval * easiness", () => {
  const card = { interval: 6, easiness: 2.5, repetitions: 2, next_review: TODAY };
  const next = computeNext(card, 4, TODAY);
  assert.equal(next.repetitions, 3);
  assert.equal(next.interval, 15); // round(6 * 2.5)
});

test("Again resets to interval 1, rep 0", () => {
  const card = { interval: 15, easiness: 2.5, repetitions: 3, next_review: TODAY };
  const next = computeNext(card, 1, TODAY);
  assert.equal(next.repetitions, 0);
  assert.equal(next.interval, 1);
  assert.equal(next.next_review, "2026-04-26");
});

test("Easy boosts easiness more than Good", () => {
  const card = { interval: 1, easiness: 2.5, repetitions: 0, next_review: TODAY };
  const good = computeNext(card, 4, TODAY);
  const easy = computeNext(card, 5, TODAY);
  assert.ok(easy.easiness > good.easiness);
});

test("Hard decreases easiness", () => {
  const card = { interval: 6, easiness: 2.5, repetitions: 2, next_review: TODAY };
  const next = computeNext(card, 2, TODAY);
  assert.ok(next.easiness < 2.5);
});

test("isDue: true when next_review <= today", () => {
  assert.ok(isDue({ next_review: "2026-04-25" }, "2026-04-25"));
  assert.ok(isDue({ next_review: "2026-04-24" }, "2026-04-25"));
  assert.ok(!isDue({ next_review: "2026-04-26" }, "2026-04-25"));
});
