// Leonida Nights Cover Studio: hands the app in. It copies this repo's app/
// and screenshots/ folders into the output directory and writes the dossier
// the judge reads, using the vendored make.fun library. Standard library
// only; runs on Node 22 with no network. Outside the grader, set
// MAKEFUN_OUTPUT_DIR to choose where the output goes:
//   MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

mkdirSync(outputDir, { recursive: true });
cpSync(appDir, join(outputDir, 'app'), { recursive: true });

const outShots = join(outputDir, 'screenshots');
mkdirSync(outShots, { recursive: true });
if (existsSync(shotsDir)) cpSync(shotsDir, outShots, { recursive: true });

// The scorer's own caps, so a build the gate would refuse is refused here
// first: at most 4 screenshots of 256 KiB each, at most 993 app files and
// 48 MiB of app files, no app path over 1000 bytes. Only the text cap
// shapes the dossier's bytes; the rest guard the entry itself. The output
// directory itself is never removed, only filled: the grader runs with a
// read-only parent, so deleting it would fail the run.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
