import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { galleryIsOpen, unlockGallery } from "@/lib/actions";
import { copy } from "@/lib/copy";
import { loadManifest } from "@/lib/manifest";
import { SITE_TYPES } from "@/lib/types";

export const instant = false;

type GalleryPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const open = await galleryIsOpen();
  const text = copy.en;

  if (!open) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <form action={unlockGallery} className="grid w-full max-w-sm gap-4 rounded-3xl border border-border bg-card p-8">
          <h1 className="text-xl font-medium">{text.galleryTitle}</h1>
          <div className="grid gap-2">
            <Label htmlFor="password">{text.galleryPassword}</Label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="h-9 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          {params.error ? (
            <p className="text-sm text-destructive" role="alert">
              {text.galleryWrong}
            </p>
          ) : null}
          <Button type="submit">{text.galleryUnlock}</Button>
        </form>
      </main>
    );
  }

  const manifest = await loadManifest();
  const sites = manifest?.sites ?? [];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <h1 className="text-xl font-medium">{text.galleryTitle}</h1>
      {SITE_TYPES.map((siteType) => (
        <section key={siteType} className="grid gap-3">
          <h2 className="text-sm text-muted-foreground">{siteType}</h2>
          <ul className="grid gap-2">
            {sites
              .filter((site) => site.type === siteType)
              .map((site) => (
                <li
                  key={site.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm"
                >
                  <span>
                    {text.country}: {site.country}
                  </span>
                  <span className="text-muted-foreground">
                    {text.model}: {site.model}
                  </span>
                  <a
                    href={`/s/${site.id}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary"
                  >
                    {text.openSite}
                  </a>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
