/**
 * Renders text with an optional phrase in the editorial accent style. The
 * phrase stays glued to punctuation right after it, so a line never starts
 * with a stray comma (also when SplitText re-flows the heading).
 */
export function HighlightText({ text, highlight }: { text: string; highlight?: string }) {
  const index = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || index === -1) return <>{text}</>;
  const rest = text.slice(index + highlight.length);
  const punctuation = /^[,.;:!?\u2019')\]]+/.exec(rest)?.[0] ?? "";
  if (!punctuation) {
    return (
      <>
        {text.slice(0, index)}
        <em className="accent-serif">{highlight}</em>
        {rest}
      </>
    );
  }
  // Only the last word is glued, so long phrases can still wrap.
  const split = highlight.lastIndexOf(" ") + 1;
  return (
    <>
      {text.slice(0, index)}
      {split > 0 && <em className="accent-serif">{highlight.slice(0, split)}</em>}
      <span className="whitespace-nowrap">
        <em className="accent-serif">{highlight.slice(split)}</em>
        {punctuation}
      </span>
      {rest.slice(punctuation.length)}
    </>
  );
}
