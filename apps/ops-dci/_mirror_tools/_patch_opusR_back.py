# -*- coding: utf-8 -*-
from pathlib import Path

js = Path(__file__).resolve().parents[1] / "mirror" / "static" / "js" / "opusRdetails-BcBlhLGL.js"
t = js.read_text(encoding="utf-8")

# 1) wire useRouter + goBack
old_setup = "const D=vs();ms();const b=ls(!0),e=ls({}),v=_s([]),"
new_setup = (
    "const D=vs(),rt=ms();"
    "const b=ls(!0),e=ls({}),v=_s([]);"
    'function zq(){rt.push("/dciCodeManage/allocation")}'
    "const __keep=0,"  # broken - don't
)

# Cleaner: replace only the router part, then insert function before is=
if "function zq()" not in t:
    if "const D=vs();ms();" not in t:
        raise SystemExit("router init not found")
    t = t.replace("const D=vs();ms();", "const D=vs(),rt=ms();", 1)
    # Insert goBack after v=_s([]), before is=
    needle = "v=_s([]),is=bs("
    if needle not in t:
        # maybe already became v=_s([]);...
        raise SystemExit("is=bs chain not found")
    t = t.replace(
        needle,
        'v=_s([]);function zq(){rt.push("/dciCodeManage/allocation")}const is=bs(',
        1,
    )
    print("patched setup + zq")
else:
    print("setup already patched")

# 2) title bar back button
old_title = 's("div",Bs,[l[1]||(l[1]=s("span",{class:"title-text"},"DCI码详情",-1)),'
new_title = (
    's("div",Bs,[d(cs,{onClick:zq,icon:"ArrowLeft",class:"back-btn"},'
    '{default:r(()=>[...l[55]||(l[55]=[f("返回",-1)])]),_:1}),'
    'l[1]||(l[1]=s("span",{class:"title-text"},"DCI码详情",-1)),'
)
if 'icon:"ArrowLeft"' in t and "back-btn" in t:
    print("title already has back button")
elif old_title not in t:
    idx = t.find('s("div",Bs,[')
    raise SystemExit("title not found; snippet=" + repr(t[idx : idx + 200]))
else:
    t = t.replace(old_title, new_title, 1)
    print("patched title")

# 3) ensure el-button (cs) is declared before title uses it —
# In render: const u=...; ... cs=c("el-button") ...; return ... d(cs...
# Title is inside return after consts — OK.

js.write_text(t, encoding="utf-8")

# Verify syntax-ish
t2 = js.read_text(encoding="utf-8")
assert "rt=ms()" in t2
assert "function zq()" in t2
assert "back-btn" in t2
assert 'f("返回",-1)' in t2
# ensure is=bs still exists
assert "is=bs(" in t2 or "const is=bs(" in t2
print("ok", js)
