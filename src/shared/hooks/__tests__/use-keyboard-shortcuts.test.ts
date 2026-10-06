import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useKeyboardShortcuts } from "../use-keyboard-shortcuts";

describe("useKeyboardShortcuts", () => {
  it("triggers onNextStep on 'j' keypress", () => {
    const onNextStep = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onNextStep }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "j" }));
    });

    expect(onNextStep).toHaveBeenCalledTimes(1);
  });

  it("triggers onPrevStep on 'k' keypress", () => {
    const onPrevStep = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onPrevStep }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    });

    expect(onPrevStep).toHaveBeenCalledTimes(1);
  });

  it("triggers onEscape on 'Escape' keypress", () => {
    const onEscape = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onEscape }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("ignores keypresses when typing in input fields", () => {
    const onNextStep = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onNextStep }));

    const input = document.createElement("input");
    document.body.appendChild(input);

    act(() => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "j", bubbles: true }));
    });

    expect(onNextStep).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
