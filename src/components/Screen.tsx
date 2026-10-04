import Image from "next/image";

/** A screenshot of the app (public/screens, captured from the demo at 2x), in a console frame. */
export function Screen({ name, alt, priority }: { name: string; alt: string; priority?: boolean }) {
  return (
    <figure className="screen">
      <Image
        src={`/screens/${name}.webp`}
        alt={alt}
        width={2880}
        height={1800}
        priority={priority}
        sizes="(max-width: 1100px) 100vw, 1040px"
      />
    </figure>
  );
}
