import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(path,'utf8');
const index=read('index.html');
const app=read('app/tinter/app.js');
const ui=read('app/tinter/ui.js');
const survey=read('app/tinter/survey.js');
const css=read('app/tinter/tinter.css');
const report=read('app/report-ui-v11.js');

const requireText=(source,text,message)=>assert.ok(source.includes(text),message);
const forbidText=(source,text,message)=>assert.ok(!source.includes(text),message);

// Canonical production architecture and cache delivery.
requireText(index,'app/tinter/app.js?v=20260719-flow1','Tinter entry module must be cache-versioned.');
requireText(index,'app/tinter/tinter.css?v=20260719-flow1','Tinter stylesheet must be cache-versioned.');
requireText(index,'app/report-ui-v11.js?v=20260719-flow1','Report renderer must be cache-versioned.');
for(const legacy of ['tinter-runtime','tinter-usability','tinter-immersive','tinter-return','tinter-language']){
  forbidText(index,legacy,`Legacy Tinter layer is active: ${legacy}`);
}
requireText(app,"./ui.js?v=20260719-flow1",'Tinter UI dependency must be cache-versioned.');
requireText(app,"./survey.js?v=20260719-flow1",'Tinter survey dependency must be cache-versioned.');
requireText(app,"./camera.js?v=20260719-flow1",'Tinter camera dependency must be cache-versioned.');

// Linear production flow without tutorial or gotcha rounds.
requireText(app,'liveQuestions=questions=>questions.filter(item=>!item.control)','Control questions must be removed from the live survey.');
requireText(app,'state.queue=liveQuestions(TinterSurvey.buildInitialQueue())','The active queue must use only real comparisons.');
requireText(app,'estimatedTotal:12','The shorter flow estimate must be used.');
requireText(index,'Usually 12–14 comparisons','The launch page must describe the shorter flow.');
forbidText(app,'calibrationPassed','Calibration must not be exposed in result data.');

// Literal, beginner-friendly questions and contextual help.
requireText(survey,'Which neutral makes your skin look more even?','Foundation wording must remain literal.');
forbidText(survey,'cleaner definition','Abstract “cleaner definition” wording returned.');
requireText(ui,'tinterQuestionHelpPanel','Question help disclosure is missing.');
requireText(ui,'A color that is too dark can deepen shadows','Plain-language depth help is missing.');

// Minimal Tinter interface.
forbidText(ui,'tinter-face-guide','Face outline guide returned to Tinter markup.');
forbidText(css,'.tinter-face-guide','Face outline guide returned to Tinter styles.');
forbidText(ui,'smooth-chip','Framed inner swatch returned.');
forbidText(ui,'smooth-name','Visible Drape A/B label returned.');
requireText(ui,'card.style.background = item[side].hex','Swatch must be the color surface itself.');
requireText(css,'border-radius: 32px;','Swatch must retain the squircle shape.');
requireText(css,'padding: 0;','Swatch must not have a white inner frame.');
requireText(css,'border: 0;','Swatch must not have a white border.');
requireText(css,'height: 28%;','Return target must remain in the lower portion of the screen.');
assert.ok(ui.indexOf('id="smoothDeck"')<ui.indexOf('tinter-choice-footer'),'“They look about the same” must remain below the swatches.');
requireText(ui,'tinter-settings-icon','Stable settings icon is missing.');
requireText(css,'.tinter-light-badge[data-quality="good"]','Successful lighting feedback must remain visually suppressed.');

// Launch and completion behavior.
requireText(index,'Press to start','Logo-first launch prompt is missing.');
requireText(index,'tinter-logo-lockup','Tinter brand lockup is missing.');
requireText(app,'close({scrollToResults:true})','Tinter must scroll to the results after completion.');

// Consumer-facing results, with technical data only behind one info control.
requireText(report,'<details class="report-diagnostics">','Analysis details must stay behind an information disclosure.');
forbidText(report,'class="report-confidence"','System metric strip is visible in the report mast.');
requireText(report,'report-evidence-check','Why-these-colors findings must use quiet checkmarks.');
requireText(app,'evidenceLines(stats,rec).map(cleanEvidence)','Evidence counts must be stripped before report rendering.');
requireText(app,'(?:across|from|in)','Evidence cleanup must handle “across 3 checks” wording.');

console.log('✓ Tinter UI and report contracts passed.');