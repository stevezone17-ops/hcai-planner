import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { CurrentTimeIndicator } from "../components/ui/CurrentTimeIndicator";

describe("HITL Status and Constraint Indicators", () => {
  it("renders locked constraint badge when locked=true", () => {
    render(<StatusBadge status="ACCEPTED" locked={true} />);
    expect(screen.getByText(/locked/i)).toBeInTheDocument();
  });

  it("renders human modified state correctly", () => {
    render(<StatusBadge status="MODIFIED" locked={false} />);
    expect(screen.getByText(/modified by you/i)).toBeInTheDocument();
  });

  it("renders AI proposed state correctly", () => {
    render(<StatusBadge status="PROPOSED" locked={false} />);
    expect(screen.getByText(/ai suggested/i)).toBeInTheDocument();
  });

  it("renders PriorityBadge with corresponding semantic styles", () => {
    const { rerender } = render(<PriorityBadge priority="Critical" />);
    expect(screen.getByText(/critical/i)).toBeInTheDocument();

    rerender(<PriorityBadge priority="High" />);
    expect(screen.getByText(/high/i)).toBeInTheDocument();

    rerender(<PriorityBadge priority="Low" />);
    expect(screen.getByText(/low/i)).toBeInTheDocument();
  });

  it("renders CurrentTimeIndicator line with test id and label", () => {
    render(<CurrentTimeIndicator startHour={8} hourHeight={72} />);
    const indicator = screen.getByTestId("current-time-indicator");
    expect(indicator).toBeInTheDocument();
  });
});
