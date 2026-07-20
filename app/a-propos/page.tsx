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
    "Découvrez l’histoire, la mission, les valeurs et les partenaires de Bnei Yeshivot.",
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
      "Nous construisons des cadres d’étude, de progression et de motivation autour de la Torah.",
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
      "Nous aidons chaque jeune à trouver sa place, depuis son arrivée jusqu’à la construction de son avenir.",
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
      "Tout ce que nous faisons est guidé par les valeurs de la Torah.",
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
      "Nous cherchons à offrir un accompagnement organisé et professionnel.",
    Icon: Star,
  },
  {
    title: "Responsabilité",
    description:
      "Nous prenons au sérieux chaque demande qui nous est confiée.",
    Icon: ShieldCheck,
  },
  {
    title: "Unité",
    description:
      "Nous rassemblons les jeunes francophones autour d’un esprit de fraternité.",
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
      "Un rassemblement de 500 jeunes Bahourim autour d’un Siyoum sur la Massekhet étudiée dans leurs Yéchivot, signe fort de Kavod HaTorah et d’investissement dans l’étude.",
  },
  {
    title: "Le voyage de Rav Yehoshoua Eihenstein Shlita",
    description:
      "Un voyage historique en France pour visiter institutions et communautés, transmettre des enseignements autour du Hinouh et réunir Rabbanim, Roshei Yéchivot et centaines de Bahourim.",
  },
  {
    title: "Le 21 mars 2024 à Beit Vagan",
    description:
      "Un rassemblement historique de 500 jeunes Bahourim francophones étudiant en Israël, marqué par la présence de grands Rabbanim et Roshei Yéchivot, et devenu un tournant pour le mouvement.",
  },
];

const communityForces = [
  "Des dizaines d’Avrekhim impliqués dans les différents cadres",
  "Des dizaines de Bahourim engagés dans les projets",
  "Des Rabbanim qui accompagnent et soutiennent les initiatives",
  "Une équipe de responsables et de bénévoles mobilisés quotidiennement",
  "Des familles, donateurs et partenaires qui permettent de développer de nouveaux projets",
];

const futureVision = [
  "Développer des structures fortes pour les prochaines générations",
  "Accompagner chaque jeune francophone dans son parcours de Torah",
  "Faciliter l’intégration en Israël avec des repères clairs",
  "Soutenir la construction personnelle, familiale et spirituelle",
];

const completeStorySections = [
  {
    title: "Bnei Yeshivot",
    eyebrow: "Qui sommes-nous ?",
    paragraphs: [
      "Une vision née du terrain. Un mouvement construit autour de la Torah et de la jeunesse francophone.",
      "Bnei Yeshivot est une association dédiée à l’accompagnement des jeunes francophones dans leur parcours de Torah, leur intégration en Israël et les grandes étapes de leur construction personnelle.",
      "Depuis sa création, notre mission est d’offrir à chaque jeune un cadre solide, une communauté et un accompagnement adapté afin qu’il puisse se consacrer pleinement à l’essentiel : grandir dans la Torah et construire son avenir.",
      "Bnei Yeshivot est née d’une conviction simple : lorsqu’un jeune choisit de consacrer sa vie à la Torah, il doit pouvoir trouver autour de lui un environnement capable de l’accompagner, de le soutenir et de lui donner les moyens de réussir.",
      "Ce qui a commencé par une petite initiative autour de quelques jeunes est devenu, avec l’aide d’Hachem, un véritable mouvement au service de toute une génération.",
    ],
  },
  {
    title: "Une histoire née d’un besoin réel",
    eyebrow: "Origine",
    paragraphs: [
      "L’histoire de Bnei Yeshivot commence dans la ville du Raincy, en France, avec la création de la première Yéchiva Ben Hazmanim Torat Yaacov, fondée pour l’élévation de l’âme de Rabbi Yaacov Toledano Zatsal.",
      "À l’origine, quelques jeunes se retrouvaient pendant les périodes de vacances autour de l’étude de la Torah, avec la volonté de créer un véritable cadre de Yéchiva, même en dehors des périodes scolaires.",
      "Très rapidement, un constat est apparu : de nombreux jeunes francophones avaient une immense volonté de progresser dans la Torah, mais avaient besoin d’un cadre adapté, d’un environnement motivant et d’une structure capable de les accompagner.",
      "Face à cette réalité, l’initiative a grandi. D’année en année, de plus en plus de jeunes ont rejoint l’aventure, les cadres se sont développés et une véritable dynamique autour de la Torah a commencé à voir le jour.",
    ],
  },
  {
    title: "De Torat Yaacov à Bnei Alia",
    eyebrow: "Réseau Ben Hazmanim",
    paragraphs: [
      "Au fil des années, l’expérience du Raincy s’est développée dans plusieurs villes de France.",
      "Ainsi est né Bnei Alia, un réseau de Yéchivot Ben Hazmanim permettant à de nombreux Bahourim de retrouver pendant les périodes de vacances une véritable atmosphère de Yéchiva, avec des Sdarim d’étude, un encadrement et une ambiance de Torah.",
      "Ce projet a permis à des centaines de jeunes de continuer leur progression spirituelle, de renforcer leur Limoud et de rester connectés à l’univers des Yéchivot.",
      "La croissance de ce réseau a reçu l’encouragement de nombreux Rabbanim et grandes figures du monde de la Torah, qui ont reconnu l’importance de proposer des cadres solides pour la jeunesse francophone.",
      "Parmi ces soutiens figure notamment une lettre du Rishon LeTsion Rav Yitzhak Yosef Shlita, exprimant son encouragement et son appréciation pour cette initiative.",
    ],
  },
  {
    title: "Construire une communauté autour de la Torah",
    eyebrow: "Beth Hamidrach Leil Shishi",
    paragraphs: [
      "Avec le développement des programmes, un nouveau besoin est apparu : créer un lieu permanent permettant aux jeunes francophones de se retrouver tout au long de l’année autour de l’étude, du partage et de la fraternité.",
      "C’est ainsi qu’est né le Beth Hamidrach Leil Shishi. Parti de quelques jeunes, ce rendez-vous est progressivement devenu un véritable lieu de rencontre incontournable pour la jeunesse francophone.",
      "Un cadre qui permet à chacun de continuer à grandir, à étudier et à renforcer son lien avec la Torah.",
    ],
    bullets: [
      "Sdarim de Limoud",
      "Cours de Torah",
      "Vaadim",
      "Sujets pratiques",
      "Moments de partage et de cohésion",
    ],
  },
  {
    title: "Une association qui répond aux besoins de la génération",
    eyebrow: "Terrain",
    paragraphs: [
      "La force de Bnei Yeshivot est d’être constamment connectée au terrain.",
      "Les projets ne naissent pas simplement d’idées théoriques : ils viennent directement des demandes des jeunes, des parents, des familles et des responsables de Yéchivot.",
      "C’est ainsi que de nouveaux pôles ont été créés pour répondre aux besoins de chaque étape du parcours.",
    ],
  },
  {
    title: "Talmoudo Beyado",
    eyebrow: "Limoud",
    paragraphs: [
      "Face au besoin exprimé par les parents et les responsables de Yéchivot d’encourager les jeunes à davantage s’investir dans leur Limoud, Bnei Yeshivot a créé Talmoudo Beyado.",
      "Un programme innovant destiné à donner aux jeunes des objectifs d’étude, une motivation supplémentaire et un cadre de progression régulier.",
      "À travers des examens mensuels, un suivi et des objectifs précis, ce programme permet aux Bahourim de renforcer leur assiduité et de développer une véritable culture de l’excellence dans l’étude.",
      "Le lancement du programme a été marqué par une grande soirée inaugurale en présence de Rabbanim, dont Rav Yechaya Arrouas Shlita et Rav Ichay Toledano.",
    ],
  },
  {
    title: "Accompagner la construction du foyer",
    eyebrow: "Binian Adei Ad",
    paragraphs: [
      "Parce que l’accompagnement d’un jeune ne s’arrête pas aux années de Yéchiva, Bnei Yeshivot a également développé Binian Adei Ad, un programme dédié à l’accompagnement dans la construction du foyer.",
      "Ce projet est né d’une demande importante du terrain afin d’aider les jeunes dans leurs démarches de Chidoukhim, en collaboration avec des Chadhanim et des acteurs spécialisés.",
    ],
  },
  {
    title: "Des événements qui ont marqué une génération",
    eyebrow: "Temps forts",
    paragraphs: [
      "Au fil de son développement, Bnei Yeshivot a organisé des événements majeurs qui ont rassemblé la communauté francophone autour de la Torah.",
      "Le Grand Maamad HaSiyoum fut un événement exceptionnel réunissant 500 jeunes Bahourim autour d’un Siyoum sur la Massekhet étudiée dans leurs Yéchivot.",
      "Ce fut un moment fort de Kavod HaTorah démontrant la force et l’investissement d’une nouvelle génération de jeunes francophones.",
      "Dans cette volonté de rapprocher la jeunesse francophone des grandes figures du monde de la Torah, Bnei Yeshivot a organisé un voyage exceptionnel du Gaon Rav Yehoshoua Eihenstein Shlita en France.",
      "Durant plusieurs jours, le Rav a visité différentes institutions et communautés afin de transmettre des enseignements autour du Hinouh et des défis de la génération.",
      "Cette tournée s’est conclue par un grand Maamad historique à Paris réunissant de nombreux Rabbanim, Roshei Yéchivot, responsables d’institutions de Torah et des centaines de Bahourim.",
    ],
  },
  {
    title: "Le moment qui a marqué un tournant : le 21 mars 2024",
    eyebrow: "Beit Vagan",
    paragraphs: [
      "Le 21 mars 2024 restera une date majeure dans l’histoire de Bnei Yeshivot.",
      "À cette occasion, l’association a organisé un rassemblement historique à Beit Vagan, Jérusalem, réunissant 500 jeunes Bahourim francophones étudiant en Israël.",
      "Un événement exceptionnel placé sous le signe du Kavod HaTorah et de l’unité, qui a rassemblé une génération entière autour d’une même ambition : grandir dans la Torah et construire son avenir sur des bases solides.",
      "Cette soirée historique a été marquée par la présence de nombreux grands Rabbanim et Roshei Yéchivot venus soutenir cette initiative.",
      "Parmi eux : Maran Hamchgiah Hagaon Rav Don Segal Shlita, Maran Roch Hayéchiva Hagaon Rav David Cohen Shlita, Roch Yéchivat Mir Hagaon Rav Yitzhak Ezrahi Shlita, Hagaon Rav Shalom Bettan, Hagaon Rav Gershon Cahen Shlita, Hagaon Rav Shalom Toledano Shlita, Hagaon Rav Avraham Bloch, Hagaon Rav Weig Shlita, Hagaon Rav Viner Shlita, Rav Reouven Hardy Shlita, Rav Mrejen Shlita et Rav Beressi Shlita.",
      "Ce rassemblement a marqué une nouvelle étape dans l’histoire de Bnei Yeshivot : la reconnaissance d’un besoin immense au sein de la jeunesse francophone et l’émergence d’une structure capable d’accompagner toute une génération.",
    ],
  },
  {
    title: "Une présence au cœur de Jérusalem",
    eyebrow: "17 Rehov HaPisga",
    paragraphs: [
      "Afin de répondre aux besoins toujours grandissants de la communauté, Bnei Yeshivot dispose aujourd’hui de locaux situés au 17 Rehov HaPisga, Beit Vagan, Jérusalem.",
      "Ces locaux sont devenus une véritable maison pour les jeunes francophones.",
    ],
    bullets: [
      "Accueillir les jeunes et les familles",
      "Organiser les activités du Beth Hamidrach Leil Shishi",
      "Recevoir les demandes d’accompagnement",
      "Offrir un espace d’écoute, de conseil et d’orientation",
    ],
  },
  {
    title: "Un mouvement porté par une communauté engagée",
    eyebrow: "Communautés",
    paragraphs: [
      "Aujourd’hui, Bnei Yeshivot s’appuie sur une véritable force humaine.",
      "Le développement de Bnei Yeshivot est également rendu possible grâce au soutien de nombreuses familles, donateurs et partenaires qui croient dans cette mission.",
      "Certains souhaitent rester discrets, mais leur engagement permet chaque année de développer de nouveaux projets et de répondre aux besoins croissants de la communauté.",
    ],
    bullets: [
      "Des dizaines d’Avrekhim impliqués dans les différents cadres",
      "Des dizaines de Bahourim engagés dans les projets",
      "Des dizaines de Rabbanim qui accompagnent et soutiennent les initiatives",
      "Une équipe de responsables et de bénévoles mobilisés quotidiennement",
    ],
  },
  {
    title: "Le mot du fondateur",
    eyebrow: "Rav Meir Guetta",
    paragraphs: [
      "Rav Meir Guetta - Fondateur de Bnei Yeshivot Torat Yaacov",
      "Bnei Yeshivot est née d’une rencontre avec les besoins réels des jeunes francophones. Depuis le début, notre volonté est d’être présents, d’écouter la communauté et de construire des solutions concrètes.",
      "Ce qui a commencé avec quelques jeunes est devenu, avec l’aide d’Hachem, un mouvement réunissant jeunes, Avrékhim, Rabbanim et acteurs engagés autour d’une même mission.",
      "Depuis sa création, Bnei Yeshivot se développe sous les conseils et l’accompagnement de Guedolei Israël, de Rabbanim et de Roché Yéchivot en Israël comme en France. Chacun de nos programmes est construit avec leur orientation, leur approbation et leur soutien, afin d’agir avec responsabilité, fidélité à la Torah et au service de la communauté.",
    ],
  },
  {
    title: "Nos partenaires",
    eyebrow: "Réseau",
    paragraphs: [
      "Bnei Yeshivot collabore avec de nombreuses Yéchivot, associations, institutions et organismes qui partagent notre volonté d’accompagner la jeunesse francophone.",
    ],
  },
  {
    title: "Notre vision pour demain",
    eyebrow: "Continuer",
    paragraphs: [
      "L’histoire de Bnei Yeshivot continue de s’écrire.",
      "Ce qui est né d’une petite initiative est devenu une dynamique majeure au service de milliers de jeunes et de familles.",
      "Notre ambition est de continuer à développer des structures fortes afin d’accompagner chaque jeune francophone dans son parcours de Torah, son intégration en Israël et la construction de son avenir.",
      "Une génération. Une mission. Une vision. Bnei Yeshivot.",
    ],
  },
];

const faqs = [
  [
    "Qui peut bénéficier de vos services ?",
    "Les étudiants, Bahourim, Avrekhim et jeunes francophones venant en Israël.",
  ],
  [
    "Les démarches sont-elles payantes ?",
    "Selon le service demandé, certaines démarches sont gratuites tandis que d’autres peuvent comporter des frais administratifs clairement indiqués.",
  ],
  [
    "Puis-je demander de l’aide avant mon arrivée ?",
    "Oui, nous accompagnons les étudiants avant même leur départ.",
  ],
];

export default function AboutPage() {
  return (
    <PageShell>
      <main>
        <section className="about-hero">
          <Image
            src="/about-hero.jpg"
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
              Bnei Yeshivot est une association dédiée à l’accompagnement des
              jeunes francophones dans leur parcours de Torah, leur intégration
              en Israël et les grandes étapes de leur construction personnelle.
              Une vision née du terrain, devenue un mouvement au service de
              toute une génération.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container about-story">
            <div>
              <span className="eyebrow">Notre histoire</span>
              <h2>Une réponse à un vrai besoin</h2>
              <p>
                L’histoire commence au Raincy, avec la première Yéchiva Ben
                Hazmanim Torat Yaacov, fondée pour l’élévation de l’âme de
                Rabbi Yaacov Toledano Zatsal.
              </p>
              <p>
                Quelques jeunes se retrouvaient pendant les vacances autour de
                l’étude de la Torah. Très vite, un besoin réel est apparu :
                offrir un cadre solide, motivant et adapté à une jeunesse qui
                voulait continuer à progresser.
              </p>
            </div>
            <Card className="about-question-card">
              <CardHeader>
                <CardTitle>De Torat Yaacov à Bnei Alia</CardTitle>
                <CardDescription>
                  L’initiative du Raincy est devenue un réseau de Yéchivot Ben
                  Hazmanim dans plusieurs villes de France.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="about-check-list">
                  {[
                    "Sdarim d’étude pendant les vacances",
                    "Encadrement par des Rabbanim et responsables",
                    "Atmosphère de Yéchiva même hors période scolaire",
                    "Centaines de jeunes touchés par le réseau",
                    "Une dynamique reconnue et encouragée",
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
              Lorsqu’un jeune choisit de consacrer sa vie à la Torah, il doit
              trouver autour de lui un environnement capable de l’accompagner.
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
                  parents, des familles et des responsables de Yéchivot. Bnei
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
              <h2>Une manière d’agir, pas seulement des mots.</h2>
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

        <section className="section band about-complete-section">
          <div className="container">
            <div className="section-header about-complete-header">
              <div>
                <span className="eyebrow">Notre histoire</span>
                <h2>Notre histoire complète</h2>
              </div>
              <p>
                De la première initiative au Raincy jusqu’à la maison de
                Jérusalem, une même mission guide chaque étape : accompagner la
                jeunesse francophone dans un cadre de Torah solide et vivant.
              </p>
            </div>
            <div className="about-complete-story">
              {completeStorySections.map((section, index) => (
                <article className="about-complete-card" key={section.title}>
                  <div className="about-complete-card-heading">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <small>{section.eyebrow}</small>
                      <h3>{section.title}</h3>
                    </div>
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
                  Binian Adei Ad et les grands rassemblements ont structuré un
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
              <h2>Des moments qui ont rassemblé une génération.</h2>
              <p>
                Au fil de son développement, Bnei Yeshivot a organisé des
                rassemblements majeurs qui ont donné une expression visible à
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
                Le développement de Bnei Yeshivot repose sur une force humaine :
                jeunes, Avrekhim, Rabbanim, familles, donateurs, partenaires et
                bénévoles qui croient dans la mission.
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

        <section className="section band">
          <div className="container about-story">
            <div>
              <span className="eyebrow">Le mot du fondateur</span>
              <h2>Une présence née des besoins réels du terrain.</h2>
              <p className="about-founder-name">
                Rav Meir Guetta - Fondateur de Bnei Yeshivot Torat Yaacov
              </p>
              <p>
                Bnei Yeshivot est née d’une rencontre avec les besoins réels
                des jeunes francophones. Depuis le début, notre volonté est
                d’être présents, d’écouter la communauté et de construire des
                solutions concrètes.
              </p>
              <p>
                Ce qui a commencé avec quelques jeunes est devenu, avec l’aide
                d’Hachem, un mouvement réunissant jeunes, Avrékhim, Rabbanim et
                acteurs engagés autour d’une même mission.
              </p>
              <p>
                Depuis sa création, Bnei Yeshivot se développe sous les conseils
                et l’accompagnement de Guedolei Israël, de Rabbanim et de Roché
                Yéchivot en Israël comme en France. Chacun de nos programmes est
                construit avec leur orientation, leur approbation et leur soutien,
                afin d’agir avec responsabilité, fidélité à la Torah et au service
                de la communauté.
              </p>
            </div>
            <Card className="about-question-card">
              <CardHeader>
                <CardTitle>17 Rehov HaPisga</CardTitle>
                <CardDescription>
                  Beit Vagan, Jérusalem : une maison pour les jeunes
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
              <h2>Continuer à écrire l’histoire avec la prochaine génération.</h2>
              <p>
                Ce qui est né d’une petite initiative est devenu une dynamique
                majeure au service de milliers de jeunes et de familles. Notre
                ambition est de continuer à construire les cadres nécessaires
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
              Une génération. Une mission. Une vision.
            </strong>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Nos partenaires</h2>
              <p>
                Un réseau de Yéchivot, Kehilot, institutions et partenaires qui
                portent avec nous l’accompagnement de la jeunesse francophone.
              </p>
            </div>
            <AboutPartners />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Questions fréquentes</h2>
              <p>
                Les réponses essentielles pour comprendre l’accompagnement Bnei
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
              <h2>Nous sommes là pour vous accompagner à chaque étape.</h2>
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
