// Run: node --experimental-strip-types lib/podcast-run.test.ts
import assert from "node:assert";
import { buildPodcastInput } from "./podcast-run.ts";

const ok = buildPodcastInput({ input: "input/a.mp4", audio: "input/a.wav", title: "Ep 1", cameras: [], height: null });
assert.ok("body" in ok);
assert.deepStrictEqual(ok.body, {
  input: "input/a.mp4", audio: "input/a.wav", title: "Ep 1", footage: "auto", aspect: "9:16",
  layout: "auto", reactions: "normal", motion: "subtle", framing: "medium", pace: "normal",
  sync: true, codec: "h264", quality: 19,
});
assert.ok("error" in buildPodcastInput({}));
assert.ok("error" in buildPodcastInput({ input: "x", layout: "grid" }));
assert.ok("error" in buildPodcastInput({ input: "x", quality: 50 }));
assert.ok("error" in buildPodcastInput({ input: "x", aspect: "wide" }));
assert.ok("error" in buildPodcastInput({ input: "x", cameras: [1] }));
assert.ok("error" in buildPodcastInput({ input: "x", height: 10 }));
assert.ok("error" in buildPodcastInput({ input: "x", title: "t".repeat(201) }));
assert.ok("body" in buildPodcastInput({ input: "x", cameras: ["c2.mp4"], footage: "angles", height: 1920 }));
console.log("ok");
