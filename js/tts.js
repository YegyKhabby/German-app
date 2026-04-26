export function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang  = "de-DE";
  utt.rate  = 0.9;
  window.speechSynthesis.speak(utt);
}
