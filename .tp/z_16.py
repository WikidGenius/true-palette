p.write_text(s)
import shutil
for x in ['notes.txt','script-check.js','assets/main.css']:
    Path(x).unlink(missing_ok=True)
shutil.rmtree('assets',ignore_errors=True)
