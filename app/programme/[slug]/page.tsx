import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../components";
import { getProgram, programmes } from "../programmes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, MessageCircle } from "lucide-react";

type ProgramDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return programmes.map((program) => ({
    slug: program.slug,
  }));
}

export async function generateMetadata({ params }: ProgramDetailPageProps) {
  const { slug } = await params;
  const program = getProgram(slug);

  if (!program) {
    return {
      title: "Programme",
    };
  }

  return {
    title: program.title,
    description: program.description,
  };
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { slug } = await params;
  const program = getProgram(slug);

  if (!program) {
    notFound();
  }

  const {
    title,
    eyebrow,
    description,
    longDescription,
    focusLabel,
    ctaLabel,
    Icon,
    actions,
  } = program;

  return (
    <PageShell>
      <main>
        <section className="page-hero program-detail-hero">
          <div className="container">
            <Link className="program-back-link" href="/programme">
              <ArrowLeft className="size-4" />
              Tous les programmes
            </Link>
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </section>

        <section className="section">
          <div className="container split">
            <div>
              <span className="eyebrow">Presentation</span>
              <h2>{title}</h2>
              <p>{longDescription}</p>
              <div className="hero-actions">
                <Button asChild variant="accent" size="lg">
                  <Link href="/contact">
                    <MessageCircle className="size-5" />
                    {ctaLabel}
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/client">Suivre mon espace</Link>
                </Button>
              </div>
            </div>
            <Card className="program-detail-summary">
              <CardHeader>
                <span className="icon-box">
                  <Icon className="size-5" />
                </span>
                <CardTitle>{eyebrow}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <h2>{focusLabel}</h2>
              <p>
                Des actions concretes pour renforcer l'etude, le lien et la
                progression de chacun.
              </p>
            </div>
            <div className="grid grid-3">
              {actions.map(({ title: actionTitle, description, Icon }) => (
                <Card className="program-action-card" key={actionTitle}>
                  <CardHeader>
                    <span className="icon-box">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{actionTitle}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section about-final-cta">
          <div className="container about-final-cta-inner">
            <div>
              <span className="eyebrow">Vous etes interesse ?</span>
              <h2>Notre equipe peut vous orienter vers le bon programme.</h2>
            </div>
            <div className="hero-actions">
              <Button asChild variant="accent" size="lg">
                <Link href="/contact">Je contacte un conseiller</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/programme">Voir les autres programmes</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
