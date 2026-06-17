import { useEffect, useState } from "react";

// Voices populate asynchronously in most browsers; re-render when they arrive.
export function useVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(
    typeof window !== "undefined" && window.speechSynthesis ? window.speechSynthesis.getVoices() : [],
  );
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const update = () => setVoices(synth.getVoices());
    update();
    synth.addEventListener("voiceschanged", update);
    return () => synth.removeEventListener("voiceschanged", update);
  }, []);
  return voices;
}
