import { useEffect, useState } from 'react'
import sanFrancisco from './assets/scenes/san-francisco.webp'
import santaClara from './assets/scenes/santa-clara.webp'
import stanford from './assets/scenes/stanford.webp'
import paloAlto from './assets/scenes/palo-alto.webp'
import losAngeles from './assets/scenes/los-angeles.webp'
import './App.css'

const navItems = [
  { href: '#purpose', label: 'Purpose' },
  { href: '#programs', label: 'Programs' },
  { href: '#governance', label: 'Governance' },
  { href: '#transparency', label: 'Transparency' },
]

const programs = [
  {
    number: '01',
    title: 'A public voice for beneficial AI',
    summary:
      'Build credible channels inside AI communities for public education, informed debate, and a shared language for beneficial and safe Agents.',
    activity: 'Essays · public forums · research translation · multilingual media',
  },
  {
    number: '02',
    title: 'Research conversations where the field gathers',
    summary:
      'Convene independent workshops, panels, and events around ICML, NeurIPS, ICLR, ACL, and other research communities.',
    activity: 'Agent ethics · oversight · safety infrastructure · social impact',
  },
  {
    number: '03',
    title: 'Free paths into AI, LLMs, and Agents',
    summary:
      'Create open courses that help more people enter responsible AI research and industry—with practical projects, mentorship, and public learning resources.',
    activity: 'Open curriculum · code · reading groups · mentorship',
  },
  {
    number: '04',
    title: 'Learning communities with a real civic life',
    summary:
      'Connect learners through primarily free local and online gatherings focused on Agent safety, infrastructure, ethics, and responsible deployment.',
    activity: 'Community cohorts · local events · project circles · public talks',
  },
]

const scenes = [
  {
    city: 'San Francisco',
    note: 'Connection as a public promise',
    image: sanFrancisco,
    alt: 'A paper-collage interpretation of the Golden Gate Bridge, with the bridge photograph crossing a torn edge into orange and charcoal lines.',
  },
  {
    city: 'Santa Clara',
    note: 'Memory makes room',
    image: santaClara,
    alt: 'A paper-collage interpretation of Mission Santa Clara, with its tower and roof reduced into large charcoal and orange forms.',
  },
  {
    city: 'Stanford',
    note: 'Knowledge bears duty',
    image: stanford,
    alt: 'A paper-collage interpretation of Hoover Tower, with the building rising through a torn paper edge and a narrow orange line.',
  },
  {
    city: 'Palo Alto',
    note: 'Systems share a shore',
    image: paloAlto,
    alt: 'A paper-collage interpretation of Palo Alto Baylands, showing utility towers and their reflections joined by an orange horizon.',
  },
  {
    city: 'Los Angeles',
    note: 'Look beyond',
    image: losAngeles,
    alt: 'A paper-collage interpretation of Griffith Observatory, with its domes continuing into charcoal and orange arcs.',
  },
]

const governanceActors = [
  {
    label: 'Human Board',
    role: 'Legally accountable',
    details:
      'Formation, fiduciary duties, hiring, fundraising, major direction, government interface, and oversight of operating Agents.',
  },
  {
    label: 'DAO',
    role: 'Collectively governing',
    details:
      'One authenticated collective governance vote with the same policy weight as one human director, within the adopted constitution.',
  },
  {
    label: 'AI Agents',
    role: 'Operating by default',
    details:
      'Planning, research, reporting, reconciliation, community operations, program delivery, and policy-bound execution.',
  },
]

const cadence = [
  {
    frequency: 'Live',
    title: 'Verifiable state',
    details: 'Official wallets, material transactions, proposals, votes, policies, and execution status.',
  },
  {
    frequency: 'Monthly',
    title: 'Operating pulse',
    details: 'Treasury movement, donation accounting, expenses, program work, Agent activity, and human interventions.',
  },
  {
    frequency: 'Quarterly',
    title: 'Accountability review',
    details: 'Budget versus actuals, outcomes, concentration risk, governance participation, failures, and control improvements.',
  },
  {
    frequency: 'Annual',
    title: 'Public record',
    details: 'Impact report, financial statements, filings, current governance documents, and independent review when proportionate.',
  },
]

const formationSteps = [
  {
    state: 'Current',
    title: 'Public pre-launch',
    details: 'Mission, program design, governance architecture, and the public website are being established.',
  },
  {
    state: 'Next',
    title: 'Legal foundation',
    details: 'Form the Wyoming nonprofit corporation, obtain an EIN, appoint the Board, and adopt governing policies.',
  },
  {
    state: 'Then',
    title: 'Operational proof',
    details: 'Deploy treasury controls, authenticated DAO governance, accounting, screening, receipts, and public reporting.',
  },
  {
    state: 'Gate',
    title: 'Fundraising activation',
    details: 'Open verified giving channels only after the Board approves the legal, security, and donor-protection checklist.',
  },
]

function Arrow({ direction = 'right' }: { direction?: 'right' | 'down' }) {
  return (
    <svg
      className={`arrow arrow--${direction}`}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
    >
      <path d="M2 9h13M10 4l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function FoundationMark() {
  return (
    <svg className="foundation-mark" viewBox="0 0 42 42" aria-hidden="true">
      <circle cx="21" cy="21" r="18.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 28.5c4.8-8.2 8.7-12.3 12-12.3s7.2 4.1 12 12.3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 6.5v29" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="21" cy="16.2" r="2.3" fill="var(--accent)" />
    </svg>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('motion-ready')
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14, rootMargin: '0px 0px -7% 0px' },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <div className="status-strip" aria-label="Organization status">
          <span className="status-strip__signal" aria-hidden="true" />
          <span>Foundation in formation</span>
          <span className="status-strip__divider" aria-hidden="true" />
          <span>Public pre-launch</span>
          <span className="status-strip__divider" aria-hidden="true" />
          <strong>Donations are not yet open</strong>
        </div>

        <div className="nav-shell">
          <a className="wordmark" href="#top" onClick={closeMenu} aria-label="Beneficence Protocol Foundation, home">
            <FoundationMark />
            <span>
              Beneficence Protocol
              <small>Foundation</small>
            </span>
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>

          <nav
            id="primary-navigation"
            className={`primary-navigation ${menuOpen ? 'is-open' : ''}`}
            aria-label="Primary navigation"
          >
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            <a className="nav-action" href="#formation" onClick={closeMenu}>
              Formation log <Arrow />
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow hero__eyebrow">A public institution for the Agent age</p>
            <h1 id="hero-title">
              AI Agents should enlarge human possibility—
              <em>not erase it.</em>
            </h1>
            <p className="hero__mission">
              Beneficence Protocol Foundation advances AI Agents that benefit society, while building the institutions and safeguards needed to prevent AGI and ASI from devastating human life, agency, and social order.
            </p>
            <div className="hero__actions">
              <a className="text-action text-action--strong" href="#purpose">
                Explore the mission <Arrow direction="down" />
              </a>
              <a className="text-action" href="#governance">
                See how responsibility is located <Arrow />
              </a>
            </div>
            <ul className="principle-line" aria-label="Founding principles">
              <li>Web3 first</li>
              <li>Agent operated</li>
              <li>Human accountable</li>
            </ul>
          </div>

          <figure className="hero__art">
            <div className="hero__image-frame">
              <img
                src={sanFrancisco}
                width="971"
                height="1619"
                fetchPriority="high"
                alt="A paper-collage interpretation of the Golden Gate Bridge, with the bridge photograph crossing a torn edge into orange and charcoal lines."
              />
            </div>
            <figcaption>
              <span>Scene 01 / San Francisco</span>
              <span>Connection as a public promise</span>
            </figcaption>
            <span className="formation-stamp" aria-hidden="true">
              Pre-formation<br />Archive 01
            </span>
          </figure>
        </section>

        <section className="purpose-section" id="purpose" aria-labelledby="purpose-title">
          <div className="section-shell">
            <p className="eyebrow eyebrow--light" data-reveal>
              Why we exist
            </p>
            <div className="purpose-statement" data-reveal>
              <h2 id="purpose-title">
                Capability is arriving faster than the institutions meant to guide it.
              </h2>
              <p>
                The future of AI cannot be left to capability alone. It needs public-interest organizations able to shape incentives, widen access to knowledge, test new forms of governance, and defend humanity’s ability to choose its own future.
              </p>
            </div>

            <ol className="imperatives">
              <li data-reveal style={{ '--i': 0 } as React.CSSProperties}>
                <span>01</span>
                <h3>Advance</h3>
                <p>Help beneficial Agents create measurable value for people and communities.</p>
              </li>
              <li data-reveal style={{ '--i': 1 } as React.CSSProperties}>
                <span>02</span>
                <h3>Prevent</h3>
                <p>Reduce catastrophic and irreversible harm from increasingly capable systems.</p>
              </li>
              <li data-reveal style={{ '--i': 2 } as React.CSSProperties}>
                <span>03</span>
                <h3>Demonstrate</h3>
                <p>Build an Agent-operated institution without dissolving human accountability.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="programs-section" id="programs" aria-labelledby="programs-title">
          <div className="programs-heading section-shell">
            <div data-reveal>
              <p className="eyebrow">The first public work</p>
              <h2 id="programs-title">Begin with public learning.</h2>
            </div>
            <p className="section-intro" data-reveal>
              Before infrastructure becomes a protocol, it must become a culture: people who can ask better questions, share practical knowledge, and organize around the public consequences of autonomous systems.
            </p>
          </div>

          <div className="program-list section-shell">
            {programs.map((program, index) => (
              <article
                className="program-row"
                key={program.number}
                data-reveal
                style={{ '--i': index } as React.CSSProperties}
              >
                <span className="program-row__number">{program.number}</span>
                <h3>{program.title}</h3>
                <div>
                  <p>{program.summary}</p>
                  <span className="program-row__activity">{program.activity}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="program-note section-shell" data-reveal>
            <span>Use of funds</span>
            <p>
              Education, research, publications, open-source work, events, accessibility, qualified people and Agents, and the legal, accounting, security, and technical infrastructure required to deliver these programs responsibly.
            </p>
          </div>
        </section>

        <section className="scene-archive" aria-labelledby="places-title">
          <div className="scene-archive__heading section-shell" data-reveal>
            <div>
              <p className="eyebrow">A public future has a geography</p>
              <h2 id="places-title">Five scenes. One civic horizon.</h2>
            </div>
            <p>
              The first community footprint stretches across California’s research, technology, cultural, and civic landscapes. Each place is treated as evidence—not decoration.
            </p>
          </div>

          <div
            className="scene-rail"
            role="region"
            tabIndex={0}
            aria-label="California scene archive. Scroll horizontally to view five scene artworks."
          >
            {scenes.map((scene, index) => (
              <figure className="scene-figure" key={scene.city} data-reveal>
                <div className="scene-figure__image">
                  <img
                    src={scene.image}
                    width={index === 2 ? '972' : '971'}
                    height="1619"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    alt={scene.alt}
                  />
                </div>
                <figcaption>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{scene.city}</strong>
                  <small>{scene.note}</small>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="governance-section" id="governance" aria-labelledby="governance-title">
          <div className="governance-heading section-shell">
            <div data-reveal>
              <p className="eyebrow">Governance as public infrastructure</p>
              <h2 id="governance-title">Distributed intelligence. Located responsibility.</h2>
            </div>
            <p data-reveal>
              Automation by default is a constitutional principle—not a promise to remove people from accountability. Work moves to Agents; authority is made explicit; legal responsibility remains visible.
            </p>
          </div>

          <div className="governance-actors section-shell">
            {governanceActors.map((actor, index) => (
              <article
                className={`governance-actor governance-actor--${index + 1}`}
                key={actor.label}
                data-reveal
                style={{ '--i': index } as React.CSSProperties}
              >
                <div className="governance-actor__index">0{index + 1}</div>
                <p>{actor.role}</p>
                <h3>{actor.label}</h3>
                <span>{actor.details}</span>
              </article>
            ))}
          </div>

          <div className="vote-architecture section-shell" data-reveal>
            <div className="vote-architecture__formula" aria-label="Working governance vote architecture">
              <span>Each director</span>
              <strong>1 vote</strong>
              <i aria-hidden="true">+</i>
              <span>DAO community</span>
              <strong className="accent-value">1 collective vote</strong>
            </div>
            <div className="vote-architecture__note">
              <span>Working legal translation</span>
              <p>
                Wyoming directors must be natural persons. The DAO therefore participates through an equal-weight collective governance vote and binding delegation where law permits; formal Board acts remain with the accountable human directors.
              </p>
            </div>
          </div>

          <div className="decision-loop section-shell" data-reveal>
            <span>Mission decision loop</span>
            <ol>
              <li>Propose</li>
              <li>Evaluate</li>
              <li>Vote</li>
              <li>Execute</li>
              <li>Record</li>
            </ol>
          </div>
        </section>

        <section className="transparency-section" id="transparency" aria-labelledby="transparency-title">
          <div className="section-shell">
            <div className="transparency-heading">
              <div data-reveal>
                <p className="eyebrow eyebrow--light">Trust must be inspectable</p>
                <h2 id="transparency-title">No black box—financial or algorithmic.</h2>
              </div>
              <p data-reveal>
                Governance, funds, Agent activity, human intervention, and real-world outcomes should form one public record. Transparency is part of the operating system, not a report added at the end.
              </p>
            </div>

            <div className="status-ledger" data-reveal>
              <div className="status-ledger__heading">
                <span>Public status ledger</span>
                <span>Last defined / August 2026</span>
              </div>
              <dl>
                <div>
                  <dt>Legal entity</dt>
                  <dd>In formation</dd>
                </div>
                <div>
                  <dt>Federal tax status</dt>
                  <dd>Not yet recognized</dd>
                </div>
                <div>
                  <dt>Donation channels</dt>
                  <dd>Not yet active</dd>
                </div>
                <div>
                  <dt>Official wallets</dt>
                  <dd>Not yet published</dd>
                </div>
                <div>
                  <dt>Initial token</dt>
                  <dd>None</dd>
                </div>
                <div>
                  <dt>Governance design</dt>
                  <dd>Tokenless DAO + human Board</dd>
                </div>
              </dl>
              <p className="status-ledger__warning">
                Anti-scam notice: no address is an official donation address until it is published on this canonical site after fundraising activation.
              </p>
            </div>

            <div className="cadence-grid">
              {cadence.map((item, index) => (
                <article key={item.frequency} data-reveal style={{ '--i': index } as React.CSSProperties}>
                  <span>{item.frequency}</span>
                  <h3>{item.title}</h3>
                  <p>{item.details}</p>
                </article>
              ))}
            </div>

            <div className="asset-line" data-reveal>
              <div>
                <span>Designed for native giving</span>
                <p>BTC · ETH · BNB · approved stablecoins · selected exchange-issued assets · reviewed Meme Coins</p>
              </div>
              <p>
                Asset support is an operating intention, not a current solicitation. Every asset and network will be individually listed and risk-reviewed before acceptance.
              </p>
            </div>
          </div>
        </section>

        <section className="formation-section" id="formation" aria-labelledby="formation-title">
          <div className="formation-heading section-shell">
            <div data-reveal>
              <p className="eyebrow">Formation in public</p>
              <h2 id="formation-title">Earn the right to ask for trust.</h2>
            </div>
            <p data-reveal>
              The website can begin as an open window into the institution. Fundraising begins only after the entity, governance, custody, accounting, donor terms, and compliance controls are real.
            </p>
          </div>

          <ol className="formation-steps section-shell">
            {formationSteps.map((step, index) => (
              <li key={step.title} data-reveal style={{ '--i': index } as React.CSSProperties}>
                <div className="formation-steps__marker">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div>
                  <span className="formation-steps__state">{step.state}</span>
                  <h3>{step.title}</h3>
                  <p>{step.details}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="closing-statement" aria-labelledby="closing-title">
          <div className="section-shell" data-reveal>
            <p className="eyebrow">A founding proposition</p>
            <h2 id="closing-title">
              Beneficence should become a native capability of autonomous systems.
            </h2>
            <p>
              An Agent economy will learn to earn, buy, sell, save, and invest. It must also learn to give—and to remain answerable to the human future it helps create.
            </p>
            <a className="text-action text-action--dark" href="#top">
              Return to the proposition <Arrow direction="down" />
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer__main section-shell">
          <a className="wordmark wordmark--footer" href="#top" aria-label="Beneficence Protocol Foundation, return home">
            <FoundationMark />
            <span>
              Beneficence Protocol
              <small>Foundation</small>
            </span>
          </a>
          <div>
            <p>Web3 first. Agent operated. Human accountable.</p>
            <p>Community channels and professional contacts will be published as legal formation is completed.</p>
          </div>
        </div>

        <div className="site-footer__legal section-shell">
          <p>
            Beneficence Protocol Foundation is currently in formation. It is not yet recognized by the IRS as a §501(c)(3) organization, and donations are not currently accepted through this website.
          </p>
          <p>© 2026 Beneficence Protocol Foundation. Working public pre-launch.</p>
        </div>

        <details className="image-credits section-shell">
          <summary>Source photography and image notes</summary>
          <div>
            <p>
              Scene artworks were derived from truthful location photographs using a paper-collage abstraction process. The artworks are not documentary photographs.
            </p>
            <ul>
              <li>
                <a href="https://commons.wikimedia.org/wiki/File:Golden_Gate_Bridge,_SF.jpg" target="_blank" rel="noreferrer">
                  Golden Gate Bridge, SF — Bernard Gagnon / Wikimedia Commons
                </a>
              </li>
              <li>
                <a href="https://commons.wikimedia.org/wiki/File:Mission_Santa_Clara.jpg" target="_blank" rel="noreferrer">
                  Mission Santa Clara — JaGa / Wikimedia Commons
                </a>
              </li>
              <li>
                <a href="https://commons.wikimedia.org/wiki/File:Hoover_Tower_west_face.JPG" target="_blank" rel="noreferrer">
                  Hoover Tower — © BrokenSphere / Wikimedia Commons, CC BY-SA
                </a>
              </li>
              <li>
                <a href="https://commons.wikimedia.org/wiki/File:Palo_Alto_Baylands_January_2013_001.jpg" target="_blank" rel="noreferrer">
                  Palo Alto Baylands — King of Hearts / Wikimedia Commons, CC BY-SA 3.0
                </a>
              </li>
              <li>
                <a href="https://commons.wikimedia.org/wiki/File:Griffith_Observatory.jpg" target="_blank" rel="noreferrer">
                  Griffith Observatory — Serouj / Wikimedia Commons, public domain
                </a>
              </li>
            </ul>
          </div>
        </details>
      </footer>
    </div>
  )
}

export default App
