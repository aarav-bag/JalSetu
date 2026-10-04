import { ArrowDown, ArrowRight, ArrowUpRight, Droplets, Leaf, MapPin, Radio, Waves } from "lucide-react";
import "./_group.css";
import "./IndiaGlass.css";

interface IndiaGlassProps {
  onEnterPortal?: () => void;
}

const fieldImage = "/__mockup/images/jalsetu-field.jpg";

export function IndiaGlass({ onEnterPortal = () => {} }: IndiaGlassProps) {
  return (
    <div className="india-glass" id="top">
      <div className="ig-atmosphere" aria-hidden="true" />
      <header className="ig-header">
        <a className="ig-brand" href="#top" aria-label="JalSetu home">
          <span className="ig-brand-mark" aria-hidden="true"><Waves size={20} strokeWidth={1.8} /></span>
          <span>JalSetu</span>
          <span className="ig-brand-divider" />
          <small>FIELD PORTAL</small>
        </a>
        <nav className="ig-nav" aria-label="Page navigation">
          <a href="#why-it-matters">Why it matters</a>
          <a href="#how-it-works">How it works</a>
          <a href="#in-the-field">In the field</a>
        </nav>
        <button className="ig-header-cta" type="button" onClick={onEnterPortal}>
          Open web portal <ArrowUpRight size={16} />
        </button>
      </header>

      <main>
        <section className="ig-hero" aria-labelledby="ig-title">
          <div className="ig-hero-copy">
            <div className="ig-eyebrow"><span className="ig-live-dot" /> FIELD MONITORING, MADE CLEAR</div>
            <h1 id="ig-title">Know what’s<br />underfoot.<br /><em>See what’s in<br className="ig-mobile-break" /> the water.</em></h1>
            <p className="ig-hero-intro">
              JalSetu brings soil-moisture and water-quality readings into one practical portal—so your next irrigation choice starts with a clearer picture.
            </p>
            <div className="ig-hero-actions">
              <button className="ig-primary-cta" type="button" onClick={onEnterPortal}>
                Open JalSetu Web Portal <span><ArrowRight size={17} /></span>
              </button>
              <a className="ig-secondary-link" href="#how-it-works">See how it works <ArrowDown size={15} /></a>
            </div>
            <div className="ig-hero-note">
              <span className="ig-note-rule" />
              Built around the decisions made out in the field.
            </div>
          </div>

          <div className="ig-hero-visual">
            <img src={fieldImage} alt="A farmer walking cultivated rows beside an irrigation channel" />
            <div className="ig-photo-shade" />
            <div className="ig-photo-topline">
              <span><MapPin size={13} /> INDIA · IN THE FIELD</span>
              <span>01 — 03</span>
            </div>
            <div className="ig-photo-caption">
              <span className="ig-caption-mark"><Waves size={19} /></span>
              <span><strong>Land and water, read together.</strong><small>A little more clarity for the next step.</small></span>
            </div>
            <div className="ig-glass-callout">
              <span className="ig-callout-orbit"><Droplets size={18} /></span>
              <span><b>One view, two essentials</b><small>Soil moisture + water quality</small></span>
              <ArrowUpRight size={15} />
            </div>
            <div className="ig-image-index" aria-hidden="true">J / S</div>
          </div>
          <a className="ig-scroll-cue" href="#why-it-matters"><span>THE FIELD CONTEXT</span><ArrowDown size={15} /></a>
        </section>

        <section className="ig-context" id="why-it-matters" aria-labelledby="ig-context-title">
          <div className="ig-context-heading">
            <div>
              <div className="ig-eyebrow ig-eyebrow-muted"><span className="ig-eyebrow-rule" /> A BIG PICTURE, A FIELD-SIZED DECISION</div>
              <h2 id="ig-context-title">Water uncertainty<br /><em>is part of the work.</em></h2>
            </div>
            <p>Rainfall can be uncertain, moisture changes across a field, and water quality is not something you can reliably judge by sight.</p>
          </div>
          <div className="ig-stat-row">
            <article className="ig-stat-card ig-stat-economy">
              <div className="ig-stat-top"><span className="ig-stat-tag">INDIA · FY 2023–24 (PE)</span><Leaf size={18} /></div>
              <div className="ig-stat-value">~16<span>%</span></div>
              <h3>of India’s GDP</h3>
              <p>Agriculture and allied activities’ approximate contribution at current prices.</p>
              <a href="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2097919" target="_blank" rel="noreferrer">
                Government of India · Economic Survey 2024–25 <ArrowUpRight size={13} />
              </a>
            </article>
            <div className="ig-stat-bridge" aria-hidden="true"><span>FIELD REALITY</span><i /></div>
            <article className="ig-stat-card ig-stat-rain">
              <div className="ig-stat-top"><span className="ig-stat-tag">NET SOWN AREA · INDIA</span><Droplets size={18} /></div>
              <div className="ig-stat-value">Nearly <span>60%</span></div>
              <h3>is rainfed</h3>
              <p>Rainfall dependence makes it harder to know what the field will need next.</p>
              <a href="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2259279&lang=1&reg=3" target="_blank" rel="noreferrer">
                National Mission for Sustainable Agriculture backgrounder <ArrowUpRight size={13} />
              </a>
            </article>
            <aside className="ig-context-aside">
              <span className="ig-aside-number">01 / THE CHALLENGE</span>
              <p>Moisture varies from one patch to another. Clear-looking water can still hold dissolved salts. A closer reading helps make the picture less uncertain.</p>
              <span className="ig-aside-signature"><i /> A practical place to start.</span>
            </aside>
          </div>
          <p className="ig-source-note">PE means provisional estimate. The GDP figure is a sector-level contribution, not an estimate of an individual farmer’s income or share.</p>
        </section>

        <section className="ig-how" id="how-it-works" aria-labelledby="ig-how-title">
          <div className="ig-how-intro">
            <div className="ig-eyebrow"><span className="ig-eyebrow-rule" /> PRACTICAL BY DESIGN</div>
            <h2 id="ig-how-title">Two readings.<br /><em>One clearer view.</em></h2>
            <p>JalSetu gathers selected readings from sensors in the field. It helps bring two useful parts of an irrigation decision into view—without pretending to decide for you.</p>
            <div className="ig-not-a-promise"><span className="ig-info-mark">i</span><span><b>Information, not instruction.</b><small>Use readings alongside your own field knowledge and local advice.</small></span></div>
          </div>
          <div className="ig-sensor-map">
            <div className="ig-map-heading">
              <span>THE JALSETU FIELD VIEW</span>
              <span className="ig-map-pill"><span /> SENSOR INPUTS</span>
            </div>
            <div className="ig-map-land" aria-label="Diagram showing two soil moisture probes and one TDS water-quality sensor feeding into JalSetu">
              <div className="ig-field-lines" aria-hidden="true"><i /><i /><i /><i /><i /></div>
              <div className="ig-probe ig-probe-one"><span className="ig-probe-label"><Leaf size={14} /> Soil moisture probe 01</span><i /><b /></div>
              <div className="ig-probe ig-probe-two"><span className="ig-probe-label"><Leaf size={14} /> Soil moisture probe 02</span><i /><b /></div>
              <div className="ig-water-channel"><span>IRRIGATION WATER</span><i /></div>
              <div className="ig-water-sensor"><span className="ig-sensor-pin"><Droplets size={15} /></span><span className="ig-probe-label">TDS sensor</span></div>
              <div className="ig-signal signal-one" aria-hidden="true" />
              <div className="ig-signal signal-two" aria-hidden="true" />
              <div className="ig-signal signal-three" aria-hidden="true" />
              <div className="ig-portal-node"><span><Radio size={19} /></span><b>JalSetu</b><small>ONE PORTAL</small></div>
              <span className="ig-diagram-foot">CONCEPTUAL FIELD VIEW · NO LIVE READINGS SHOWN</span>
            </div>
            <div className="ig-sensor-legend">
              <div><span className="ig-legend-icon soil"><Leaf size={16} /></span><span><b>2 soil-moisture probes</b><small>Read moisture at two points in the field.</small></span></div>
              <div><span className="ig-legend-icon water"><Droplets size={16} /></span><span><b>1 TDS water-quality sensor</b><small>Total dissolved solids: one indicator, not a complete water test.</small></span></div>
            </div>
          </div>
        </section>

        <section className="ig-field-story" id="in-the-field" aria-labelledby="ig-field-title">
          <div className="ig-story-photo">
            <img src={fieldImage} alt="Cultivated field rows meeting a narrow irrigation channel" />
            <div className="ig-story-photo-wash" />
            <span className="ig-story-label"><span /> FIELD NOTES / JALSETU</span>
            <span className="ig-story-vertical">LAND · WATER · CARE</span>
          </div>
          <div className="ig-story-copy">
            <div className="ig-eyebrow ig-eyebrow-muted"><span className="ig-eyebrow-rule" /> FROM READING TO REFLECTION</div>
            <h2 id="ig-field-title">The field has<br />the final word.</h2>
            <p>JalSetu is a monitoring portal—not a substitute for the farmer’s judgement. Compare readings over time, consider the conditions on your land, and make the choice that fits your field.</p>
            <div className="ig-story-points">
              <span><i>01</i> See soil moisture from two probe points</span>
              <span><i>02</i> Consider TDS as one water-quality indicator</span>
              <span><i>03</i> Bring both into your irrigation decision</span>
            </div>
            <button className="ig-story-cta" type="button" onClick={onEnterPortal}>
              Step into JalSetu <span><ArrowRight size={17} /></span>
            </button>
          </div>
        </section>

        <section className="ig-closing">
          <div className="ig-closing-orbit ig-orbit-a" aria-hidden="true" />
          <div className="ig-closing-orbit ig-orbit-b" aria-hidden="true" />
          <div className="ig-closing-content">
            <div className="ig-eyebrow"><span className="ig-eyebrow-rule" /> A CLEARER START TO THE NEXT STEP</div>
            <h2>Read the field.<br /><em>Then decide.</em></h2>
            <p>Bring soil moisture and water quality into one view with JalSetu.</p>
            <button className="ig-primary-cta ig-closing-cta" type="button" onClick={onEnterPortal}>
              Open JalSetu Web Portal <span><ArrowRight size={17} /></span>
            </button>
          </div>
          <div className="ig-closing-mark" aria-hidden="true"><Waves size={34} /></div>
        </section>
      </main>

      <footer className="ig-footer">
        <a className="ig-brand ig-footer-brand" href="#top" aria-label="JalSetu home">
          <span className="ig-brand-mark" aria-hidden="true"><Waves size={18} /></span><span>JalSetu</span>
        </a>
        <p>Rooted in the field. Mindful of every drop.</p>
        <span className="ig-footer-note">FIELD MONITORING PORTAL · INDIA</span>
        <a className="ig-back-top" href="#top">Back to top <ArrowUpRight size={14} /></a>
      </footer>
    </div>
  );
}

export default IndiaGlass;