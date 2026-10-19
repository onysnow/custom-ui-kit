import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders a button that fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders as its child with asChild", () => {
    render(
      <Button asChild>
        <a href="/x">Go</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute("href", "/x");
  });
});
