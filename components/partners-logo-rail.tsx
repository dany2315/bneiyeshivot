import Image from "next/image";

const logoFiles = [
  "el-haaretz.png",
  "4bb0c924-11b4-4d32-88b3-37de6b6da11e.jpg",
  "87894877-bbf0-4bdd-bfb3-7c05410a6ae1.jpeg",
  "476dd32c-973f-41c4-9cdf-26b7855c96b3.jpeg",
  "d2465f0f-c5a5-4522-84c6-90c1728b1e8a.jpeg",
  "bb7765c2-14d1-44b3-adb9-2160b8eaf41a.jpeg",
  "dd034949-264f-4079-b26a-14716c37d0b2.jpeg",
  "IMG_1684.jpeg",
];

export function PartnersLogoRail() {
  return (
    <section className="partners-band">
      <div className="container">
        <p className="partners-band-label">Ils nous accompagnent</p>

        <div className="ben-logo-rail" aria-label="Logos des partenaires">
          <div className="ben-logo-track">
            {[...logoFiles, ...logoFiles].map((file, index) => (
              <div className="ben-logo-item" key={`${file}-${index}`}>
                <Image
                  alt=""
                  fill
                  sizes="156px"
                  src={`/logobneiyeshivot/${file}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
