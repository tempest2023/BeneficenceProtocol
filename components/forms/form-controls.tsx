'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { COUNTRIES, US_STATES } from '@/lib/community/constants'
import type { ActionState } from '@/lib/community/types'

export function FieldError({ state, name }: { state: ActionState; name: string }) {
  const errors = state.fieldErrors?.[name]
  if (!errors?.length) return null
  return <span className="field-error" id={`${name}-error`}>{errors[0]}</span>
}

export function FormStatus({ state }: { state: ActionState }) {
  const statusRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (state.status !== 'idle') statusRef.current?.focus()
  }, [state])
  if (state.status === 'idle') return null
  const errors = state.fieldErrors ? Object.values(state.fieldErrors).flat() : []
  return (
    <div ref={statusRef} className="form-status" data-kind={state.status} role={state.status === 'error' ? 'alert' : 'status'} aria-live="polite" tabIndex={-1}>
      <strong>{state.status === 'success' ? 'Submission received' : 'Please check the form'}</strong>
      {state.message ? <p>{state.message}</p> : null}
      {errors.length ? <ul>{errors.map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}</ul> : null}
    </div>
  )
}

export function SubmitButton({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus()
  const unavailable = pending || disabled
  return <button className="primary-action submit-button" type="submit" disabled={unavailable} aria-disabled={unavailable}>{pending ? 'Submitting…' : children}</button>
}

export function FormsClosed({ title = 'This form is not open yet.' }: { title?: string }) {
  return (
    <div className="forms-closed" id="form-availability" role="status">
      <strong>{title}</strong>
      <p>You can review the fields below. Please check back soon to submit.</p>
    </div>
  )
}

export function LocationFields({ state }: { state: ActionState }) {
  const [scope, setScope] = useState<'united_states' | 'international'>('united_states')
  return (
    <fieldset className="field-group field-group--full">
      <legend>Region <span aria-hidden="true">*</span></legend>
      <div className="choice-list choice-list--columns">
        <label className="choice"><input type="radio" name="location_scope" value="united_states" checked={scope === 'united_states'} onChange={() => setScope('united_states')} /><span>United States</span></label>
        <label className="choice"><input type="radio" name="location_scope" value="international" checked={scope === 'international'} onChange={() => setScope('international')} /><span>Outside the United States</span></label>
      </div>
      <FieldError state={state} name="location_scope" />
      <div className="field-grid" style={{ marginTop: '1rem' }}>
        {scope === 'united_states' ? (
          <label className="field-group"><span className="field-label">State <span aria-hidden="true">*</span></span><select name="us_state" required defaultValue=""><option value="" disabled>Select a state</option>{US_STATES.map(([code, name]) => <option value={code} key={code}>{name}</option>)}</select><FieldError state={state} name="us_state" /></label>
        ) : (
          <label className="field-group"><span className="field-label">Country <span aria-hidden="true">*</span></span><select name="country" required defaultValue=""><option value="" disabled>Select a country</option>{COUNTRIES.map((country) => <option value={country} key={country}>{country}</option>)}</select><FieldError state={state} name="country" /></label>
        )}
        <label className="field-group"><span className="field-label">{scope === 'united_states' ? 'City' : 'City or region'} <span aria-hidden="true">*</span></span><input type="text" name="city_region" maxLength={120} autoComplete="address-level2" required aria-describedby="location-hint city_region-error" /><span className="field-hint" id="location-hint">Do not enter a street address.</span><FieldError state={state} name="city_region" /></label>
      </div>
    </fieldset>
  )
}
