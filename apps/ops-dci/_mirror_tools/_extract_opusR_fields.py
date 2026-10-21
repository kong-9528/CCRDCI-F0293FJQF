# -*- coding: utf-8 -*-
from pathlib import Path
import re
import json

js = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\ops-dci\mirror\static\js\opusRdetails-BcBlhLGL.js"
).read_text(encoding="utf-8")
out = Path(__file__).with_name("_opusR_fields.json")

# All identifier accesses after optional chaining from e.value
# Patterns like: e.value.foo, (e.value.bar)==null?void 0:X.baz
props = set(re.findall(r"e\.value\.([A-Za-z0-9_]+)", js))
# nested like T.opusName where T comes from dciCodeOpusBaseRinfo
nested = set(re.findall(r"\)\?\?\.\s*([A-Za-z0-9_]+)", js))
# more: ==null?void 0:X.prop
nested2 = set(re.findall(r"void 0:([A-Za-z])\.([A-Za-z0-9_]+)", js))
# map short vars - hard. Just dump long property names in source
long_props = sorted(set(re.findall(r"[A-Za-z][A-Za-z0-9_]{4,}", js)))
# filter camelCase-ish domain names
domain = [
    p
    for p in long_props
    if any(
        k in p.lower()
        for k in [
            "dci",
            "opus",
            "owner",
            "right",
            "reg",
            "chain",
            "sample",
            "revoke",
            "apply",
            "file",
            "hash",
            "time",
            "name",
            "type",
            "status",
            "code",
            "nature",
            "place",
            "date",
            "phone",
            "contact",
            "cert",
            "scope",
            "wish",
            "entrust",
            "author",
            "sign",
            "category",
            "create",
            "publish",
            "sync",
            "platform",
            "org",
        ]
    )
]

# Extract more precise from template: .prop)||"-"
precise = sorted(set(re.findall(r"\.([A-Za-z][A-Za-z0-9_]*)\)\|\|\"-\"", js)))
precise2 = sorted(set(re.findall(r"\.([A-Za-z][A-Za-z0-9_]*)\|\|\"-\"", js)))

result = {
    "e_value_props": sorted(props),
    "precise_dash": precise + precise2,
    "domain_idents": domain[:200],
    "owner_array": "dciOpusRightOwnerRinfos" in js,
}

# Get full context around dciCodeOpusBaseRinfo usages
ctxs = []
for m in re.finditer(r"dciCodeOpusBaseRinfo[\s\S]{0,80}", js):
    ctxs.append(m.group(0)[:100])
result["base_ctx"] = ctxs[:20]

for key in [
    "dciOpusRightOwnerRinfos",
    "dciCodeOpusRightRinfo",
    "dciCodeOpusRelatedRinfos",
    "dciCodeOpusChainRinfo",
    "dciCodeOpusSampleRinfo",
    "dciCodeOpusRevokeRinfo",
    "relatedDci",
]:
    result[key] = key in js

out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print("wrote", out)
print("e_value", result["e_value_props"])
print("precise", result["precise_dash"][:40])
