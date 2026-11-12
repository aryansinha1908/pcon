/**
 * Falling code blocks on either side of the hero copy.
 *
 * Pure CSS: each block sits at the top of a full-height "lane" and the lane is
 * translated down the hero, so only `transform` animates. Blocks are spread over
 * three depth layers (size, blur, opacity, speed) for parallax. Values are
 * derived from the index so server and client render identically.
 */

type Token = [className: string, text: string];
type Snippet = Token[][];

const k = (text: string): Token => ["syntax-purple", text];
const f = (text: string): Token => ["syntax-blue", text];
const s = (text: string): Token => ["syntax-yellow", text];
const n = (text: string): Token => ["syntax-orange", text];
const p = (text: string): Token => ["", text];
const c = (text: string): Token => ["code-rain__comment", text];

const SNIPPETS: Snippet[] = [
  [[k("#include"), p(" "), s("<bits/stdc++.h>")]],
  [[f("dp"), p("[i] = "), f("max"), p("(dp[i-1], dp[i-2] + a[i]);")]],
  [[k("while"), p(" (lo < hi) {")], [p("  mid = (lo + hi) >> "), n("1"), p(";")], [p("}")]],
  [[p("$ "), f("git"), p(" commit -m "), s("\"ship it\"")]],
  [[k("def"), p(" "), f("solve"), p("(n):")], [p("  "), k("return"), p(" n * (n + "), n("1"), p(") // "), n("2")]],
  [[f("sort"), p("(v.begin(), v.end());")]],
  [[k("const"), p(" app = "), f("express"), p("();")]],
  [[c("// O(n log n)")]],
  [[f("model"), p("."), f("fit"), p("(X_train, y_train)")]],
  [[k("for"), p(" ("), k("int"), p(" i = "), n("0"), p("; i < n; i++)")]],
  [[p("$ "), f("npm"), p(" run build")]],
  [[k("fn"), p(" "), f("main"), p("() {")], [p("  "), f("println!"), p("("), s("\"hello, pcon\""), p(");")], [p("}")]],
  [[k("SELECT"), p(" * "), k("FROM"), p(" ideas;")]],
  [[k("await"), p(" "), f("fetch"), p("(url)")]],
  [[f("printf"), p("("), s("\"AC\\n\""), p(");")]],
  [[p("$ "), f("kubectl"), p(" apply -f .")]],
  [[k("if"), p(" (visited[v]) "), k("continue"), p(";")]],
  [[p("<"), f("Hero"), p(" future="), s("\"yours\""), p(" />")]],
];

const LAYERS = [
  { scale: 0.78, opacity: 0.32, blur: 1.4, duration: 34 },
  { scale: 0.9, opacity: 0.5, blur: 0.4, duration: 26 },
  { scale: 1, opacity: 0.78, blur: 0, duration: 19 },
];

const BLOCKS_PER_SIDE = 9;

function blocksFor(side: 0 | 1) {
  return Array.from({ length: BLOCKS_PER_SIDE }, (_, i) => {
    const seed = i * 7 + side * 13;
    const layer = LAYERS[(i + side) % LAYERS.length];
    const lanes = [4, 26, 48, 14, 36, 58, 8, 30, 52];
    const duration = layer.duration + (seed % 5) * 1.6;
    return {
      key: `${side}-${i}`,
      snippet: SNIPPETS[(i * 2 + side * 5) % SNIPPETS.length],
      style: {
        "--x": `${lanes[i % lanes.length]}%`,
        "--scale": layer.scale,
        "--opacity": layer.opacity,
        "--blur": `${layer.blur}px`,
        "--duration": `${duration}s`,
        // Negative delays spread blocks down the column so it is already full on load.
        "--delay": `${-((i / BLOCKS_PER_SIDE) * duration + (seed % 3) * 2.3).toFixed(2)}s`,
        "--static-y": `${((i * 37 + side * 19) % 90) + 2}%`,
        zIndex: Math.round(layer.scale * 10),
      } as React.CSSProperties,
    };
  });
}

export function CodeRain() {
  return (
    <div className="code-rain" aria-hidden="true">
      {([0, 1] as const).map((side) => (
        <div className={"code-rain__side code-rain__side--" + (side === 0 ? "left" : "right")} key={side}>
          {blocksFor(side).map((block) => (
            <div className="code-rain__lane" key={block.key} style={block.style}>
              <pre className="code-rain__block">
                {block.snippet.map((line, li) => (
                  <span className="code-rain__line" key={li}>
                    {line.map(([cls, text], ti) => <span className={cls || undefined} key={ti}>{text}</span>)}
                  </span>
                ))}
              </pre>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
