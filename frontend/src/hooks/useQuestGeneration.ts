import { useState, useCallback, useRef, useEffect } from 'react';
import type { GeneratedQuest, QuestGenerateRequest } from '../types/quest';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function useQuestGeneration() {
  const [quest, setQuest] = useState<GeneratedQuest | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generationTimeMs, setGenerationTimeMs] = useState<number | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const generateQuest = useCallback(async (request: QuestGenerateRequest) => {
    setIsGenerating(true);
    setStreamingText('');
    setError(null);
    setQuest(null);
    setGenerationTimeMs(undefined);

    const startTime = Date.now();

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const apiKey = sessionStorage.getItem('pqw-api-key');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['X-User-API-Key'] = apiKey;
    }

    try {
      const response = await fetch(`${API_BASE}/api/quest/generate/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const eventType = parsed.event || parsed.type;
              if (eventType === 'chunk') {
                fullText += parsed.data ?? parsed.content ?? '';
                setStreamingText(fullText);
              } else if (eventType === 'complete') {
                setQuest(parsed.data ?? parsed.quest);
                setGenerationTimeMs(Date.now() - startTime);
              } else if (eventType === 'error') {
                setError(parsed.data ?? parsed.message);
              }
            } catch {
              // non-JSON line, skip
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        // Fallback to non-streaming
        try {
          const response = await fetch(`${API_BASE}/api/quest/generate`, {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
            signal: abortRef.current?.signal,
          });
          if (response.ok) {
            const questData = await response.json();
            setQuest(questData);
            setGenerationTimeMs(Date.now() - startTime);
            setError(null);
          }
        } catch {
          // keep original error
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const cancelGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
  }, []);

  // Abort any in-flight request on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  return { quest, isGenerating, streamingText, error, generationTimeMs, generateQuest, cancelGeneration, setQuest };
}
