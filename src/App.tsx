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
  },
  {
    number: '02',
    title: 'Convene the field',
    short: 'Independent events around the places where AI research gathers.',
    detail:
      'Organize workshops, panels and community events around ICML, NeurIPS, ICLR, ACL and related research communities, with accurate affiliation language.',
  },
  {
    number: '03',
    title: 'Teach openly',
    short: 'Free paths into AI, LLMs and responsible Agent development.',
    detail:
      'Create open courses, curricula, practical projects, reading groups and mentorship that widen access to research and responsible industry work.',
  },
  {
    number: '04',
    title: 'Build civic community',
    short: 'Primarily free online and local spaces for learning and action.',
    detail:
      'Connect learners, researchers and builders through cohorts, local gatherings and public discussions on Agent safety, infrastructure and social impact.',
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
    text: 'Fiduciary duties, formation, people, major direction and Agent oversight.',
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
}: {
  href: string
  navigate: Navigate
  className?: string
  children: React.ReactNode
  onNavigate?: () => void
}) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onNavigate?.()
    navigate(href)
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}

function SiteHeader({ navigate }: { navigate: Navigate }) {
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
          <InternalLink href="/mission" navigate={navigate} onNavigate={() => setMenuOpen(false)}>
            Mission
          </InternalLink>
          <InternalLink href="/mission#programs" navigate={navigate} onNavigate={() => setMenuOpen(false)}>
            Programs
          </InternalLink>
          <InternalLink href="/governance" navigate={navigate} onNavigate={() => setMenuOpen(false)}>
            Governance
          </InternalLink>
          <InternalLink
            href="/giving"
            navigate={navigate}
            className="nav-action"
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
          <InternalLink href="/mission" navigate={navigate}>Mission</InternalLink>
          <InternalLink href="/governance" navigate={navigate}>Governance</InternalLink>
          <InternalLink href="/giving" navigate={navigate}>Giving</InternalLink>
        </nav>
      </div>
      <div className="footer-legal page-shell">
        <p>
          Beneficence Protocol Foundation is in formation. It is not yet recognized by the IRS as a §501(c)(3)
          organization, and this website does not currently accept donations.
        </p>
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

        <section className="position-section" aria-labelledby="position-title">
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
          </div>
        </section>

        <section className="work-section" aria-labelledby="work-title">
          <div className="work-visual" aria-hidden="true" data-reveal>
            <DeferredImage src={stanford} width={972} height={1619} />
            <span>Knowledge bears duty</span>
          </div>
          <div className="work-content" data-reveal>
            <p className="section-index">02 / What we do</p>
            <h2 id="work-title">We begin with public learning.</h2>
            <ol className="work-list">
              {programs.map((program) => (
                <li key={program.number}>
                  <span>{program.number}</span>
                  <div><strong>{program.title}</strong><p>{program.short}</p></div>
                </li>
              ))}
            </ol>
            <TextLink href="/mission#programs" navigate={navigate}>Explore the first programs</TextLink>
          </div>
        </section>

        <section className="stewardship-section" aria-labelledby="stewardship-title">
          <div className="stewardship-art" aria-hidden="true">
            <DeferredImage src={paloAlto} width={971} height={1619} />
          </div>
          <div className="page-shell stewardship-content">
            <div className="stewardship-heading" data-reveal>
              <p className="section-index section-index--light">03 / Stewardship</p>
              <h2 id="stewardship-title">Every gift should have a public path.</h2>
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

        <section className="giving-section" aria-labelledby="giving-title">
          <div className="giving-art" aria-hidden="true" data-reveal>
            <DeferredImage src={losAngeles} width={971} height={1619} />
          </div>
          <div className="giving-content" data-reveal>
            <p className="section-index">04 / Giving</p>
            <h2 id="giving-title">Giving opens only after trust is operational.</h2>
            <p className="giving-lead">
              The intended rails are native to both people and Agents: crypto, stablecoins and conventional payments—accepted only after legal, custody and accounting controls are ready.
            </p>
            <div className="giving-status">
              <span>Current status</span>
              <strong>Not yet accepting donations</strong>
            </div>
            <p className="asset-summary">BTC · ETH · BNB · approved stablecoins · reviewed assets · fiat rails</p>
            <TextLink href="/giving" navigate={navigate}>See how giving will work</TextLink>
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

function DetailHero({
  eyebrow,
  title,
  lead,
  image,
  imagePosition,
}: {
  eyebrow: string
  title: string
  lead: string
  image: string
  imagePosition?: string
}) {
  return (
    <section className="detail-hero">
      <div className="detail-hero__image" aria-hidden="true">
        <img src={image} alt="" width="971" height="1619" style={{ objectPosition: imagePosition }} />
      </div>
      <div className="page-shell detail-hero__content">
        <p className="eyebrow hero-enter hero-enter--1">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-enter hero-enter--3">{lead}</p>
      </div>
    </section>
  )
}

function MissionPage({ navigate }: { navigate: Navigate }) {
  return (
    <main id="main-content">
      <DetailHero
        eyebrow="Mission and public work"
        title="Build benefit. Prevent catastrophe."
        lead="Beneficence Protocol exists to make AI Agents more useful to humanity—and increasingly capable systems less able to destroy what humanity values."
        image={santaClara}
        imagePosition="50% 58%"
      />

      <section className="detail-section">
        <div className="page-shell two-theses">
          <article data-reveal>
            <span>Constructive</span>
            <h2>Help Agents create public good.</h2>
            <p>Widen access to knowledge, support responsible research and build practical paths for AI to serve people and communities.</p>
          </article>
          <article data-reveal>
            <span>Protective</span>
            <h2>Keep the worst outcomes from becoming irreversible.</h2>
            <p>Protect human life, agency, institutions and society’s ability to govern its own future in an AGI/ASI era.</p>
          </article>
        </div>
      </section>

      <section className="program-detail-section" id="programs" aria-labelledby="program-detail-title">
        <div className="page-shell">
          <div className="detail-heading" data-reveal>
            <p className="section-index">The first public work</p>
            <h2 id="program-detail-title">Four programs. One public purpose.</h2>
          </div>
          <div className="program-detail-list">
            {programs.map((program) => (
              <article key={program.number} data-reveal>
                <span>{program.number}</span>
                <h3>{program.title}</h3>
                <p>{program.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="use-of-funds-section" aria-labelledby="use-of-funds-title">
        <div className="page-shell use-of-funds-grid">
          <div data-reveal>
            <p className="section-index section-index--light">Use of funds</p>
            <h2 id="use-of-funds-title">Programs first. Infrastructure in service of programs.</h2>
          </div>
          <ul data-reveal>
            <li>Education, curriculum and public research</li>
            <li>Events, access, translation and community support</li>
            <li>Open-source and public-benefit technology</li>
            <li>Qualified people and operating AI systems</li>
            <li>Legal, accounting, security and compliance</li>
          </ul>
          <TextLink href="/governance" navigate={navigate} light>See how funds are governed</TextLink>
        </div>
      </section>
    </main>
  )
}

function GovernancePage({ navigate }: { navigate: Navigate }) {
  return (
    <main id="main-content">
      <DetailHero
        eyebrow="Governance and stewardship"
        title="Power should leave a record."
        lead="The organization is designed for Agent operation without anonymous authority: legal responsibility stays visible, community governance has a defined place and every material action should be inspectable."
        image={paloAlto}
        imagePosition="50% 62%"
      />

      <section className="actors-section" aria-labelledby="actors-title">
        <div className="page-shell">
          <div className="detail-heading" data-reveal>
            <p className="section-index">Responsibility map</p>
            <h2 id="actors-title">Distributed intelligence. Located accountability.</h2>
          </div>
          <div className="actor-list">
            {governanceActors.map((actor, index) => (
              <article key={actor.label} data-reveal>
                <span>0{index + 1}</span>
                <p>{actor.role}</p>
                <h3>{actor.label}</h3>
                <strong>{actor.text}</strong>
              </article>
            ))}
          </div>
          <div className="vote-note" data-reveal>
            <strong>Working vote architecture</strong>
            <p>Each natural-person director has one vote. The authenticated DAO community produces one collective governance vote with equal policy weight, subject to nonprofit law and nondelegable fiduciary duties.</p>
          </div>
        </div>
      </section>

      <section className="fund-detail-section" aria-labelledby="fund-detail-title">
        <div className="page-shell">
          <div className="detail-heading detail-heading--light" data-reveal>
            <p className="section-index section-index--light">The public path</p>
            <h2 id="fund-detail-title">From accepted gift to visible outcome.</h2>
          </div>
          <ol className="fund-path fund-path--detail" data-reveal>
            {fundPath.map((step, index) => (
              <li key={step.label}>
                <span>0{index + 1}</span>
                <strong>{step.label}</strong>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="fund-boundary" data-reveal>
            Charitable assets remain Foundation property. They do not become donor property, Token-holder property or a private protocol treasury.
          </p>
        </div>
      </section>

      <section className="disclosure-section" aria-labelledby="disclosure-title">
        <div className="page-shell">
          <div className="detail-heading" data-reveal>
            <p className="section-index">Publication cadence</p>
            <h2 id="disclosure-title">Trust is a reporting system.</h2>
          </div>
          <dl className="cadence-list">
            {disclosureCadence.map(([term, description]) => (
              <div key={term} data-reveal><dt>{term}</dt><dd>{description}</dd></div>
            ))}
          </dl>
          <TextLink href="/giving" navigate={navigate}>Review the future donation model</TextLink>
        </div>
      </section>
    </main>
  )
}

function GivingPage({ navigate }: { navigate: Navigate }) {
  return (
    <main id="main-content">
      <DetailHero
        eyebrow="Future giving architecture"
        title="Native to the Agent economy. Bound to charitable law."
        lead="Beneficence intends to accept both conventional and digital-asset gifts through verified channels, with every asset screened, recorded and governed as charitable property."
        image={losAngeles}
        imagePosition="50% 58%"
      />

      <section className="current-status-section">
        <div className="page-shell current-status-grid" data-reveal>
          <span>Current status</span>
          <h2>Donation channels are not yet active.</h2>
          <p>No wallet, address or payment link is official until it appears on this canonical site after the fundraising activation gate.</p>
        </div>
      </section>

      <section className="gift-model-section" aria-labelledby="gift-model-title">
        <div className="page-shell">
          <div className="detail-heading" data-reveal>
            <p className="section-index">Intended rails</p>
            <h2 id="gift-model-title">Broad access. Asset-by-asset control.</h2>
          </div>
          <div className="gift-groups">
            <article data-reveal><span>Core digital assets</span><h3>BTC · ETH · BNB</h3><p>Accepted only on specifically approved networks and through published Foundation-controlled addresses.</p></article>
            <article data-reveal><span>Stable and conventional</span><h3>Approved stablecoins · ACH · cards · wires</h3><p>Lower-cost routes should be recommended when fees would consume a disproportionate share of a gift.</p></article>
            <article data-reveal><span>Reviewed assets</span><h3>Exchange-issued tokens · Meme Coins · other assets</h3><p>Individual review for liquidity, custody, contract, compliance, accounting and liquidation risk.</p></article>
          </div>
        </div>
      </section>

      <section className="receipt-section" aria-labelledby="receipt-title">
        <div className="page-shell receipt-grid">
          <div data-reveal>
            <p className="section-index section-index--light">Accounting rule</p>
            <h2 id="receipt-title">A gift and its later investment result are not the same thing.</h2>
          </div>
          <div className="receipt-steps" data-reveal>
            <p><span>At receipt</span>Record quantity, chain, timestamp and defensible fair value.</p>
            <p><span>After receipt</span>Report appreciation or loss separately from donation revenue.</p>
            <p><span>For the donor</span>Describe donated property; do not promise or assign the donor’s tax value.</p>
          </div>
        </div>
      </section>

      <section className="activation-section" aria-labelledby="activation-title">
        <div className="page-shell">
          <div className="detail-heading" data-reveal>
            <p className="section-index">Before giving opens</p>
            <h2 id="activation-title">Formation before solicitation.</h2>
          </div>
          <ol className="activation-list">
            <li data-reveal><span>01</span><strong>Legal entity and Board</strong></li>
            <li data-reveal><span>02</span><strong>Custody and signer controls</strong></li>
            <li data-reveal><span>03</span><strong>Gift acceptance and screening</strong></li>
            <li data-reveal><span>04</span><strong>Accounting and receipts</strong></li>
            <li data-reveal><span>05</span><strong>Public addresses and reporting</strong></li>
          </ol>
          <TextLink href="/governance" navigate={navigate}>See the stewardship model</TextLink>
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
      '/mission': 'Mission and Programs — Beneficence Protocol Foundation',
      '/governance': 'Governance and Stewardship — Beneficence Protocol Foundation',
      '/giving': 'Future Giving Architecture — Beneficence Protocol Foundation',
    }
    document.title = titles[route] ?? 'Beneficence Protocol Foundation'
  }, [route])

  let page: React.ReactNode
  if (route === '/') page = <HomePage navigate={navigate} />
  else if (route === '/mission') page = <MissionPage navigate={navigate} />
  else if (route === '/governance') page = <GovernancePage navigate={navigate} />
  else if (route === '/giving') page = <GivingPage navigate={navigate} />
  else page = <NotFoundPage navigate={navigate} />

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader navigate={navigate} />
      {page}
      <ImageCreditFooter navigate={navigate} />
    </div>
  )
}

export default App
