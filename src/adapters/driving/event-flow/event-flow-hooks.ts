"use client";

import { useAppContainer } from "@di/providers";

export function useTopicFlows() {
  const { eventFlow } = useAppContainer();
  return eventFlow.getTopicFlows.execute();
}
