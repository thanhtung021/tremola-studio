/** Temporary empty page: title only, until page content is built. */
export function PageTitle({ title }: { title: string }) {
  return (
    <section className="section container-site min-h-[60vh] pt-40">
      <h1>{title}</h1>
    </section>
  );
}
