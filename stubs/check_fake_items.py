"""Flag category, item_type, colors and area values not in the contract's Section 4 lists.

Run from the repo root: python3 stubs/check_fake_items.py
"""
import json
import re
import sys

CONTRACT = "docs/foundyou-tool-contract.md"
DATA = "stubs/foundyou-fake-items.json"

# Read the bullet lists under each "### " heading of Section 4.
lists, current, in_section4 = {}, None, False
for line in open(CONTRACT, encoding="utf-8"):
    if line.startswith("## "):
        in_section4 = line.startswith("## 4.")
    elif in_section4 and line.startswith("### "):
        m = re.search(r"`(\w+)`", line)
        current = m.group(1) if m else None
        if current:
            lists[current] = set()
    elif in_section4 and current and line.startswith("- "):
        lists[current].add(line[2:].strip())

bad = []
for item in json.load(open(DATA, encoding="utf-8")):
    pub = item["public"]
    checks = [("category", [pub["category"]]), ("item_type", [pub["item_type"]]),
              ("colors", pub["colors"]), ("area", [pub["area"]])]
    for field, values in checks:
        for v in values:
            if v not in lists.get(field, set()):
                bad.append(f"{pub['id']}: {field} = {v!r}")

print("\n".join(bad))
sys.exit(1 if bad else 0)
