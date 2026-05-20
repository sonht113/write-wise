import { useState } from "react";
import SYSTEM_PROMPT from "../prompts/systemPrompt";
import getDynamicDescription from "../utils/chartDescription";

export default function useAnalysis({
  activeKey,
  model,
  chartData,
  currentPrompt,
  answer,
  wordCount,
  onNoKey,
  onInvalidKey,
  saveSubmission,
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!activeKey) {
      onNoKey?.();
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `IELTS Writing Task 1 prompt:\n${getDynamicDescription(chartData)}\n${currentPrompt.task}\n\nStudent's answer:\n${answer}`,
            },
          ],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        onInvalidKey?.();
        if (!onInvalidKey) {
          throw new Error(`API error ${res.status}: ${await res.text()}`);
        }
        return;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse AI response");
      const parsed = JSON.parse(jsonMatch[0]);
      setResult(parsed);

      saveSubmission?.(
        currentPrompt.id,
        currentPrompt.title,
        currentPrompt.chartType,
        answer,
        parsed,
        wordCount,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError("");
  };

  return { loading, result, error, submit, reset };
}
