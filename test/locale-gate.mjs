/**
 * Ship-gate for the plugin's display name (m09620).
 *
 * Why this is its own script and not another row in bundle-gate.mjs: the thing
 * that breaks here is package metadata, not the built bundle. `bundle-gate`
 * reads dist/index.mjs and dist/client.js; a locale regression cannot appear in
 * either of them. Worse, the failure is *silent by construction* — the host
 * resolves `<pkg>/locale/en.json` through the package `exports` map, and a specifier
 * it cannot resolve is swallowed by `missingResource()` and treated as "this
 * plugin declares no locale at all". The UI then falls back to `moduleShortName()`
 * and prints `hillstone-cli-ops`. Nothing is logged, nothing fails, every other
 * gate stays green, and the only symptom is that the plugin market is in English.
 * A gate that can only fail on an exception is a gate nobody has.
 *
 * So: replay the host's own resolution here, against the real manifest, and fail
 * loudly when the subpath cannot be resolved or the translations are missing.
 * The algorithm mirrors `readPluginMeta()` in @deepseek-ai/dsh-app-boot.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const pkgRoot = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const manifest = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf-8'))

let bad = 0
const ok = (name) => console.log(`  ok    ${name}`)
const miss = (name, why) => {
  console.log(`  MISS  ${name}${why ? ` — ${why}` : ''}`)
  bad++
}

/**
 * Resolve `<name>/<subpath>` the way the host does: through the package `exports`
 * map, using a require rooted in this package. A subpath the exports map does not
 * mention raises ERR_PACKAGE_PATH_NOT_EXPORTED, which the host converts into
 * "no locale" — so a missing exports entry and a malformed one look identical
 * from the outside. That is why the map itself is asserted separately below.
 */
const req = createRequire(join(pkgRoot, 'package.json'))
const resolveSubpath = (subpath) => req.resolve(`${manifest.name}/${subpath}`)

// 1. The exports map must actually publish the locale subpath, or every lookup
//    below fails for a reason that has nothing to do with the locale files.
if (manifest.exports?.['./locale/*.json'] !== './locale/*.json') {
  miss('manifest exports "./locale/*.json"', `found ${JSON.stringify(manifest.exports?.['./locale/*.json'])}`)
} else {
  ok('manifest exports "./locale/*.json"')
}

// 2. `files` decides what an npm publish tarball carries. The check above would
//    pass locally and the name would revert to English for everyone installing
//    from the registry, because locale/ simply is not in the tarball.
const files = manifest.files ?? []
if (!files.some((entry) => entry === 'locale' || entry === 'locale/*.json')) {
  miss('manifest files ships locale/', `files = ${JSON.stringify(files)}`)
} else {
  ok('manifest files ships locale/')
}

// 3. English is the anchor: `dictionariesOf()` walks the *directory holding
//    en.json*, so without en.json the plugin declares no locale whatsoever.
if (existsSync(join(pkgRoot, 'locale', 'en.json'))) {
  ok('locale/en.json exists')
} else {
  miss('locale/en.json exists')
}

// 4. Replay readPluginMeta(): the language id comes from the filename, the text
//    comes from meta.title / meta.description, and the host's textOf() rejects an
//    empty string (surfaced in the UI as "包元信息错误").
const LANGUAGE_ID = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u
const dictionaries = new Map()
try {
  const englishDir = dirname(resolveSubpath('locale/en.json'))
  for (const entry of readdirSync(englishDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue
    const language = entry.name.slice(0, -5)
    if (!LANGUAGE_ID.test(language)) {
      miss(`locale/${entry.name} uses a language id as its filename`, `"${language}" is not one`)
      continue
    }
    const file = resolveSubpath(`locale/${entry.name}`)
    const meta = JSON.parse(readFileSync(file, 'utf-8')).meta
    dictionaries.set(language.toLowerCase(), { title: meta?.title, description: meta?.description })
  }
} catch (error) {
  miss('locale files resolve through the exports map', String(error.code ?? error))
}

for (const [language, fields] of dictionaries) {
  if (typeof fields.title !== 'string' || fields.title.trim() === '') {
    miss(`locale/${language} declares a non-empty meta.title`, JSON.stringify(fields.title))
  } else {
    ok(`locale/${language} declares meta.title (${fields.title})`)
  }
}

// 5. The whole point of the change: the Chinese locale must differ from the
//    English one. A zh.json that exists but repeats the English title keeps every
//    other gate green while the plugin market stays English — the exact symptom
//    the user reported, reproduced in miniature.
const en = dictionaries.get('en')?.title
const zh = dictionaries.get('zh')?.title
if (typeof zh !== 'string' || zh.trim() === '') {
  miss('locale/zh.json declares a Chinese meta.title', 'this is the name the plugin market shows')
} else if (zh === en) {
  miss('locale/zh.json title differs from en.json', `both are "${zh}"`)
} else if (!/[^\x00-\x7f]/.test(zh)) {
  miss('locale/zh.json title contains Chinese characters', `got "${zh}"`)
} else {
  ok(`Chinese title resolves to "${zh}" (English: "${en}")`)
}

console.log(`\n${bad === 0 ? 'LOCALE OK' : `LOCALE MISSING ${bad}`}`)
process.exit(bad === 0 ? 0 : 1)