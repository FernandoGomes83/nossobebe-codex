"use client";

import { useRef, useState, useTransition } from "react";

import styles from "./photo-upload-field.module.css";

type PhotoUploadFieldProps = {
  name: string;
};

export function PhotoUploadField({ name }: PhotoUploadFieldProps) {
  const [uploadId, setUploadId] = useState("");
  const [message, setMessage] = useState(
    "Upload opcional por enquanto. A foto fica em bucket privado e expira se o pedido nao for concluido.",
  );
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange() {
    const file = inputRef.current?.files?.[0];

    if (!file) {
      return;
    }

    startTransition(async () => {
      setMessage("Enviando foto...");

      const payload = new FormData();
      payload.set("file", file);

      const response = await fetch("/api/uploads/baby-photo", {
        method: "POST",
        body: payload,
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; uploadId?: string; error?: string }
        | null;

      if (!response.ok || !result?.ok || !result.uploadId) {
        setUploadId("");
        setMessage(result?.error ?? "Falha ao enviar a foto.");
        return;
      }

      setUploadId(result.uploadId);
      setMessage("Foto validada e salva com seguranca.");
    });
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.field}>
        <span>Foto do bebe</span>
        <input
          accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif"
          onChange={handleChange}
          ref={inputRef}
          type="file"
        />
      </label>

      <input name={name} type="hidden" value={uploadId} />

      <p className={styles.message} data-pending={isPending ? "true" : "false"}>
        {message}
      </p>
    </div>
  );
}
