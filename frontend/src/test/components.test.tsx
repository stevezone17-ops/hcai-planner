import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CommandPalette } from "../components/ui/CommandPalette";

describe("Design System UI Primitives", () => {
  it("renders Button with proper variant styles and handles click", () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Accept Proposal
      </Button>
    );

    const button = screen.getByRole("button", { name: /accept proposal/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables Button when isLoading or disabled is set", () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Generating...
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders Card container with children and design classes", () => {
    render(
      <Card data-testid="test-card" className="p-4">
        <span>Slot Content</span>
      </Card>
    );

    const card = screen.getByTestId("test-card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent("Slot Content");
  });
});

describe("Command Palette Keyboard Navigation", () => {
  it("filters navigation items on user typing and navigates on Enter", () => {
    const handleNavigate = vi.fn();
    const handleClose = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        onNavigate={handleNavigate}
      />
    );

    const input = screen.getByPlaceholderText(/type a command or search/i);
    expect(input).toBeInTheDocument();

    // Type query to filter
    fireEvent.change(input, { target: { value: "planner" } });

    // Should show AI Planner
    const plannerOptions = screen.getAllByText(/ai planner/i);
    expect(plannerOptions.length).toBeGreaterThan(0);

    // Press Enter to select
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(handleNavigate).toHaveBeenCalledWith("planner");
    expect(handleClose).toHaveBeenCalled();
  });

  it("closes palette on Escape key", () => {
    const handleClose = vi.fn();
    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        onNavigate={() => {}}
      />
    );

    const input = screen.getByPlaceholderText(/type a command or search/i);
    fireEvent.keyDown(input, { key: "Escape", code: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });
});
