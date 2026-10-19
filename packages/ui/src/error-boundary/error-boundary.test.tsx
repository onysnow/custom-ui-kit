import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./error-boundary";

function Boom(): never {
  throw new Error("kaboom");
}

describe("ErrorBoundary", () => {
  it("shows the crash in its own panel and leaves the rest of the page alone", () => {
    const onError = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <div>
        <p>rest of the page</p>
        <ErrorBoundary name="Timeline" onError={onError}>
          <Boom />
        </ErrorBoundary>
      </div>,
    );
    expect(screen.getByText("rest of the page")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Timeline stopped working.");
    expect(screen.getByRole("alert")).toHaveTextContent("kaboom");
    expect(onError).toHaveBeenCalledOnce();
  });

  it("renders children when nothing throws, and a custom fallback when given one", () => {
    const { rerender } = render(
      <ErrorBoundary name="X">
        <p>fine</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("fine")).toBeInTheDocument();
    vi.spyOn(console, "error").mockImplementation(() => {});
    rerender(
      <ErrorBoundary name="X" fallback={(e) => <p>custom: {e.message}</p>}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText("custom: kaboom")).toBeInTheDocument();
  });
});
