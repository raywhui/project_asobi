"use client";
// import { createInviteLink } from "@/app/actions/invites";
import { useState } from "react";

export default function InviteButton({ sessionId }: { sessionId: string }) {
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    // const url = await createInviteLink(sessionId);
    // setLink(url);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(link!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {!link ? (
        <button onClick={handleGenerate}>Generate Invite Link</button>
      ) : (
        <div>
          <input value={link} readOnly />
          <button onClick={handleCopy}>{copied ? "Copied!" : "Copy"}</button>
        </div>
      )}
    </div>
  );
}
