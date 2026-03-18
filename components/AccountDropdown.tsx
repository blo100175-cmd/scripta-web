"use client";

import { useState } from "react";

export default function AccountDropdown({
  profile,
  healthColor,
}: {
  profile: any;
  healthColor: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="account-wrapper">
      <div
        className="account-trigger"
        onClick={() => setOpen(!open)}
      >
        <span
          className="health-dot"
          style={{ backgroundColor: healthColor }}
        />
        {profile.email} . {profile.plan}
      </div>

      {open && (
        <div className="account-dropdown">
          <p>{profile.email}</p>
          <p>Plan: {profile.plan}</p>
          <p>Status: {profile.subscription_status}</p>
          <button onClick={() => window.location.href = "/api/create-portal-session"}>
            Manage Account
          </button>
          <button onClick={() => fetch("/api/logout").then(() => location.reload())}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}