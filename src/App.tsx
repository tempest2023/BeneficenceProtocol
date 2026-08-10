import { useEffect, useRef, useState, type MouseEvent } from 'react'
import sanFrancisco from './assets/scenes/san-francisco.webp'
import santaClara from './assets/scenes/santa-clara.webp'
import stanford from './assets/scenes/stanford.webp'
import paloAlto from './assets/scenes/palo-alto.webp'
import losAngeles from './assets/scenes/los-angeles.webp'
import './App.css'

type Navigate = (href: string) => void

const programs = [
  {
    number: '01',
    title: 'Make AI legible',
    short: 'Public education and an independent voice inside AI communities.',
    detail:
      'Publish accessible research interpretation, public forums, interviews and multilingual material that help more people understand beneficial and safe AI Agents.',
    approach:
      'The work translates technical progress without flattening uncertainty. It connects model capability, Agent behavior, governance and social consequence so that public participation can begin before decisions become irreversible.',
  },
  {
    number: '02',
    title: 'Convene the field',
    short: 'Independent events around the places where AI research gathers.',
    detail:
      'Organize workshops, panels and community events around ICML, NeurIPS, ICLR, ACL and related research communities, with accurate affiliation language.',
    approach:
      'Convenings bring researchers, builders, educators and public-interest practitioners into the same room. The Foundation participates independently and describes every institutional relationship precisely.',
  },
  {
    number: '03',
    title: 'Teach openly',
    short: 'Free paths into AI, LLMs and responsible Agent development.',
    detail:
      'Create open courses, curricula, practical projects, reading groups and mentorship that widen access to research and responsible industry work.',
    approach:
      'Learning paths combine conceptual foundations with responsible practice. Materials are designed for reuse, translation and adaptation by communities that are usually downstream of technical change.',
  },
  {
    number: '04',
    title: 'Build civic community',
    short: 'Primarily free online and local spaces for learning and action.',
    detail:
      'Connect learners, researchers and builders through cohorts, local gatherings and public discussions on Agent safety, infrastructure and social impact.',
    approach:
      'Community is treated as civic infrastructure: a place to learn, deliberate and act together. Participation should remain broadly accessible rather than becoming a premium gate around public knowledge.',
  },
]

const fundPath = [
  { label: 'Accept', text: 'Only through verified channels and approved assets.' },
  { label: 'Safeguard', text: 'Segregated custody, policy limits and accountable signers.' },
  { label: 'Allocate', text: 'Mission budgets governed by humans, DAO and policy.' },
  { label: 'Publish', text: 'Transactions, decisions, expenses and outcomes.' },
]

const governanceActors = [
  {
    label: 'Human Board',
    role: 'Legally accountable',
    text: 'Fiduciary duties, legal standing, people, major direction and Agent oversight.',
  },
  {
    label: 'DAO',
    role: 'Collectively governing',
    text: 'One authenticated collective governance vote within the adopted constitution.',
  },
  {
    label: 'AI Agents',
    role: 'Operating by default',
    text: 'Planning, research, reporting and policy-bound program execution.',
  },
]

const disclosureCadence = [
  ['Live', 'Wallets, material transactions, proposals and votes'],
  ['Monthly', 'Treasury movement, expenses, programs and Agent activity'],
  ['Quarterly', 'Budget, outcomes, risks, failures and control improvements'],
  ['Annual', 'Financial, governance, impact and filing record'],
]

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

function Arrow() {
  return (
    <svg className="arrow" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2 9h13M10 4l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function DeferredImage({ src, width, height }: { src: string; width: number; height: number }) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const image = imageRef.current
    if (!image) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px 0px' },
    )
    observer.observe(image)
    return () => observer.disconnect()
  }, [])

  return (
    <img
      ref={imageRef}
      className={`deferred-image ${loaded ? 'is-loaded' : ''}`}
      src={shouldLoad ? src : undefined}
      alt=""
      width={width}
      height={height}
      decoding="async"
      onLoad={() => setLoaded(true)}
    />
  )
}

function InternalLink({
  href,
  navigate,
  className,
  children,
  onNavigate,
  isCurrent = false,
}: {
  href: string
  navigate: Navigate
  className?: string
  children: React.ReactNode
  onNavigate?: () => void
  isCurrent?: boolean
}) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onNavigate?.()
    navigate(href)
  }

  return (
    <a href={href} className={className} aria-current={isCurrent ? 'page' : undefined} onClick={handleClick}>
      {children}
    </a>
  )
}

function SiteHeader({ navigate, currentRoute }: { navigate: Navigate; currentRoute: string }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className="site-header">
      <div className="nav-shell">
        <InternalLink
          href="/"
          navigate={navigate}
          className="wordmark"
          onNavigate={() => setMenuOpen(false)}
        >
          <FoundationMark />
          <span>
            Beneficence Protocol
            <small>Foundation</small>
          </span>
        </InternalLink>

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
          <InternalLink
            href="/"
            navigate={navigate}
            className={currentRoute === '/' ? 'is-active' : undefined}
            isCurrent={currentRoute === '/'}
            onNavigate={() => setMenuOpen(false)}
          >
            Home
          </InternalLink>
          <InternalLink
            href="/mission"
            navigate={navigate}
            className={currentRoute === '/mission' ? 'is-active' : undefined}
            isCurrent={currentRoute === '/mission'}
            onNavigate={() => setMenuOpen(false)}
          >
            Mission
          </InternalLink>
          <InternalLink
            href="/programs"
            navigate={navigate}
            className={currentRoute === '/programs' ? 'is-active' : undefined}
            isCurrent={currentRoute === '/programs'}
            onNavigate={() => setMenuOpen(false)}
          >
            Programs
          </InternalLink>
          <InternalLink
            href="/governance"
            navigate={navigate}
            className={currentRoute === '/governance' ? 'is-active' : undefined}
            isCurrent={currentRoute === '/governance'}
            onNavigate={() => setMenuOpen(false)}
          >
            Governance
          </InternalLink>
          <InternalLink
            href="/giving"
            navigate={navigate}
            className={`nav-action ${currentRoute === '/giving' ? 'is-active' : ''}`}
            isCurrent={currentRoute === '/giving'}
            onNavigate={() => setMenuOpen(false)}
          >
            Giving <Arrow />
          </InternalLink>
        </nav>
      </div>
    </header>
  )
}

function ImageCreditFooter({ navigate }: { navigate: Navigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-main page-shell">
        <InternalLink href="/" navigate={navigate} className="wordmark wordmark--footer">
          <FoundationMark />
          <span>
            Beneficence Protocol
            <small>Foundation</small>
          </span>
        </InternalLink>
        <p className="footer-thesis">Web3 first. Agent operated. Human accountable.</p>
        <nav aria-label="Footer navigation">
          <InternalLink href="/" navigate={navigate}>Home</InternalLink>
          <InternalLink href="/mission" navigate={navigate}>Mission</InternalLink>
          <InternalLink href="/programs" navigate={navigate}>Programs</InternalLink>
          <InternalLink href="/governance" navigate={navigate}>Governance</InternalLink>
          <InternalLink href="/giving" navigate={navigate}>Giving</InternalLink>
        </nav>
      </div>
      <div className="footer-legal page-shell">
        <p>Advancing beneficial AI, public knowledge and accountable Agent infrastructure.</p>
        <p>© 2026 Beneficence Protocol Foundation</p>
      </div>
      <details className="image-credits page-shell">
        <summary>Image sources and notes</summary>
        <p>Atmospheric artworks are source-preserving paper-collage interpretations, not documentary photographs.</p>
        <ul>
          <li><a href="https://commons.wikimedia.org/wiki/File:Golden_Gate_Bridge,_SF.jpg" target="_blank" rel="noreferrer">Golden Gate Bridge — Bernard Gagnon</a></li>
          <li><a href="https://commons.wikimedia.org/wiki/File:Mission_Santa_Clara.jpg" target="_blank" rel="noreferrer">Mission Santa Clara — JaGa</a></li>
          <li><a href="https://commons.wikimedia.org/wiki/File:Hoover_Tower_west_face.JPG" target="_blank" rel="noreferrer">Hoover Tower — © BrokenSphere, CC BY-SA</a></li>
          <li><a href="https://commons.wikimedia.org/wiki/File:Palo_Alto_Baylands_January_2013_001.jpg" target="_blank" rel="noreferrer">Palo Alto Baylands — King of Hearts, CC BY-SA 3.0</a></li>
          <li><a href="https://commons.wikimedia.org/wiki/File:Griffith_Observatory.jpg" target="_blank" rel="noreferrer">Griffith Observatory — Serouj, public domain</a></li>
        </ul>
      </details>
    </footer>
  )
}

function TextLink({ href, navigate, children, light = false }: { href: string; navigate: Navigate; children: React.ReactNode; light?: boolean }) {
  return (
    <InternalLink href={href} navigate={navigate} className={`text-link ${light ? 'text-link--light' : ''}`}>
      <span>{children}</span>
      <Arrow />
    </InternalLink>
  )
}

function HomePage({ navigate }: { navigate: Navigate }) {
  return (
    <>
      <main id="main-content">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero__art" aria-hidden="true">
            <img src={sanFrancisco} alt="" width="971" height="1619" fetchPriority="high" />
          </div>
          <div className="home-hero__content page-shell">
            <p className="eyebrow hero-enter hero-enter--1">A public institution for the Agent age</p>
            <h1 id="home-title">
              AI Agents should enlarge human possibility—<em>not erase it.</em>
            </h1>
            <p className="home-hero__mission hero-enter hero-enter--3">
              We advance beneficial AI Agents, widen access to AI knowledge, and build safeguards against catastrophic harm from AGI and ASI.
            </p>
            <div className="home-hero__actions hero-enter hero-enter--4">
              <InternalLink href="/mission" navigate={navigate} className="primary-action">
                Read our mission <Arrow />
              </InternalLink>
              <InternalLink href="/governance" navigate={navigate} className="quiet-action">
                How trust is designed
              </InternalLink>
            </div>
          </div>
          <div className="home-hero__principles page-shell hero-enter hero-enter--5" aria-label="Founding principles">
            <span>Web3 first</span>
            <span>Agent operated</span>
            <span>Human accountable</span>
          </div>
        </section>

        <section className="position-section" id="mission" aria-labelledby="position-title">
          <div className="page-shell position-grid">
            <p className="section-index" data-reveal>01 / Our position</p>
            <div data-reveal>
              <h2 id="position-title">Intelligence is becoming public power.</h2>
              <p className="position-lead">
                It should serve human flourishing, preserve human agency, and remain answerable to the society it transforms.
              </p>
            </div>
            <div className="value-line" data-reveal>
              <div><strong>Benefit</strong><span>Direct capability toward public good.</span></div>
              <div><strong>Agency</strong><span>Protect humanity’s ability to choose.</span></div>
              <div><strong>Proof</strong><span>Make power, money and outcomes inspectable.</span></div>
            </div>
            <TextLink href="/mission" navigate={navigate} light>Read the mission in full</TextLink>
          </div>
        </section>

        <section className="work-section" id="programs" aria-labelledby="work-title">
          <div className="work-visual" aria-hidden="true" data-reveal>
            <DeferredImage src={stanford} width={972} height={1619} />
            <span>Knowledge bears duty</span>
          </div>
          <div className="work-content" data-reveal>
            <p className="section-index">02 / What we do</p>
            <h2 id="work-title">Public learning turns capability into shared power.</h2>
            <ol className="work-list">
              {programs.map((program) => (
                <li key={program.number}>
                  <span>{program.number}</span>
                  <div><strong>{program.title}</strong><p>{program.short}</p></div>
                </li>
              ))}
            </ol>
            <TextLink href="/programs" navigate={navigate}>Explore our programs</TextLink>
          </div>
        </section>

        <section className="stewardship-section" id="governance" aria-labelledby="stewardship-title">
          <div className="stewardship-art" aria-hidden="true">
            <DeferredImage src={paloAlto} width={971} height={1619} />
          </div>
          <div className="page-shell stewardship-content">
            <div className="stewardship-heading" data-reveal>
              <p className="section-index section-index--light">03 / Stewardship</p>
              <h2 id="stewardship-title">Every gift has a public path.</h2>
              <p>Money moves through controls—not a black box.</p>
            </div>
            <ol className="fund-path" data-reveal>
              {fundPath.map((step, index) => (
                <li key={step.label}>
                  <span>0{index + 1}</span>
                  <strong>{step.label}</strong>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
            <div className="accountability-line" data-reveal>
              <p><strong>Human Board</strong> carries legal accountability.</p>
              <p><strong>DAO</strong> participates through one collective vote.</p>
              <p><strong>AI Agents</strong> execute within visible policy.</p>
            </div>
            <TextLink href="/governance" navigate={navigate} light>Inspect the governance model</TextLink>
          </div>
        </section>

        <section className="giving-section" id="giving" aria-labelledby="giving-title">
          <div className="giving-art" aria-hidden="true" data-reveal>
            <DeferredImage src={losAngeles} width={971} height={1619} />
          </div>
          <div className="giving-content" data-reveal>
            <p className="section-index">04 / Giving</p>
            <h2 id="giving-title">Giving is built on operational trust.</h2>
            <p className="giving-lead">
              Our giving rails serve both people and Agents: crypto, stablecoins and conventional payments governed by legal, custody, screening and accounting controls.
            </p>
            <div className="giving-standard">
              <span>Giving standard</span>
              <strong>Verified channels. Accountable custody.</strong>
            </div>
            <p className="asset-summary">BTC · ETH · BNB · approved stablecoins · reviewed assets · fiat rails</p>
            <TextLink href="/giving" navigate={navigate}>Review our giving standards</TextLink>
          </div>
        </section>

        <section className="closing-section" aria-labelledby="closing-title">
          <div className="page-shell" data-reveal>
            <p className="eyebrow">Our long view</p>
            <h2 id="closing-title">Beneficence should become a native capability of autonomous systems.</h2>
            <InternalLink href="/mission" navigate={navigate} className="closing-link">
              The future we are building <Arrow />
            </InternalLink>
          </div>
        </section>
      </main>
    </>
  )
}

function ArticleHero({
  eyebrow,
  title,
  lead,
  image,
  imagePosition,
  caption,
}: {
  eyebrow: string
  title: string
  lead: string
  image: string
  imagePosition?: string
  caption: string
}) {
  return (
    <header className="article-hero">
      <div className="page-shell article-hero__grid">
        <div className="article-hero__content">
          <p className="eyebrow hero-enter hero-enter--1">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="article-hero__lead hero-enter hero-enter--3">{lead}</p>
        </div>
        <figure className="article-hero__figure hero-enter hero-enter--3">
          <img src={image} alt="" width="971" height="1619" style={{ objectPosition: imagePosition }} />
          <figcaption>{caption}</figcaption>
        </figure>
      </div>
    </header>
  )
}

function MissionPage({ navigate }: { navigate: Navigate }) {
  return (
    <main id="main-content">
      <ArticleHero
        eyebrow="Mission and public work"
        title="Build benefit. Prevent catastrophe."
        lead="Beneficence Protocol exists to make AI Agents more useful to humanity—and increasingly capable systems less able to destroy what humanity values."
        image={santaClara}
        imagePosition="50% 58%"
        caption="Institutional memory / Santa Clara"
      />

      <section className="article-body">
        <div className="page-shell article-layout">
          <aside className="article-rail" aria-label="Mission summary">
            <span>Mission note</span>
            <p>Two obligations guide one institution: create measurable public benefit and preserve humanity’s ability to govern its future.</p>
          </aside>
          <article className="article-copy">
            <p className="article-standfirst" data-reveal>
              Advanced AI is not only a technical achievement. It is a redistribution of capability, power and risk. Our mission begins from the premise that institutions must shape that transition deliberately—and remain accountable for the consequences.
            </p>

            <section id="constructive" data-reveal>
              <p className="article-kicker">01 / Constructive obligation</p>
              <h2>Help Agents create public good.</h2>
              <p>Beneficial capability should be legible and broadly usable. We widen access to knowledge, support responsible research and build practical paths for AI Agents to serve people, communities and public-interest institutions.</p>
              <p>This means treating education, open technology and civic participation as core infrastructure. A society cannot govern powerful systems if only a narrow technical class can understand or influence them.</p>
            </section>

            <section id="protective" data-reveal>
              <p className="article-kicker">02 / Protective obligation</p>
              <h2>Keep the worst outcomes from becoming irreversible.</h2>
              <p>As systems become more autonomous and capable, the cost of weak safeguards grows. The Foundation works to protect human life, agency, institutions and society’s ability to choose its own future in an AGI and ASI era.</p>
              <p>Protection is not a separate pessimistic agenda. It is the condition that makes durable benefit possible: capability must remain answerable to human purposes, visible governance and enforceable limits.</p>
            </section>

            <blockquote className="article-proposition" data-reveal>
              Beneficence should become a native capability of autonomous systems.
            </blockquote>

            <section id="practice" data-reveal>
              <p className="article-kicker">03 / From principle to practice</p>
              <h2>Mission becomes credible through public work.</h2>
              <p>Programs translate the mission into education, convening, open learning and civic community. Governance translates it into responsibility: identifiable fiduciaries, bounded Agent authority, inspectable decisions and published outcomes.</p>
              <TextLink href="/programs" navigate={navigate}>Read the programs</TextLink>
            </section>
          </article>
        </div>
      </section>
    </main>
  )
}

function ProgramsPage({ navigate }: { navigate: Navigate }) {
  return (
    <main id="main-content">
      <ArticleHero
        eyebrow="Programs and public work"
        title="Knowledge becomes public capacity."
        lead="Four connected programs turn the Foundation’s mission into work people can learn from, participate in and hold accountable."
        image={stanford}
        imagePosition="50% 58%"
        caption="Knowledge and duty / Stanford"
      />

      <section className="article-body">
        <div className="page-shell article-layout">
          <aside className="article-rail" aria-label="Program summary">
            <span>Program model</span>
            <p>Public education, field-building, open learning and civic community reinforce one another rather than operating as isolated projects.</p>
          </aside>
          <article className="article-copy">
            <p className="article-standfirst" data-reveal>
              The Foundation begins where public understanding and technical capability meet. Each program is designed to produce reusable knowledge, stronger participation and a clearer path from AI progress to human benefit.
            </p>

            <div className="program-essay-list">
              {programs.map((program) => (
                <section key={program.number} data-reveal>
                  <span>{program.number}</span>
                  <div>
                    <p className="article-kicker">{program.short}</p>
                    <h2>{program.title}</h2>
                    <p>{program.detail}</p>
                    <p>{program.approach}</p>
                  </div>
                </section>
              ))}
            </div>

            <aside className="article-inset" data-reveal>
              <p className="article-kicker">Use of funds</p>
              <h2>Programs first. Infrastructure in service of programs.</h2>
              <ul>
                <li>Education, curriculum and public research</li>
                <li>Events, access, translation and community support</li>
                <li>Open-source and public-benefit technology</li>
                <li>Qualified people and operating AI systems</li>
                <li>Legal, accounting, security and compliance</li>
              </ul>
            </aside>

            <TextLink href="/governance" navigate={navigate}>See how the work is governed</TextLink>
          </article>
        </div>
      </section>
    </main>
  )
}

function GovernancePage({ navigate }: { navigate: Navigate }) {
  return (
    <main id="main-content">
      <ArticleHero
        eyebrow="Governance and stewardship"
        title="Power should leave a record."
        lead="The organization is designed for Agent operation without anonymous authority: legal responsibility stays visible, community governance has a defined place and every material action should be inspectable."
        image={paloAlto}
        imagePosition="50% 62%"
        caption="Shared systems / Palo Alto Baylands"
      />

      <section className="article-body">
        <div className="page-shell article-layout">
          <aside className="article-rail" aria-label="Governance summary">
            <span>Constitutional principle</span>
            <p>Automate operations wherever responsible; never automate away legal duty, human judgment or the ability to intervene.</p>
          </aside>
          <article className="article-copy">
            <p className="article-standfirst" data-reveal>
              Agent operation is meaningful only when authority is bounded and attributable. Beneficence separates execution, collective participation and fiduciary responsibility so that no system or constituency can quietly become sovereign.
            </p>

            <section data-reveal>
              <p className="article-kicker">01 / Responsibility map</p>
              <h2>Distributed intelligence. Located accountability.</h2>
              <p>Different actors contribute different forms of judgment. Their roles overlap enough to challenge one another, but not enough to dissolve responsibility.</p>
              <div className="actor-ledger">
                {governanceActors.map((actor, index) => (
                  <div key={actor.label}>
                    <span>0{index + 1}</span>
                    <div><strong>{actor.label}</strong><small>{actor.role}</small></div>
                    <p>{actor.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="article-inset" data-reveal>
              <p className="article-kicker">Governance vote architecture</p>
              <h2>Community voice enters a legally accountable process.</h2>
              <p>Each natural-person director has one vote. The authenticated DAO community produces one collective governance vote with equal policy weight, subject to nonprofit law and nondelegable fiduciary duties.</p>
            </aside>

            <section data-reveal>
              <p className="article-kicker">02 / Stewardship path</p>
              <h2>From accepted gift to visible outcome.</h2>
              <ol className="article-process">
                {fundPath.map((step, index) => (
                  <li key={step.label}>
                    <span>0{index + 1}</span>
                    <div><strong>{step.label}</strong><p>{step.text}</p></div>
                  </li>
                ))}
              </ol>
              <p>Charitable assets remain Foundation property. They do not become donor property, Token-holder property or a private protocol treasury.</p>
            </section>

            <section data-reveal>
              <p className="article-kicker">03 / Publication cadence</p>
              <h2>Trust is a reporting system.</h2>
              <dl className="article-cadence">
                {disclosureCadence.map(([term, description]) => (
                  <div key={term}><dt>{term}</dt><dd>{description}</dd></div>
                ))}
              </dl>
              <TextLink href="/giving" navigate={navigate}>Review the giving model</TextLink>
            </section>
          </article>
        </div>
      </section>
    </main>
  )
}

function GivingPage({ navigate }: { navigate: Navigate }) {
  return (
    <main id="main-content">
      <ArticleHero
        eyebrow="Giving architecture"
        title="Native to the Agent economy. Bound to charitable law."
        lead="Beneficence supports conventional and digital-asset gifts through verified channels. Every accepted asset is screened, recorded and governed as charitable property."
        image={losAngeles}
        imagePosition="50% 58%"
        caption="Looking beyond / Los Angeles"
      />

      <section className="article-body">
        <div className="page-shell article-layout">
          <aside className="article-rail" aria-label="Giving summary">
            <span>Official-channel policy</span>
            <p>Give only through verified Foundation channels published with their network, asset, custody and receipt information.</p>
          </aside>
          <article className="article-copy">
            <p className="article-standfirst" data-reveal>
              A contribution is not simply a transaction. It creates a charitable asset, a custody obligation, an accounting record and a public responsibility that must remain coherent across fiat and digital rails.
            </p>

            <section data-reveal>
              <p className="article-kicker">01 / Giving rails</p>
              <h2>Broad access. Asset-by-asset control.</h2>
              <div className="giving-ledger">
                <div><span>Core digital assets</span><strong>BTC · ETH · BNB</strong><p>Accepted only on specifically approved networks and through published Foundation-controlled addresses.</p></div>
                <div><span>Stable and conventional</span><strong>Approved stablecoins · ACH · cards · wires</strong><p>We recommend lower-cost routes when fees would consume a disproportionate share of a gift.</p></div>
                <div><span>Reviewed assets</span><strong>Exchange-issued tokens · Meme Coins · other assets</strong><p>Individual review for liquidity, custody, contract, compliance, accounting and liquidation risk.</p></div>
              </div>
            </section>

            <aside className="article-inset" data-reveal>
              <p className="article-kicker">Accounting rule</p>
              <h2>A gift and its later investment result are not the same thing.</h2>
              <div className="receipt-steps">
                <p><span>At receipt</span>Record quantity, chain, timestamp and defensible fair value.</p>
                <p><span>After receipt</span>Report appreciation or loss separately from donation revenue.</p>
                <p><span>For the donor</span>Describe donated property; do not promise or assign the donor’s tax value.</p>
              </div>
            </aside>

            <section data-reveal>
              <p className="article-kicker">02 / Operational controls</p>
              <h2>Five controls govern every gift.</h2>
              <ol className="article-process">
                <li><span>01</span><strong>Legal authority and Board oversight</strong></li>
                <li><span>02</span><strong>Custody and signer controls</strong></li>
                <li><span>03</span><strong>Gift acceptance and screening</strong></li>
                <li><span>04</span><strong>Accounting and receipts</strong></li>
                <li><span>05</span><strong>Public addresses and reporting</strong></li>
              </ol>
              <TextLink href="/governance" navigate={navigate}>See the stewardship model</TextLink>
            </section>
          </article>
        </div>
      </section>
    </main>
  )
}

function NotFoundPage({ navigate }: { navigate: Navigate }) {
  return (
    <main id="main-content" className="not-found page-shell">
      <p className="eyebrow">404</p>
      <h1>This page is not part of the public record.</h1>
      <TextLink href="/" navigate={navigate}>Return home</TextLink>
    </main>
  )
}

function normalizePath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

function resetScrollPosition() {
  const root = document.documentElement
  const previousBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)
  window.requestAnimationFrame(() => {
    root.style.scrollBehavior = previousBehavior
  })
}

function App() {
  const [route, setRoute] = useState(() => normalizePath(window.location.pathname))

  const navigate: Navigate = (href) => {
    const url = new URL(href, window.location.origin)
    window.history.pushState({}, '', `${url.pathname}${url.hash}`)
    setRoute(normalizePath(url.pathname))
    window.requestAnimationFrame(() => {
      const target = url.hash ? document.querySelector(url.hash) : null
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else resetScrollPosition()
    })
  }

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    const handlePopState = () => {
      setRoute(normalizePath(window.location.pathname))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (!window.location.hash) resetScrollPosition()
  }, [route])

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
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [route])

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Beneficence Protocol Foundation — Keep the Agent Age Human',
      '/mission': 'Mission — Beneficence Protocol Foundation',
      '/programs': 'Programs and Public Work — Beneficence Protocol Foundation',
      '/governance': 'Governance and Stewardship — Beneficence Protocol Foundation',
      '/giving': 'Giving Architecture — Beneficence Protocol Foundation',
    }
    document.title = titles[route] ?? 'Beneficence Protocol Foundation'
  }, [route])

  let page: React.ReactNode
  if (route === '/') page = <HomePage navigate={navigate} />
  else if (route === '/mission') page = <MissionPage navigate={navigate} />
  else if (route === '/programs') page = <ProgramsPage navigate={navigate} />
  else if (route === '/governance') page = <GovernancePage navigate={navigate} />
  else if (route === '/giving') page = <GivingPage navigate={navigate} />
  else page = <NotFoundPage navigate={navigate} />

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader navigate={navigate} currentRoute={route} />
      {page}
      <ImageCreditFooter navigate={navigate} />
    </div>
  )
}

export default App
