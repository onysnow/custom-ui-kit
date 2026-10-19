import { PhotoSection } from "@onysnow/fx/react/PhotoSection";

// Any photograph works: a plain URL via `src`, or stored paths through configureFx({ photoUrl }).
const photo = { src: "/fx/rooms/studio.jpg", width: 1280, height: 346, alt: "A photographed room" };

export default function PhotoSectionDemo() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border">
      <PhotoSection image={photo} depth="standard">
        <div className="mx-auto max-w-xl p-8 text-center">
          <p className="font-display text-3xl font-light">A pane over a picture</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Scroll the page: the photograph slides under the glass by how far the glass stands off
            it.
          </p>
        </div>
      </PhotoSection>
    </div>
  );
}
