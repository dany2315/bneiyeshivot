import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { PageShell } from "@/app/components";
import { getServiceDetail, serviceDetails } from "../details";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function generateStaticParams() {
  return serviceDetails.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceDetail(slug);

  return {
    title: service?.title ?? "Service",
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceDetail(slug);

  if (!service) {
    notFound();
  }

  return (
    <PageShell>
      <main>
        <section className="page-hero">
          <div className="container">
            <Button asChild variant="ghost" className="mb-5">
              <Link href="/services">
                <ArrowLeft className="size-4" />
                Tous les services
              </Link>
            </Button>
            <span className="eyebrow">{service.eyebrow}</span>
            <h1>{service.title}</h1>
            <p>{service.intro}</p>
            <div className="mt-6">
              <Button asChild variant="accent" size="lg">
                <Link
                  href={service.actionHref}
                  target={service.external ? "_blank" : undefined}
                  rel={service.external ? "noreferrer" : undefined}
                >
                  {service.actionLabel}
                  {service.external ? <ExternalLink className="size-4" /> : null}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <Card className="h-fit border-[var(--border)] bg-[var(--primary)] text-white">
              <CardHeader>
                <CardTitle className="text-3xl text-white">
                  Bnei Yeshivot vous accompagne gratuitement
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-base leading-7 text-white/82">
                <p>
                  Notre objectif est de rendre chaque démarche plus claire,
                  plus simple et mieux suivie pour les étudiants francophones
                  qui viennent étudier en Israël.
                </p>
                <Button asChild variant="accent">
                  <Link
                    href={service.actionHref}
                    target={service.external ? "_blank" : undefined}
                    rel={service.external ? "noreferrer" : undefined}
                  >
                    Commencer maintenant
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {service.sections.map((section) => (
                <Card
                  key={section.title}
                  className="border-[var(--border)] bg-white/95 shadow-sm"
                >
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 text-base leading-7 text-[var(--muted)]">
                    {section.body?.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.bullets ? (
                      <ul className="grid gap-3">
                        {section.bullets.map((bullet) => (
                          <li
                            className="flex gap-3 rounded-2xl bg-[var(--subtle)] p-3 text-[var(--primary)]"
                            key={bullet}
                          >
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
