import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const fail=message=>{console.error(`\nQuality check failed: ${message}`);process.exit(1)};
const html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map(match=>match[1]);
const styles=[...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+\.css)"/g)].map(match=>match[1]);

if(!scripts.length)fail('index.html does not load JavaScript.');
if(!styles.length)fail('index.html does not load CSS.');
if(new Set(scripts).size!==scripts.length)fail('index.html contains duplicate script imports.');
if(new Set(styles).size!==styles.length)fail('index.html contains duplicate stylesheet imports.');

const tinterModules=['app/tinter/survey.js','app/tinter/ui.js','app/tinter/camera.js','app/tinter/app.js'];
for(const file of [...scripts,...styles,...tinterModules])if(!fs.existsSync(file))fail(`Missing active asset: ${file}`);
for(const file of [...new Set([...scripts,...tinterModules])]){
  execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
  console.log(`✓ syntax ${file}`);
}

const requiredIds=['tinterOpen','tinterStartPrompt','noCamera','result','refineSection','refineDetails','quiz','questions','analyze','sliderDock'];
for(const id of requiredIds)if(!html.includes(`id="${id}"`))fail(`Missing required UI id: ${id}`);

const expectedOrder=[
  'app/intake-v6.js','app/fabric-color-engine-v4.js','app/season-hybrid-v11.js','app/profile-v11.js',
  'app/report-ui-v11.js','app/report-export-v2.js','app/main.js','app/tinter/app.js',
  'app/reset-random.js','app/report-visibility.js'
];
let previous=-1;
for(const file of expectedOrder){
  const index=scripts.indexOf(file);
  if(index===-1)fail(`Active runtime is missing ${file}`);
  if(index<=previous)fail(`Incorrect script order near ${file}`);
  previous=index;
}

const forbiddenActive=[
  /tinter-(?:optimized|first|usability|immersive|gesture|intelligence|cleanup|help|minimal|return)/,
  /tinter-(?:runtime|survey|language)-v\d/
];
for(const file of [...scripts,...styles]){
  if(forbiddenActive.some(pattern=>pattern.test(file)))fail(`Legacy Tinter adjustment layer is still active: ${file}`);
}
if(styles.filter(file=>file==='app/tinter/tinter.css').length!==1)fail('Exactly one canonical Tinter stylesheet must be active.');
if(scripts.filter(file=>file==='app/tinter/app.js').length!==1)fail('Exactly one canonical Tinter entry module must be active.');

const survey=fs.readFileSync('app/tinter/survey.js','utf8');
const runtime=fs.readFileSync('app/tinter/app.js','utf8');
const ui=fs.readFileSync('app/tinter/ui.js','utf8');
const camera=fs.readFileSync('app/tinter/camera.js','utf8');
const css=fs.readFileSync('app/tinter/tinter.css','utf8');
const season=fs.readFileSync('app/season-hybrid-v11.js','utf8');
const intake=fs.readFileSync('app/intake-v6.js','utf8');
const report=fs.readFileSync('app/report-ui-v11.js','utf8');

for(const contract of ['buildInitialQueue','scoreResponse','planAdaptive','planResolution','planValidation','validationSummary','compareSessions','confidenceSummary']){
  if(!survey.includes(contract))fail(`Tinter survey contract missing: ${contract}`);
}
for(const contract of ['state.result','planValidation','window.buildPalette','scrollToResults']){
  if(!runtime.includes(contract))fail(`Tinter application contract missing: ${contract}`);
}
for(const contract of ['tinterQuestionHelpPanel','tinter-return-zone','setLaunchComplete','scrollIntoView']){
  if(!ui.includes(contract))fail(`Tinter UI contract missing: ${contract}`);
}
for(const contract of ['getUserMedia','checkLighting','autoBalance','lightingConfidence']){
  if(!camera.includes(contract))fail(`Tinter camera contract missing: ${contract}`);
}
for(const selector of ['.tinter-modal','.tinter-question','.smooth-card','.tinter-choice-footer','.tinter-return-zone','.tinter-entry']){
  if(!css.includes(selector))fail(`Tinter stylesheet contract missing: ${selector}`);
}
for(const label of ['Deep Neutral','Soft Neutral','Deep Autumn'])if(!season.includes(label))fail(`Hybrid season contract missing: ${label}`);
if(!intake.includes('window.calculateObservationReport'))fail('Camera-free observation report is missing.');
if(!intake.includes('window.calculateReport'))fail('Unified report calculation is missing.');
if(!report.includes('Why this result'))fail('Report evidence panel is missing.');
if(!report.includes('Easy outfit combinations'))fail('Outfit guidance is missing.');
if(!report.includes('Survey checks'))fail('Survey validation panel is missing.');

console.log(`\n✓ ${scripts.length} scripts and ${styles.length} styles passed production checks.`);
