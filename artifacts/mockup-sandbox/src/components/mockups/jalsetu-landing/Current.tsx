import { ArrowDown, ArrowRight, Droplets, Leaf, MoveUpRight, Waves } from "lucide-react";
import "./_group.css";
import "./Current.css";

const fieldImage = "/__mockup/images/jalsetu-field.jpg";

interface LandingProps {
  onEnterPortal?: () => void;
}

export default function Landing({ onEnterPortal = () => {} }: LandingProps) {
  return (
    <div className="jal-landing">
      <header className="jal-header">
        <a className="jal-brand" href="#welcome" aria-label="JalSetu home">
          <span className="jal-brand-mark" aria-hidden="true">
            <Waves size={22} strokeWidth={1.8} />
          </span>
          <span className="jal-brand-name">JalSetu</span>
        </a>
        <nav className="jal-nav" aria-label="Main navigation">
          <a href="#approach">Our approach</a>
          <a href="#in-the-field">In the field</a>
        </nav>
        <button className="jal-header-cta" type="button" onClick={onEnterPortal}>
          Open JalSetu Web Portal <ArrowRight size={16} />
        </button>
      </header>

      <main className="jal-main" id="welcome">
        <section className="jal-hero" aria-labelledby="jal-hero-title">
          <div className="jal-hero-copy">
            <div className="jal-eyebrow"><span /> WATER, SOIL &amp; THE NEXT RIGHT STEP</div>
            <h1 id="jal-hero-title">
              Good decisions<br />
              start <em>beneath</em><br />
              the surface.
            </h1>
            <p className="jal-hero-intro">
              A clearer picture of your soil moisture and water quality helps you make
              irrigation decisions with care—for your fields, and for every drop.
            </p>
            <button className="jal-primary-cta" type="button" onClick={onEnterPortal}>
              Open JalSetu Web Portal
              <span className="jal-cta-arrow"><ArrowRight size={18} /></span>
            </button>
            <div className="jal-hero-footnote">
              <span className="jal-footnote-rule" />
              Made for the everyday decisions that shape a season.
            </div>
          </div>

          <div className="jal-hero-art">
            <img
              className="jal-field-image"
              src={fieldImage}
              alt="A farmer looking across cultivated rows beside a narrow irrigation channel"
            />
            <div className="jal-image-wash" />
            <div className="jal-image-caption">
              <span className="jal-caption-index">01 / 03</span>
              <span>Look closely. Grow thoughtfully.</span>
            </div>
            <div className="jal-art-note">
              <span className="jal-note-icon"><Droplets size={17} /></span>
              <span><strong>Water is a shared resource.</strong><small>Every decision matters.</small></span>
            </div>
            <div className="jal-vertical-label">FIELD NOTES · JALSETU</div>
          </div>

          <a className="jal-scroll-cue" href="#approach" aria-label="Scroll to learn about the JalSetu approach">
            <span>SCROLL TO EXPLORE</span><ArrowDown size={15} />
          </a>
        </section>

        <section className="jal-approach" id="approach" aria-labelledby="approach-title">
          <div className="jal-section-heading">
            <div>
              <div className="jal-eyebrow jal-eyebrow-dark"><span /> A VIEW FROM BELOW THE CANOPY</div>
              <h2 id="approach-title">Read the field.<br /><em>Then decide.</em></h2>
            </div>
            <p>
              Farming asks for a hundred small judgements. JalSetu brings two
              important parts of the picture together, so the next step feels
              better informed.
            </p>
          </div>

          <div className="jal-principles">
            <article className="jal-principle jal-principle-soil">
              <div className="jal-principle-top">
                <span className="jal-principle-number">01</span>
                <span className="jal-icon-disc"><Leaf size={21} strokeWidth={1.65} /></span>
              </div>
              <div className="jal-principle-body">
                <p className="jal-kicker">UNDERFOOT</p>
                <h3>Soil moisture</h3>
                <p>Keep an eye on moisture in the soil and understand what your field may need.</p>
              </div>
              <span className="jal-principle-line" />
            </article>

            <article className="jal-principle jal-principle-water">
              <div className="jal-principle-top">
                <span className="jal-principle-number">02</span>
                <span className="jal-icon-disc"><Droplets size={21} strokeWidth={1.65} /></span>
              </div>
              <div className="jal-principle-body">
                <p className="jal-kicker">IN THE CHANNEL</p>
                <h3>Water quality</h3>
                <p>Bring water quality into view as part of the choices you make for your land.</p>
              </div>
              <span className="jal-principle-line" />
            </article>

            <article className="jal-principle jal-principle-decision">
              <div className="jal-principle-top">
                <span className="jal-principle-number">03</span>
                <span className="jal-icon-disc"><MoveUpRight size={20} strokeWidth={1.65} /></span>
              </div>
              <div className="jal-principle-body">
                <p className="jal-kicker">THE NEXT STEP</p>
                <h3>Irrigation decisions</h3>
                <p>Use what you know about soil and water to guide when and how you irrigate.</p>
              </div>
              <span className="jal-principle-line" />
            </article>
          </div>
          <div className="jal-field-rule"><span>GOOD STEWARDSHIP BEGINS WITH ATTENTION</span><i /></div>
        </section>

        <section className="jal-field-section" id="in-the-field" aria-labelledby="field-title">
          <div className="jal-field-aside">
            <span className="jal-field-aside-label">A TOOL FOR THE SEASON</span>
            <span className="jal-field-aside-mark" aria-hidden="true"><Waves size={31} /></span>
          </div>
          <div className="jal-field-content">
            <div className="jal-eyebrow"><span /> PRACTICAL BY DESIGN</div>
            <h2 id="field-title">Made to bring<br /><em>the picture together.</em></h2>
            <p className="jal-field-description">
              Soil and water do not work in isolation. JalSetu is a place to
              monitor both, and to bring that understanding into the irrigation
              decisions you make for your farm.
            </p>
            <button className="jal-text-link" type="button" onClick={onEnterPortal}>
              Step into JalSetu <span><ArrowRight size={17} /></span>
            </button>
          </div>
          <div className="jal-field-illustration" aria-hidden="true">
            <div className="jal-illustration-sun" />
            <div className="jal-terrace terrace-one" />
            <div className="jal-terrace terrace-two" />
            <div className="jal-terrace terrace-three" />
            <div className="jal-illustration-water" />
            <span className="jal-illustration-label">LAND / WATER / CARE</span>
          </div>
        </section>

        <footer className="jal-footer">
          <a className="jal-brand jal-footer-brand" href="#welcome" aria-label="JalSetu home">
            <span className="jal-brand-mark" aria-hidden="true"><Waves size={20} /></span>
            <span className="jal-brand-name">JalSetu</span>
          </a>
          <p>Rooted in the field. Mindful of every drop.</p>
          <button className="jal-footer-cta" type="button" onClick={onEnterPortal}>
            Open JalSetu Web Portal <ArrowRight size={16} />
          </button>
          <span className="jal-copyright">© JalSetu</span>
        </footer>
      </main>
    </div>
  );
}