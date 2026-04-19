"use client";

import { useEffect, useEffectEvent, useState } from "react";

import type { ModuleDetails } from "@/core/module/module.types";

export interface UseModuleOptions {
  enabled?: boolean;
  requesterId?: string | null;
}

export interface UseModuleResult {
  module: ModuleDetails | null;
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function useModule(moduleId: string | null, options: UseModuleOptions = {}): UseModuleResult {
  const [module, setModule] = useState<ModuleDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const enabled = options.enabled ?? true;
  const requesterId = normalizeRequesterId(options.requesterId);
  const fetchModuleEvent = useEffectEvent(async (currentModuleId: string) => fetchModule(currentModuleId));

  useEffect(() => {
    let isActive = true;

    async function loadModule() {
      const normalizedModuleId = moduleId?.trim() ?? "";

      if (!enabled || normalizedModuleId.length === 0) {
        if (isActive) {
          setModule(null);
          setError(null);
          setIsLoading(false);
        }

        return;
      }

      if (isActive) {
        setIsLoading(true);
      }

      try {
        const nextModule = await fetchModuleEvent(normalizedModuleId);

        if (isActive) {
          setModule(nextModule);
          setError(null);
        }
      } catch (loadError) {
        if (isActive) {
          setModule(null);
          setError(toError(loadError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadModule();

    return () => {
      isActive = false;
    };
  }, [enabled, moduleId, requesterId]);

  return {
    error,
    isLoading,
    module,
    reload: async () => {
      if (!moduleId?.trim() || !enabled) {
        setModule(null);
        setError(null);
        setIsLoading(false);

        return;
      }

      setIsLoading(true);

      try {
        const nextModule = await fetchModule(moduleId.trim());
        setModule(nextModule);
        setError(null);
      } catch (loadError) {
        setModule(null);
        setError(toError(loadError));
      } finally {
        setIsLoading(false);
      }
    },
  };
}

async function fetchModule(moduleId: string): Promise<ModuleDetails> {
  const url = new URL(`/api/modules/${encodeURIComponent(moduleId)}`, window.location.origin);

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch module ${moduleId}.`);
  }

  return (await response.json()) as ModuleDetails;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error("Unable to load module.");
}

function normalizeRequesterId(requesterId: string | null | undefined): string | null {
  if (!requesterId) {
    return null;
  }

  const normalizedRequesterId = requesterId.trim();

  return normalizedRequesterId.length > 0 ? normalizedRequesterId : null;
}