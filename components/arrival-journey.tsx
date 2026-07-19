"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BedDouble,
  Check,
  CheckCircle2,
  Globe,
  HeartHandshake,
  HeartPulse,
  Luggage,
  MessageCircle,
  PartyPopper,
  Phone,
  RotateCcw,
  Stamp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const WHATSAPP_URL =
  "https://chat.whatsapp.com/EJr8re5PAc6B3hTYuwEp7J?s=cl&p=i&ilr=1";
const STORAGE_KEY = "arrival-journey-progress-v1";

/**
 * Petit store externe pour la progression : lu via useSyncExternalStore afin
 * d'eviter tout setState dans un effet et tout decalage d'hydratation.
 */
type Progress = Record<string, boolean>;
const EMPTY_PROGRESS: Progress = {};

let progressCache: Progress = EMPTY_PROGRESS;
let progressLoaded = false;
const progressListeners = new Set<() => void>();

function readProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Progress) : EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

function ensureProgressLoaded() {
  if (!progressLoaded && typeof window !== "undefined") {
    progressCache = readProgress();
    progressLoaded = true;
  }
}

function subscribeProgress(callback: () => void) {
  ensureProgressLoaded();
  progressListeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      progressCache = readProgress();
      for (const listener of progressListeners) listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    progressListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getProgressSnapshot(): Progress {
  ensureProgressLoaded();
  return progressCache;
}

function getServerProgressSnapshot(): Progress {
  return EMPTY_PROGRESS;
}

function writeProgress(updater: (prev: Progress) => Progress) {
  progressCache = updater(progressCache);
  progressLoaded = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progressCache));
  } catch {
    // ignore
  }
  for (const listener of progressListeners) listener();
}

type JourneyStep = {
  id: string;
  step: string;
  short: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets?: string[];
  cta: { label: string; href: string; external?: boolean };
  icon: LucideIcon;
};

const steps: JourneyStep[] = [
  {
    id: "depart",
    step: "01",
    short: "Preparation",
    eyebrow: "Avant mon depart",
    title: "Je prepare mon arrivee",
    description:
      "Nous vous aidons a preparer votre arrivee sereinement, bien avant de monter dans l'avion.",
    bullets: [
      "Notre guide complet d'installation en Israel.",
      "Les informations pratiques essentielles.",
      "La checklist des choses importantes.",
      "Les conseils pour organiser votre depart.",
    ],
    cta: { label: "Telecharger le guide d'arrivee", href: "/guide" },
    icon: Luggage,
  },
  {
    id: "visa",
    step: "02",
    short: "Visa",
    eyebrow: "Mon visa etudiant",
    title: "Je prepare mon visa",
    description:
      "Nous vous accompagnons dans vos demarches de visa etudiant afin de faciliter votre arrivee en Israel.",
    bullets: [
      "Comprendre les demarches.",
      "Preparer les documents.",
      "Deposer votre demande.",
      "Suivre votre dossier.",
    ],
    cta: { label: "Faire ma demande de visa", href: "/demandes/visa" },
    icon: Stamp,
  },
  {
    id: "sante",
    step: "03",
    short: "Sante",
    eyebrow: "Mon assurance maladie",
    title: "Je prepare ma couverture sante",
    description:
      "Nous vous accompagnons pour effectuer votre inscription aupres des caisses d'assurance maladie israeliennes.",
    cta: {
      label: "Demander mon assurance",
      href: "/demandes/koupat-holim",
    },
    icon: HeartPulse,
  },
  {
    id: "eta",
    step: "04",
    short: "ETA-IL",
    eyebrow: "Mon autorisation ETA-IL",
    title: "Je prepare mon entree en Israel",
    description:
      "Nous vous aidons a comprendre et effectuer votre demande ETA-IL lorsque celle-ci est necessaire.",
    cta: {
      label: "Faire ma demande ETA-IL",
      href: "https://israel-entry.piba.gov.il/",
      external: true,
    },
    icon: Globe,
  },
  {
    id: "installation",
    step: "05",
    short: "Installation",
    eyebrow: "Mon installation",
    title: "J'arrive avec tout le necessaire",
    description:
      "Pour faciliter votre installation, Bnei Yeshivot propose des solutions pratiques des votre arrivee.",
    bullets: [
      "Literie et kit d'installation.",
      "Informations utiles.",
      "Conseils pratiques.",
      "Contacts importants.",
    ],
    cta: { label: "Preparer mon installation", href: "/boutique" },
    icon: BedDouble,
  },
  {
    id: "communaute",
    step: "06",
    short: "Communaute",
    eyebrow: "Rejoindre la communaute",
    title: "Une fois arrive, vous n'etes pas seul",
    description:
      "Apres votre arrivee, vous pouvez rejoindre nos differents programmes et retrouver un cadre chaleureux.",
    bullets: [
      "Beth Hamidrach.",
      "Talmoudo Beyado.",
      "Ben Hazmanim.",
      "Shabbatot, Leil Chichi et evenements.",
    ],
    cta: { label: "Decouvrir nos programmes", href: "/programme" },
    icon: HeartHandshake,
  },
  {
    id: "connecte",
    step: "07",
    short: "Rester connecte",
    eyebrow: "Rester connecte",
    title: "Recevez toutes les informations utiles",
    description:
      "Rejoignez notre groupe WhatsApp pour recevoir les prochains evenements et rester en lien avec l'equipe.",
    bullets: ["Groupe WhatsApp de l'association.", "Prochains evenements."],
    cta: { label: "Rejoindre WhatsApp", href: WHATSAPP_URL, external: true },
    icon: MessageCircle,
  },
];

function StepCta({
  cta,
  onDone,
}: {
  cta: JourneyStep["cta"];
  onDone: () => void;
}) {
  const content = (
    <>
      {cta.label}
      <ArrowRight className="size-4" />
    </>
  );

  if (cta.external) {
    return (
      <Button asChild variant="accent" className="w-full sm:w-auto">
        <a href={cta.href} target="_blank" rel="noreferrer" onClick={onDone}>
          {content}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild variant="accent" className="w-full sm:w-auto">
      <Link href={cta.href} onClick={onDone}>
        {content}
      </Link>
    </Button>
  );
}

export function ArrivalJourney() {
  const done = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot
  );
  const [activeId, setActiveId] = useState<string>(steps[0].id);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [armed, setArmed] = useState(false);
  const stepRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const progressListRef = useRef<HTMLOListElement>(null);
  const progressStepRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Etape active + apparition au scroll.
  useEffect(() => {
    const elements = steps
      .map((s) => stepRefs.current[s.id])
      .filter((el): el is HTMLLIElement => Boolean(el));

    const activeObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.stepId;
            if (id) setActiveId(id);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        // Armer l'animation seulement une fois l'observer actif : sans JS le
        // contenu reste visible.
        setArmed(true);
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.stepId;
            if (id) {
              setRevealed((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
              revealObserver.unobserve(entry.target);
            }
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    for (const el of elements) {
      activeObserver.observe(el);
      revealObserver.observe(el);
    }

    return () => {
      activeObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  // Garder l'etape active visible dans la liste horizontale (mobile).
  useEffect(() => {
    const container = progressListRef.current;
    const chip = progressStepRefs.current[activeId];
    if (!container || !chip) return;
    // Uniquement quand la liste defile horizontalement (vue mobile).
    if (container.scrollWidth <= container.clientWidth) return;
    const target =
      chip.offsetLeft - container.clientWidth / 2 + chip.offsetWidth / 2;
    container.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [activeId]);

  const toggle = useCallback((id: string) => {
    writeProgress((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const markDone = useCallback((id: string) => {
    writeProgress((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  const reset = useCallback(() => writeProgress(() => ({})), []);

  const scrollToStep = useCallback((id: string) => {
    stepRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const completedCount = steps.filter((s) => done[s.id]).length;
  const percent = Math.round((completedCount / steps.length) * 100);
  const allDone = completedCount === steps.length;

  return (
    <div className={cn("arrival-journey-shell", armed && "is-armed")}>
      <div className="arrival-journey-layout">
        {/* Panneau de progression (sticky) */}
        <aside className="arrival-progress" aria-label="Progression du parcours">
          <div className="arrival-progress-head">
            <div
              className="arrival-progress-ring"
              style={
                {
                  "--progress": `${percent}%`,
                } as React.CSSProperties
              }
            >
              <span>
                <strong>{completedCount}</strong>
                <small>/ {steps.length}</small>
              </span>
            </div>
            <div>
              <p className="arrival-progress-title">Ma progression</p>
              <p className="arrival-progress-sub">
                {allDone
                  ? "Parcours termine, bravo !"
                  : `${percent}% du parcours complete`}
              </p>
            </div>
          </div>

          <div className="arrival-progress-bar" aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </div>

          <ol className="arrival-progress-steps" ref={progressListRef}>
            {steps.map((s) => {
              const isDone = Boolean(done[s.id]);
              const isActive = activeId === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    ref={(el) => {
                      progressStepRefs.current[s.id] = el;
                    }}
                    onClick={() => scrollToStep(s.id)}
                    aria-current={isActive ? "step" : undefined}
                    className={cn(
                      "arrival-progress-step",
                      isActive && "is-active",
                      isDone && "is-done"
                    )}
                  >
                    <span className="arrival-progress-dot">
                      {isDone ? <Check className="size-3.5" /> : s.step}
                    </span>
                    <span className="arrival-progress-label">{s.short}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {completedCount > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="arrival-progress-reset"
            >
              <RotateCcw className="size-3.5" />
              Reinitialiser
            </button>
          ) : null}
        </aside>

        {/* Timeline */}
        <ol className="arrival-journey">
          {steps.map((s) => {
            const Icon = s.icon;
            const isDone = Boolean(done[s.id]);
            const isActive = activeId === s.id;
            const isRevealed = revealed[s.id];
            return (
              <li
                key={s.id}
                data-step-id={s.id}
                ref={(el) => {
                  stepRefs.current[s.id] = el;
                }}
                className={cn(
                  "arrival-step",
                  isActive && "is-active",
                  isDone && "is-done",
                  isRevealed && "is-revealed"
                )}
              >
                <div className="arrival-step-rail">
                  <span className="arrival-step-number">
                    {isDone ? <Check className="size-6" /> : s.step}
                  </span>
                </div>
                <Card className="arrival-step-card">
                  <CardHeader className="gap-3">
                    <div className="arrival-step-head">
                      <span className="arrival-step-icon">
                        <Icon className="size-5" />
                      </span>
                      <span className="arrival-step-eyebrow">{s.eyebrow}</span>
                      {isDone ? (
                        <span className="arrival-step-tag">
                          <Check className="size-3" />
                          Fait
                        </span>
                      ) : null}
                    </div>
                    <CardTitle>{s.title}</CardTitle>
                    <CardDescription>{s.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-5">
                    {s.bullets ? (
                      <ul className="arrival-step-bullets">
                        {s.bullets.map((bullet) => (
                          <li key={bullet}>
                            <CheckCircle2 className="size-4" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="arrival-step-actions">
                      <StepCta cta={s.cta} onDone={() => markDone(s.id)} />
                      <button
                        type="button"
                        onClick={() => toggle(s.id)}
                        aria-pressed={isDone}
                        className={cn(
                          "arrival-step-toggle",
                          isDone && "is-done"
                        )}
                      >
                        <span className="arrival-step-check">
                          {isDone ? <Check className="size-3.5" /> : null}
                        </span>
                        {isDone ? "Etape validee" : "Marquer comme fait"}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Felicitations */}
      <div
        className={cn("arrival-complete", allDone && "is-visible")}
        aria-hidden={!allDone}
      >
        <span className="arrival-complete-icon">
          <PartyPopper className="size-6" />
        </span>
        <div>
          <h3>Vous avez parcouru toutes les etapes !</h3>
          <p>
            Vous etes pret pour votre arrivee en Israel. Notre equipe reste a vos
            cotes pour la suite du parcours.
          </p>
        </div>
        <div className="arrival-complete-actions">
          <Button asChild variant="accent" size="lg">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" />
              Rejoindre WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" className="arrival-final-contact">
            <Link href="/contact">
              <Phone className="size-4" />
              Nous contacter
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
