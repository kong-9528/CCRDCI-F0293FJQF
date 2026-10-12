"""从 docx 提取结构化文本：标题层级 + 段落 + 表格（保留格式骨架）。
用法: python _docx_dump.py <docx路径> [输出txt路径]
"""
import sys
import zipfile
import re
from xml.etree import ElementTree as ET

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'


def para_text(p):
    parts = []
    for node in p.iter():
        tag = node.tag
        if tag == W + 't':
            parts.append(node.text or '')
        elif tag == W + 'tab':
            parts.append('\t')
        elif tag == W + 'br':
            parts.append(' ')
    return ''.join(parts)


def para_style(p):
    pPr = p.find(W + 'pPr')
    if pPr is None:
        return None
    st = pPr.find(W + 'pStyle')
    if st is not None:
        return st.get(W + 'val')
    return None


def outline_level(p):
    """返回 outlineLvl 值（0-based）或 None"""
    pPr = p.find(W + 'pPr')
    if pPr is None:
        return None
    ol = pPr.find(W + 'outlineLvl')
    if ol is not None:
        try:
            return int(ol.get(W + 'val'))
        except (TypeError, ValueError):
            return None
    return None


def heading_level(p):
    st = para_style(p) or ''
    m = re.match(r'(?i)^[Hh]eading(\d)$', st)
    if m:
        return int(m.group(1))
    m = re.match(r'(?i)^(\d)$', st)
    if m:
        return int(m.group(1))
    ol = outline_level(p)
    if ol is not None:
        return ol + 1
    return None


def dump(path, out):
    z = zipfile.ZipFile(path)
    xml = z.read('word/document.xml')
    root = ET.fromstring(xml)
    body = root.find(W + 'body')

    lines = []

    def walk(el):
        for child in el:
            tag = child.tag
            if tag == W + 'p':
                txt = para_text(child).strip()
                lvl = heading_level(child)
                if lvl:
                    lines.append('\n' + '#' * min(lvl, 6) + ' ' + txt)
                elif txt:
                    lines.append(txt)
                else:
                    lines.append('')
            elif tag == W + 'tbl':
                lines.append('\n<<TABLE>>')
                for tr in child.findall(W + 'tr'):
                    cells = []
                    for tc in tr.findall(W + 'tc'):
                        ct = []
                        for p in tc.findall(W + 'p'):
                            t = para_text(p).strip()
                            if t:
                                ct.append(t)
                        cells.append(' / '.join(ct))
                    lines.append('| ' + ' | '.join(cells) + ' |')
                lines.append('<<END TABLE>>\n')
            else:
                walk(child)

    walk(body)

    text = '\n'.join(lines)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(text)
    print('WROTE', out, len(text), 'chars')


if __name__ == '__main__':
    dump(sys.argv[1], sys.argv[2])
