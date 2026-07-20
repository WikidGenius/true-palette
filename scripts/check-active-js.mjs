import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const fail=message=>{console.error(`\nQuality check failed: ${message}`);process.exit(1)};
const html=fs.readFileSync('index.html','utf8');
const assetPath=url=>String(url).split(/[?#]/,1)[0];
const scripts=[...html.matchAll(/<script[^>]+src="([^"]+\.js(?:[?#][^"]*)?)"/g)].map(match=>assetPath(match[1]));
const styles=[...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+\.css(?:[?#][^"]*)?)"/g)].map(match=>assetPath(match[1]));
const canonicalModules=['app/tinter/survey.js','app/tinter/ui.js','app/tinter/camera.js','app/tinter/app.js'];

if(!scripts.length)fail('index.html does not load JavaScript.');
if(new Set(scripts).size!==scripts.length)fail('index.html contains duplicate script imports.');
for(const file of [...scripts,...canonicalModules]){
  if(!fs.existsSync(file))fail(`Missing JavaScript asset: ${file}`);
  execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
  console.log(`✓ syntax ${file}`);
}
if(!fs.existsSync('app/tinter/tinter.css'))fail('Canonical Tinter stylesheet is missing.');

for(const id of ['tinterOpen','noCamera','result','refineSection','refineDetails','quiz','questions','analyze','sliderDock']){
  if(!html.includes(`id="${id}"`))fail(`Missing required UI id: ${id}`);
}

const canonicalActive=scripts.includes('app/tinter/app.js');
if(canonicalActive){
  if(!styles.includes('app/tinter/tinter.css'))fail('Canonical Tinter stylesheet is not active.');
  const legacyPattern=/tinter-(?:optimized|first|usability|immersive|gesture|intelligence|cleanup|help|minimal|return)|tinter-(?:runtime|survey|language)-v\d/;
  for(const file of [...scripts,...styles])if(legacyPattern.test(file))fail(`Legacy Tinter adjustment layer is still active: ${file}`);
  for(const file of ['app/intake-v6.js','app/fabric-color-engine-v4.js','app/season-hybrid-v11.js','app/profile-v11.js','app/report-ui-v11.js','app/report-export-v2.js','app/main.js','app/tinter/app.js','app/reset-random.js','app/report-visibility.js']){
    if(!scripts.includes(file))fail(`Active runtime is missing ${file}`);
  }
}

const survey=fs.readFileSync('app/tinter/survey.js','utf8');
const app=fs.readFileSync('app/tinter/app.js','utf8');
const ui=fs.readFileSync('app/tinter/ui.js','utf8');
const camera=fs.readFileSync('app/tinter/camera.js','utf8');
const season=fs.readFileSync('app/season-hybrid-v11.js','utf8');
for(const contract of ['buildInitialQueue','scoreResponse','planAdaptive','planResolution','planValidation','validationSummary','compareSessions'])if(!survey.includes(contract))fail(`Survey contract missing: ${contract}`);
for(const contract of ['window.buildPalette','scrollToResults','state.result'])if(!app.includes(contract))fail(`Application contract missing: ${contract}`);
for(const contract of ['tinterQuestionHelpPanel','tinter-return-zone','setLaunchComplete','scrollIntoView'])if(!ui.includes(contract))fail(`UI contract missing: ${contract}`);
for(const contract of ['getUserMedia','checkLighting','autoBalance'])if(!camera.includes(contract))fail(`Camera contract missing: ${contract}`);
for(const label of ['Deep Neutral','Soft Neutral','Deep Autumn'])if(!season.includes(label))fail(`Hybrid result contract missing: ${label}`);
console.log(`\n✓ ${scripts.length} active scripts and the canonical Tinter modules passed checks.`);
