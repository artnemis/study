"use client";

import Link from "next/link";
import { use, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { extractMaterialTopicsApi, uploadModuleMaterialApi } from "@/app/_lib/api-client";
import { useModule } from "@/hooks/useModule";
import { useT } from "@/lib/i18n/context";
import type { StudyMaterial } from "@/core/module/module.types";
import {
  Badge,
  EmptyState,
  Feedback,
  PageHeader,
  Panel,
  secondaryButtonClassName,
  toMessage,
} from "@/app/_components/ui";

export default function MaterialsPage(props: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(props.params);
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;
  const t = useT();
  const moduleDetails = useModule(moduleId, {
    enabled: true,
    requesterId: userId,
  });

  const [feedback, setFeedback] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mod = moduleDetails.module;
  const materials: StudyMaterial[] = mod?.materials ?? [];
  const canManageMaterials = status === "authenticated" && !!userId;

  async function onUpload(file: File) {
    setIsUploading(true);
    try {
      await uploadModuleMaterialApi(moduleId, file);

      await moduleDetails.reload();
      setFeedback(null);
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  async function onExtractTopics(materialId: string) {
    setIsExtracting(true);
    try {
      const result = await extractMaterialTopicsApi(moduleId, materialId);

      await moduleDetails.reload();
      setFeedback(`${t.mat_estimatedCost}: ${result.estimatedCost}`);
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsExtracting(false);
    }
  }

  function estimateCost(tokens: number): string {
    const costPer1k = 0.00015; // gpt-4.1-mini input
    const estimatedCalls = Math.ceil(tokens / 4000);
    const totalCost = estimatedCalls * 4000 * (costPer1k / 1000);
    return `~$${totalCost.toFixed(4)} (${estimatedCalls} call${estimatedCalls > 1 ? "s" : ""})`;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <Link href={`/modules/${encodeURIComponent(moduleId)}`} className="hover:text-teal-700">
          ← {t.common_back}
        </Link>
      </div>

      <PageHeader title={t.mat_title} subtitle={t.mat_subtitle} />

      <Feedback message={feedback} />
      {moduleDetails.error ? <Feedback message={moduleDetails.error.message} variant="error" /> : null}

      {!canManageMaterials ? (
        <EmptyState
          icon="🔐"
          label={t.common_signInRequired}
          action={
            <Link href="/auth/sign-in" className={secondaryButtonClassName}>
              {t.auth_signIn}
            </Link>
          }
        />
      ) : null}

      {/* Upload zone */}
      {canManageMaterials ? (
        <div
          className="group cursor-pointer rounded-3xl border-2 border-dashed border-black/10 bg-white/60 p-8 text-center backdrop-blur transition hover:border-teal-500/30 hover:bg-white/80"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files[0];
            if (file) onUpload(file);
          }}
        >
          <div className="mb-3 text-3xl">📁</div>
          <p className="font-medium text-slate-700">{t.mat_dragDrop}</p>
          <p className="mt-1 text-xs text-slate-400">{t.mat_fileTypes}</p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.pptx,.docx,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
          {isUploading ? (
            <p className="mt-3 text-sm font-medium text-teal-700">{t.mat_uploading}</p>
          ) : null}
        </div>
      ) : null}

      {/* Materials list */}
      {materials.length === 0 ? (
        <EmptyState icon="📄" label={t.mat_noMaterials} />
      ) : (
        <div className="space-y-4">
          {materials.map((material) => (
            <Panel key={material.id} title={material.filename}>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <Badge label={material.mimeType} />
                  <span>{(material.sizeBytes / 1024).toFixed(0)} KB</span>
                  {material.estimatedTokens > 0 && (
                    <>
                      <span>·</span>
                      <span>~{material.estimatedTokens.toLocaleString()} tokens</span>
                      <span>·</span>
                      <span className="font-mono text-xs text-amber-700">
                        {t.mat_estimatedCost}: {estimateCost(material.estimatedTokens)}
                      </span>
                    </>
                  )}
                </div>

                {material.extractedTopics.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{t.mat_topics}</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {material.extractedTopics.map((topic) => (
                        <Badge key={topic} label={topic} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isExtracting || !canManageMaterials}
                    className={secondaryButtonClassName}
                    onClick={() => onExtractTopics(material.id)}
                  >
                    {isExtracting ? t.mat_extracting : t.mat_extractTopics}
                  </button>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
