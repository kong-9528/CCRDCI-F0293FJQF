# -*- coding: utf-8 -*-
"""Build GET /dci/applyDoc/opus/rInfo/{id} mocks from existing dciCodeDetail + cursorList."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\ops-dci\mirror\static\js")
STORE_JSON = ROOT / "ops-mock-store.json"
STORE_JS = ROOT / "ops-mock-store.js"
OUT_LOG = Path(__file__).with_name("_opus_rinfo_build.txt")


def ok100(data):
    return {"code": 1000000, "msg": "成功", "data": data, "success": True, "traceId": "", "timestamp": ""}


def enrich_detail(detail: dict, list_row: dict | None = None) -> dict:
    d = deepcopy(detail) if detail else {}
    base = d.setdefault("dciCodeOpusBaseRinfo", {})
    opus = d.setdefault("dciOpusBaseRinfo", {})
    if list_row:
        base.setdefault("dciCode", list_row.get("dciCode"))
        base.setdefault("dciApplyTime", list_row.get("dciApplyTime"))
        base.setdefault("registerName", list_row.get("registerName"))
        base.setdefault("applyOrgName", list_row.get("applyOrgName"))
        base.setdefault("dciCodeTypeName", "原始分配")
        opus.setdefault("opusName", list_row.get("caseName"))
        if list_row.get("caseCategoryCode") == 200:
            opus.setdefault("opusCategoryName", "摄影作品")
        else:
            opus.setdefault("opusCategoryName", opus.get("opusCategoryName") or "文字作品")

    opus.setdefault("firstPublishDate", None)
    opus.setdefault("firstAddress", None)
    opus.setdefault("publishStatusDesc", opus.get("publishStatusDesc") or "未发表")

    chain = d.setdefault("dciOpusBlockchainRinfo", {})
    chain.setdefault("blockTime", chain.get("blockTime") or "2026-08-20")
    chain.setdefault("sdatahash", chain.get("sdatahash") or "0xmockhash" + str(hash(base.get("dciCode") or "x") % 10**12))

    d.setdefault(
        "dciOpusRightRinfo",
        {
            "methodAcquiringRights": "原始取得",
            "methodOwnershipRights": "单独所有",
            "rightsScope": "全部权利",
        },
    )

    owners = d.get("dciOpusRightOwnerRinfos") or []
    for o in owners:
        o.setdefault("rightOwnerTypeDesc", "个人")
        o.setdefault("rightOwnerRegion", "中国大陆")
        # UI uses public*Url for links
        if o.get("cardFrontUrl") and not o.get("publicCardFrontUrl"):
            o["publicCardFrontUrl"] = "/" + str(o["cardFrontUrl"]).lstrip("/")
        if o.get("cardBackUrl") and not o.get("publicCardBackUrl"):
            o["publicCardBackUrl"] = "/" + str(o["cardBackUrl"]).lstrip("/")
        o.setdefault("cardFrontName", o.get("cardFrontName") or "证件正面照")
        o.setdefault("cardBackName", o.get("cardBackName") or "证件反面照")
    d["dciOpusRightOwnerRinfos"] = owners

    if not d.get("dciOpusSampleRinfos"):
        d["dciOpusSampleRinfos"] = [
            {
                "attachmentName": (opus.get("opusName") or "作品") + "-样本.pdf",
                "publicAttachmentUrl": "/static/mock/opus-sample-demo.pdf",
                "sampleSummary": "演示作品样本摘要（mock）",
            }
        ]
    else:
        for s in d["dciOpusSampleRinfos"]:
            if s.get("attachmentUrl") and not s.get("publicAttachmentUrl"):
                s["publicAttachmentUrl"] = "/" + str(s["attachmentUrl"]).lstrip("/")
            s.setdefault("sampleSummary", s.get("sampleSummary") or "-")

    # related DCI list (may be empty)
    d.setdefault("dciLinkInfoVO", [])

    # revoke only when status revoked — leave null for normal
    d.setdefault("dciOpusRevokeRinfo", None)

    reg = d.setdefault("dciOpusRegisterRinfo", {})
    if list_row and list_row.get("relatedRegNo"):
        reg.setdefault("registerNo", list_row["relatedRegNo"])

    return d


def main():
    store = json.loads(STORE_JSON.read_text(encoding="utf-8"))
    lines = []

    # index dciCodeDetail by code
    by_code: dict[str, dict] = {}
    for k, v in store.items():
        if "dciCodeDetail/" not in k:
            continue
        if not isinstance(v, dict):
            continue
        data = v.get("data") or {}
        detail = data.get("detail") or {}
        code = (
            (detail.get("dciCodeOpusBaseRinfo") or {}).get("dciCode")
            or k.split("dciCodeDetail/")[-1]
        )
        code = code.replace("%3A", ":")
        try:
            from urllib.parse import unquote

            code = unquote(code)
        except Exception:
            pass
        by_code[code] = detail
        lines.append(f"detail_code={code}")

    cursor = store.get("POST /api/v1/dciManage/dci/applyDoc/cursorList") or {}
    rows = ((cursor.get("data") or {}).get("rows")) or []
    added = 0

    # Prefer opus R rows for works tab
    for row in rows:
        if str(row.get("dciCodeType") or "").upper() != "R":
            continue
        # soft rows may still appear in shared list; skip non-opus for rInfo
        if str(row.get("caseType") or "opus") not in ("opus", "OPUS"):
            # still allow if we have opus detail for that code
            pass
        rid = str(row.get("id") or row.get("docId") or "")
        code = str(row.get("dciCode") or "")
        if not rid:
            continue
        detail = by_code.get(code) or next(iter(by_code.values()), {})
        # If caseType is soft, still map but only opus rows primarily
        if row.get("caseType") == "soft" and code not in by_code:
            continue
        payload = ok100(enrich_detail(detail, row))
        for key in (
            f"GET /api/v1/dciManage/dci/applyDoc/opus/rInfo/{rid}",
            f"GET /dci/applyDoc/opus/rInfo/{rid}",
        ):
            store[key] = payload
            added += 1
            lines.append(f"add {key}")

    # Alias for remote demo id in user URL
    alias_id = "1792405697941"
    if f"GET /api/v1/dciManage/dci/applyDoc/opus/rInfo/{alias_id}" not in store:
        # use first opus R detail
        first = next(
            (
                r
                for r in rows
                if str(r.get("dciCodeType")).upper() == "R"
                and str(r.get("caseType") or "opus") == "opus"
            ),
            rows[0] if rows else None,
        )
        if first:
            code = first.get("dciCode")
            detail = by_code.get(code) or next(iter(by_code.values()), {})
            payload = ok100(enrich_detail(detail, first))
            store[f"GET /api/v1/dciManage/dci/applyDoc/opus/rInfo/{alias_id}"] = payload
            store[f"GET /dci/applyDoc/opus/rInfo/{alias_id}"] = payload
            added += 2
            lines.append(f"alias {alias_id} -> {first.get('id')} {code}")

    STORE_JSON.write_text(json.dumps(store, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    STORE_JS.write_text(
        "window.__OPS_MOCK_STORE__ = " + json.dumps(store, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    lines.append(f"added_keys={added}")
    OUT_LOG.write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines[-20:]))


if __name__ == "__main__":
    main()
