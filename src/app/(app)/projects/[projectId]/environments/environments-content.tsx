"use client";

import React from "react";
import { EnvironmentCards } from "@/features/environments";

export function EnvironmentsContent() {
  return (
    <div data-testid="environments-view">
      <EnvironmentCards />
    </div>
  );
}
