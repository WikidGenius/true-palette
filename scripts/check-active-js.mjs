import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const fail = message => {
  console.error(`\nQuality check failed: ${message}`);
  process.exit(1);
};

const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script\s+src="([^"]+\.js)"/g)].map(match => match[1]);

if (!scripts.length) fail('index.html does not load any JavaScript.');
if (new Set(scripts).size !== scripts.length) fail('index.html contains duplicate script imports.');

for (const file of scripts) {
  if (!fs.existsSync(file)) fail(`Missing active script: ${file}`);
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  console.log(`✓ syntax ${file}`);
}

const requiredIds = [
  'tinterOpen', 'noCamera', 'result', 'refineSection', 'refineDetails',
  'quiz', 'questions', 'analyze', 'sliderDock'
];
for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) fail(`Missing required UI id: ${id}`);
}

const expectedOrder = [
  'app/intake-v6.js',
  'app/fabric-color-engine-v4.js',
  'app/profile-v6.js',
  'app/report-ui-v6.js',
  'app/report-export-v2.js',
  'app/main.js',
  'app/tinter-runtime-v3.js',
  'app/reset-random.js',
  'app/report-visibility.js'
];

let previousIndex = -1;
for (const file of expectedOrder) {
  const index = scripts.indexOf(file);
  if (index === -1) fail(`Active runtime is missing ${file}`);
  if (index <= previousIndex) fail(`Incorrect script order near ${file}`);
  previousIndex = index;
}

const runtime = fs.readFileSync('app/tinter-runtime-v3.js', 'utf8');
const intake = fs.readFileSync('app/intake-v6.js', 'utf8');
const report = fs.readFileSync('app/report-ui-v6.js', 'utf8');

const runtimeContracts = [
  'TINTER_FOUNDATION',
  'TINTER_TIEBREAKERS',
  'No clear difference',
  'window.buildPalette',
  'Tinter.result',
  'axisConfidence'
];
for (const contract of runtimeContracts) {
  if (!runtime.includes(contract)) fail(`Tinter runtime contract missing: ${contract}`);
}

if (!intake.includes('window.calculateObservationReport')) fail('Camera-free observation report is missing.');
if (!intake.includes('window.calculateReport')) fail('Unified report calculation is missing.');
if (!report.includes('Why this result')) fail('Report evidence panel is missing.');
if (!report.includes('Easy outfit combinations')) fail('Outfit guidance is missing.');

console.log(`\n✓ ${scripts.length} active scripts passed syntax and app-contract checks.`);
