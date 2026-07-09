import sys
import re

with open('diff_output_utf8.txt', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

current_file = None
changes = {}

for line in lines:
    if line.startswith('diff --git'):
        # regex to capture the b/ path which is the current workspace path
        match = re.search(r'\"b/(.*?)\"', line)
        if not match:
            # try without quotes
            match = re.search(r' b/(.*?)$', line)
            
        if match:
            raw_path = match.group(1).strip()
            # extract just the relative src path
            if 'src/' in raw_path:
                current_file = raw_path.split('src/')[-1]
            else:
                current_file = raw_path
            
            changes[current_file] = {'added': 0, 'removed': 0, 'lines': []}
    elif current_file and line.startswith('+') and not line.startswith('+++'):
        changes[current_file]['added'] += 1
    elif current_file and line.startswith('-') and not line.startswith('---'):
        changes[current_file]['removed'] += 1

with open('diff_summary.md', 'w', encoding='utf-8') as out:
    for f, stats in changes.items():
        if stats['added'] > 0 or stats['removed'] > 0:
            out.write(f'### {f}\n')
            out.write(f'**Downloads Branch had {stats["removed"]} lines removed and {stats["added"]} lines added compared to current workspace.**\n\n')
