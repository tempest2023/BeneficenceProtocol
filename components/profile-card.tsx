import type { PublicPerson } from '@/lib/community/types'

export function ProfileCard({ person }: { person: PublicPerson }) {
  const links = [
    ['Website', person.website_url], ['GitHub', person.github_url], ['Google Scholar', person.scholar_url], ['LinkedIn', person.linkedin_url],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))
  return <article className="profile-card">
    {person.photo_url ? <img className="profile-card__portrait" src={person.photo_url} alt={person.photo_alt ?? ''} /> : <div className="profile-card__placeholder" aria-hidden="true">{person.display_name.slice(0, 1)}</div>}
    <div><p className="profile-card__role">{person.role}</p><h2>{person.display_name}</h2>{person.responsibilities ? <p><strong>{person.responsibilities}</strong></p> : null}{person.biography ? <p className="profile-card__bio">{person.biography}</p> : null}{person.region || person.active_since ? <p className="field-hint">{[person.region, person.active_since ? `Active since ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(person.active_since))}` : null].filter(Boolean).join(' · ')}</p> : null}{person.current_work ? <p><strong>Current work:</strong> {person.current_work}</p> : null}{links.length ? <div className="profile-card__links">{links.map(([label, url]) => <a href={url} target="_blank" rel="noreferrer" key={label}>{label}</a>)}</div> : null}</div>
  </article>
}
