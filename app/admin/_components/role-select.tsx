"use client";

import type { Role } from "@prisma/client";
import { useState, useTransition } from "react";
import { changeUserRole } from "../_actions/users";
import { ROLES, roleLabel } from "@/lib/roles";

export function RoleSelect({ userId, role, disabled }: { userId: string; role: Role; disabled?: boolean }) {
  const [value, setValue] = useState<Role>(role);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  return (
    <span className="adm-action">
      <select
        className="adm-select"
        value={value}
        disabled={disabled || pending}
        aria-label="Role"
        onChange={(e) => {
          const next = e.target.value as Role;
          const previous = value;
          if (next === "OWNER" && !window.confirm("Owners can change everyone's roles. Make this person an owner?")) return;
          setValue(next);
          setError(undefined);
          startTransition(async () => {
            const result = await changeUserRole(userId, next);
            if (result.error) {
              setValue(previous);
              setError(result.error);
            }
          });
        }}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {roleLabel(r)}
          </option>
        ))}
      </select>
      {error && <span className="adm-action__error" role="alert">{error}</span>}
    </span>
  );
}
