import glob
import pathlib
import re

files = glob.glob(r"c:/WORKING_PLACE/CODE_R/sampleA/docs/htmls/*.html")
text = pathlib.Path(files[0]).read_text(encoding="utf-8", errors="replace")

# Extract from root to footer start
start = text.find('<div id="root">')
end = text.find('<footer')
chunk = text[start:end]
pretty = re.sub(r"><", ">\n<", chunk)
out = pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/account-full.txt")
out.write_text(pretty, encoding="utf-8")
print("wrote", len(pretty))

# Also extract CSS variables related to brand/primary from css file
css_files = glob.glob(r"c:/WORKING_PLACE/CODE_R/sampleA/docs/htmls/*_files/*.css")
for c in css_files:
    print("css", c, pathlib.Path(c).stat().st_size)

css = pathlib.Path([c for c in css_files if "index-" in c][0]).read_text(encoding="utf-8", errors="replace")
# find :root or --primary
for pat in ["--primary", "--brand", "--background", "--muted", "--destructive", "--card", "gradient-primary", "bg-brand"]:
    i = css.find(pat)
    print(pat, i)

# extract :root block
m = re.search(r":root\{[^}]+\}", css)
if m:
    pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/css-root.txt").write_text(m.group(0), encoding="utf-8")
    print("root len", len(m.group(0)))

# dark/theme variants
for m in re.finditer(r"\{--[^}]{20,800}\}", css):
    s = m.group(0)
    if "--primary" in s and "hsl" in s:
        pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/css-primary-block.txt").write_text(s[:2000], encoding="utf-8")
        print("found primary block", len(s))
        break
