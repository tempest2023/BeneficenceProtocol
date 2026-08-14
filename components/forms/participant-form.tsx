'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { registerParticipant } from '@/lib/community/actions'
import { INDUSTRIES } from '@/lib/community/constants'
import { initialActionState } from '@/lib/community/types'
import { FieldError, FormStatus, LocationFields, SubmitButton } from '@/components/forms/form-controls'

export function ParticipantForm() {
  const [state, action] = useActionState(registerParticipant, initialActionState)
  const [industry, setIndustry] = useState('')
  return (
    <form className="community-form community-form--participant" action={action} noValidate>
      <FormStatus state={state} />
      <fieldset className="form-content">
      <legend className="visually-hidden">Community registration fields</legend>
      <div className="field-grid">
        <label className="field-group"><span className="field-label">Email <span aria-hidden="true">*</span></span><input type="email" name="email" autoComplete="email" maxLength={320} required aria-describedby="email-error" /><FieldError state={state} name="email" /></label>
        <label className="field-group"><span className="field-label">Name <span className="required-note">Optional</span></span><input type="text" name="name" autoComplete="name" maxLength={120} aria-describedby="name-hint name-error" /><span className="field-hint" id="name-hint">An approved pseudonym is welcome.</span><FieldError state={state} name="name" /></label>
        <label className="field-group field-group--full"><span className="field-label">Field or industry <span aria-hidden="true">*</span></span><select name="industry" required defaultValue="" onChange={(event) => setIndustry(event.target.value)}><option value="" disabled>Select a field</option>{INDUSTRIES.map((option) => <option key={option}>{option}</option>)}</select><FieldError state={state} name="industry" /></label>
        {industry === 'Other' ? <label className="field-group field-group--full"><span className="field-label">Your field or industry <span aria-hidden="true">*</span></span><input name="industry_other" type="text" maxLength={120} required /><FieldError state={state} name="industry_other" /></label> : null}
        <LocationFields state={state} />
      </div>
      <fieldset><legend>Consent</legend><div className="choice-list choice-list--columns">
        <label className="choice"><input type="checkbox" name="communications_consent" required /><span>I agree to receive community and activity messages. I can unsubscribe at any time.</span></label>
        <label className="choice"><input type="checkbox" name="privacy_consent" required /><span>I have read the <Link href="/privacy" target="_blank">Privacy Policy</Link> and consent to this registration being processed.</span></label>
      </div><FieldError state={state} name="communications_consent" /><FieldError state={state} name="privacy_consent" /></fieldset>
      <div className="form-actions"><SubmitButton>Register for community updates</SubmitButton></div>
      </fieldset>
    </form>
  )
}
