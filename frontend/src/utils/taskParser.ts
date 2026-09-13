import { PriorityType } from "../types";

export interface ParsedTask {
  title: string;
  priority: PriorityType;
  duration_minutes: number;
  deadline?: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const ACTION_VERBS = /^(finish|complete|prepare|draft|review|write|do|submit|work\s+on|start|create|make|build|study|read|practice)\s+/i;

const DURATION_PATTERNS: [RegExp, number][] = [
  [/\b(15\s*m(?:ins?)?|quarter\s*hour)\b/i, 15],
  [/\b(20\s*m(?:ins?)?)\b/i, 20],
  [/\b(30\s*m(?:ins?)?|half\s*(?:an?\s*)?hour)\b/i, 30],
  [/\b(45\s*m(?:ins?)?)\b/i, 45],
  [/\b(1\.5\s*h(?:ours?)?|90\s*m(?:ins?)?)\b/i, 90],
  [/\b(2\.5\s*h(?:ours?)?|150\s*m(?:ins?)?)\b/i, 150],
  [/\b(2\s*h(?:ours?)?|120\s*m(?:ins?)?)\b/i, 120],
  [/\b(3\s*h(?:ours?)?|180\s*m(?:ins?)?)\b/i, 180],
  [/\b(4\s*h(?:ours?)?|240\s*m(?:ins?)?)\b/i, 240],
  [/\b(1\s*h(?:our)?|60\s*m(?:ins?)?)\b/i, 60],
  [/\b(\d+)\s*h(?:ours?)?\b/i, -1], // dynamic hours
  [/\b(\d+)\s*m(?:ins?|inutes?)?\b/i, -2], // dynamic minutes
];

const WEEKDAY_MAP: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

function getNextWeekday(dayName: string, baseDate: Date): Date {
  const target = WEEKDAY_MAP[dayName.toLowerCase()];
  if (target === undefined) return baseDate;
  const current = baseDate.getDay();
  let diff = target - current;
  if (diff <= 0) diff += 7;
  const d = new Date(baseDate);
  d.setDate(d.getDate() + diff);
  d.setHours(18, 0, 0, 0);
  return d;
}

function parseDuration(text: string): number {
  for (const [pattern, value] of DURATION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      if (value === -1) return parseInt(match[1], 10) * 60; // hours -> minutes
      if (value === -2) return parseInt(match[1], 10); // direct minutes
      return value;
    }
  }
  return 60; // default 1 hour
}

function parseDeadline(text: string, baseDate: Date): string | undefined {
  if (/\btonight\b/i.test(text)) {
    const d = new Date(baseDate);
    d.setHours(22, 0, 0, 0);
    return d.toISOString();
  }
  if (/\btomorrow\b/i.test(text)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    return d.toISOString();
  }
  if (/\btoday\b/i.test(text)) {
    const d = new Date(baseDate);
    d.setHours(21, 0, 0, 0);
    return d.toISOString();
  }

  // "in N days"
  const inDaysMatch = text.match(/\bin\s+(\d+)\s*days?\b/i);
  if (inDaysMatch) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + parseInt(inDaysMatch[1], 10));
    d.setHours(18, 0, 0, 0);
    return d.toISOString();
  }

  // "next Monday", "this Friday"
  const nextDayMatch = text.match(/\b(?:next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)\b/i);
  if (nextDayMatch) {
    return getNextWeekday(nextDayMatch[1], baseDate).toISOString();
  }

  // "by Friday"
  const byDayMatch = text.match(/\bby\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)\b/i);
  if (byDayMatch) {
    return getNextWeekday(byDayMatch[1], baseDate).toISOString();
  }

  return undefined;
}

function inferCategory(text: string): string {
  if (/\b(research|paper|literature|experiment|thesis|journal|cite|citation)\b/i.test(text)) return "Research";
  if (/\b(code|coding|program|debug|deploy|git|api|software|app|web|database)\b/i.test(text)) return "Coding";
  if (/\b(gym|workout|health|errand|personal|lunch|dinner|grocery|clean|laundry)\b/i.test(text)) return "Personal";
  if (/\b(math|algorithm|study|read|hw|homework|assignment|exam|quiz|test|revision)\b/i.test(text)) return "Study";
  if (/\b(presentation|slides|present|pitch|briefing|brief)\b/i.test(text)) return "Academic";
  if (/\b(meeting|call|discussion|standup|sync|review)\b/i.test(text)) return "Meeting";
  return "Coursework";
}

function inferPriority(text: string): PriorityType {
  if (/\bcritical\b/i.test(text)) return "Critical";
  if (/\b(high|important|urgent)\b/i.test(text)) return "High";
  if (/\blow\b/i.test(text)) return "Low";
  return "Medium";
}

function inferDifficulty(priority: PriorityType, category: string): "Easy" | "Medium" | "Hard" {
  if (priority === "Critical") return "Hard";
  if (priority === "High") return "Medium";
  if (category === "Research" || category === "Coding") return "Hard";
  if (category === "Personal") return "Easy";
  return "Medium";
}

// Clean fragments from the title
const TITLE_CLEAN_PATTERNS = [
  /\b(critical|high|medium|low)\s*(priority)?\b/gi,
  /\b(tomorrow|today|tonight)\b/gi,
  /\bin\s+\d+\s*days?\b/gi,
  /\b(?:next|this|by)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)\b/gi,
  /\b\d+\s*(?:m(?:ins?|inutes?)?|h(?:ours?)?)\b/gi,
  /\b(?:half\s*(?:an?\s*)?hour|quarter\s*hour)\b/gi,
  /\b(?:1\.5h|2\.5h)\b/gi,
  /,\s*,/g, // leftover commas
  /\s+/g,
];

export function parseNaturalLanguageTask(
  inputText: string,
  baseDate: Date = new Date()
): ParsedTask {
  const text = inputText.trim();

  const priority = inferPriority(text);
  const duration_minutes = parseDuration(text);
  const deadline = parseDeadline(text, baseDate);
  const category = inferCategory(text);
  const difficulty = inferDifficulty(priority, category);

  // Preserve the user-intent verb in the title when present, while stripping
  // extracted timing/priority metadata that was only used for parsing.
  let title = text;
  for (const pattern of TITLE_CLEAN_PATTERNS) {
    title = title.replace(pattern, " ");
  }
  title = title.replace(/\s+/g, " ").replace(/^[,.\s]+|[,.\s]+$/g, "").trim();
  if (!title) title = text;

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return {
    title,
    priority,
    duration_minutes,
    deadline,
    category,
    difficulty,
  };
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDeadline(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) {
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
