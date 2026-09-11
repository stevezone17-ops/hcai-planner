import { describe, it, expect } from "vitest";
import { parseNaturalLanguageTask } from "../utils/taskParser";

describe("Natural Language Task Parser", () => {
  it("extracts priority correctly from text tokens", () => {
    const criticalTask = parseNaturalLanguageTask("Finish urgent grant proposal critical priority");
    expect(criticalTask.priority).toBe("Critical");
    expect(criticalTask.difficulty).toBe("Hard");

    const highTask = parseNaturalLanguageTask("Review code diff high priority");
    expect(highTask.priority).toBe("High");

    const lowTask = parseNaturalLanguageTask("Clean browser cache low");
    expect(lowTask.priority).toBe("Low");

    const defaultTask = parseNaturalLanguageTask("Regular team sync");
    expect(defaultTask.priority).toBe("Medium");
  });

  it("extracts durations accurately (30m, 45m, 90m, 2h, 3h)", () => {
    expect(parseNaturalLanguageTask("Quick standup 30m").duration_minutes).toBe(30);
    expect(parseNaturalLanguageTask("Deep code sprint 2h").duration_minutes).toBe(120);
    expect(parseNaturalLanguageTask("Architecture session 90m").duration_minutes).toBe(90);
    expect(parseNaturalLanguageTask("Workshop 3h").duration_minutes).toBe(180);
    expect(parseNaturalLanguageTask("Standard task").duration_minutes).toBe(60);
  });

  it("extracts relative deadlines (tomorrow, today)", () => {
    const baseDate = new Date("2026-09-11T12:00:00Z");
    const tomorrowTask = parseNaturalLanguageTask("Submit final draft tomorrow", baseDate);
    expect(tomorrowTask.deadline).toBeDefined();

    const deadlineDate = new Date(tomorrowTask.deadline!);
    expect(deadlineDate.getDate()).toBe(12); // Next day

    const todayTask = parseNaturalLanguageTask("Send recap email today", baseDate);
    expect(todayTask.deadline).toBeDefined();
    const todayDeadline = new Date(todayTask.deadline!);
    expect(todayDeadline.getDate()).toBe(11);
  });

  it("detects inferred category from keywords", () => {
    expect(parseNaturalLanguageTask("Literature review on transformers").category).toBe("Research");
    expect(parseNaturalLanguageTask("Gym workout session 45m").category).toBe("Personal");
    expect(parseNaturalLanguageTask("Solve algorithm math homework").category).toBe("Study");
    expect(parseNaturalLanguageTask("Prepare sprint deck").category).toBe("Coursework");
  });

  it("cleans title properly by removing recognized tokens", () => {
    const parsed = parseNaturalLanguageTask("Write thesis introduction tomorrow 90m critical priority");
    expect(parsed.title).toBe("Write thesis introduction");
  });
});
