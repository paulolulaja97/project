// src/lib/ai.ts
//
// Multi-provider AI integration. Supports Z.ai, Groq, Google Gemini, and OpenAI.
// All use the OpenAI-compatible chat completions format.
// The provider + API key are stored on-device via expo-secure-store.

import * as SecureStore from 'expo-secure-store';
import { AIPhasingInfo } from '../types/task';

export type Provider = 'zai' | 'groq' | 'gemini' | 'openai';

export interface ProviderConfig {
  id: Provider;
  name: string;
  endpoint: string;
  model: string;
  keyUrl: string;
  keyLabel: string;
}

export const PROVIDERS: Record<Provider, ProviderConfig> = {
  zai: {
    id: 'zai',
    name: 'Z.ai GLM',
    endpoint: 'https://api.z.ai/api/paas/v4/chat/completions',
    model: 'glm-4.6',
    keyUrl: 'https://z.ai/manage-apikey/apikey-list',
    keyLabel: 'Z.ai API key',
  },
  groq: {
    id: 'groq',
    name: 'Groq (Llama 3.3)',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-8b-instant',
    keyUrl: 'https://console.groq.com/keys',
    keyLabel: 'Groq API key',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-1.5-flash',
    keyUrl: 'https://aistudio.google.com/apikey',
    keyLabel: 'Gemini API key',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI (GPT-4o mini)',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyLabel: 'OpenAI API key',
  },
};

const PROVIDER_STORAGE_KEY = 'ai_provider';
const API_KEY_STORAGE_KEY = 'ai_api_key';

export async function saveProvider(provider: Provider): Promise<void> {
  await SecureStore.setItemAsync(PROVIDER_STORAGE_KEY, provider);
}

export async function getProvider(): Promise<Provider> {
  const stored = await SecureStore.getItemAsync(PROVIDER_STORAGE_KEY);
  if (stored && stored in PROVIDERS) return stored as Provider;
  return 'zai';
}

export async function getProviderConfig(): Promise<ProviderConfig> {
  const provider = await getProvider();
  return PROVIDERS[provider];
}

export async function saveApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
}

export async function getApiKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

export async function hasApiKey(): Promise<boolean> {
  const k = await getApiKey();
  return !!k && k.trim().length > 0;
}

export async function clearApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}

async function chat(messages: { role: string; content: string }[]): Promise<string> {
  const config = await getProviderConfig();
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error(`No API key set for ${config.name}. Open Settings to add one.`);
  }

  const body: Record<string, unknown> = {
    model: config.model,
    messages,
  };

  const res = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${config.name} request failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI');
  return content as string;
}

export async function analyzeTask(
  taskDescription: string,
  deadlineISO: string,
): Promise<AIPhasingInfo> {
  const deadlineReadable = new Date(deadlineISO).toLocaleString();

  const systemPrompt =
    'You are a scheduling assistant for a to-do list app. ' +
    'Given a task and its deadline, decide when to send the user a heads-up notification. ' +
    'Respond with ONLY valid JSON, no markdown fences, no extra text. ' +
    'Schema: {"priority":"high"|"medium"|"low","lead_time_minutes":number,"smart_message":string}. ' +
    'lead_time_minutes is how many minutes BEFORE the deadline to alert. ' +
    'Use small values (5-30) for trivial tasks, medium (60-480) for normal tasks, ' +
    'large (720-2880) for important tasks. smart_message must be under 120 characters, ' +
    'friendly, and reference the task.';

  const userPrompt =
    `Task: "${taskDescription}"\n` +
    `Deadline: ${deadlineReadable}\n` +
    `Now: ${new Date().toLocaleString()}\n\n` +
    'Return the JSON.';

  const raw = await chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  const cleaned = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned) as AIPhasingInfo;

  if (!['high', 'medium', 'low'].includes(parsed.priority)) {
    parsed.priority = 'medium';
  }
  if (typeof parsed.lead_time_minutes !== 'number' || parsed.lead_time_minutes < 1) {
    parsed.lead_time_minutes = 60;
  }
  if (parsed.lead_time_minutes > 10080) parsed.lead_time_minutes = 10080;
  if (typeof parsed.smart_message !== 'string' || parsed.smart_message.length === 0) {
    parsed.smart_message = `Heads up: "${taskDescription}" is due soon.`;
  }

  return parsed;
}

export async function dailyBriefing(
  tasks: { task: string; due_date: string; duetime: string; status: string }[],
): Promise<string> {
  if (tasks.length === 0) return 'You have no active tasks. Enjoy the calm.';

  const lines = tasks.map(
    (t) => `- "${t.task}" due ${new Date(t.due_date).toLocaleDateString()} ${t.duetime} (${t.status})`,
  );

  const systemPrompt =
    'You are a concise, friendly productivity assistant. ' +
    'Given a list of tasks with deadlines, write a short (3-5 sentence) briefing. ' +
    'Highlight what is most urgent, what can wait, and end with one concrete suggestion. ' +
    'Do not use markdown. Plain text only.';

  const userPrompt = `My tasks:\n${lines.join('\n')}\n\nWrite the briefing.`;

  return await chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}
