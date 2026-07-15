import Image from "next/image";
import Link from "next/link";
import { PageShell } from "../components";
import { AboutPartners } from "@/components/about-partners";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "À propos",
  description:
    "Découvrez l'histoire, la mission, les valeurs, l'équipe et les partenaires de Bnei Yeshivot.",
};

const missionPillars = [
  {
    title: "Accompagner",
    description:
      "Nous accompagnons les jeunes francophones dans leurs démarches, leur intégration en Israël et les grandes étapes de leur parcours.",
    Icon: HandHeart,
  },
  {
    title: "Former",
    description:
      "Nous construisons des cadres d'étude, de progression et de motivation autour de la Torah.",
    Icon: GraduationCap,
  },
  {
    title: "Rassembler",
    description:
      "Nous faisons vivre une communauté de Bahourim, Avrekhim, Rabbanim, familles et bénévoles engagés.",
    Icon: Users,
  },
  {
    title: "Construire",
    description:
      "Nous aidons chaque jeune a trouver sa place, depuis son arrivée jusqu'à la construction de son avenir.",
    Icon: Building2,
  },
];

const values: Array<{
  title: string;
  description: string;
  Icon: LucideIcon;
}> = [
  {
    title: "Torah",
    description:
      "Tout ce que nous faisons est guide par les valeurs de la Torah.",
    Icon: BookOpen,
  },
  {
    title: "Bienveillance",
    description:
      "Chaque jeune est accueilli avec attention, écoute et respect.",
    Icon: HeartHandshake,
  },
  {
    title: "Excellence",
    description:
      "Nous cherchons a offrir un accompagnement organisé et professionnel.",
    Icon: Star,
  },
  {
    title: "Responsabilite",
    description:
      "Nous prenons au sérieux chaque demande qui nous est confiée.",
    Icon: ShieldCheck,
  },
  {
    title: "Unite",
    description:
      "Nous rassemblons les jeunes francophones autour d'un esprit de fraternité.",
    Icon: Users,
  },
];

const timeline = [
  "Torat Yaacov au Raincy",
  "Développement de Bnei Alia",
  "Réseau Ben Hazmanim en France",
  "Beth Hamidrach Leil Shishi",
  "Création de Talmoudo Beyado",
  "Binian Adei Ad",
  "Grand Maamad HaSiyoum",
  "Voyage de Rav Yehoshoua Eihenstein",
  "Rassemblement du 21 mars 2024",
  "Maison Bnei Yeshivot à Beit Vagan",
];

const landmarkEvents = [
  {
    title: "Le Grand Maamad HaSiyoum",
    description:
      "Un rassemblement de 500 jeunes Bahourim autour d'un Siyoum sur la Massekhet étudiée dans leurs Yechivot, signe fort de Kavod HaTorah et d'investissement dans l'étude.",
  },
  {
    title: "Le voyage de Rav Yehoshoua Eihenstein Shlita",
    description:
      "Un voyage historique en France pour visiter institutions et communautés, transmettre des enseignements autour du Hinouh et reunir Rabbanim, Roshei Yechivot et centaines de Bahourim.",
  },
  {
    title: "Le 21 mars 2024 à Beit Vagan",
    description:
      "Un rassemblement historique de 500 jeunes Bahourim francophones étudiant en Israël, marqué par la présence de grands Rabbanim et Roshei Yechivot, et devenu un tournant pour le mouvement.",
  },
];

const communityForces = [
  "Des dizaines d'Avrekhim impliques dans les différents cadres",
  "Des dizaines de Bahourim engagés dans les projets",
  "Des Rabbanim qui accompagnent et soutiennent les initiatives",
  "Une équipe de responsables et de bénévoles mobilisés quotidiennement",
  "Des familles, donateurs et partenaires qui permettent de développer de nouveaux projets",
];

const futureVision = [
  "Développer des structures fortes pour les prochaines générations",
  "Accompagner chaque jeune francophone dans son parcours de Torah",
  "Faciliter l'intégration en Israël avec des repères clairs",
  "Soutenir la construction personnelle, familiale et spirituelle",
];

const completeStorySections = [
  {
    title: "Bnei Yeshivot",
    eyebrow: "Qui sommes-nous ?",
    paragraphs: [
      "Une vision née du terrain. Un mouvement construit autour de la Torah et de la jeunesse francophone.",
      "Bnei Yeshivot est une association dédiée à l'accompagnement des jeunes francophones dans leur parcours de Torah, leur intégration en Israël et les grandes étapes de leur construction personnelle.",
      "Depuis sa création, notre mission est d'offrir à chaque jeune un cadre solide, une communauté et un accompagnement adapté afin qu'il puisse se consacrer pleinement à l'essentiel : grandir dans la Torah et construire son avenir.",
      "Bnei Yeshivot est née d'une conviction simple : lorsqu'un jeune choisit de consacrer sa vie à la Torah, il doit pouvoir trouver autour de lui un environnement capable de l'accompagner, de le soutenir et de lui donner les moyens de réussir.",
      "Ce qui a commence par une petite initiative autour de quelques jeunes est devenu, avec l'aide d'Hachem, un véritable mouvement au service de toute une génération.",
    ],
  },
  {
    title: "Une histoire née d'un besoin reel",
    eyebrow: "Origine",
    paragraphs: [
      "L'histoire de Bnei Yeshivot commence dans la ville du Raincy, en France, avec la création de la première Yechiva Ben Hazmanim Torat Yaacov, fondée pour l'élévation de l'âme de Rabbi Yaacov Toledano Zatsal.",
      "À l'origine, quelques jeunes se retrouvaient pendant les périodes de vacances autour de l'étude de la Torah, avec la volonté de créer un véritable cadre de Yechiva, même en dehors des périodes scolaires.",
      "Très rapidement, un constat est apparu : de nombreux jeunes francophones avaient une immense volonté de progresser dans la Torah, mais avaient besoin d'un cadre adapté, d'un environnement motivant et d'une structure capable de les accompagner.",
      "Face a cette réalité, l'initiative a grandi. D'année en année, de plus en plus de jeunes ont rejoint l'aventure, les cadres se sont développés et une véritable dynamique autour de la Torah a commence a voir le jour.",
    ],
  },
  {
    title: "De Torat Yaacov a Bnei Alia",
    eyebrow: "Réseau Ben Hazmanim",
    paragraphs: [
      "Au fil des années, l'expérience du Raincy s'est développée dans plusieurs villes de France.",
      "Ainsi est ne Bnei Alia, un réseau de Yechivot Ben Hazmanim permettant a de nombreux Bahourim de retrouver pendant les périodes de vacances une véritable atmosphère de Yechiva, avec des Sdarim d'étude, un encadrement et une ambiance de Torah.",
      "Ce projet a permis à des centaines de jeunes de continuer leur progression spirituelle, de renforcer leur Limoud et de rester connectés à l'univers des Yechivot.",
      "La croissance de ce réseau a reçu l'encouragement de nombreux Rabbanim et grandes figures du monde de la Torah, qui ont reconnu l'importance de proposer des cadres solides pour la jeunesse francophone.",
      "Parmi ces soutiens figure notamment une lettre du Rishon LeTsion Rav Yitzhak Yosef Shlita, exprimant son encouragement et son appréciation pour cette initiative.",
    ],
  },
  {
    title: "Construire une communauté autour de la Torah",
    eyebrow: "Beth Hamidrach Leil Shishi",
    paragraphs: [
      "Avec le développement des programmes, un nouveau besoin est apparu : créer un lieu permanent permettant aux jeunes francophones de se retrouver tout au long de l'année autour de l'étude, du partage et de la fraternité.",
      "C'est ainsi qu'est ne le Beth Hamidrach Leil Shishi. Parti de quelques jeunes, ce rendez-vous est progressivement devenu un véritable lieu de rencontre incontournable pour la jeunesse francophone.",
      "Un cadre qui permet à chacun de continuer a grandir, a étudier et a renforcer son lien avec la Torah.",
    ],
    bullets: [
      "Sdarim de Limoud",
      "Cours de Torah",
      "Vaadim",
      "Sujets pratiques",
      "Moments de partage et de cohesion",
    ],
  },
  {
    title: "Une association qui répond aux besoins de la génération",
    eyebrow: "Terrain",
    paragraphs: [
      "La force de Bnei Yeshivot est d'être constamment connectee au terrain.",
      "Les projets ne naissent pas simplement d'idées théoriques : ils viennent directement des demandes des jeunes, des parents, des familles et des responsables de Yechivot.",
      "C'est ainsi que de nouveaux pœles ont été créés pour répondre aux besoins de chaque étape du parcours.",
    ],
  },
  {
    title: "Talmoudo Beyado",
    eyebrow: "Limoud",
    paragraphs: [
      "Face au besoin exprimé par les parents et les responsables de Yechivot d'encourager les jeunes a davantage s'investir dans leur Limoud, Bnei Yeshivot a créé Talmoudo Beyado.",
      "Un programme innovant destiné a donner aux jeunes des objectifs d'étude, une motivation supplémentaire et un cadre de progression régulier.",
      "À travers des examens mensuels, un suivi et des objectifs précis, ce programme permet aux Bahourim de renforcer leur assiduité et de développer une véritable culture de l'excellence dans l'étude.",
      "Le lancement du programme a été marqué par une grande soirée inaugurale en présence de Rabbanim, dont Rav Yechaya Arrouas Shlita et Rav Ichay Toledano.",
    ],
  },
  {
    title: "Accompagner la construction du foyer",
    eyebrow: "Binian Adei Ad",
    paragraphs: [
      "Parce que l'accompagnement d'un jeune ne s'arrete pas aux années de Yechiva, Bnei Yeshivot a également développe Binian Adei Ad, un programme dédié à l'accompagnement dans la construction du foyer.",
      "Ce projet est ne d'une demande importante du terrain afin d'aider les jeunes dans leurs démarches de Chidoukhim, en collaboration avec des Chadhanim et des acteurs spécialisés.",
    ],
  },
  {
    title: "Des événements qui ont marqué une génération",
    eyebrow: "Temps forts",
    paragraphs: [
      "Au fil de son développement, Bnei Yeshivot a organisé des événements majeurs qui ont rassemblà la communauté francophone autour de la Torah.",
      "Le Grand Maamad HaSiyoum fut un événement exceptionnel réunissant 500 jeunes Bahourim autour d'un Siyoum sur la Massekhet étudiée dans leurs Yechivot.",
      "Ce fut un moment fort de Kavod HaTorah démontrant la force et l'investissement d'une nouvelle génération de jeunes francophones.",
      "Dans cette volonté de rapprocher la jeunesse francophone des grandes figures du monde de la Torah, Bnei Yeshivot a organisé un voyage exceptionnel du Gaon Rav Yehoshoua Eihenstein Shlita en France.",
      "Durant plusieurs jours, le Rav a visité différentes institutions et communautés afin de transmettre des enseignements autour du Hinouh et des défis de la génération.",
      "Cette tournée s'est conclue par un grand Maamad historique à Paris réunissant de nombreux Rabbanim, Roshei Yechivot, responsables d'institutions de Torah et des centaines de Bahourim.",
    ],
  },
  {
    title: "Le moment qui a marqué un tournant : le 21 mars 2024",
    eyebrow: "Beit Vagan",
    paragraphs: [
      "Le 21 mars 2024 restera une date majeure dans l'histoire de Bnei Yeshivot.",
      "À cette occasion, l'association a organisé un rassemblement historique à Beit Vagan, Jérusalem, réunissant 500 jeunes Bahourim francophones étudiant en Israël.",
      "Un événement exceptionnel placé sous le signe du Kavod HaTorah et de l'unité, qui a rassemblà une génération entière autour d'une même ambition : grandir dans la Torah et construire son avenir sur des bases solides.",
      "Cette soirée historique a été marquée par la présence de nombreux grands Rabbanim et Roshei Yechivot venus soutenir cette initiative.",
      "Parmi eux : Maran Hamchgiah Hagaon Rav Don Segal Shlita, Maran Roch Hayechiva Hagaon Rav David Cohen Shlita, Roch Yechivat Mir Hagaon Rav Yitzhak Ezrahi Shlita, Hagaon Rav Shalom Bettan, Hagaon Rav Gershon Cahen Shlita, Hagaon Rav Shalom Toledano Shlita, Hagaon Rav Avraham Bloch, Hagaon Rav Weig Shlita, Hagaon Rav Viner Shlita, Rav Reouven Hardy Shlita, Rav Mrejen Shlita et Rav Beressi Shlita.",
      "Ce rassemblement a marqué une nouvelle étape dans l'histoire de Bnei Yeshivot : la reconnaissance d'un besoin immense au sein de la jeunesse francophone et l'émergence d'une structure capable d'accompagner toute une génération.",
    ],
  },
  {
    title: "Une présence au cœur de Jérusalem",
    eyebrow: "17 Rehov HaPisga",
    paragraphs: [
      "Afin de répondre aux besoins toujours grandissants de la communauté, Bnei Yeshivot dispose aujourd'hui de locaux situés au 17 Rehov HaPisga, Beit Vagan, Jérusalem.",
      "Ces locaux sont devenus une véritable maison pour les jeunes francophones.",
    ],
    bullets: [
      "Accueillir les jeunes et les familles",
      "Organiser les activités du Beth Hamidrach Leil Shishi",
      "Recevoir les demandes d'accompagnement",
      "Offrir un espace d'écoute, de conseil et d'orientation",
    ],
  },
  {
    title: "Un mouvement porte par une communauté engagée",
    eyebrow: "Communautés",
    paragraphs: [
      "Aujourd'hui, Bnei Yeshivot s'appuie sur une véritable force humaine.",
      "Le développement de Bnei Yeshivot est également rendu possible grâce au soutien de nombreuses familles, donateurs et partenaires qui croient dans cette mission.",
      "Certains souhaitent rester discrets, mais leur engagement permet chaque année de développer de nouveaux projets et de répondre aux besoins croissants de la communauté.",
    ],
    bullets: [
      "Des dizaines d'Avrekhim impliques dans les différents cadres",
      "Des dizaines de Bahourim engagés dans les projets",
      "Des dizaines de Rabbanim qui accompagnent et soutiennent les initiatives",
      "Une équipe de responsables et de bénévoles mobilisés quotidiennement",
    ],
  },
  {
    title: "Le mot du fondateur",
    eyebrow: "Meir Guetta",
    paragraphs: [
      "Meir Guetta, fondateur et President de Bnei Yeshivot.",
      "Bnei Yeshivot est née d'une rencontre avec les besoins reels des jeunes francophones.",
      "Depuis le début, notre volonté a toujours été la même : être présents sur le terrain, écouter les besoins de la communauté et construire des solutions concrètes.",
      "Ce qui a commence avec quelques jeunes est devenu, avec l'aide d'Hachem, un mouvement réunissant aujourd'hui des jeunes, des Avrekhim, des Rabbanim et de nombreux acteurs engagés autour d'une même mission.",
      "Notre ambition est de continuer à construire les structures nécessaires pour accompagner les générations futures et permettre à chaque jeune francophone de trouver sa place dans un cadre de Torah.",
    ],
  },
  {
    title: "Nos partenaires",
    eyebrow: "Réseau",
    paragraphs: [
      "Bnei Yeshivot collabore avec de nombreuses Yechivot, associations, institutions et organismes qui partagent notre volonté d'accompagner la jeunesse francophone.",
    ],
  },
  {
    title: "Notre vision pour demain",
    eyebrow: "Continuer",
    paragraphs: [
      "L'histoire de Bnei Yeshivot continue de s'écrire.",
      "Ce qui est ne d'une petite initiative est devenu une dynamique majeure au service de milliers de jeunes et de familles.",
      "Notre ambition est de continuer a développer des structures fortes afin d'accompagner chaque jeune francophone dans son parcours de Torah, son intégration en Israël et la construction de son avenir.",
      "Une génération. Une mission. Une vision. Bnei Yeshivot.",
    ],
  },
];

const team = [
  {
    name: "Meir Guetta",
    role: "President - Fondateur",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
    description:
      "Responsable de la vision, du développement et de l'accompagnement des jeunes francophones.",
  },
  {
    name: "Responsable administratif",
    role: "Démarches et suivi",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80",
    description:
      "Coordonne les demandes visa, assurance maladie et informations pratiques pour les étudiants.",
  },
  {
    name: "Responsable programmes",
    role: "Torah et événements",
    image:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
    description:
      "Organise les programmes, Chabbatot, cours et temps forts de l'année.",
  },
];

const faqs = [
  [
    "Qui peut bénéficier de vos services ?",
    "Les étudiants, Bahourim, Avrekhim et jeunes francophones venant en Israël.",
  ],
  [
    "Les démarches sont-elles payantes ?",
    "Selon le service demande, certaines démarches sont gratuites tandis que d'autres peuvent comporter des frais administratifs clairement indiques.",
  ],
  [
    "Puis-je demander de l'aide avant mon arrivée ?",
    "Oui, nous accompagnons les étudiants avant même leur départ.",
  ],
];

export default function AboutPage() {
  return (
    <PageShell>
      <main>
        <section className="about-hero">
          <Image
            src="https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1800&q=85"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="about-hero-overlay" />
          <div className="container about-hero-content">
            <span className="eyebrow">À propos de Bnei Yeshivot</span>
            <h1>Qui sommes-nous ?</h1>
            <p>
              Bnei Yeshivot est une association dédiée a l&apos;accompagnement des
              jeunes francophones dans leur parcours de Torah, leur integration
              en Israel et les grandes etapes de leur construction personnelle.
              Une vision nee du terrain, devenue un mouvement au service de
              toute une generation.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container about-story">
            <div>
              <span className="eyebrow">Notre histoire</span>
              <h2>Une réponse a un vrai besoin</h2>
              <p>
                L&apos;histoire commence au Raincy, avec la première Yechiva Ben
                Hazmanim Torat Yaacov, fondée pour l&apos;élévation de l&apos;âme de
                Rabbi Yaacov Toledano Zatsal.
              </p>
              <p>
                Quelques jeunes se retrouvaient pendant les vacances autour de
                l&apos;étude de la Torah. Très vite, un besoin reel est apparu :
                offrir un cadre solide, motivant et adapte a une jeunesse qui
                voulait continuer a progresser.
              </p>
            </div>
            <Card className="about-question-card">
              <CardHeader>
                <CardTitle>De Torat Yaacov a Bnei Alia</CardTitle>
                <CardDescription>
                  L&apos;initiative du Raincy est devenue un réseau de Yechivot Ben
                  Hazmanim dans plusieurs villes de France.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="about-check-list">
                  {[
                    "Sdarim d'étude pendant les vacances",
                    "Encadrement par des Rabbanim et responsables",
                    "Atmosphere de Yechiva même hors periode scolaire",
                    "Centaines de jeunes touchés par le réseau",
                    "Une dynamique reconnue et encouragee",
                  ].map((item) => (
                    <li key={item}>
                      <CheckCircle2 className="size-4" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="container">
            <div className="about-conviction">
              Lorsqu&apos;un jeune choisit de consacrer sa vie à la Torah, il doit
              trouver autour de lui un environnement capable de l&apos;accompagner.
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="about-mission-panel">
              <div className="about-mission-copy">
                <span className="eyebrow">Notre mission</span>
                <h2>Construire une maison autour de la Torah et de la jeunesse.</h2>
                <p>
                  Les projets naissent du terrain : besoins des jeunes, des
                  parents, des familles et des responsables de Yechivot. Bnei
                  Yeshivot transforme ces besoins en cadres concrets.
                </p>
              </div>
              <div className="about-mission-stack">
                {missionPillars.map(({ title, description, Icon }, index) => (
                  <div className="about-mission-row" key={title}>
                    <span className="about-mission-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon className="size-5" />
                    <div>
                      <strong>{title}</strong>
                      <p>{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="about-values-heading">
              <span className="eyebrow">Nos valeurs</span>
              <h2>Une maniere d&apos;agir, pas seulement des mots.</h2>
            </div>
            <div className="about-values-grid">
              {values.map(({ title, description, Icon }, index) => (
                <Card className="about-value-card" key={title}>
                  <CardHeader>
                    <span className="about-value-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="about-value-icon">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="section-header">
              <h2>Notre histoire complete</h2>
              <p>
                Le texte complet de presentation, organise pour rester lisible
                tout en conservant l&apos;esprit de la page.
              </p>
            </div>
            <div className="about-complete-story">
              {completeStorySections.map((section, index) => (
                <article className="about-complete-card" key={section.title}>
                  <div className="about-complete-card-heading">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <small>{section.eyebrow}</small>
                    <h3>{section.title}</h3>
                  </div>
                  <div className="about-complete-card-body">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.bullets?.length ? (
                      <ul className="about-check-list">
                        {section.bullets.map((item) => (
                          <li key={item}>
                            <CheckCircle2 className="size-4" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container">
            <div className="about-impact-layout">
              <div>
                <span className="eyebrow">Notre impact</span>
                <h2>Des initiatives devenues des repères pour une génération.</h2>
                <p>
                  Ben Hazmanim, Beth Hamidrach Leil Shishi, Talmoudo Beyado,
                  Binian Adei Ad et les grands rassemblements ont structure un
                  mouvement vivant autour de la Torah.
                </p>
              </div>
              <div className="about-impact-meter">
                <strong>10</strong>
                <span>axes développés</span>
              </div>
            </div>
            <div className="about-impact-grid">
              {timeline.map((item, index) => (
                <div className="about-impact-item" key={item}>
                  <span>{index + 1}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container about-story">
            <div>
              <span className="eyebrow">Événements marquants</span>
              <h2>Des moments qui ont rassemblà une génération.</h2>
              <p>
                Au fil de son developpement, Bnei Yeshivot a organise des
                rassemblements majeurs qui ont donne une expression visible a
                la force de la jeunesse francophone autour de la Torah.
              </p>
            </div>
            <div className="about-event-stack">
              {landmarkEvents.map((event) => (
                <Card className="about-question-card" key={event.title}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container about-story">
            <div>
              <span className="eyebrow">Un mouvement humain</span>
              <h2>Une communauté engagée qui porte les projets.</h2>
              <p>
                Le developpement de Bnei Yeshivot repose sur une force humaine :
                jeunes, Avrekhim, Rabbanim, familles, donateurs, partenaires et
                benevoles qui croient dans la mission.
              </p>
            </div>
            <Card className="about-question-card">
              <CardHeader>
                <CardTitle>Ce qui rend le mouvement possible</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="about-check-list">
                  {communityForces.map((item) => (
                    <li key={item}>
                      <CheckCircle2 className="size-4" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Notre équipe</h2>
              <p>
                Une equipe engagee pour inspirer confiance, repondre avec
                serieux et accompagner chaque jeune avec attention.
              </p>
            </div>
            <div className="grid grid-3">
              {team.map((member) => (
                <Card className="team-card" key={member.name}>
                  <div className="team-photo">
                    <Image
                      alt=""
                      fill
                      sizes="(max-width: 980px) 100vw, 33vw"
                      src={member.image}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container about-story">
            <div>
              <span className="eyebrow">Le mot du fondateur</span>
              <h2>Une présence née des besoins reels du terrain.</h2>
              <p className="about-founder-name">
                Meir Guetta - Fondateur et President de Bnei Yeshivot
              </p>
              <p>
                Bnei Yeshivot est née d&apos;une rencontre avec les besoins reels
                des jeunes francophones. Depuis le debut, notre volonte est
                d&apos;être présents, d&apos;écouter la communauté et de construire des
                solutions concretes.
              </p>
              <p>
                Ce qui a commence avec quelques jeunes est devenu, avec l&apos;aide
                d&apos;Hachem, un mouvement réunissant jeunes, Avrekhim, Rabbanim et
                acteurs engagés autour d&apos;une même mission.
              </p>
            </div>
            <Card className="about-question-card">
              <CardHeader>
                <CardTitle>17 Rehov HaPisga</CardTitle>
                <CardDescription>
                  Beit Vagan, Jerusalem : une maison pour les jeunes
                  francophones et leurs familles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="about-check-list">
                  {[
                    "Accueil des jeunes et des familles",
                    "Beth Hamidrach Leil Shishi",
                    "Écoute, conseil et orientation",
                    "Demandes administratives et accompagnement",
                  ].map((item) => (
                    <li key={item}>
                      <CheckCircle2 className="size-4" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="section">
          <div className="container about-vision-panel">
            <div>
              <span className="eyebrow">Notre vision pour demain</span>
              <h2>Continuer ? écrire l&apos;histoire avec la prochaine génération.</h2>
              <p>
                Ce qui est ne d&apos;une petite initiative est devenu une dynamique
                majeure au service de milliers de jeunes et de familles. Notre
                ambition est de continuer a construire les cadres necessaires
                pour accompagner chaque jeune francophone.
              </p>
            </div>
            <div className="about-vision-list">
              {futureVision.map((item) => (
                <div key={item}>
                  <CheckCircle2 className="size-4" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <strong className="about-vision-signature">
              Une generation. Une mission. Une vision.
            </strong>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Nos partenaires</h2>
              <p>
                Selectionnez une categorie pour afficher la liste des reseaux et
                structures qui travaillent avec Bnei Yeshivot.
              </p>
            </div>
            <AboutPartners />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Questions frequentes</h2>
              <p>
                Les réponses essentielles pour comprendre l&apos;accompagnement Bnei
                Yeshivot.
              </p>
            </div>
            <div className="faq-list">
              {faqs.map(([question, answer]) => (
                <Card key={question}>
                  <CardHeader>
                    <CardTitle>{question}</CardTitle>
                    <CardDescription>{answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section about-final-cta">
          <div className="container about-final-cta-inner">
            <div>
              <span className="eyebrow">Vous préparez votre arrivée ?</span>
              <h2>Nous sommes la pour vous accompagner à chaque étape.</h2>
            </div>
            <div className="hero-actions">
              <Button asChild variant="accent" size="lg">
                <Link href="/services">Je fais une demande</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/contact">Je contacte un conseiller</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
