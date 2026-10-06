import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * P8 light-theme guard: the §3.3 status hues are read as text on their own
 * 8% tint, and that tint can sit on any §3.1 light surface. Checking a hue
 * against the white canvas alone overstates the real ratio, so this test
 * composites the tint over every surface and requires 4.5:1 everywhere.
 */

const TOKENS = readFileSync(
  resolve(__dirname, "../../../styles/tokens.css"),
  "utf8",
);

const lightBlock = TOKENS.split('[data-theme="light"]')[1] ?? "";

const token = (name: string): string => {
  const match = lightBlock.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6,8})`, "i"));
  if (!match?.[1]) throw new Error(`light token ${name} not found`);
  return match[1];
};

const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);

const luminance = (hex: string): number => {
  const [r, g, b] = [0, 1, 2].map((i) => {
    const v = channel(hex, i) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [l1, l2] = [luminance(a), luminance(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

const flatten = (fg: string, bg: string): string => {
  const alpha = channel(fg, 3) / 255;
  const mixed = [0, 1, 2].map((i) =>
    Math.round(channel(fg, i) * alpha + channel(bg, i) * (1 - alpha)),
  );
  return `#${mixed.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

const SURFACES = [
  "--bs-bg-canvas",
  "--bs-bg-panel",
  "--bs-bg-raised",
  "--bs-bg-inset",
] as const;

const STATUS_HUES = [
  "--bs-pass",
  "--bs-healed",
  "--bs-fail",
  "--bs-warn",
  "--bs-neutral",
  "--bs-accent",
  "--bs-infer",
] as const;

describe("P8 light theme status & border contrast", () => {
  it.each(STATUS_HUES)("%s reads at 4.5:1 on its tint over every surface", (hue) => {
    const fg = token(hue);
    const tint = token(`${hue}-tint`);
    for (const surface of SURFACES) {
      const background = flatten(tint, token(surface));
      expect(contrast(fg, background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(STATUS_HUES)("%s carries white text at 4.5:1 when used as a solid fill", (hue) => {
    const canvasToken = token("--bs-bg-canvas");
    expect(contrast(canvasToken, token(hue))).toBeGreaterThanOrEqual(4.5);
  });

  it("border-strong clears the 3:1 non-text floor on every surface", () => {
    const border = token("--bs-border-strong");
    for (const surface of SURFACES) {
      const base = token(surface);
      expect(contrast(flatten(border, base), base)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("P8 light theme UI element contrast", () => {
  it("focus ring clears 3:1 on every surface", () => {
    const ring = token("--bs-focus-ring");
    for (const surface of SURFACES) {
      expect(contrast(ring, token(surface))).toBeGreaterThanOrEqual(3);
    }
  });

  it("text-quaternary clears 3:1 as decorative text on every surface", () => {
    const fg = token("--bs-text-quaternary");
    for (const surface of SURFACES) {
      expect(contrast(fg, token(surface))).toBeGreaterThanOrEqual(3);
    }
  });

  it("an Inference block is visibly distinct from the surface behind it", () => {
    const tint = token("--bs-infer-tint");
    for (const surface of SURFACES) {
      const base = token(surface);
      expect(contrast(flatten(tint, base), base)).toBeGreaterThanOrEqual(1.1);
    }
  });

  it("environments risk dots clear 3:1 non-text floor on every surface", () => {
    const riskDotTokens = [
      "--bs-fail",
      "--bs-warn",
      "--bs-accent",
      "--bs-neutral",
      "--bs-text-tertiary",
    ] as const;
    for (const dot of riskDotTokens) {
      const color = token(dot);
      for (const surface of SURFACES) {
        expect(contrast(color, token(surface))).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
