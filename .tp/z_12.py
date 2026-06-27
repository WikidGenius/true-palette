def add(title,note):
    global s
    old=f'<div class="field-title">{title}</div>\n        <div class="choices">'
    new=f'<div class="field-title">{title}</div>\n        <p class="test-instruction">{note}</p>\n        <div class="choices">'
    s=s.replace(old,new)
