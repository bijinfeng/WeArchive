import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { AppIcon } from "./app-icon";

describe("AppIcon", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with default size 32", () => {
    render(<AppIcon data-testid="app-icon" />);
    const svg = screen.getByTestId("app-icon");
    expect(svg.tagName).toBe("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("renders with custom size", () => {
    render(<AppIcon size={64} data-testid="app-icon" />);
    const svg = screen.getByTestId("app-icon");
    expect(svg).toHaveAttribute("width", "64");
    expect(svg).toHaveAttribute("height", "64");
  });

  it("has accessibility attributes", () => {
    render(<AppIcon data-testid="app-icon" />);
    const svg = screen.getByTestId("app-icon");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-label", "WeArchive");

    const title = svg.querySelector("title");
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe("WeArchive");
  });

  it("forwards className prop", () => {
    render(<AppIcon className="custom-class" data-testid="app-icon" />);
    const svg = screen.getByTestId("app-icon");
    expect(svg).toHaveClass("custom-class");
  });

  it("forwards style prop", () => {
    render(<AppIcon style={{ opacity: 0.5 }} data-testid="app-icon" />);
    const svg = screen.getByTestId("app-icon");
    expect(svg).toHaveStyle({ opacity: "0.5" });
  });
});
