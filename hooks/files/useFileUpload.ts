"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import type { UploadPurpose } from "@/config/uploads";
import { uploadFile } from "@/lib/files/upload";

/**
 * Upload one file for a purpose and get its public URL back.
 *   const upload = useFileUpload("payout_proof");
 *   const url = await upload.mutateAsync(file);
 * `progress` is 0 – 100 while uploading.
 */
export function useFileUpload(purpose: UploadPurpose) {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (file: File) => {
      setProgress(0);
      return uploadFile(purpose, file, setProgress);
    },
  });

  return { ...mutation, progress };
}
