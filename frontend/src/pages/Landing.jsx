import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiAward,
  FiHeart,
  FiMapPin,
  FiPhone,
  FiShield,
  FiUsers,
} from 'react-icons/fi';
import { config } from '@/config/env.js';
import { ROUTES } from '@/constants';
import {
  aboutImage,
  certificateImages,
  heroImage,
  hospitalImages,
} from '@/constants/landingAssets.js';
import Logo from '@/components/common/Logo.jsx';
import logoSrc from '@/assets/logo.png';
import PageMeta from '@/components/common/PageMeta.jsx';
import PhotoGrid, { ImageLightbox } from '@/components/landing/PhotoGrid.jsx';

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'contact', label: 'Contact' },
];

const SERVICES = [
  {
    icon: FiHeart,
    title: 'Addiction Rehabilitation',
    text: 'Structured recovery programs with medical supervision and compassionate daily care.',
  },
  {
    icon: FiShield,
    title: 'Detox & Medical Support',
    text: 'Safe withdrawal management and ongoing health monitoring throughout treatment.',
  },
  {
    icon: FiUsers,
    title: 'Family Counseling',
    text: 'Guidance for families to rebuild trust, communication, and long-term support systems.',
  },
  {
    icon: FiAward,
    title: 'Aftercare Planning',
    text: 'Personalized discharge planning and follow-up to help patients sustain recovery.',
  },
];

const STATS = [
  { value: '24/7', label: 'Clinical supervision' },
  { value: '100%', label: 'Confidential care' },
  { value: 'Holistic', label: 'Mind & body approach' },
  { value: 'Licensed', label: 'Professional staff' },
];

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
};

function SectionHeading({ eyebrow, title, description, center = false }) {
  return (
    <div className={`mb-10 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-forest">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight text-ios-label sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-[15px] leading-relaxed text-ios-secondary">{description}</p>}
    </div>
  );
}

export default function Landing() {
  const [preview, setPreview] = useState(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-brand-cream text-ios-label">
      <PageMeta
        title="Home"
        description="Umeed-e-Zindagi Institute — compassionate addiction rehabilitation and mental health care in Pakistan."
      />

      {/* Top bar */}
      <div className="h-1 bg-gradient-to-r from-brand-forest via-brand-lime to-brand-heart" aria-hidden />

      <header className="sticky top-0 z-50 border-b border-ios-separator/40 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="shrink-0">
            <Logo size="sm" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="rounded-ios px-3 py-2 text-[13px] font-medium text-ios-secondary transition hover:bg-brand-forestLight hover:text-brand-forestDark"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.LOGIN}
              className="hidden rounded-ios px-3 py-2 text-[13px] font-semibold text-brand-forest sm:inline-flex"
            >
              Staff login
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-1.5 rounded-ios bg-brand-forest px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-brand-forestDark"
            >
              Patient portal
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {heroImage && (
            <img src={heroImage} alt="" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-forestDark/92 via-brand-forestDark/78 to-brand-forestDark/55" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-lime">
              {config.appTagline}
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              Restoring hope.
              <span className="block text-brand-lime">Rebuilding lives.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/85">
              {config.appName} provides confidential addiction treatment, mental health support, and
              rehabilitation in a safe, dignified environment for patients and families.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => scrollTo('contact')}
                className="rounded-ios-lg bg-white px-6 py-3 text-[14px] font-semibold text-brand-forestDark shadow-ios-lg transition hover:bg-brand-forestLight"
              >
                Request admission
              </button>
              <button
                type="button"
                onClick={() => scrollTo('gallery')}
                className="rounded-ios-lg border border-white/35 px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-white/10"
              >
                View our facility
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="hidden lg:block"
          >
            <div className="overflow-hidden rounded-ios-xl border border-white/20 shadow-2xl">
              <img
                src={aboutImage ?? heroImage}
                alt="Umeed-e-Zindagi facility"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-ios-separator/40 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-2xl font-bold text-brand-forest">{s.value}</p>
              <p className="mt-1 text-[13px] font-medium text-ios-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div {...fade}>
              <SectionHeading
                eyebrow="About us"
                title="A trusted place for recovery"
                description="We combine clinical expertise with a warm, respectful atmosphere — because healing happens when people feel safe, seen, and supported."
              />
              <ul className="space-y-3 text-[15px] leading-relaxed text-ios-secondary">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-forest" />
                  Inpatient rehabilitation with structured daily routines
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-forest" />
                  Medical and psychiatric evaluation for every admission
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-forest" />
                  Family involvement and ethical, confidential records
                </li>
              </ul>
            </motion.div>
            <motion.div {...fade} className="grid grid-cols-2 gap-3">
              {[aboutImage, hospitalImages[2], hospitalImages[3], hospitalImages[4]]
                .filter(Boolean)
                .slice(0, 4)
                .map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setPreview(src)}
                    className="overflow-hidden rounded-ios-lg border border-ios-separator/30 shadow-ios transition hover:shadow-ios-lg"
                  >
                    <img src={src} alt="" className="aspect-square w-full object-cover" loading="lazy" />
                  </button>
                ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="scroll-mt-20 bg-brand-forestLight/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fade}>
            <SectionHeading
              center
              eyebrow="Our services"
              title="Comprehensive rehabilitation care"
              description="Evidence-informed treatment tailored to each patient’s medical, psychological, and social needs."
            />
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ icon: Icon, title, text }, i) => (
              <motion.article
                key={title}
                {...fade}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                className="rounded-ios-lg border border-ios-separator/30 bg-white p-5 shadow-ios"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-ios bg-brand-forestLight text-brand-forest">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-[17px] font-bold text-ios-label">{title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ios-secondary">{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fade}>
            <SectionHeading
              center
              eyebrow="Facility gallery"
              title="Inside our institute"
              description="A calm, secure environment designed for recovery — common areas, care spaces, and daily life at Umeed-e-Zindagi."
            />
          </motion.div>
          <PhotoGrid images={hospitalImages} aspect="landscape" onPreview={(src) => setPreview(src)} />
        </div>
      </section>

      {/* Certificates */}
      {certificateImages.length > 0 && (
        <section id="certificates" className="scroll-mt-20 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fade}>
              <SectionHeading
                center
                eyebrow="Accreditation"
                title="Licenses & certifications"
                description="We maintain recognized registrations and compliance documentation for regulated healthcare and rehabilitation services."
              />
            </motion.div>
            <div className="mx-auto max-w-5xl">
              <PhotoGrid
                images={certificateImages}
                columns="certificates"
                aspect="certificate"
                onPreview={(src) => setPreview(src)}
              />
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-ios-xl border border-ios-separator/40 bg-white shadow-ios-lg">
            <div className="grid lg:grid-cols-2">
              <div className="bg-gradient-to-br from-brand-forest to-brand-forestDark p-8 text-white sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-lime">Contact</p>
                <h2 className="mt-2 font-display text-3xl font-bold">Begin the conversation</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-white/85">
                  Reach out for admissions, family inquiries, or general information. All consultations are handled
                  with strict confidentiality.
                </p>
                <ul className="mt-8 space-y-4 text-[15px]">
                  <li className="flex items-start gap-3">
                    <FiMapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-lime" />
                    <span>Pakistan — contact the institute for directions and visiting hours.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiPhone className="h-5 w-5 shrink-0 text-brand-lime" />
                    <span>Call during office hours for admission support</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
                <p className="text-[15px] text-ios-secondary">
                  Staff and registered users can access the digital patient portal for records, admissions, and
                  administrative workflows.
                </p>
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex w-fit items-center gap-2 rounded-ios-lg bg-brand-forest px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-brand-forestDark"
                >
                  Open patient portal
                  <FiArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="inline-flex w-fit text-[14px] font-semibold text-brand-forest hover:underline"
                >
                  Register staff account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ios-separator/40 bg-brand-forestDark py-10 text-white/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="" className="h-12 w-12 rounded-ios-lg border border-white/15 bg-white/95 object-contain p-0.5" />
            <div>
              <p className="font-display text-[15px] font-bold text-white">Umeed-e-Zindagi</p>
              <p className="text-[12px] text-white/65">{config.appTagline}</p>
            </div>
          </div>
          <p className="text-[13px]">
            © {new Date().getFullYear()} {config.appName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-[13px] font-medium">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="transition hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </footer>

      <ImageLightbox src={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
