import type { GalleryImage } from "@/lib/types";
import type { TemplateTheme } from "@/lib/templateTheme";

export interface GalleryBlockProps {
  heading: string;
  images: GalleryImage[];
  theme: TemplateTheme;
  mode: "live" | "preview";
  animClassName?: string;
  animStyle?: React.CSSProperties;
}

export function GalleryBlock({ heading, images, theme: t, mode, animClassName, animStyle }: GalleryBlockProps) {
  return (
    <div className={animClassName} style={animStyle}>
      {heading && (
        <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${t.linkSub}`}>{heading}</p>
      )}
      <div className="grid grid-cols-3 gap-1">
        {images.map((img) =>
          mode === "live" ? (
            <a
              key={img.id}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square overflow-hidden rounded-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover transition active:scale-95" />
            </a>
          ) : (
            <div key={img.id} className="aspect-square overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </div>
          ),
        )}
      </div>
    </div>
  );
}
