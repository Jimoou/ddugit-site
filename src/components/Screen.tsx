import Image from "next/image";

/**
 * A screenshot of the app (public/screens: 2880x1800, captured from the demo at 2x, webp 0.95),
 * in a console frame. Served as is: Next's image optimizer would recompress it and blur the UI text.
 */
export function Screen({
  name,
  alt,
  priority,
  caption,
}: {
  name: string;
  alt: string;
  priority?: boolean;
  /** Shown under the frame (guides: what the step looks like). */
  caption?: string;
}) {
  return (
    <figure className="screen">
      <Image
        src={`/screens/${name}.webp`}
        alt={alt}
        width={2880}
        height={1800}
        priority={priority}
        unoptimized
        sizes="(max-width: 1100px) 100vw, 1040px"
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
