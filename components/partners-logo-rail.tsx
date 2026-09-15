import Image from "next/image";

// Logos detoures (fond transparent) et normalises a aire optique egale,
// centres sur une toile fixe de 312x208 (2x l'emplacement CSS 156x104),
// afin qu'ils apparaissent tous a la meme taille dans le rail.
// Les fichiers d'origine restent dans /public/logobneiyeshivot, ou ils
// servent aux galeries de la page d'accueil, de Chabbat Plein et de
// « venir etudier ».
const logoFiles = [
  "hasdei-yosef.png",
  "el-haaretz.png",
  "bnei-aliya.png",
  "shaarei-ocher.png",
  "beth-hamidrach-darkei-shalom.png",
  "beth-hamidrach-bonneuil.png",
  "centre-alef.png",
  "siah-israel.png",
];

export function PartnersLogoRail() {
  return (
    <div className="partners-strip">
      <p className="partners-strip-label">Ils nous accompagnent</p>

      <div className="ben-logo-rail" aria-label="Logos des partenaires">
        <div className="ben-logo-track">
          {[...logoFiles, ...logoFiles].map((file, index) => (
            <div className="ben-logo-item" key={`${file}-${index}`}>
              {/* loading="eager" : le chargement differe ne se declenche pas
                  pour les logos clippes par overflow: hidden que l'animation
                  du rail fait entrer, ils resteraient des trous blancs. */}
              <Image
                alt=""
                fill
                loading="eager"
                sizes="156px"
                src={`/partners/${file}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
