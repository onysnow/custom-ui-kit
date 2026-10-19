import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiTag, LevelChip, StatusChip } from "./status";

describe("the status grammar", () => {
  it("shows a word as well as a colour for every status, and lets you relabel without losing the shape", () => {
    const { container, rerender } = render(<StatusChip status="disputed" />);
    expect(screen.getByText("Disputed")).toBeInTheDocument();
    expect(container.querySelector("[aria-hidden]")).toHaveTextContent("✕");
    rerender(<StatusChip status="disputed" label="Contested" />);
    expect(screen.getByText("Contested")).toBeInTheDocument();
    expect(container.querySelector("[aria-hidden]")).toHaveTextContent("✕");
  });

  it("says what a flag level means, on hover and on request", () => {
    render(<LevelChip level="textbook" showMeaning />);
    expect(screen.getByTitle("it meets the published definition or threshold")).toBeInTheDocument();
    expect(screen.getByText(/it meets the published definition/)).toBeInTheDocument();
  });

  it("marks AI material, with a date if there is one", () => {
    render(<AiTag date="18 Oct" />);
    expect(screen.getByText("AI draft · 18 Oct")).toBeInTheDocument();
  });
});
