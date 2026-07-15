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
  title: "A propos",
  description:
    "Decouvrez l'histoire, la mission, les valeurs et les partenaires de Bnei Yeshivot.",
};

const missionPillars = [
  {
    title: "Accompagner",
    description:
      "Nous accompagnons les jeunes francophones dans leurs demarches, leur integration en Israel et les grandes etapes de leur parcours.",
    Icon: HandHeart,
  },
  {
    title: "Former",
    description:
      "Nous construisons des cadres d'etude, de progression et de motivation autour de la Torah.",
    Icon: GraduationCap,
  },
  {
    title: "Rassembler",
    description:
      "Nous faisons vivre une communaute de Bahourim, Avrekhim, Rabbanim, familles et benevoles engages.",
    Icon: Users,
  },
  {
    title: "Construire",
    description:
      "Nous aidons chaque jeune a trouver sa place, depuis son arrivee jusqu'a la construction de son avenir.",
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
      "Chaque jeune est accueilli avec attention, ecoute et respect.",
    Icon: HeartHandshake,
  },
  {
    title: "Excellence",
    description:
      "Nous cherchons a offrir un accompagnement organise et professionnel.",
    Icon: Star,
  },
  {
    title: "Responsabilite",
    description:
      "Nous prenons au serieux chaque demande qui nous est confiee.",
    Icon: ShieldCheck,
  },
  {
    title: "Unite",
    description:
      "Nous rassemblons les jeunes francophones autour d'un esprit de fraternite.",
    Icon: Users,
  },
];

const timeline = [
  "Torat Yaacov au Raincy",
  "Developpement de Bnei Alia",
  "Reseau Ben Hazmanim en France",
  "Beth Hamidrach Leil Shishi",
  "Creation de Talmoudo Beyado",
  "Binian Adei Ad",
  "Grand Maamad HaSiyoum",
  "Voyage de Rav Yehoshoua Eihenstein",
  "Rassemblement du 21 mars 2024",
  "Maison Bnei Yeshivot a Beit Vagan",
];

const landmarkEvents = [
  {
    title: "Le Grand Maamad HaSiyoum",
    description:
      "Un rassemblement de 500 jeunes Bahourim autour d'un Siyoum sur la Massekhet etudiee dans leurs Yechivot, signe fort de Kavod HaTorah et d'investissement dans l'etude.",
  },
  {
    title: "Le voyage de Rav Yehoshoua Eihenstein Shlita",
    description:
      "Un voyage historique en France pour visiter institutions et communautes, transmettre des enseignements autour du Hinouh et reunir Rabbanim, Roshei Yechivot et centaines de Bahourim.",
  },
  {
    title: "Le 21 mars 2024 a Beit Vagan",
    description:
      "Un rassemblement historique de 500 jeunes Bahourim francophones etudiant en Israel, marque par la presence de grands Rabbanim et Roshei Yechivot, et devenu un tournant pour le mouvement.",
  },
];

const communityForces = [
  "Des dizaines d'Avrekhim impliques dans les differents cadres",
  "Des dizaines de Bahourim engages dans les projets",
  "Des Rabbanim qui accompagnent et soutiennent les initiatives",
  "Une equipe de responsables et de benevoles mobilises quotidiennement",
  "Des familles, donateurs et partenaires qui permettent de developper de nouveaux projets",
];

const futureVision = [
  "Developper des structures fortes pour les prochaines generations",
  "Accompagner chaque jeune francophone dans son parcours de Torah",
  "Faciliter l'integration en Israel avec des reperes clairs",
  "Soutenir la construction personnelle, familiale et spirituelle",
];

const completeStorySections = [
  {
    title: "Bnei Yeshivot",
    eyebrow: "Qui sommes-nous ?",
    paragraphs: [
      "Une vision nee du terrain. Un mouvement construit autour de la Torah et de la jeunesse francophone.",
      "Bnei Yeshivot est une association dediee a l'accompagnement des jeunes francophones dans leur parcours de Torah, leur integration en Israel et les grandes etapes de leur construction personnelle.",
      "Depuis sa creation, notre mission est d'offrir a chaque jeune un cadre solide, une communaute et un accompagnement adapte afin qu'il puisse se consacrer pleinement a l'essentiel : grandir dans la Torah et construire son avenir.",
      "Bnei Yeshivot est nee d'une conviction simple : lorsqu'un jeune choisit de consacrer sa vie a la Torah, il doit pouvoir trouver autour de lui un environnement capable de l'accompagner, de le soutenir et de lui donner les moyens de reussir.",
      "Ce qui a commence par une petite initiative autour de quelques jeunes est devenu, avec l'aide d'Hachem, un veritable mouvement au service de toute une generation.",
    ],
  },
  {
    title: "Une histoire nee d'un besoin reel",
    eyebrow: "Origine",
    paragraphs: [
      "L'histoire de Bnei Yeshivot commence dans la ville du Raincy, en France, avec la creation de la premiere Yechiva Ben Hazmanim Torat Yaacov, fondee pour l'elevation de l'ame de Rabbi Yaacov Toledano Zatsal.",
      "A l'origine, quelques jeunes se retrouvaient pendant les periodes de vacances autour de l'etude de la Torah, avec la volonte de creer un veritable cadre de Yechiva, meme en dehors des periodes scolaires.",
      "Tres rapidement, un constat est apparu : de nombreux jeunes francophones avaient une immense volonte de progresser dans la Torah, mais avaient besoin d'un cadre adapte, d'un environnement motivant et d'une structure capable de les accompagner.",
      "Face a cette realite, l'initiative a grandi. D'annee en annee, de plus en plus de jeunes ont rejoint l'aventure, les cadres se sont developpes et une veritable dynamique autour de la Torah a commence a voir le jour.",
    ],
  },
  {
    title: "De Torat Yaacov a Bnei Alia",
    eyebrow: "Reseau Ben Hazmanim",
    paragraphs: [
      "Au fil des annees, l'experience du Raincy s'est developpee dans plusieurs villes de France.",
      "Ainsi est ne Bnei Alia, un reseau de Yechivot Ben Hazmanim permettant a de nombreux Bahourim de retrouver pendant les periodes de vacances une veritable atmosphere de Yechiva, avec des Sdarim d'etude, un encadrement et une ambiance de Torah.",
      "Ce projet a permis a des centaines de jeunes de continuer leur progression spirituelle, de renforcer leur Limoud et de rester connectes a l'univers des Yechivot.",
      "La croissance de ce reseau a recu l'encouragement de nombreux Rabbanim et grandes figures du monde de la Torah, qui ont reconnu l'importance de proposer des cadres solides pour la jeunesse francophone.",
      "Parmi ces soutiens figure notamment une lettre du Rishon LeTsion Rav Yitzhak Yosef Shlita, exprimant son encouragement et son appreciation pour cette initiative.",
    ],
  },
  {
    title: "Construire une communaute autour de la Torah",
    eyebrow: "Beth Hamidrach Leil Shishi",
    paragraphs: [
      "Avec le developpement des programmes, un nouveau besoin est apparu : creer un lieu permanent permettant aux jeunes francophones de se retrouver tout au long de l'annee autour de l'etude, du partage et de la fraternite.",
      "C'est ainsi qu'est ne le Beth Hamidrach Leil Shishi. Parti de quelques jeunes, ce rendez-vous est progressivement devenu un veritable lieu de rencontre incontournable pour la jeunesse francophone.",
      "Un cadre qui permet a chacun de continuer a grandir, a etudier et a renforcer son lien avec la Torah.",
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
    title: "Une association qui repond aux besoins de la generation",
    eyebrow: "Terrain",
    paragraphs: [
      "La force de Bnei Yeshivot est d'etre constamment connectee au terrain.",
      "Les projets ne naissent pas simplement d'idees theoriques : ils viennent directement des demandes des jeunes, des parents, des familles et des responsables de Yechivot.",
      "C'est ainsi que de nouveaux poles ont ete crees pour repondre aux besoins de chaque etape du parcours.",
    ],
  },
  {
    title: "Talmoudo Beyado",
    eyebrow: "Limoud",
    paragraphs: [
      "Face au besoin exprime par les parents et les responsables de Yechivot d'encourager les jeunes a davantage s'investir dans leur Limoud, Bnei Yeshivot a cree Talmoudo Beyado.",
      "Un programme innovant destine a donner aux jeunes des objectifs d'etude, une motivation supplementaire et un cadre de progression regulier.",
      "A travers des examens mensuels, un suivi et des objectifs precis, ce programme permet aux Bahourim de renforcer leur assiduite et de developper une veritable culture de l'excellence dans l'etude.",
      "Le lancement du programme a ete marque par une grande soiree inaugurale en presence de Rabbanim, dont Rav Yechaya Arrouas Shlita et Rav Ichay Toledano.",
    ],
  },
  {
    title: "Accompagner la construction du foyer",
    eyebrow: "Binian Adei Ad",
    paragraphs: [
      "Parce que l'accompagnement d'un jeune ne s'arrete pas aux annees de Yechiva, Bnei Yeshivot a egalement developpe Binian Adei Ad, un programme dedie a l'accompagnement dans la construction du foyer.",
      "Ce projet est ne d'une demande importante du terrain afin d'aider les jeunes dans leurs demarches de Chidoukhim, en collaboration avec des Chadhanim et des acteurs specialises.",
    ],
  },
  {
    title: "Des evenements qui ont marque une generation",
    eyebrow: "Temps forts",
    paragraphs: [
      "Au fil de son developpement, Bnei Yeshivot a organise des evenements majeurs qui ont rassemble la communaute francophone autour de la Torah.",
      "Le Grand Maamad HaSiyoum fut un evenement exceptionnel reunissant 500 jeunes Bahourim autour d'un Siyoum sur la Massekhet etudiee dans leurs Yechivot.",
      "Ce fut un moment fort de Kavod HaTorah demontrant la force et l'investissement d'une nouvelle generation de jeunes francophones.",
      "Dans cette volonte de rapprocher la jeunesse francophone des grandes figures du monde de la Torah, Bnei Yeshivot a organise un voyage exceptionnel du Gaon Rav Yehoshoua Eihenstein Shlita en France.",
      "Durant plusieurs jours, le Rav a visite differentes institutions et communautes afin de transmettre des enseignements autour du Hinouh et des defis de la generation.",
      "Cette tournee s'est conclue par un grand Maamad historique a Paris reunissant de nombreux Rabbanim, Roshei Yechivot, responsables d'institutions de Torah et des centaines de Bahourim.",
    ],
  },
  {
    title: "Le moment qui a marque un tournant : le 21 mars 2024",
    eyebrow: "Beit Vagan",
    paragraphs: [
      "Le 21 mars 2024 restera une date majeure dans l'histoire de Bnei Yeshivot.",
      "A cette occasion, l'association a organise un rassemblement historique a Beit Vagan, Jerusalem, reunissant 500 jeunes Bahourim francophones etudiant en Israel.",
      "Un evenement exceptionnel place sous le signe du Kavod HaTorah et de l'unite, qui a rassemble une generation entiere autour d'une meme ambition : grandir dans la Torah et construire son avenir sur des bases solides.",
      "Cette soiree historique a ete marquee par la presence de nombreux grands Rabbanim et Roshei Yechivot venus soutenir cette initiative.",
      "Parmi eux : Maran Hamchgiah Hagaon Rav Don Segal Shlita, Maran Roch Hayechiva Hagaon Rav David Cohen Shlita, Roch Yechivat Mir Hagaon Rav Yitzhak Ezrahi Shlita, Hagaon Rav Shalom Bettan, Hagaon Rav Gershon Cahen Shlita, Hagaon Rav Shalom Toledano Shlita, Hagaon Rav Avraham Bloch, Hagaon Rav Weig Shlita, Hagaon Rav Viner Shlita, Rav Reouven Hardy Shlita, Rav Mrejen Shlita et Rav Beressi Shlita.",
      "Ce rassemblement a marque une nouvelle etape dans l'histoire de Bnei Yeshivot : la reconnaissance d'un besoin immense au sein de la jeunesse francophone et l'emergence d'une structure capable d'accompagner toute une generation.",
    ],
  },
  {
    title: "Une presence au coeur de Jerusalem",
    eyebrow: "17 Rehov HaPisga",
    paragraphs: [
      "Afin de repondre aux besoins toujours grandissants de la communaute, Bnei Yeshivot dispose aujourd'hui de locaux situes au 17 Rehov HaPisga, Beit Vagan, Jerusalem.",
      "Ces locaux sont devenus une veritable maison pour les jeunes francophones.",
    ],
    bullets: [
      "Accueillir les jeunes et les familles",
      "Organiser les activites du Beth Hamidrach Leil Shishi",
      "Recevoir les demandes d'accompagnement",
      "Offrir un espace d'ecoute, de conseil et d'orientation",
    ],
  },
  {
    title: "Un mouvement porte par une communaute engagee",
    eyebrow: "Communautes",
    paragraphs: [
      "Aujourd'hui, Bnei Yeshivot s'appuie sur une veritable force humaine.",
      "Le developpement de Bnei Yeshivot est egalement rendu possible grace au soutien de nombreuses familles, donateurs et partenaires qui croient dans cette mission.",
      "Certains souhaitent rester discrets, mais leur engagement permet chaque annee de developper de nouveaux projets et de repondre aux besoins croissants de la communaute.",
    ],
    bullets: [
      "Des dizaines d'Avrekhim impliques dans les differents cadres",
      "Des dizaines de Bahourim engages dans les projets",
      "Des dizaines de Rabbanim qui accompagnent et soutiennent les initiatives",
      "Une equipe de responsables et de benevoles mobilises quotidiennement",
    ],
  },
  {
    title: "Le mot du fondateur",
    eyebrow: "Meir Guetta",
    paragraphs: [
      "Meir Guetta, fondateur et President de Bnei Yeshivot.",
      "Bnei Yeshivot est nee d'une rencontre avec les besoins reels des jeunes francophones.",
      "Depuis le debut, notre volonte a toujours ete la meme : etre presents sur le terrain, ecouter les besoins de la communaute et construire des solutions concretes.",
      "Ce qui a commence avec quelques jeunes est devenu, avec l'aide d'Hachem, un mouvement reunissant aujourd'hui des jeunes, des Avrekhim, des Rabbanim et de nombreux acteurs engages autour d'une meme mission.",
      "Notre ambition est de continuer a construire les structures necessaires pour accompagner les generations futures et permettre a chaque jeune francophone de trouver sa place dans un cadre de Torah.",
    ],
  },
  {
    title: "Nos partenaires",
    eyebrow: "Reseau",
    paragraphs: [
      "Bnei Yeshivot collabore avec de nombreuses Yechivot, associations, institutions et organismes qui partagent notre volonte d'accompagner la jeunesse francophone.",
    ],
  },
  {
    title: "Notre vision pour demain",
    eyebrow: "Continuer",
    paragraphs: [
      "L'histoire de Bnei Yeshivot continue de s'ecrire.",
      "Ce qui est ne d'une petite initiative est devenu une dynamique majeure au service de milliers de jeunes et de familles.",
      "Notre ambition est de continuer a developper des structures fortes afin d'accompagner chaque jeune francophone dans son parcours de Torah, son integration en Israel et la construction de son avenir.",
      "Une generation. Une mission. Une vision. Bnei Yeshivot.",
    ],
  },
];

const faqs = [
  [
    "Qui peut beneficier de vos services ?",
    "Les etudiants, Bahourim, Avrekhim et jeunes francophones venant en Israel.",
  ],
  [
    "Les demarches sont-elles payantes ?",
    "Selon le service demande, certaines demarches sont gratuites tandis que d'autres peuvent comporter des frais administratifs clairement indiques.",
  ],
  [
    "Puis-je demander de l'aide avant mon arrivee ?",
    "Oui, nous accompagnons les etudiants avant meme leur depart.",
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
            <span className="eyebrow">A propos de Bnei Yeshivot</span>
            <h1>Qui sommes-nous ?</h1>
            <p>
              Bnei Yeshivot est une association dediee a l&apos;accompagnement des
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
              <h2>Une reponse a un vrai besoin</h2>
              <p>
                L&apos;histoire commence au Raincy, avec la premiere Yechiva Ben
                Hazmanim Torat Yaacov, fondee pour l&apos;elevation de l&apos;ame de
                Rabbi Yaacov Toledano Zatsal.
              </p>
              <p>
                Quelques jeunes se retrouvaient pendant les vacances autour de
                l&apos;etude de la Torah. Tres vite, un besoin reel est apparu :
                offrir un cadre solide, motivant et adapte a une jeunesse qui
                voulait continuer a progresser.
              </p>
            </div>
            <Card className="about-question-card">
              <CardHeader>
                <CardTitle>De Torat Yaacov a Bnei Alia</CardTitle>
                <CardDescription>
                  L&apos;initiative du Raincy est devenue un reseau de Yechivot Ben
                  Hazmanim dans plusieurs villes de France.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="about-check-list">
                  {[
                    "Sdarim d'etude pendant les vacances",
                    "Encadrement par des Rabbanim et responsables",
                    "Atmosphere de Yechiva meme hors periode scolaire",
                    "Centaines de jeunes touches par le reseau",
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
              Lorsqu&apos;un jeune choisit de consacrer sa vie a la Torah, il doit
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
                <h2>Des initiatives devenues des reperes pour une generation.</h2>
                <p>
                  Ben Hazmanim, Beth Hamidrach Leil Shishi, Talmoudo Beyado,
                  Binian Adei Ad et les grands rassemblements ont structure un
                  mouvement vivant autour de la Torah.
                </p>
              </div>
              <div className="about-impact-meter">
                <strong>10</strong>
                <span>axes developpes</span>
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
              <span className="eyebrow">Evenements marquants</span>
              <h2>Des moments qui ont rassemble une generation.</h2>
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
              <h2>Une communaute engagee qui porte les projets.</h2>
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

        <section className="section band">
          <div className="container about-story">
            <div>
              <span className="eyebrow">Le mot du fondateur</span>
              <h2>Une presence nee des besoins reels du terrain.</h2>
              <p className="about-founder-name">
                Meir Guetta - Fondateur et President de Bnei Yeshivot
              </p>
              <p>
                Bnei Yeshivot est nee d&apos;une rencontre avec les besoins reels
                des jeunes francophones. Depuis le debut, notre volonte est
                d&apos;etre presents, d&apos;ecouter la communaute et de construire des
                solutions concretes.
              </p>
              <p>
                Ce qui a commence avec quelques jeunes est devenu, avec l&apos;aide
                d&apos;Hachem, un mouvement reunissant jeunes, Avrekhim, Rabbanim et
                acteurs engages autour d&apos;une meme mission.
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
                    "Ecoute, conseil et orientation",
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
              <h2>Continuer a ecrire l&apos;histoire avec la prochaine generation.</h2>
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
                Les reponses essentielles pour comprendre l&apos;accompagnement Bnei
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
              <span className="eyebrow">Vous preparez votre arrivee ?</span>
              <h2>Nous sommes la pour vous accompagner a chaque etape.</h2>
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
