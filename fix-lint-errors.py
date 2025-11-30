#!/usr/bin/env python3
"""
Script to fix common lint errors in the weather app
"""

import re
import os

# Define files and their fixes
fixes = {
    r"app/(main)/sign-in/page.tsx": [
        {
            "pattern": r'import Link from "next/link";\n',
            "replacement": "",
            "description": "Remove unused Link import"
        }
    ],
    r"app/actions/synoptic-code-data.ts": [
        {
            "pattern": r"(\(.*?:\s*)any(\s*\))",
            "replacement": r"\1unknown\2",
            "description": "Replace any with unknown",
            "count": 2
        }
    ],
    r"app/api/auth/sign-in/route.ts": [
        {
            "pattern": r"@ts-ignore",
            "replacement": "@ts-expect-error",
            "description": "Replace @ts-ignore with @ts-expect-error",
            "count": 4
        }
    ],
    r"lib/generateSynopticCode.ts": [
        {
            "pattern": r"let (conVertMinTemp|lowFormSig|mediumFormSig|highFormSig|lowAmountSig|mediumAmountSig|highAmountSig|lowHeightSig|mediumHeightSig|highHeightSig)",
            "replacement": r"const \1",
            "description": "Change let to const for never-reassigned variables",
            "count": 10
        }
    ]
}

def fix_file(filepath, file_fixes):
    """Fix a single file"""
    full_path = os.path.join(r"e:\weather\next_update\weather-updated", filepath)
    
    if not os.path.exists(full_path):
        print(f"File not found: {full_path}")
        return False
    
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for fix in file_fixes:
            pattern = fix["pattern"]
            replacement = fix["replacement"]
            count = fix.get("count", 1)
            
            if count == 1:
                content = re.sub(pattern, replacement, content, count=1)
            else:
                content = re.sub(pattern, replacement, content)
            
            print(f"  ✓ {fix['description']}")
        
        if content != original_content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Fixed: {filepath}\n")
            return True
        else:
            print(f"⚠ No changes made: {filepath}\n")
            return False
    
    except Exception as e:
        print(f"✗ Error fixing {filepath}: {e}\n")
        return False

# Apply fixes
print("Starting lint error fixes...\n")
for filepath, file_fixes in fixes.items():
    print(f"Processing: {filepath}")
    fix_file(filepath, file_fixes)

print("Done!")
