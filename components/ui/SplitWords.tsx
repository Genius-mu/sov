/** Wraps each word in a mask so it can rise into place. `wordClassName` styles each word (e.g. a colour). */
export function SplitWords({ text, wordClassName = "" }: { text: string; wordClassName?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          {/* side padding keeps italic overhangs from being clipped by the mask */}
          <span className="-mx-[0.1em] -mb-[0.14em] inline-block overflow-hidden px-[0.1em] pb-[0.14em] align-top">
            <span data-word className={`inline-block will-change-transform ${wordClassName}`}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
