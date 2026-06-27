kit_css+='.prop-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.prop-tag{border:1px solid var(--line);border-radius:999px;background:rgba(255,253,248,.72);color:var(--cocoa);padding:7px 10px;font-size:12px;font-weight:900}\n\n'
s=re.sub(r'\.method-list \{.*?\.method-item p \{ margin: 2px 0 0; color: var\(--muted\); \}\n\n',kit_css,s,flags=re.S)
