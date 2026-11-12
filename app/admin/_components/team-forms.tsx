"use client";

import { useActionState, useEffect, useRef } from "react";
import { addTeamMember, removeTeamMember, setTeamMemberActive, updateTeamMember } from "../_actions/team";
import type { FormState } from "@/lib/validation";
import { ActionButton } from "./action-button";
import { Field, FormMessage, SubmitButton, useKeepValuesSubmit } from "./form-bits";

export function TeamAddForm({ defaultBatch }: { defaultBatch: number }) {
  const [state, formAction, pending] = useActionState(addTeamMember, {});
  const onSubmit = useKeepValuesSubmit(formAction);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form only after a successful add.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="adm-form adm-form--compact" noValidate>
      <FormMessage state={state} />
      <div className="adm-form__row adm-form__row--4">
        <Field label="College email" name="email" state={state}>
          <input type="email" name="email" required placeholder="name@nitjsr.ac.in" />
        </Field>
        <Field label="Name" name="name" hint="Used until they sign in" state={state}>
          <input name="name" maxLength={80} />
        </Field>
        <Field label="Position" name="position" state={state}>
          <input name="position" required placeholder="CP Lead" maxLength={60} />
        </Field>
        <Field label="Batch" name="batch" state={state}>
          <input type="number" name="batch" required defaultValue={defaultBatch} />
        </Field>
      </div>
      <div className="adm-form__actions">
        <SubmitButton pending={pending} pendingText="Adding…">
          Add to team
        </SubmitButton>
      </div>
    </form>
  );
}

export type TeamRowData = {
  id: string;
  name: string | null;
  email: string;
  position: string;
  batch: number;
  order: number;
  isActive: boolean;
  isAdmin: boolean;
};

export function TeamRow({ member }: { member: TeamRowData }) {
  const update = updateTeamMember.bind(null, member.id);
  const [state, formAction, pending] = useActionState<FormState, FormData>(update, {});
  const onSubmit = useKeepValuesSubmit(formAction);

  return (
    <li className="adm-team-row">
      <div className="adm-team-row__who">
        <strong>{member.name ?? member.email}</strong>
        <span className="adm-muted">{member.email}</span>
        {member.isAdmin && <span className="adm-badge">admin</span>}
      </div>
      <form onSubmit={onSubmit} className="adm-team-row__edit" noValidate>
        <input name="position" defaultValue={member.position} aria-label="Position" placeholder="Position" aria-invalid={!!state.fieldErrors?.position} />
        <input name="batch" type="number" defaultValue={member.batch} aria-label="Batch" className="adm-input--narrow" aria-invalid={!!state.fieldErrors?.batch} />
        <input name="order" type="number" defaultValue={member.order} aria-label="Display order" placeholder="Order" title="Display order (lower comes first)" className="adm-input--narrow" />
        <SubmitButton pending={pending}>Save</SubmitButton>
      </form>
      <div className="adm-team-row__actions">
        {member.isActive ? (
          <ActionButton action={setTeamMemberActive.bind(null, member.id, false)}>Move to alumni</ActionButton>
        ) : (
          <ActionButton action={setTeamMemberActive.bind(null, member.id, true)}>Make current</ActionButton>
        )}
        <ActionButton
          variant="danger"
          confirmText={`Remove ${member.name ?? member.email} from the team page? Their account and blogs stay.`}
          action={removeTeamMember.bind(null, member.id)}
        >
          Remove
        </ActionButton>
      </div>
      {(state.error || state.fieldErrors || state.ok) && (
        <div className="adm-team-row__msg">
          <FormMessage state={state} />
        </div>
      )}
    </li>
  );
}
