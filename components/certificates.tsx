import React from "react";
import Image from "next/image";
import { Eye, Download } from "lucide-react";

interface CertificateCardProps {
  title: string;
  imageUrl: string;
  date: string;
  time: string;
  location: string;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  title,
  imageUrl,
}) => {
  return (
    <div className="group relative overflow-hidden border border-white/80 bg-black">
      {/* Media (dark area) */}
      <div className="relative h-40 bg-neutral-900">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover opacity-80 group-hover:opacity-90 transition-opacity"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between bg-[#D9D9D9] px-5 py-4">
        <h3 className="text-2xl font-medium tracking-tight text-black">
          {title}
        </h3>
        <div className="flex items-center gap-6">
          <button
            aria-label="View"
            className="text-black hover:scale-105 transition-transform"
          >
            <Eye className="w-6 h-6" />
          </button>
          <button
            aria-label="Download"
            className="text-black hover:scale-105 transition-transform"
          >
            <Download className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Demo grid ----------
const certificatesData: CertificateCardProps[] = [
  {
    title: "Equinox",
    imageUrl: "https://source.unsplash.com/random/800x600?abstract,dark",
    date: "",
    time: "",
    location: "",
  },
  {
    title: "Aurora",
    imageUrl: "https://source.unsplash.com/random/800x600?texture,dark",
    date: "",
    time: "",
    location: "",
  },
  {
    title: "Solstice",
    imageUrl: "https://source.unsplash.com/random/800x600?pattern,dark",
    date: "",
    time: "",
    location: "",
  },
  // ...add more
  {
    title: "Equinox",
    imageUrl: "https://source.unsplash.com/random/800x600?abstract,dark",
    date: "",
    time: "",
    location: "",
  },
  {
    title: "Aurora",
    imageUrl: "https://source.unsplash.com/random/800x600?texture,dark",
    date: "",
    time: "",
    location: "",
  },
  {
    title: "Solstice",
    imageUrl: "https://source.unsplash.com/random/800x600?pattern,dark",
    date: "",
    time: "",
    location: "",
  },
  // ...add more
  {
    title: "Equinox",
    imageUrl: "https://source.unsplash.com/random/800x600?abstract,dark",
    date: "",
    time: "",
    location: "",
  },
  {
    title: "Aurora",
    imageUrl: "https://source.unsplash.com/random/800x600?texture,dark",
    date: "",
    time: "",
    location: "",
  },
  {
    title: "Solstice",
    imageUrl: "https://source.unsplash.com/random/800x600?pattern,dark",
    date: "",
    time: "",
    location: "",
  },
  // ...add more
  {
    title: "Equinox",
    imageUrl: "https://source.unsplash.com/random/800x600?abstract,dark",
    date: "",
    time: "",
    location: "",
  },
  {
    title: "Aurora",
    imageUrl: "https://source.unsplash.com/random/800x600?texture,dark",
    date: "",
    time: "",
    location: "",
  },
  {
    title: "Solstice",
    imageUrl: "https://source.unsplash.com/random/800x600?pattern,dark",
    date: "",
    time: "",
    location: "",
  },
  // ...add more
];

const Certificates: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-8 text-center">My Certificates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificatesData.map((cert, i) => (
          <CertificateCard key={i} {...cert} />
        ))}
      </div>
    </div>
  );
};

export default Certificates;
