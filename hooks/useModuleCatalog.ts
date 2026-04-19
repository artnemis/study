"use client";

import { useEffect, useEffectEvent, useState } from "react";

import { listModulesApi, type CatalogResponse } from "@/app/_lib/api-client";

export type ModuleCatalogFetcher = (requesterId: string | null) => Promise<CatalogResponse>;

export interface UseModuleCatalogOptions {
  enabled?: boolean;
  fetcher?: ModuleCatalogFetcher;
}

export interface UseModuleCatalogResult {
  error: Error | null;
  isLoading: boolean;
  modules: CatalogResponse["modules"];
  reload: () => Promise<void>;
  storageMode: CatalogResponse["storageMode"] | null;
}

export function useModuleCatalog(
  requesterId: string | null,
  options: UseModuleCatalogOptions = {},
): UseModuleCatalogResult {
  const [modules, setModules] = useState<CatalogResponse["modules"]>([]);
  const [storageMode, setStorageMode] = useState<CatalogResponse["storageMode"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const enabled = options.enabled ?? true;
  const fetcher = options.fetcher ?? listModulesApi;
  const fetchCatalog = useEffectEvent(async (currentRequesterId: string | null) => fetcher(currentRequesterId));

  useEffect(() => {
    let isActive = true;

    async function loadCatalog() {
      if (!enabled) {
        if (isActive) {
          setModules([]);
          setStorageMode(null);
          setError(null);
          setIsLoading(false);
        }

        return;
      }

      if (isActive) {
        setIsLoading(true);
      }

      try {
        const nextCatalog = await fetchCatalog(normalizeRequesterId(requesterId));

        if (isActive) {
          setModules(nextCatalog.modules);
          setStorageMode(nextCatalog.storageMode);
          setError(null);
        }
      } catch (loadError) {
        if (isActive) {
          setModules([]);
          setStorageMode(null);
          setError(toError(loadError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      isActive = false;
    };
  }, [enabled, requesterId]);

  return {
    error,
    isLoading,
    modules,
    reload: async () => {
      if (!enabled) {
        setModules([]);
        setStorageMode(null);
        setError(null);
        setIsLoading(false);

        return;
      }

      setIsLoading(true);

      try {
        const nextCatalog = await fetcher(normalizeRequesterId(requesterId));
        setModules(nextCatalog.modules);
        setStorageMode(nextCatalog.storageMode);
        setError(null);
      } catch (loadError) {
        setModules([]);
        setStorageMode(null);
        setError(toError(loadError));
      } finally {
        setIsLoading(false);
      }
    },
    storageMode,
  };
}

function normalizeRequesterId(requesterId: string | null): string | null {
  if (!requesterId) {
    return null;
  }

  const normalizedRequesterId = requesterId.trim();

  return normalizedRequesterId.length === 0 ? null : normalizedRequesterId;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error("Unable to load modules.");
}