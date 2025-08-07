import { describe, it, expect } from "vitest";

describe("Example Test Suite", () => {
  it("should pass", () => {
    expect(1 + 1).toBe(2);
  });

  it("should test dom elements", () => {
    const div = document.createElement("div");
    div.innerHTML = "Hello World";
    expect(div).toHaveTextContent("Hello World");
  });
});
