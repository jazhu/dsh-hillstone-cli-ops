/**
 * Ship-gate: the plugin must load on a machine that has NOTHING beside it.
 *
 * Why this is its own script and not another row in bundle-gate.mjs: bundle-gate
 * greps the built artefacts *in place*, where node_modules is present. Every one
 * of its checks passed on the broken tree. The failure this gate exists for was
 * `Error: Cannot find module 'asn1'`: a `link:` install (and any folder copied to
 * another machine) never installs the package's own dependencies, so a host half
 * with an external `import "ssh2"` dies at Loader import time. The Loader entry
 * then keeps `fiber === undefined`, the `dsh.client` scan skips it, and the whole
 * plugin disappears -- host tools, client half and right-rail tab alike. Nothing
 * in dist/ looks wrong; only "does it load with no node_modules" notices.
 *
 * So: stage exactly what `files` would ship into a temp dir with no node_modules,
 * prove the runtime deps are NOT resolvable there, and import the host bundle
 * from that stage. A gate that can only run next to node_modules is a gate that
 * cannot see this class of bug.
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const pkgRoot = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const manifest = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf-8'))
const require = createRequire(import.meta.url)

let bad = 0
const ok = (name) => console.log(`  ok    ${name}`)
const miss = (name, why) => {
  console.log(`  MISS  ${name}${why ? `  -  ${why}` : ''}`)
  bad++
}

// ---- 1. the manifest itself must not promise dependencies it does not need --
// ssh2/xterm are inlined into dist at build time; leaving them in `dependencies`
// would make every install download and BUILD them (cpu-features gyp) for
// nothing. playwright is OPTIONAL on purpose: it is a runtime import whose
// ~100MB of browser code must not be inlined, but only the WebUI-login button
// needs it -- device CRUD, SSH terminals and the agent tools all work without
// it, so a machine that cannot fetch playwright must still get a working plugin
// and one actionable error message (see src/web-login.ts).
const runtimeDeps = Object.keys(manifest.dependencies ?? {})
const optionalDeps = Object.keys(manifest.optionalDependencies ?? {})
for (const inlined of ['ssh2', 'xterm', 'xterm-addon-fit']) {
  if (!runtimeDeps.includes(inlined) && !optionalDeps.includes(inlined))
    ok(`${inlined} is build-time only (it is inlined into dist)`)
  else miss(`${inlined} is build-time only (it is inlined into dist)`, 'listed as a runtime dependency')
}
if (optionalDeps.includes('playwright')) ok('playwright is an optional runtime dependency (dynamic import, not inlined)')
else if (runtimeDeps.includes('playwright')) miss('playwright is an optional runtime dependency', 'a hard dependency breaks the install when it cannot be fetched')
else miss('playwright is an optional runtime dependency (dynamic import, not inlined)')
if (manifest.engines?.node) ok(`engines.node = ${manifest.engines.node}`)
else miss('engines.node declared', 'ssh2 needs modern Node internals; "@deepseek-ai/dsh-*" bundles assume >=22')

// ---- 2. stage exactly what `files` ships, behind a node_modules junction ----
// The layout mirrors the install that actually broke: `<profile>/node_modules/
// <name>` pointing at a package directory that has no node_modules of its own
// (that is what a `link:` install -- and a folder copied to another machine --
// looks like). Resolving by package name therefore works here, while ssh2 and
// friends must NOT resolve.
const stage = mkdtempSync(join(tmpdir(), 'dsh-hillstone-portability-'))
const stagePkg = join(stage, 'pkg')
const shipped = ['dist', 'locale', 'cordis.patch.yml', 'package.json']
// package.json is always in the tarball whatever `files` says, and it is the file
// that carries the `exports` map the host resolves subpaths through.
for (const entry of new Set([...(manifest.files ?? shipped), 'package.json'])) {
  const from = join(pkgRoot, entry)
  if (!existsSync(from)) {
    miss(`files[] entry exists (${entry})`, 'missing on disk -- the tarball would ship without it')
    continue
  }
  cpSync(from, join(stagePkg, entry), { recursive: true })
}

try {
  mkdirSync(join(stage, 'node_modules'), { recursive: true })
  symlinkSync(stagePkg, join(stage, 'node_modules', manifest.name), 'junction')
  const stageRequire = createRequire(join(stage, 'package.json'))
  const pkgRequire = createRequire(join(stagePkg, 'package.json'))
  if (!existsSync(join(stagePkg, 'node_modules'))) ok('the installed package has no node_modules of its own')
  else miss('the installed package has no node_modules of its own')

  // The point of the stage: these MUST be unresolvable, so the import below is
  // proof of inlining rather than proof that this machine happens to be set up.
  for (const name of ['ssh2', 'asn1', 'bcrypt-pbkdf', 'xterm', 'cpu-features']) {
    let resolved = true
    try {
      pkgRequire.resolve(name)
    } catch {
      resolved = false
    }
    if (!resolved) ok(`"${name}" is not resolvable from the installed package (stays inlined)`)
    else miss(`"${name}" is not resolvable from the installed package (stays inlined)`, 'resolved after all')
  }

  // ---- 3. the host half imports and exports the plugin contract -------------
  const host = await import(pathToFileURL(join(stagePkg, 'dist', 'index.mjs')).href).catch((error) => {
    miss('host bundle imports with no node_modules beside it', String(error?.message ?? error))
    return undefined
  })
  if (host) {
    ok('host bundle imports with no node_modules beside it')
    for (const [exportName, want] of [
      ['name', 'string'],
      ['inject', 'object'],
      ['apply', 'function'],
      ['DEFAULT_CONFIG', 'object'],
      ['checkCommandPolicy', 'function'],
    ]) {
      if (typeof host[exportName] === want) ok(`host exports ${exportName} (${want})`)
      else miss(`host exports ${exportName} (${want})`, `got ${typeof host[exportName]}`)
    }
    if (host.name === manifest.name) ok(`host name matches the manifest (${host.name})`)
    else miss('host name matches the manifest', `host says ${host.name}`)
  }

  // ---- 4. the shipped bundle must not re-grow a static external import ------
  // This is the shape that broke: `import { Client as SSHClient } from "ssh2"`.
  // A static import is evaluated when the Loader imports the entry; a dynamic one
  // is only evaluated on the button press that needs a browser.
  const hostSource = readFileSync(join(stagePkg, 'dist', 'index.mjs'), 'utf-8')
  const staticExternal = /(?:^|\n)\s*import\s[^;\n]*from\s*["'](?:ssh2|asn1|bcrypt-pbkdf|tweetnacl|safer-buffer|playwright|cpu-features)["']/
  if (!staticExternal.test(hostSource)) ok('host bundle has no static import of a runtime dependency')
  else miss('host bundle has no static import of a runtime dependency', 'an external import came back')
  const dynamicImports = [...hostSource.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1])
  const strayDynamic = dynamicImports.filter((spec) => spec !== 'playwright' && !spec.startsWith('node:'))
  if (!strayDynamic.length) ok(`host bundle's only dynamic import is playwright (${dynamicImports.join(', ') || 'none'})`)
  else miss('host bundle imports nothing else at runtime', `also imports ${strayDynamic.join(', ')}`)

  // ---- 5. every subpath the host resolves through `exports` must be shipped --
  for (const [subpath, want] of [
    ['.', manifest.exports['.']],
    ['./client', manifest.exports['./client']],
    ['./cordis.patch.yml', manifest.exports['./cordis.patch.yml']],
    ['./locale/zh.json', './locale/zh.json'],
  ]) {
    let target
    try {
      target = stageRequire.resolve(manifest.name + (subpath === '.' ? '' : subpath.slice(1)))
    } catch (error) {
      miss(`staged install resolves "${subpath}"`, String(error?.message ?? error).split('\n')[0])
      continue
    }
    const expectFile = join(stagePkg, want.replace(/^\.\//, ''))
    if (existsSync(expectFile)) ok(`installed package resolves "${subpath}" -> ${want}`)
    else miss(`installed package resolves "${subpath}"`, `${target} but ${want} is not in the tarball`)
  }
  if (manifest.dsh?.bundle?.patch && existsSync(join(stagePkg, manifest.dsh.bundle.patch)))
    ok(`bundle patch ships (${manifest.dsh.bundle.patch})`)
  else miss('bundle patch ships', String(manifest.dsh?.bundle?.patch))
  const inject = manifest.dsh?.client?.inject
  if (Array.isArray(inject) && inject.every((entry) => typeof entry === 'string') && manifest.dsh.client.platform === 'web')
    ok('dsh.client declaration is a web bundle with a string inject list')
  else miss('dsh.client declaration is a web bundle with a string inject list')
} finally {
  rmSync(stage, { recursive: true, force: true })
}

console.log(bad ? `\nPORTABILITY FAILED (${bad})` : '\nPORTABILITY OK')
process.exit(bad ? 1 : 0)
