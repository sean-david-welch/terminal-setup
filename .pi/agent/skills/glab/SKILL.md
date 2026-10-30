---
name: glab
description: Fetch MR diff comments with file and line context using glab CLI
allowed-tools: [Bash]
---

Fetch all diff comments on the current branch's MR and display with file/line context.

Run this command and show the results:

```bash
glab mr note list -F json | python3 -c "
import json, sys
data = json.load(sys.stdin)
comments = []
for thread in data:
    for note in thread['notes']:
        if note.get('type') == 'DiffNote' and note.get('position'):
            pos = note['position']
            comments.append({
                'file': pos.get('new_path'),
                'line': pos.get('new_line'),
                'author': note['author']['username'],
                'resolved': note['resolved'],
                'body': note['body'],
            })

for c in comments:
    status = 'RESOLVED' if c['resolved'] else 'OPEN'
    print(f\"[{status}] {c['file']}:{c['line']} ({c['author']})\")
    print(c['body'])
    print()
"
```

After showing the output, summarize: which files have open comments, what the reviewer is asking for, and what action is needed.
