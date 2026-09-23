/**
 * Wrap plain-text ® as <sup class="a-tm"> for superscript display.
 * Safe for Vue SPA mirrors; skips inputs and already-marked nodes.
 */
(function () {
  var MARK = "\u00AE";
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION|CODE|PRE|SVG|NOSCRIPT)$/i;

  function isMarked(el) {
    return !!(el && el.closest && el.closest("sup.a-tm, .a-tm, .tc-hero__reg"));
  }

  function wrapTextNode(textNode) {
    var parent = textNode.parentNode;
    if (!parent || parent.nodeType !== 1) return;
    if (SKIP.test(parent.nodeName) || isMarked(parent)) return;
    if (parent.nodeName === "SUP") return;
    var text = textNode.nodeValue;
    if (!text || text.indexOf(MARK) === -1) return;

    var frag = document.createDocumentFragment();
    var parts = text.split(MARK);
    for (var i = 0; i < parts.length; i++) {
      if (parts[i]) frag.appendChild(document.createTextNode(parts[i]));
      if (i < parts.length - 1) {
        var sup = document.createElement("sup");
        sup.className = "a-tm";
        sup.textContent = MARK;
        frag.appendChild(sup);
      }
    }
    parent.replaceChild(frag, textNode);
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) {
      wrapTextNode(root);
      return;
    }
    if (root.nodeType !== 1) return;
    if (SKIP.test(root.nodeName) || isMarked(root)) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (var i = 0; i < nodes.length; i++) wrapTextNode(nodes[i]);
  }

  function start() {
    if (!document.body) return;
    walk(document.body);
    var obs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type !== "childList") continue;
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          if (n.nodeType === 3) wrapTextNode(n);
          else if (n.nodeType === 1) walk(n);
        }
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
