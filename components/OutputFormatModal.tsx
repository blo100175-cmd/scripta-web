//SCRIPTA-DEV 
//SCRIPTA - V1.300726.100 - RENDERER OPTION (Bullet + VCTF + Cornell + Bubble)

"use client";

import { useState } from "react";

/**
 * OutputFormatModal.tsx
 *
 * Shown BEFORE upload begins. Free tier never sees this component at all
 * (parent decides whether to render it based on tier - see integration
 * note below). Lite sees Bullet + VCTF. Student/Pro see Bullet + VCTF +
 * Cornell + Fact Tree (internal value "bubble", renamed for users 290726 -
 * rendered by a separate node, N63, not the PDF-family renderer N61).
 *
 * The selected value is passed back via onConfirm(format) and the CALLER
 * is responsible for including it as `requested_format` in the same
 * incoming_files insert() call that registers the upload - this is what
 * makes the whole design timing-safe (value exists before N25/N61 ever run).
 */

type Tier = "free" | "lite" | "student" | "pro";

type FormatOption = {
  value: string;
  label: string;
  description: string;
};

const ALL_FORMATS: FormatOption[] = [
  { value: "bullet", label: "Classic Point Form", description: "Clean bulleted summary - always available" },
  { value: "vctf", label: "VCTF Table", description: "Visual Cognitive Thinking Framework - structured table" },
  { value: "cornell", label: "Cornell Method", description: "Notes / cue / summary study layout" },
  { value: "bubble", label: "Fact Tree", description: "Visual tree diagram - see how facts connect" },
];

const TIER_ALLOWED: Record<Tier, string[]> = {
  free: ["bullet"],
  lite: ["bullet", "vctf"],
  student: ["bullet", "vctf", "cornell", "bubble"],
  pro: ["bullet", "vctf", "cornell", "bubble"],
};

export default function OutputFormatModal({
  tier,
  onConfirm,
  onClose,
}: {
  tier: Tier;
  onConfirm: (format: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string>("bullet");

  const allowed = TIER_ALLOWED[tier] || TIER_ALLOWED.free;

  return (
    <div className="modal-overlay">
      <div className="modal format-modal">
        <h2>Choose Output Format</h2>
        <p className="format-modal-subtitle">
          Pick how you'd like your summary formatted.
        </p>

        <div className="format-options">
          {ALL_FORMATS.map((opt) => {
            const isAllowed = allowed.includes(opt.value);
            const isSelected = selected === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                disabled={!isAllowed}
                onClick={() => isAllowed && setSelected(opt.value)}
                className={`format-option ${isSelected ? "format-option-selected" : ""} ${
                  !isAllowed ? "format-option-locked" : ""
                }`}
              >
                <div className="format-option-label">
                  {opt.label}
                  {!isAllowed && <span className="format-lock-badge">🔒 Upgrade</span>}
                </div>
                <div className="format-option-desc">{opt.description}</div>
              </button>
            );
          })}
        </div>

        <div className="format-modal-actions">
          <button type="button" className="format-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="format-modal-confirm"
            onClick={() => onConfirm(selected)}
          >
            Continue to Upload
          </button>
        </div>
      </div>
    </div>
  );
}