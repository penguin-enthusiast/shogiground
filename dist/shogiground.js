"use strict";
var Shogiground = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default
  });

  // src/constants.ts
  var colors = ["sente", "gote"];
  var files = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16"
  ];
  var ranks = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p"
  ];
  var allKeys = Array.prototype.concat(
    ...ranks.map((r) => files.map((f) => f + r))
  );

  // src/util.ts
  var pos2key = (pos) => allKeys[pos[0] + 16 * pos[1]];
  var key2pos = (k) => {
    if (k.length > 2) return [k.charCodeAt(1) - 39, k.charCodeAt(2) - 97];
    else return [k.charCodeAt(0) - 49, k.charCodeAt(1) - 97];
  };
  function memo(f) {
    let v;
    const ret = () => {
      if (v === void 0) v = f();
      return v;
    };
    ret.clear = () => {
      v = void 0;
    };
    return ret;
  }
  function callUserFunction(f, ...args) {
    if (f) setTimeout(() => f(...args), 1);
  }
  var opposite = (c) => c === "sente" ? "gote" : "sente";
  var sentePov = (o) => o === "sente";
  var distanceSq = (pos1, pos2) => {
    const dx = pos1[0] - pos2[0], dy = pos1[1] - pos2[1];
    return dx * dx + dy * dy;
  };
  var samePiece = (p1, p2) => p1.role === p2.role && p1.color === p2.color;
  var posToTranslateBase = (pos, dims, asSente, xFactor, yFactor) => [
    (asSente ? dims.files - 1 - pos[0] : pos[0]) * xFactor,
    (asSente ? pos[1] : dims.ranks - 1 - pos[1]) * yFactor
  ];
  var posToTranslateAbs = (dims, bounds) => {
    const xFactor = bounds.width / dims.files, yFactor = bounds.height / dims.ranks;
    return (pos, asSente) => posToTranslateBase(pos, dims, asSente, xFactor, yFactor);
  };
  var posToTranslateRel = (dims) => (pos, asSente) => posToTranslateBase(pos, dims, asSente, 100, 100);
  var translateAbs = (el, pos, scale) => {
    el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${scale}`;
  };
  var translateRel = (el, percents, scaleFactor, scale) => {
    el.style.transform = `translate(${percents[0] * scaleFactor}%,${percents[1] * scaleFactor}%) scale(${scale || scaleFactor})`;
  };
  var setDisplay = (el, v) => {
    el.style.display = v ? "" : "none";
  };
  var eventPosition = (e) => {
    var _a;
    if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY];
    if ((_a = e.targetTouches) == null ? void 0 : _a[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    return;
  };
  var isRightButton = (e) => e.buttons === 2 || e.button === 2;
  var isMiddleButton = (e) => e.buttons === 4 || e.button === 1;
  var createEl = (tagName, className) => {
    const el = document.createElement(tagName);
    if (className) el.className = className;
    return el;
  };
  function pieceNameOf(piece) {
    return `${piece.color} ${piece.role}`;
  }
  function isPieceNode(el) {
    return el.tagName === "PIECE";
  }
  function isSquareNode(el) {
    return el.tagName === "SQ";
  }
  function computeSquareCenter(key, asSente, dims, bounds) {
    const pos = key2pos(key);
    if (asSente) {
      pos[0] = dims.files - 1 - pos[0];
      pos[1] = dims.ranks - 1 - pos[1];
    }
    return [
      bounds.left + bounds.width * pos[0] / dims.files + bounds.width / (dims.files * 2),
      bounds.top + bounds.height * (dims.ranks - 1 - pos[1]) / dims.ranks + bounds.height / (dims.ranks * 2)
    ];
  }
  function domSquareIndexOfKey(key, asSente, dims) {
    const pos = key2pos(key);
    let index = dims.files - 1 - pos[0] + pos[1] * dims.files;
    if (!asSente) index = dims.files * dims.ranks - 1 - index;
    return index;
  }
  function isInsideRect(rect, pos) {
    return rect.left <= pos[0] && rect.top <= pos[1] && rect.left + rect.width > pos[0] && rect.top + rect.height > pos[1];
  }
  function getKeyAtDomPos(pos, asSente, dims, bounds) {
    let file = Math.floor(dims.files * (pos[0] - bounds.left) / bounds.width);
    if (asSente) file = dims.files - 1 - file;
    let rank = Math.floor(dims.ranks * (pos[1] - bounds.top) / bounds.height);
    if (!asSente) rank = dims.ranks - 1 - rank;
    return file >= 0 && file < dims.files && rank >= 0 && rank < dims.ranks ? pos2key([file, rank]) : void 0;
  }
  function getSqElAtKey(key, state) {
    const boardEls = state.dom.elements.board;
    if (boardEls) {
      const squaresEl = boardEls.squares;
      let sqEl = squaresEl.firstElementChild;
      while (sqEl && isSquareNode(sqEl)) {
        if (sqEl.sgKey === key) {
          return sqEl;
        }
        sqEl = sqEl.nextElementSibling;
      }
    }
    return void 0;
  }
  function getHandPieceAtDomPos(pos, roles, bounds) {
    for (const color of colors) {
      for (const role of roles) {
        const piece = { color, role }, pieceRect = bounds.get(pieceNameOf(piece));
        if (pieceRect && isInsideRect(pieceRect, pos)) return piece;
      }
    }
    return;
  }
  function posOfOutsideEl(left, top, asSente, dims, boardBounds) {
    const sqW = boardBounds.width / dims.files, sqH = boardBounds.height / dims.ranks;
    if (!sqW || !sqH) return;
    let xOff = (left - boardBounds.left) / sqW;
    if (asSente) xOff = dims.files - 1 - xOff;
    let yOff = (top - boardBounds.top) / sqH;
    if (!asSente) yOff = dims.ranks - 1 - yOff;
    return [xOff, yOff];
  }

  // src/hands.ts
  function addToHand(s, piece, cnt = 1) {
    const hand = s.hands.handMap.get(piece.color), role = (s.hands.roles.includes(piece.role) ? piece.role : s.promotion.unpromotesTo(piece.role)) || piece.role;
    if (hand && s.hands.roles.includes(role)) hand.set(role, (hand.get(role) || 0) + cnt);
  }
  function removeFromHand(s, piece, cnt = 1) {
    const hand = s.hands.handMap.get(piece.color), role = (s.hands.roles.includes(piece.role) ? piece.role : s.promotion.unpromotesTo(piece.role)) || piece.role, num = hand == null ? void 0 : hand.get(role);
    if (hand && num) hand.set(role, Math.max(num - cnt, 0));
  }
  function renderHand(s, handEl) {
    var _a;
    handEl.classList.toggle("promotion", !!s.promotion.current);
    let wrapEl = handEl.firstElementChild;
    while (wrapEl) {
      const pieceEl = wrapEl.firstElementChild, piece = { role: pieceEl.sgRole, color: pieceEl.sgColor }, num = ((_a = s.hands.handMap.get(piece.color)) == null ? void 0 : _a.get(piece.role)) || 0, isSelected = !!s.selectedPiece && samePiece(piece, s.selectedPiece) && !s.droppable.spare;
      wrapEl.classList.toggle(
        "selected",
        (s.activeColor === "both" || s.activeColor === s.turnColor) && isSelected
      );
      wrapEl.classList.toggle(
        "preselected",
        s.activeColor !== "both" && s.activeColor !== s.turnColor && isSelected
      );
      wrapEl.classList.toggle(
        "last-dest",
        s.highlight.lastDests && !!s.lastPiece && samePiece(piece, s.lastPiece)
      );
      wrapEl.classList.toggle("drawing", !!s.drawable.piece && samePiece(s.drawable.piece, piece));
      wrapEl.classList.toggle(
        "current-pre",
        !!s.predroppable.current && samePiece(s.predroppable.current.piece, piece)
      );
      wrapEl.dataset.nb = num.toString();
      wrapEl = wrapEl.nextElementSibling;
    }
  }

  // src/render.ts
  function render(s, boardEls) {
    var _a, _b, _c;
    const asSente = sentePov(s.orientation), scaleDown = s.scaleDownPieces ? 0.5 : 1, posToTranslate = posToTranslateRel(s.dimensions), squaresEl = boardEls.squares, piecesEl = boardEls.pieces, draggedEl = boardEls.dragged, squareOverEl = boardEls.squareOver, promotionEl = boardEls.promotion, pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : /* @__PURE__ */ new Map(), fadings = curAnim ? curAnim.plan.fadings : /* @__PURE__ */ new Map(), promotions = curAnim ? curAnim.plan.promotions : /* @__PURE__ */ new Map(), curDrag = s.draggable.current, curPromKey = ((_a = s.promotion.current) == null ? void 0 : _a.dragged) ? s.selected : void 0, squares = computeSquareClasses(s), samePieces = /* @__PURE__ */ new Set(), movedPieces = /* @__PURE__ */ new Map();
    if (!curDrag && (draggedEl == null ? void 0 : draggedEl.sgDragging)) {
      draggedEl.sgDragging = false;
      setDisplay(draggedEl, false);
      if (squareOverEl) setDisplay(squareOverEl, false);
    }
    let k, el, pieceAtKey, elPieceName, anim2, fading, prom, pMvdset, pMvd;
    el = piecesEl.firstElementChild;
    while (el) {
      if (isPieceNode(el)) {
        k = el.sgKey;
        pieceAtKey = pieces.get(k);
        anim2 = anims.get(k);
        fading = fadings.get(k);
        prom = promotions.get(k);
        elPieceName = pieceNameOf({ color: el.sgColor, role: el.sgRole });
        if (((curDrag == null ? void 0 : curDrag.started) && ((_b = curDrag.fromBoard) == null ? void 0 : _b.orig) === k || curPromKey && curPromKey === k) && !el.sgGhost) {
          el.sgGhost = true;
          el.classList.add("ghost");
        } else if (el.sgGhost && (!curDrag || ((_c = curDrag.fromBoard) == null ? void 0 : _c.orig) !== k) && (!curPromKey || curPromKey !== k)) {
          el.sgGhost = false;
          el.classList.remove("ghost");
        }
        if (!fading && el.sgFading) {
          el.sgFading = false;
          el.classList.remove("fading");
        }
        if (pieceAtKey) {
          if (anim2 && el.sgAnimating && (elPieceName === pieceNameOf(pieceAtKey) || prom && elPieceName === pieceNameOf(prom))) {
            const pos = key2pos(k);
            pos[0] += anim2[2];
            pos[1] += anim2[3];
            translateRel(el, posToTranslate(pos, asSente), scaleDown);
          } else if (el.sgAnimating) {
            el.sgAnimating = false;
            el.classList.remove("anim");
            translateRel(el, posToTranslate(key2pos(k), asSente), scaleDown);
          }
          if (elPieceName === pieceNameOf(pieceAtKey) && (!fading || !el.sgFading)) {
            samePieces.add(k);
          } else {
            if (fading && elPieceName === pieceNameOf(fading)) {
              el.sgFading = true;
              el.classList.add("fading");
            } else if (prom && elPieceName === pieceNameOf(prom)) {
              samePieces.add(k);
            } else {
              appendValue(movedPieces, elPieceName, el);
            }
          }
        } else {
          appendValue(movedPieces, elPieceName, el);
        }
      }
      el = el.nextElementSibling;
    }
    let sqEl = squaresEl.firstElementChild;
    while (sqEl && isSquareNode(sqEl)) {
      sqEl.className = squares.get(sqEl.sgKey) || "";
      sqEl = sqEl.nextElementSibling;
    }
    for (const [k2, p] of pieces) {
      const piece = promotions.get(k2) || p;
      anim2 = anims.get(k2);
      if (!samePieces.has(k2)) {
        pMvdset = movedPieces.get(pieceNameOf(piece));
        pMvd = pMvdset == null ? void 0 : pMvdset.pop();
        if (pMvd) {
          pMvd.sgKey = k2;
          if (pMvd.sgFading) {
            pMvd.sgFading = false;
            pMvd.classList.remove("fading");
          }
          const pos = key2pos(k2);
          if (anim2) {
            pMvd.sgAnimating = true;
            pMvd.classList.add("anim");
            pos[0] += anim2[2];
            pos[1] += anim2[3];
          }
          translateRel(pMvd, posToTranslate(pos, asSente), scaleDown);
        } else {
          const pieceNode = createEl("piece", pieceNameOf(p)), pos = key2pos(k2);
          pieceNode.sgColor = p.color;
          pieceNode.sgRole = p.role;
          pieceNode.sgKey = k2;
          if (anim2) {
            pieceNode.sgAnimating = true;
            pos[0] += anim2[2];
            pos[1] += anim2[3];
          }
          translateRel(pieceNode, posToTranslate(pos, asSente), scaleDown);
          piecesEl.appendChild(pieceNode);
        }
      }
    }
    for (const nodes of movedPieces.values()) {
      for (const node of nodes) {
        piecesEl.removeChild(node);
      }
    }
    if (promotionEl) renderPromotion(s, promotionEl);
  }
  function appendValue(map, key, value) {
    const arr = map.get(key);
    if (arr) arr.push(value);
    else map.set(key, [value]);
  }
  function computeSquareClasses(s) {
    var _a, _b;
    const squares = /* @__PURE__ */ new Map();
    if (s.lastDests && s.highlight.lastDests)
      for (const k of s.lastDests) addSquare(squares, k, "last-dest");
    if (s.checks && s.highlight.check)
      for (const check of s.checks) addSquare(squares, check, "check");
    if (s.hovered) addSquare(squares, s.hovered, "hover");
    if (s.selected) {
      if (s.activeColor === "both" || s.activeColor === s.turnColor)
        addSquare(squares, s.selected, "selected");
      else addSquare(squares, s.selected, "preselected");
      if (s.movable.showDests) {
        const dests = (_a = s.movable.dests) == null ? void 0 : _a.get(s.selected);
        if (dests)
          for (const k of dests) {
            addSquare(squares, k, "dest" + (s.pieces.has(k) ? " oc" : ""));
          }
        const pDests = s.premovable.dests;
        if (pDests)
          for (const k of pDests) {
            addSquare(squares, k, "pre-dest" + (s.pieces.has(k) ? " oc" : ""));
          }
      }
    } else if (s.selectedPiece) {
      if (s.droppable.showDests) {
        const dests = (_b = s.droppable.dests) == null ? void 0 : _b.get(pieceNameOf(s.selectedPiece));
        if (dests)
          for (const k of dests) {
            addSquare(squares, k, "dest");
          }
        const pDests = s.predroppable.dests;
        if (pDests)
          for (const k of pDests) {
            addSquare(squares, k, "pre-dest" + (s.pieces.has(k) ? " oc" : ""));
          }
      }
    }
    const premove = s.premovable.current;
    if (premove) {
      addSquare(squares, premove.orig, "current-pre");
      addSquare(squares, premove.dest, "current-pre" + (premove.prom ? " prom" : ""));
    } else if (s.predroppable.current)
      addSquare(
        squares,
        s.predroppable.current.key,
        "current-pre" + (s.predroppable.current.prom ? " prom" : "")
      );
    for (const sqh of s.drawable.squares) {
      addSquare(squares, sqh.key, sqh.className);
    }
    return squares;
  }
  function addSquare(squares, key, klass) {
    const classes = squares.get(key);
    if (classes) squares.set(key, `${classes} ${klass}`);
    else squares.set(key, klass);
  }
  function renderPromotion(s, promotionEl) {
    const cur = s.promotion.current, key = cur == null ? void 0 : cur.key, pieces = cur ? [cur.promotedPiece, cur.piece] : [], hash = promotionHash(!!cur, key, pieces);
    if (s.promotion.prevPromotionHash === hash) return;
    s.promotion.prevPromotionHash = hash;
    if (key) {
      const asSente = sentePov(s.orientation), initPos = key2pos(key), color = cur.piece.color, promotionSquare = createEl("sg-promotion-square"), promotionChoices = createEl("sg-promotion-choices");
      if (s.orientation !== color) promotionChoices.classList.add("reversed");
      translateRel(promotionSquare, posToTranslateRel(s.dimensions)(initPos, asSente), 1);
      for (const p of pieces) {
        const pieceNode = createEl("piece", pieceNameOf(p));
        pieceNode.sgColor = p.color;
        pieceNode.sgRole = p.role;
        promotionChoices.appendChild(pieceNode);
      }
      promotionEl.innerHTML = "";
      promotionSquare.appendChild(promotionChoices);
      promotionEl.appendChild(promotionSquare);
      setDisplay(promotionEl, true);
    } else {
      setDisplay(promotionEl, false);
    }
  }
  function promotionHash(active, key, pieces) {
    return [active, key, pieces.map((p) => pieceNameOf(p)).join(" ")].join(" ");
  }
  function renderSquareTimer(key, state) {
    const sqEl = getSqElAtKey(key, state);
    if (!sqEl) return;
    removeActiveTimer(sqEl);
    const timerComponent = createEl("div", "timer");
    timerComponent.addEventListener("animationend", () => {
      timerComponent.remove();
    });
    sqEl.appendChild(timerComponent);
  }
  function removeActiveTimer(sqEl) {
    const children = Array.from(sqEl.childNodes);
    for (const node of children) {
      if (node.className === "timer") {
        sqEl.removeChild(node);
        return;
      }
    }
  }

  // src/board.ts
  function toggleOrientation(state) {
    state.orientation = opposite(state.orientation);
    state.animation.current = state.draggable.current = state.promotion.current = state.hovered = state.selected = state.selectedPiece = void 0;
  }
  function reset(state) {
    unselect(state);
    unsetPremove(state);
    unsetPredrop(state);
    cancelPromotion(state);
    state.animation.current = state.draggable.current = state.hovered = void 0;
  }
  function setPieces(state, pieces) {
    for (const [key, piece] of pieces) {
      if (piece) state.pieces.set(key, piece);
      else state.pieces.delete(key);
    }
  }
  function setChecks(state, checksValue) {
    if (Array.isArray(checksValue)) {
      state.checks = checksValue;
    } else {
      if (checksValue === true) checksValue = state.turnColor;
      if (checksValue) {
        const checks = [];
        for (const [k, p] of state.pieces) {
          if (state.highlight.checkRoles.includes(p.role) && p.color === checksValue) checks.push(k);
        }
        state.checks = checks;
      } else state.checks = void 0;
    }
  }
  function setPremove(state, orig, dest, prom) {
    unsetPredrop(state);
    state.premovable.current = { orig, dest, prom };
    callUserFunction(state.premovable.events.set, orig, dest, prom);
  }
  function unsetPremove(state) {
    if (state.premovable.current) {
      state.premovable.current = void 0;
      callUserFunction(state.premovable.events.unset);
    }
  }
  function setPredrop(state, piece, key, prom) {
    unsetPremove(state);
    state.predroppable.current = { piece, key, prom };
    callUserFunction(state.predroppable.events.set, piece, key, prom);
  }
  function unsetPredrop(state) {
    if (state.predroppable.current) {
      state.predroppable.current = void 0;
      callUserFunction(state.predroppable.events.unset);
    }
  }
  function baseMove(state, orig, dest, prom) {
    const origPiece = state.pieces.get(orig), destPiece = state.pieces.get(dest);
    if (orig === dest || !origPiece) return false;
    const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : void 0, promPiece = prom && promotePiece(state, origPiece);
    if (dest === state.selected || orig === state.selected) unselect(state);
    state.pieces.set(dest, promPiece || origPiece);
    state.pieces.delete(orig);
    state.lastDests = [orig, dest];
    state.lastPiece = void 0;
    state.checks = void 0;
    if (isPieceCooldownEnabled(state)) {
      (promPiece || origPiece).lastMoved = Date.now();
      renderSquareTimer(dest, state);
    }
    callUserFunction(state.events.move, orig, dest, prom, captured);
    callUserFunction(state.events.change);
    return captured || true;
  }
  function baseDrop(state, piece, key, prom) {
    var _a;
    const pieceCount = ((_a = state.hands.handMap.get(piece.color)) == null ? void 0 : _a.get(piece.role)) || 0;
    if (!pieceCount && !state.droppable.spare) return false;
    const promPiece = prom && promotePiece(state, piece);
    if (key === state.selected || !state.droppable.spare && pieceCount === 1 && state.selectedPiece && samePiece(state.selectedPiece, piece))
      unselect(state);
    state.pieces.set(key, promPiece || piece);
    state.lastDests = [key];
    state.lastPiece = piece;
    state.checks = void 0;
    if (!state.droppable.spare) removeFromHand(state, piece);
    if (isPieceCooldownEnabled(state)) {
      piece.lastMoved = Date.now();
      renderSquareTimer(key, state);
    }
    callUserFunction(state.events.drop, piece, key, prom);
    callUserFunction(state.events.change);
    return true;
  }
  function baseUserMove(state, orig, dest, prom) {
    const result = baseMove(state, orig, dest, prom);
    if (result) {
      state.movable.dests = void 0;
      state.droppable.dests = void 0;
      state.turnColor = opposite(state.turnColor);
      state.animation.current = void 0;
    }
    return result;
  }
  function baseUserDrop(state, piece, key, prom) {
    const result = baseDrop(state, piece, key, prom);
    if (result) {
      state.movable.dests = void 0;
      state.droppable.dests = void 0;
      state.turnColor = opposite(state.turnColor);
      state.animation.current = void 0;
    }
    return result;
  }
  function userDrop(state, piece, key, prom) {
    const realProm = prom || state.promotion.forceDropPromotion(piece, key);
    if (canDrop(state, piece, key)) {
      const result = baseUserDrop(state, piece, key, realProm);
      if (result) {
        unselect(state);
        callUserFunction(state.droppable.events.after, piece, key, realProm, { premade: false });
        return true;
      }
    } else if (canPredrop(state, piece, key)) {
      setPredrop(state, piece, key, realProm);
      unselect(state);
      return true;
    }
    unselect(state);
    return false;
  }
  function userMove(state, orig, dest, prom) {
    const realProm = prom || state.promotion.forceMovePromotion(orig, dest);
    if (canMove(state, orig, dest)) {
      const result = baseUserMove(state, orig, dest, realProm);
      if (result) {
        unselect(state);
        const metadata = { premade: false };
        if (result !== true) metadata.captured = result;
        callUserFunction(state.movable.events.after, orig, dest, realProm, metadata);
        return true;
      }
    } else if (canPremove(state, orig, dest)) {
      setPremove(state, orig, dest, realProm);
      unselect(state);
      return true;
    }
    unselect(state);
    return false;
  }
  function basePromotionDialog(state, piece, key) {
    const promotedPiece = promotePiece(state, piece);
    if (state.viewOnly || state.promotion.current || !promotedPiece) return false;
    state.promotion.current = { piece, promotedPiece, key, dragged: !!state.draggable.current };
    state.hovered = key;
    return true;
  }
  function promotionDialogDrop(state, piece, key) {
    if (canDropPromote(state, piece, key) && (canDrop(state, piece, key) || canPredrop(state, piece, key))) {
      if (basePromotionDialog(state, piece, key)) {
        callUserFunction(state.promotion.events.initiated);
        return true;
      }
    }
    return false;
  }
  function promotionDialogMove(state, orig, dest) {
    if (canMovePromote(state, orig, dest) && (canMove(state, orig, dest) || canPremove(state, orig, dest))) {
      const piece = state.pieces.get(orig);
      if (piece && basePromotionDialog(state, piece, dest)) {
        callUserFunction(state.promotion.events.initiated);
        return true;
      }
    }
    return false;
  }
  function promotePiece(s, piece) {
    const promRole = s.promotion.promotesTo(piece.role);
    return promRole !== void 0 ? { color: piece.color, role: promRole, lastMoved: piece.lastMoved } : void 0;
  }
  function deletePiece(state, key) {
    if (state.pieces.delete(key)) callUserFunction(state.events.change);
  }
  function selectSquare(state, key, prom, force) {
    callUserFunction(state.events.select, key);
    if (!state.draggable.enabled && state.selected === key) {
      callUserFunction(state.events.unselect, key);
      unselect(state);
      return;
    }
    if (state.selectable.enabled || force || state.selectable.forceSpares && state.selectedPiece && state.droppable.spare) {
      if (state.selectedPiece && userDrop(state, state.selectedPiece, key, prom)) return;
      else if (state.selected && userMove(state, state.selected, key, prom)) return;
    }
    if ((state.selectable.enabled || state.draggable.enabled || force) && (isMovable(state, key) || isPremovable(state, key))) {
      if (isPieceCooldownEnabled(state)) {
        const piece = state.pieces.get(key);
        if (piece && isPieceOnCooldown(state, piece)) {
          return;
        }
      }
      setSelected(state, key);
    }
  }
  function selectPiece(state, piece, spare, force, api) {
    callUserFunction(state.events.pieceSelect, piece);
    if (state.selectable.addSparesToHand && state.droppable.spare && state.selectedPiece) {
      addToHand(state, { role: state.selectedPiece.role, color: piece.color });
      callUserFunction(state.events.change);
      unselect(state);
    } else if (!api && !state.draggable.enabled && state.selectedPiece && samePiece(state.selectedPiece, piece)) {
      callUserFunction(state.events.pieceUnselect, piece);
      unselect(state);
    } else if ((state.selectable.enabled || state.draggable.enabled || force) && (isDroppable(state, piece, !!spare) || isPredroppable(state, piece))) {
      setSelectedPiece(state, piece);
      state.droppable.spare = !!spare;
    } else {
      unselect(state);
    }
  }
  function setSelected(state, key) {
    unselect(state);
    state.selected = key;
    setPreDests(state);
  }
  function setSelectedPiece(state, piece) {
    unselect(state);
    state.selectedPiece = piece;
    setPreDests(state);
  }
  function setPreDests(state) {
    state.premovable.dests = state.predroppable.dests = void 0;
    if (state.selected && isPremovable(state, state.selected) && state.premovable.generate)
      state.premovable.dests = state.premovable.generate(state.selected, state.pieces);
    else if (state.selectedPiece && isPredroppable(state, state.selectedPiece) && state.predroppable.generate)
      state.predroppable.dests = state.predroppable.generate(state.selectedPiece, state.pieces);
  }
  function unselect(state) {
    state.selected = state.selectedPiece = state.premovable.dests = state.predroppable.dests = state.promotion.current = void 0;
    state.droppable.spare = false;
  }
  function isMovable(state, orig) {
    const piece = state.pieces.get(orig);
    return !!piece && (state.activeColor === "both" || state.activeColor === piece.color && state.turnColor === piece.color);
  }
  function isDroppable(state, piece, spare) {
    var _a;
    return (spare || !!((_a = state.hands.handMap.get(piece.color)) == null ? void 0 : _a.get(piece.role))) && (state.activeColor === "both" || state.activeColor === piece.color && state.turnColor === piece.color);
  }
  function canMove(state, orig, dest) {
    var _a, _b;
    return orig !== dest && isMovable(state, orig) && (state.movable.free || !!((_b = (_a = state.movable.dests) == null ? void 0 : _a.get(orig)) == null ? void 0 : _b.includes(dest)));
  }
  function canDrop(state, piece, dest) {
    var _a, _b;
    return isDroppable(state, piece, state.droppable.spare) && (state.droppable.free || state.droppable.spare || !!((_b = (_a = state.droppable.dests) == null ? void 0 : _a.get(pieceNameOf(piece))) == null ? void 0 : _b.includes(dest)));
  }
  function canMovePromote(state, orig, dest) {
    const piece = state.pieces.get(orig);
    return !!piece && state.promotion.movePromotionDialog(orig, dest);
  }
  function canDropPromote(state, piece, key) {
    return !state.droppable.spare && state.promotion.dropPromotionDialog(piece, key);
  }
  function isPremovable(state, orig) {
    const piece = state.pieces.get(orig);
    return !!piece && state.premovable.enabled && state.activeColor === piece.color && state.turnColor !== piece.color;
  }
  function isPredroppable(state, piece) {
    var _a;
    return !!((_a = state.hands.handMap.get(piece.color)) == null ? void 0 : _a.get(piece.role)) && state.predroppable.enabled && state.activeColor === piece.color && state.turnColor !== piece.color;
  }
  function canPremove(state, orig, dest) {
    return orig !== dest && isPremovable(state, orig) && !!state.premovable.generate && state.premovable.generate(orig, state.pieces).includes(dest);
  }
  function canPredrop(state, piece, dest) {
    const destPiece = state.pieces.get(dest);
    return isPredroppable(state, piece) && (!destPiece || destPiece.color !== state.activeColor) && !!state.predroppable.generate && state.predroppable.generate(piece, state.pieces).includes(dest);
  }
  function isDraggable(state, piece) {
    return state.draggable.enabled && (state.activeColor === "both" || state.activeColor === piece.color && (state.turnColor === piece.color || state.premovable.enabled));
  }
  function playPremove(state) {
    const move3 = state.premovable.current;
    if (!move3) return false;
    const orig = move3.orig, dest = move3.dest, prom = move3.prom;
    let success = false;
    if (canMove(state, orig, dest)) {
      const result = baseUserMove(state, orig, dest, prom);
      if (result) {
        const metadata = { premade: true };
        if (result !== true) metadata.captured = result;
        callUserFunction(state.movable.events.after, orig, dest, prom, metadata);
        success = true;
      }
    }
    unsetPremove(state);
    return success;
  }
  function playPredrop(state) {
    const drop = state.predroppable.current;
    if (!drop) return false;
    const piece = drop.piece, key = drop.key, prom = drop.prom;
    let success = false;
    if (canDrop(state, piece, key)) {
      if (baseUserDrop(state, piece, key, prom)) {
        callUserFunction(state.droppable.events.after, piece, key, prom, { premade: true });
        success = true;
      }
    }
    unsetPredrop(state);
    return success;
  }
  function cancelMoveOrDrop(state) {
    unsetPremove(state);
    unsetPredrop(state);
    unselect(state);
  }
  function cancelPromotion(state) {
    if (!state.promotion.current) return;
    unselect(state);
    state.promotion.current = void 0;
    state.hovered = void 0;
    callUserFunction(state.promotion.events.cancel);
  }
  function stop(state) {
    state.activeColor = state.movable.dests = state.droppable.dests = state.draggable.current = state.animation.current = state.promotion.current = state.hovered = void 0;
    cancelMoveOrDrop(state);
  }
  function isPieceCooldownEnabled(state) {
    return !!(state.pieceCooldown && state.pieceCooldown.cooldownTime && state.pieceCooldown.enabled);
  }
  function isPieceOnCooldown(state, piece) {
    if (state.pieceCooldown && state.pieceCooldown.cooldownTime && !!state.pieceCooldown.enabled && piece.lastMoved) {
      const now = Date.now();
      return piece.lastMoved + state.pieceCooldown.cooldownTime > now;
    }
    return false;
  }

  // src/sfen.ts
  function inferDimensions(boardSfen) {
    const ranks2 = boardSfen.split("/"), firstFile = ranks2[0].split("");
    let filesCnt = 0, cnt = 0;
    for (const c of firstFile) {
      const nb = c.charCodeAt(0);
      if (nb < 58 && nb > 47) cnt = cnt * 10 + nb - 48;
      else if (c !== "+") {
        filesCnt += cnt + 1;
        cnt = 0;
      }
    }
    filesCnt += cnt;
    return { files: filesCnt, ranks: ranks2.length };
  }
  function sfenToBoard(sfen, dims, fromForsyth) {
    const sfenParser = fromForsyth || standardFromForsyth, pieces = /* @__PURE__ */ new Map();
    let x = dims.files - 1, y = 0;
    for (let i = 0; i < sfen.length; i++) {
      switch (sfen[i]) {
        case " ":
        case "_":
          return pieces;
        case "/":
          ++y;
          if (y > dims.ranks - 1) return pieces;
          x = dims.files - 1;
          break;
        default: {
          const nb1 = sfen[i].charCodeAt(0), nb2 = sfen[i + 1] && sfen[i + 1].charCodeAt(0);
          if (nb1 < 58 && nb1 > 47) {
            if (nb2 && nb2 < 58 && nb2 > 47) {
              x -= (nb1 - 48) * 10 + (nb2 - 48);
              i++;
            } else x -= nb1 - 48;
          } else {
            const roleStr = sfen[i] === "+" && sfen.length > i + 1 ? "+" + sfen[++i] : sfen[i], role = sfenParser(roleStr);
            if (x >= 0 && role) {
              const color = roleStr === roleStr.toLowerCase() ? "gote" : "sente";
              pieces.set(pos2key([x, y]), {
                role,
                color
              });
            }
            --x;
          }
        }
      }
    }
    return pieces;
  }
  function boardToSfen(pieces, dims, toForsyth) {
    const sfenRenderer = toForsyth || standardToForsyth, reversedFiles = files.slice(0, dims.files).reverse();
    return ranks.slice(0, dims.ranks).map(
      (y) => reversedFiles.map((x) => {
        const piece = pieces.get(x + y), forsyth = piece && sfenRenderer(piece.role);
        if (forsyth) {
          return piece.color === "sente" ? forsyth.toUpperCase() : forsyth.toLowerCase();
        } else return "1";
      }).join("")
    ).join("/").replace(/1{2,}/g, (s) => s.length.toString());
  }
  function sfenToHands(sfen, fromForsyth) {
    const sfenParser = fromForsyth || standardFromForsyth, sente = /* @__PURE__ */ new Map(), gote = /* @__PURE__ */ new Map();
    let tmpNum = 0, num = 1;
    for (let i = 0; i < sfen.length; i++) {
      const nb = sfen[i].charCodeAt(0);
      if (nb < 58 && nb > 47) {
        tmpNum = tmpNum * 10 + nb - 48;
        num = tmpNum;
      } else {
        const roleStr = sfen[i] === "+" && sfen.length > i + 1 ? "+" + sfen[++i] : sfen[i], role = sfenParser(roleStr);
        if (role) {
          const color = roleStr === roleStr.toLowerCase() ? "gote" : "sente";
          if (color === "sente") sente.set(role, (sente.get(role) || 0) + num);
          else gote.set(role, (gote.get(role) || 0) + num);
        }
        tmpNum = 0;
        num = 1;
      }
    }
    return /* @__PURE__ */ new Map([
      ["sente", sente],
      ["gote", gote]
    ]);
  }
  function handsToSfen(hands, roles, toForsyth) {
    var _a, _b;
    const sfenRenderer = toForsyth || standardToForsyth;
    let senteHandStr = "", goteHandStr = "";
    for (const role of roles) {
      const forsyth = sfenRenderer(role);
      if (forsyth) {
        const senteCnt = (_a = hands.get("sente")) == null ? void 0 : _a.get(role), goteCnt = (_b = hands.get("gote")) == null ? void 0 : _b.get(role);
        if (senteCnt) senteHandStr += senteCnt > 1 ? senteCnt.toString() + forsyth : forsyth;
        if (goteCnt) goteHandStr += goteCnt > 1 ? goteCnt.toString() + forsyth : forsyth;
      }
    }
    if (senteHandStr || goteHandStr) return senteHandStr.toUpperCase() + goteHandStr.toLowerCase();
    else return "-";
  }
  function standardFromForsyth(forsyth) {
    switch (forsyth.toLowerCase()) {
      case "p":
        return "pawn";
      case "l":
        return "lance";
      case "n":
        return "knight";
      case "s":
        return "silver";
      case "g":
        return "gold";
      case "b":
        return "bishop";
      case "r":
        return "rook";
      case "+p":
        return "tokin";
      case "+l":
        return "promotedlance";
      case "+n":
        return "promotedknight";
      case "+s":
        return "promotedsilver";
      case "+b":
        return "horse";
      case "+r":
        return "dragon";
      case "k":
        return "king";
      default:
        return;
    }
  }
  function standardToForsyth(role) {
    switch (role) {
      case "pawn":
        return "p";
      case "lance":
        return "l";
      case "knight":
        return "n";
      case "silver":
        return "s";
      case "gold":
        return "g";
      case "bishop":
        return "b";
      case "rook":
        return "r";
      case "tokin":
        return "+p";
      case "promotedlance":
        return "+l";
      case "promotedknight":
        return "+n";
      case "promotedsilver":
        return "+s";
      case "horse":
        return "+b";
      case "dragon":
        return "+r";
      case "king":
        return "k";
      default:
        return;
    }
  }

  // src/config.ts
  function applyAnimation(state, config) {
    if (config.animation) {
      deepMerge(state.animation, config.animation);
      if ((state.animation.duration || 0) < 70) state.animation.enabled = false;
    }
  }
  function configure(state, config) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    if ((_a = config.movable) == null ? void 0 : _a.dests) state.movable.dests = void 0;
    if ((_b = config.droppable) == null ? void 0 : _b.dests) state.droppable.dests = void 0;
    if ((_c = config.drawable) == null ? void 0 : _c.shapes) state.drawable.shapes = [];
    if ((_d = config.drawable) == null ? void 0 : _d.autoShapes) state.drawable.autoShapes = [];
    if ((_e = config.drawable) == null ? void 0 : _e.squares) state.drawable.squares = [];
    if ((_f = config.hands) == null ? void 0 : _f.roles) state.hands.roles = [];
    deepMerge(state, config);
    if ((_g = config.sfen) == null ? void 0 : _g.board) {
      state.dimensions = inferDimensions(config.sfen.board);
      state.pieces = sfenToBoard(config.sfen.board, state.dimensions, state.forsyth.fromForsyth);
      state.drawable.shapes = ((_h = config.drawable) == null ? void 0 : _h.shapes) || [];
    }
    if ((_i = config.sfen) == null ? void 0 : _i.hands) {
      state.hands.handMap = sfenToHands(config.sfen.hands, state.forsyth.fromForsyth);
    }
    if ("checks" in config) setChecks(state, config.checks || false);
    if ("lastPiece" in config && !config.lastPiece) state.lastPiece = void 0;
    if ("lastDests" in config && !config.lastDests) state.lastDests = void 0;
    else if (config.lastDests) state.lastDests = config.lastDests;
    setPreDests(state);
    applyAnimation(state, config);
  }
  function deepMerge(base, extend) {
    for (const key in extend) {
      if (Object.prototype.hasOwnProperty.call(extend, key)) {
        if (Object.prototype.hasOwnProperty.call(base, key) && isPlainObject(base[key]) && isPlainObject(extend[key]))
          deepMerge(base[key], extend[key]);
        else base[key] = extend[key];
      }
    }
  }
  function isPlainObject(o) {
    if (typeof o !== "object" || o === null) return false;
    const proto = Object.getPrototypeOf(o);
    return proto === Object.prototype || proto === null;
  }

  // src/anim.ts
  function anim(mutation, state) {
    return state.animation.enabled ? animate(mutation, state) : render2(mutation, state);
  }
  function render2(mutation, state) {
    const result = mutation(state);
    state.dom.redraw();
    return result;
  }
  function makePiece(key, piece) {
    return {
      key,
      pos: key2pos(key),
      piece
    };
  }
  function closer(piece, pieces) {
    return pieces.sort((p1, p2) => {
      return distanceSq(piece.pos, p1.pos) - distanceSq(piece.pos, p2.pos);
    })[0];
  }
  function computePlan(prevPieces, prevHands, current) {
    const anims = /* @__PURE__ */ new Map(), animedOrigs = [], fadings = /* @__PURE__ */ new Map(), promotions = /* @__PURE__ */ new Map(), missings = [], news = [], prePieces = /* @__PURE__ */ new Map();
    for (const [k, p] of prevPieces) {
      prePieces.set(k, makePiece(k, p));
    }
    for (const key of allKeys) {
      const curP = current.pieces.get(key), preP = prePieces.get(key);
      if (curP) {
        if (preP) {
          if (!samePiece(curP, preP.piece)) {
            missings.push(preP);
            news.push(makePiece(key, curP));
          }
        } else news.push(makePiece(key, curP));
      } else if (preP) missings.push(preP);
    }
    if (current.animation.hands) {
      for (const color of colors) {
        const curH = current.hands.handMap.get(color), preH = prevHands.get(color);
        if (preH && curH) {
          for (const [role, n] of preH) {
            const piece = { role, color }, curN = curH.get(role) || 0;
            if (curN < n) {
              const handPieceOffset = current.dom.bounds.hands.pieceBounds().get(pieceNameOf(piece)), bounds = current.dom.bounds.board.bounds(), outPos = handPieceOffset && bounds ? posOfOutsideEl(
                handPieceOffset.left,
                handPieceOffset.top,
                sentePov(current.orientation),
                current.dimensions,
                bounds
              ) : void 0;
              if (outPos)
                missings.push({
                  pos: outPos,
                  piece
                });
            }
          }
        }
      }
    }
    for (const newP of news) {
      const preP = closer(
        newP,
        missings.filter((p) => {
          if (samePiece(newP.piece, p.piece)) return true;
          const pRole = current.promotion.promotesTo(p.piece.role), pPiece = pRole && { color: p.piece.color, role: pRole };
          const nRole = current.promotion.promotesTo(newP.piece.role), nPiece = nRole && { color: newP.piece.color, role: nRole };
          return !!pPiece && samePiece(newP.piece, pPiece) || !!nPiece && samePiece(nPiece, p.piece);
        })
      );
      if (preP) {
        const vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
        anims.set(newP.key, vector.concat(vector));
        if (preP.key) animedOrigs.push(preP.key);
        if (!samePiece(newP.piece, preP.piece) && newP.key) promotions.set(newP.key, preP.piece);
      }
    }
    for (const p of missings) {
      if (p.key && !animedOrigs.includes(p.key)) fadings.set(p.key, p.piece);
    }
    return {
      anims,
      fadings,
      promotions
    };
  }
  function step(state, now) {
    const cur = state.animation.current;
    if (cur === void 0) {
      if (!state.dom.destroyed) state.dom.redrawNow();
      return;
    }
    const rest = 1 - (now - cur.start) * cur.frequency;
    if (rest <= 0) {
      state.animation.current = void 0;
      state.dom.redrawNow();
    } else {
      const ease = easing(rest);
      for (const cfg of cur.plan.anims.values()) {
        cfg[2] = cfg[0] * ease;
        cfg[3] = cfg[1] * ease;
      }
      state.dom.redrawNow(true);
      requestAnimationFrame((now2 = performance.now()) => step(state, now2));
    }
  }
  function animate(mutation, state) {
    var _a;
    const prevPieces = new Map(state.pieces), prevHands = /* @__PURE__ */ new Map([
      ["sente", new Map(state.hands.handMap.get("sente"))],
      ["gote", new Map(state.hands.handMap.get("gote"))]
    ]);
    const result = mutation(state), plan = computePlan(prevPieces, prevHands, state);
    if (plan.anims.size || plan.fadings.size) {
      const alreadyRunning = ((_a = state.animation.current) == null ? void 0 : _a.start) !== void 0;
      state.animation.current = {
        start: performance.now(),
        frequency: 1 / Math.max(state.animation.duration, 1),
        plan
      };
      if (!alreadyRunning) step(state, performance.now());
    } else {
      state.dom.redraw();
    }
    return result;
  }
  function easing(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  // src/shapes.ts
  function createSVGElement(tagName) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }
  var outsideArrowHash = "outsideArrow";
  function renderShapes(state, svg, customSvg, freePieces) {
    const d = state.drawable, curD = d.current, cur = (curD == null ? void 0 : curD.dest) ? curD : void 0, outsideArrow = !!curD && !cur, arrowDests = /* @__PURE__ */ new Map(), pieceMap = /* @__PURE__ */ new Map();
    const hashBounds = () => {
      const bounds = state.dom.bounds.board.bounds();
      return bounds && bounds.width.toString() + bounds.height || "";
    };
    for (const s of d.shapes.concat(d.autoShapes).concat(cur ? [cur] : [])) {
      const destName = isPiece(s.dest) ? pieceNameOf(s.dest) : s.dest;
      if (!samePieceOrKey(s.dest, s.orig))
        arrowDests.set(destName, (arrowDests.get(destName) || 0) + 1);
    }
    for (const s of d.shapes.concat(cur ? [cur] : []).concat(d.autoShapes)) {
      if (s.piece && !isPiece(s.orig)) pieceMap.set(s.orig, s);
    }
    const pieceShapes = [...pieceMap.values()].map((s) => {
      return {
        shape: s,
        hash: shapeHash(s, arrowDests, false, hashBounds)
      };
    });
    const shapes = d.shapes.concat(d.autoShapes).map((s) => {
      return {
        shape: s,
        hash: shapeHash(s, arrowDests, false, hashBounds)
      };
    });
    if (cur)
      shapes.push({
        shape: cur,
        hash: shapeHash(cur, arrowDests, true, hashBounds),
        current: true
      });
    const fullHash = shapes.map((sc) => sc.hash).join(";") + (outsideArrow ? outsideArrowHash : "");
    if (fullHash === state.drawable.prevSvgHash) return;
    state.drawable.prevSvgHash = fullHash;
    const defsEl = svg.querySelector("defs"), shapesEl = svg.querySelector("g"), customSvgsEl = customSvg.querySelector("g");
    syncDefs(shapes, outsideArrow ? curD : void 0, defsEl);
    syncShapes(
      shapes.filter((s) => !s.shape.customSvg && (!s.shape.piece || s.current)),
      shapesEl,
      (shape) => renderSVGShape(state, shape, arrowDests),
      outsideArrow
    );
    syncShapes(
      shapes.filter((s) => s.shape.customSvg),
      customSvgsEl,
      (shape) => renderSVGShape(state, shape, arrowDests)
    );
    syncShapes(pieceShapes, freePieces, (shape) => renderPiece(state, shape));
    if (!outsideArrow && curD) curD.arrow = void 0;
    if (outsideArrow && !curD.arrow) {
      const orig = pieceOrKeyToPos(curD.orig, state);
      if (orig) {
        const g = setAttributes(createSVGElement("g"), {
          class: shapeClass(curD.brush, true, true),
          sgHash: outsideArrowHash
        }), el = renderArrow(curD.brush, orig, orig, state.squareRatio, true, false);
        g.appendChild(el);
        curD.arrow = el;
        shapesEl.appendChild(g);
      }
    }
  }
  function syncDefs(shapes, outsideShape, defsEl) {
    const brushes2 = /* @__PURE__ */ new Set();
    for (const s of shapes) {
      if (!samePieceOrKey(s.shape.dest, s.shape.orig)) brushes2.add(s.shape.brush);
    }
    if (outsideShape) brushes2.add(outsideShape.brush);
    const keysInDom = /* @__PURE__ */ new Set();
    let el = defsEl.firstElementChild;
    while (el) {
      keysInDom.add(el.getAttribute("sgKey"));
      el = el.nextElementSibling;
    }
    for (const key of brushes2) {
      const brush = key || "primary";
      if (!keysInDom.has(brush)) defsEl.appendChild(renderMarker(brush));
    }
  }
  function syncShapes(shapes, root, renderShape, outsideArrow) {
    const hashesInDom = /* @__PURE__ */ new Map(), toRemove = [];
    for (const sc of shapes) hashesInDom.set(sc.hash, false);
    if (outsideArrow) hashesInDom.set(outsideArrowHash, true);
    let el = root.firstElementChild, elHash;
    while (el) {
      elHash = el.getAttribute("sgHash");
      if (hashesInDom.has(elHash)) hashesInDom.set(elHash, true);
      else toRemove.push(el);
      el = el.nextElementSibling;
    }
    for (const el2 of toRemove) root.removeChild(el2);
    for (const sc of shapes) {
      if (!hashesInDom.get(sc.hash)) {
        const shapeEl = renderShape(sc);
        if (shapeEl) root.appendChild(shapeEl);
      }
    }
  }
  function shapeHash({ orig, dest, brush, piece, customSvg, description }, arrowDests, current, boundHash) {
    return [
      current,
      (isPiece(orig) || isPiece(dest)) && boundHash(),
      isPiece(orig) ? pieceHash(orig) : orig,
      isPiece(dest) ? pieceHash(dest) : dest,
      brush,
      (arrowDests.get(isPiece(dest) ? pieceNameOf(dest) : dest) || 0) > 1,
      piece && pieceHash(piece),
      customSvg && customSvgHash(customSvg),
      description
    ].filter((x) => x).join(",");
  }
  function pieceHash(piece) {
    return [piece.color, piece.role, piece.scale].filter((x) => x).join(",");
  }
  function customSvgHash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i) >>> 0;
    }
    return "custom-" + h.toString();
  }
  function renderSVGShape(state, { shape, current, hash }, arrowDests) {
    const orig = pieceOrKeyToPos(shape.orig, state);
    if (!orig) return;
    if (shape.customSvg) {
      return renderCustomSvg(shape.brush, shape.customSvg, orig, state.squareRatio);
    } else {
      let el;
      const dest = !samePieceOrKey(shape.orig, shape.dest) && pieceOrKeyToPos(shape.dest, state);
      if (dest) {
        el = renderArrow(
          shape.brush,
          orig,
          dest,
          state.squareRatio,
          !!current,
          (arrowDests.get(isPiece(shape.dest) ? pieceNameOf(shape.dest) : shape.dest) || 0) > 1
        );
      } else if (samePieceOrKey(shape.dest, shape.orig)) {
        let ratio = state.squareRatio;
        if (isPiece(shape.orig)) {
          const pieceBounds = state.dom.bounds.hands.pieceBounds().get(pieceNameOf(shape.orig)), bounds = state.dom.bounds.board.bounds();
          if (pieceBounds && bounds) {
            const heightBase = pieceBounds.height / (bounds.height / state.dimensions.ranks);
            ratio = [heightBase * state.squareRatio[0], heightBase * state.squareRatio[1]];
          }
        }
        el = renderEllipse(orig, ratio, !!current);
      }
      if (el) {
        const g = setAttributes(createSVGElement("g"), {
          class: shapeClass(shape.brush, !!current, false),
          sgHash: hash
        });
        g.appendChild(el);
        const descEl = shape.description && renderDescription(state, shape, arrowDests);
        if (descEl) g.appendChild(descEl);
        return g;
      } else return;
    }
  }
  function renderCustomSvg(brush, customSvg, pos, ratio) {
    const [x, y] = pos;
    const g = setAttributes(createSVGElement("g"), { transform: `translate(${x},${y})` });
    const svg = setAttributes(createSVGElement("svg"), {
      class: brush,
      width: ratio[0],
      height: ratio[1],
      viewBox: `0 0 ${ratio[0] * 10} ${ratio[1] * 10}`
    });
    g.appendChild(svg);
    svg.innerHTML = customSvg;
    return g;
  }
  function renderEllipse(pos, ratio, current) {
    const o = pos, widths = ellipseWidth(ratio);
    return setAttributes(createSVGElement("ellipse"), {
      "stroke-width": widths[current ? 0 : 1],
      fill: "none",
      cx: o[0],
      cy: o[1],
      rx: ratio[0] / 2 - widths[1] / 2,
      ry: ratio[1] / 2 - widths[1] / 2
    });
  }
  function renderArrow(brush, orig, dest, ratio, current, shorten) {
    const m = arrowMargin(shorten && !current, ratio), a = orig, b = dest, dx = b[0] - a[0], dy = b[1] - a[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
    return setAttributes(createSVGElement("line"), {
      "stroke-width": lineWidth(current, ratio),
      "stroke-linecap": "round",
      "marker-end": "url(#arrowhead-" + (brush || "primary") + ")",
      x1: a[0],
      y1: a[1],
      x2: b[0] - xo,
      y2: b[1] - yo
    });
  }
  function renderPiece(state, { shape }) {
    if (!shape.piece || isPiece(shape.orig)) return;
    const orig = shape.orig, scale = (shape.piece.scale || 1) * (state.scaleDownPieces ? 0.5 : 1);
    const pieceEl = createEl("piece", pieceNameOf(shape.piece));
    pieceEl.sgKey = orig;
    pieceEl.sgScale = scale;
    translateRel(
      pieceEl,
      posToTranslateRel(state.dimensions)(key2pos(orig), sentePov(state.orientation)),
      state.scaleDownPieces ? 0.5 : 1,
      scale
    );
    return pieceEl;
  }
  function renderDescription(state, shape, arrowDests) {
    const orig = pieceOrKeyToPos(shape.orig, state);
    if (!orig || !shape.description) return;
    const dest = !samePieceOrKey(shape.orig, shape.dest) && pieceOrKeyToPos(shape.dest, state), diff = dest ? [dest[0] - orig[0], dest[1] - orig[1]] : [0, 0], offset = (arrowDests.get(isPiece(shape.dest) ? pieceNameOf(shape.dest) : shape.dest) || 0) > 1 ? 0.3 : 0.15, close = (diff[0] === 0 || Math.abs(diff[0]) === state.squareRatio[0]) && (diff[1] === 0 || Math.abs(diff[1]) === state.squareRatio[1]), ratio = dest ? 0.55 - (close ? offset : 0) : 0, mid = [orig[0] + diff[0] * ratio, orig[1] + diff[1] * ratio], textLength = shape.description.length;
    const g = setAttributes(createSVGElement("g"), { class: "description" }), circle = setAttributes(createSVGElement("ellipse"), {
      cx: mid[0],
      cy: mid[1],
      rx: textLength + 1.5,
      ry: 2.5
    }), text = setAttributes(createSVGElement("text"), {
      x: mid[0],
      y: mid[1],
      "text-anchor": "middle",
      "dominant-baseline": "central"
    });
    g.appendChild(circle);
    text.appendChild(document.createTextNode(shape.description));
    g.appendChild(text);
    return g;
  }
  function renderMarker(brush) {
    const marker = setAttributes(createSVGElement("marker"), {
      id: "arrowhead-" + brush,
      orient: "auto",
      markerWidth: 4,
      markerHeight: 8,
      refX: 2.05,
      refY: 2.01
    });
    marker.appendChild(
      setAttributes(createSVGElement("path"), {
        d: "M0,0 V4 L3,2 Z"
      })
    );
    marker.setAttribute("sgKey", brush);
    return marker;
  }
  function setAttributes(el, attrs) {
    for (const key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) el.setAttribute(key, attrs[key]);
    }
    return el;
  }
  function pos2user(pos, color, dims, ratio) {
    return color === "sente" ? [(dims.files - 1 - pos[0]) * ratio[0], pos[1] * ratio[1]] : [pos[0] * ratio[0], (dims.ranks - 1 - pos[1]) * ratio[1]];
  }
  function isPiece(x) {
    return typeof x === "object";
  }
  function samePieceOrKey(kp1, kp2) {
    return isPiece(kp1) && isPiece(kp2) && samePiece(kp1, kp2) || kp1 === kp2;
  }
  function usesBounds(shapes) {
    return shapes.some((s) => isPiece(s.orig) || isPiece(s.dest));
  }
  function shapeClass(brush, current, outside) {
    return brush + (current ? " current" : "") + (outside ? " outside" : "");
  }
  function ratioAverage(ratio) {
    return (ratio[0] + ratio[1]) / 2;
  }
  function ellipseWidth(ratio) {
    return [3 / 64 * ratioAverage(ratio), 4 / 64 * ratioAverage(ratio)];
  }
  function lineWidth(current, ratio) {
    return (current ? 8.5 : 10) / 64 * ratioAverage(ratio);
  }
  function arrowMargin(shorten, ratio) {
    return (shorten ? 20 : 10) / 64 * ratioAverage(ratio);
  }
  function pieceOrKeyToPos(kp, state) {
    if (isPiece(kp)) {
      const pieceBounds = state.dom.bounds.hands.pieceBounds().get(pieceNameOf(kp)), bounds = state.dom.bounds.board.bounds(), offset = sentePov(state.orientation) ? [0.5, -0.5] : [-0.5, 0.5], pos = pieceBounds && bounds && posOfOutsideEl(
        pieceBounds.left + pieceBounds.width / 2,
        pieceBounds.top + pieceBounds.height / 2,
        sentePov(state.orientation),
        state.dimensions,
        bounds
      );
      return pos && pos2user(
        [pos[0] + offset[0], pos[1] + offset[1]],
        state.orientation,
        state.dimensions,
        state.squareRatio
      );
    } else return pos2user(key2pos(kp), state.orientation, state.dimensions, state.squareRatio);
  }

  // src/draw.ts
  var brushes = ["primary", "alternative0", "alternative1", "alternative2"];
  function start(state, e) {
    if (e.touches && e.touches.length > 1) return;
    e.stopPropagation();
    e.preventDefault();
    if (e.ctrlKey) unselect(state);
    else cancelMoveOrDrop(state);
    const pos = eventPosition(e), bounds = state.dom.bounds.board.bounds(), orig = pos && bounds && getKeyAtDomPos(pos, sentePov(state.orientation), state.dimensions, bounds), piece = state.drawable.piece;
    if (!orig) return;
    state.drawable.current = {
      orig,
      dest: void 0,
      pos,
      piece,
      brush: eventBrush(e, isRightButton(e) || state.drawable.forced)
    };
    processDraw(state);
  }
  function startFromHand(state, piece, e) {
    if (e.touches && e.touches.length > 1) return;
    e.stopPropagation();
    e.preventDefault();
    if (e.ctrlKey) unselect(state);
    else cancelMoveOrDrop(state);
    const pos = eventPosition(e);
    if (!pos) return;
    state.drawable.current = {
      orig: piece,
      dest: void 0,
      pos,
      brush: eventBrush(e, isRightButton(e) || state.drawable.forced)
    };
    processDraw(state);
  }
  function processDraw(state) {
    requestAnimationFrame(() => {
      const cur = state.drawable.current, bounds = state.dom.bounds.board.bounds();
      if (cur && bounds) {
        const dest = getKeyAtDomPos(cur.pos, sentePov(state.orientation), state.dimensions, bounds) || getHandPieceAtDomPos(cur.pos, state.hands.roles, state.dom.bounds.hands.pieceBounds());
        if (cur.dest !== dest && !(cur.dest && dest && samePieceOrKey(dest, cur.dest))) {
          cur.dest = dest;
          state.dom.redrawNow();
        }
        const outPos = posOfOutsideEl(
          cur.pos[0],
          cur.pos[1],
          sentePov(state.orientation),
          state.dimensions,
          bounds
        );
        if (!cur.dest && cur.arrow && outPos) {
          const dest2 = pos2user(outPos, state.orientation, state.dimensions, state.squareRatio);
          setAttributes(cur.arrow, {
            x2: dest2[0] - state.squareRatio[0] / 2,
            y2: dest2[1] - state.squareRatio[1] / 2
          });
        }
        processDraw(state);
      }
    });
  }
  function move(state, e) {
    if (state.drawable.current) state.drawable.current.pos = eventPosition(e);
  }
  function end(state, _) {
    const cur = state.drawable.current;
    if (cur) {
      addShape(state.drawable, cur);
      cancel(state);
    }
  }
  function cancel(state) {
    if (state.drawable.current) {
      state.drawable.current = void 0;
      state.dom.redraw();
    }
  }
  function clear(state) {
    const drawableLength = state.drawable.shapes.length;
    if (drawableLength || state.drawable.piece) {
      state.drawable.shapes = [];
      state.drawable.piece = void 0;
      state.dom.redraw();
      if (drawableLength) onChange(state.drawable);
    }
  }
  function setDrawPiece(state, piece) {
    if (state.drawable.piece && samePiece(state.drawable.piece, piece))
      state.drawable.piece = void 0;
    else state.drawable.piece = piece;
    state.dom.redraw();
  }
  function eventBrush(e, allowFirstModifier) {
    var _a;
    const modA = allowFirstModifier && (e.shiftKey || e.ctrlKey), modB = e.altKey || e.metaKey || ((_a = e.getModifierState) == null ? void 0 : _a.call(e, "AltGraph"));
    return brushes[(modA ? 1 : 0) + (modB ? 2 : 0)];
  }
  function addShape(drawable, cur) {
    if (!cur.dest) return;
    const similarShape = (s) => cur.dest && samePieceOrKey(cur.orig, s.orig) && samePieceOrKey(cur.dest, s.dest);
    const piece = cur.piece;
    cur.piece = void 0;
    const similar = drawable.shapes.find(similarShape), removePiece = drawable.shapes.find(
      (s) => similarShape(s) && piece && s.piece && samePiece(piece, s.piece)
    ), diffPiece = drawable.shapes.find(
      (s) => similarShape(s) && piece && s.piece && !samePiece(piece, s.piece)
    );
    if (similar) drawable.shapes = drawable.shapes.filter((s) => !similarShape(s));
    if (!isPiece(cur.orig) && piece && !removePiece) {
      drawable.shapes.push({ orig: cur.orig, dest: cur.orig, piece, brush: cur.brush });
      if (!samePieceOrKey(cur.orig, cur.dest))
        drawable.shapes.push({ orig: cur.orig, dest: cur.orig, brush: cur.brush });
    }
    if (!similar || diffPiece || similar.brush !== cur.brush) drawable.shapes.push(cur);
    onChange(drawable);
  }
  function onChange(drawable) {
    if (drawable.onChange) drawable.onChange(drawable.shapes);
  }

  // src/drag.ts
  function start2(s, e) {
    var _a;
    const bounds = s.dom.bounds.board.bounds(), position = eventPosition(e), orig = bounds && position && getKeyAtDomPos(position, sentePov(s.orientation), s.dimensions, bounds);
    if (!orig) return;
    const piece = s.pieces.get(orig), previouslySelected = s.selected;
    if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || !piece || piece.color !== s.turnColor))
      clear(s);
    if (e.cancelable !== false && (!e.touches || s.blockTouchScroll || s.selectedPiece || piece || previouslySelected || pieceCloseTo(s, position, bounds)))
      e.preventDefault();
    const hadPremove = !!s.premovable.current;
    const hadPredrop = !!s.predroppable.current;
    if (s.selectable.deleteOnTouch) deletePiece(s, orig);
    else if (s.selected) {
      if (!promotionDialogMove(s, s.selected, orig)) {
        if (canMove(s, s.selected, orig)) anim((state) => selectSquare(state, orig), s);
        else selectSquare(s, orig);
      }
    } else if (s.selectedPiece) {
      if (!promotionDialogDrop(s, s.selectedPiece, orig)) {
        if (canDrop(s, s.selectedPiece, orig))
          anim((state) => selectSquare(state, orig), s);
        else selectSquare(s, orig);
      }
    } else {
      selectSquare(s, orig);
    }
    const stillSelected = s.selected === orig, draggedEl = (_a = s.dom.elements.board) == null ? void 0 : _a.dragged;
    if (piece && draggedEl && stillSelected && isDraggable(s, piece)) {
      const touch = e.type === "touchstart";
      s.draggable.current = {
        piece,
        pos: position,
        origPos: position,
        started: s.draggable.autoDistance && !touch,
        spare: false,
        touch,
        originTarget: e.target,
        fromBoard: {
          orig,
          previouslySelected,
          keyHasChanged: false
        }
      };
      draggedEl.sgColor = piece.color;
      draggedEl.sgRole = piece.role;
      draggedEl.className = `dragging ${pieceNameOf(piece)}`;
      draggedEl.classList.toggle("touch", touch);
      processDrag(s);
    } else {
      if (hadPremove) unsetPremove(s);
      if (hadPredrop) unsetPredrop(s);
    }
    s.dom.redraw();
  }
  function pieceCloseTo(s, pos, bounds) {
    const asSente = sentePov(s.orientation), radiusSq = Math.pow(bounds.width / s.dimensions.files, 2);
    for (const key of s.pieces.keys()) {
      const center = computeSquareCenter(key, asSente, s.dimensions, bounds);
      if (distanceSq(center, pos) <= radiusSq) return true;
    }
    return false;
  }
  function dragNewPiece(s, piece, e, spare) {
    var _a;
    const previouslySelectedPiece = s.selectedPiece, draggedEl = (_a = s.dom.elements.board) == null ? void 0 : _a.dragged, position = eventPosition(e), touch = e.type === "touchstart";
    if (!previouslySelectedPiece && !spare && s.drawable.enabled && s.drawable.eraseOnClick)
      clear(s);
    if (!spare && s.selectable.deleteOnTouch) removeFromHand(s, piece);
    else selectPiece(s, piece, spare);
    const hadPremove = !!s.premovable.current, hadPredrop = !!s.predroppable.current, stillSelected = s.selectedPiece && samePiece(s.selectedPiece, piece);
    if (draggedEl && position && s.selectedPiece && stillSelected && isDraggable(s, piece)) {
      s.draggable.current = {
        piece: s.selectedPiece,
        pos: position,
        origPos: position,
        touch,
        started: s.draggable.autoDistance && !touch,
        spare: !!spare,
        originTarget: e.target,
        fromOutside: {
          originBounds: !spare ? s.dom.bounds.hands.pieceBounds().get(pieceNameOf(piece)) : void 0,
          leftOrigin: false,
          previouslySelectedPiece: !spare ? previouslySelectedPiece : void 0
        }
      };
      draggedEl.sgColor = piece.color;
      draggedEl.sgRole = piece.role;
      draggedEl.className = `dragging ${pieceNameOf(piece)}`;
      draggedEl.classList.toggle("touch", touch);
      processDrag(s);
    } else {
      if (hadPremove) unsetPremove(s);
      if (hadPredrop) unsetPredrop(s);
    }
    s.dom.redraw();
  }
  function processDrag(s) {
    requestAnimationFrame(() => {
      var _a, _b, _c, _d;
      const cur = s.draggable.current, draggedEl = (_a = s.dom.elements.board) == null ? void 0 : _a.dragged, bounds = s.dom.bounds.board.bounds();
      if (!cur || !draggedEl || !bounds) return;
      if (((_b = cur.fromBoard) == null ? void 0 : _b.orig) && ((_c = s.animation.current) == null ? void 0 : _c.plan.anims.has(cur.fromBoard.orig)))
        s.animation.current = void 0;
      const origPiece = cur.fromBoard ? s.pieces.get(cur.fromBoard.orig) : cur.piece;
      if (!origPiece || !samePiece(origPiece, cur.piece)) cancel2(s);
      else {
        if (!cur.started && distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 2)) {
          cur.started = true;
          s.dom.redraw();
        }
        if (cur.started) {
          translateAbs(
            draggedEl,
            [
              cur.pos[0] - bounds.left - bounds.width / (s.dimensions.files * 2),
              cur.pos[1] - bounds.top - bounds.height / (s.dimensions.ranks * 2)
            ],
            s.scaleDownPieces ? 0.5 : 1
          );
          if (!draggedEl.sgDragging) {
            draggedEl.sgDragging = true;
            setDisplay(draggedEl, true);
          }
          const hover = getKeyAtDomPos(
            cur.pos,
            sentePov(s.orientation),
            s.dimensions,
            bounds
          );
          if (cur.fromBoard)
            cur.fromBoard.keyHasChanged = cur.fromBoard.keyHasChanged || cur.fromBoard.orig !== hover;
          else if (cur.fromOutside)
            cur.fromOutside.leftOrigin = cur.fromOutside.leftOrigin || !!cur.fromOutside.originBounds && !isInsideRect(cur.fromOutside.originBounds, cur.pos);
          if (hover !== s.hovered) {
            updateHoveredSquares(s, hover);
            if (cur.touch && ((_d = s.dom.elements.board) == null ? void 0 : _d.squareOver)) {
              if (hover && s.draggable.showTouchSquareOverlay) {
                translateAbs(
                  s.dom.elements.board.squareOver,
                  posToTranslateAbs(s.dimensions, bounds)(
                    key2pos(hover),
                    sentePov(s.orientation)
                  ),
                  1
                );
                setDisplay(s.dom.elements.board.squareOver, true);
              } else {
                setDisplay(s.dom.elements.board.squareOver, false);
              }
            }
          }
        }
      }
      processDrag(s);
    });
  }
  function move2(s, e) {
    if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
      s.draggable.current.pos = eventPosition(e);
    } else if ((s.selected || s.selectedPiece || s.highlight.hovered) && !s.draggable.current && (!e.touches || e.touches.length < 2)) {
      const bounds = s.dom.bounds.board.bounds(), hover = bounds && getKeyAtDomPos(
        eventPosition(e),
        sentePov(s.orientation),
        s.dimensions,
        bounds
      );
      if (hover !== s.hovered) updateHoveredSquares(s, hover);
    }
  }
  function end2(s, e) {
    var _a, _b, _c;
    const cur = s.draggable.current;
    if (!cur) return;
    if (e.type === "touchend" && e.cancelable !== false) e.preventDefault();
    if (e.type === "touchend" && cur.originTarget !== e.target && !cur.fromOutside) {
      s.draggable.current = void 0;
      if (s.hovered && !s.highlight.hovered) updateHoveredSquares(s, void 0);
      return;
    }
    unsetPremove(s);
    unsetPredrop(s);
    const eventPos = eventPosition(e) || cur.pos, bounds = s.dom.bounds.board.bounds(), dest = bounds && getKeyAtDomPos(eventPos, sentePov(s.orientation), s.dimensions, bounds);
    if (dest && cur.started && ((_a = cur.fromBoard) == null ? void 0 : _a.orig) !== dest) {
      if (cur.fromOutside && !promotionDialogDrop(s, cur.piece, dest))
        userDrop(s, cur.piece, dest);
      else if (cur.fromBoard && !promotionDialogMove(s, cur.fromBoard.orig, dest))
        userMove(s, cur.fromBoard.orig, dest);
    } else if (s.draggable.deleteOnDropOff && !dest) {
      if (cur.fromBoard) s.pieces.delete(cur.fromBoard.orig);
      else if (cur.fromOutside && !cur.spare) removeFromHand(s, cur.piece);
      if (s.draggable.addToHandOnDropOff) {
        const handBounds = s.dom.bounds.hands.bounds(), handBoundsTop = handBounds.get("top"), handBoundsBottom = handBounds.get("bottom");
        if (handBoundsTop && isInsideRect(handBoundsTop, cur.pos))
          addToHand(s, { color: opposite(s.orientation), role: cur.piece.role });
        else if (handBoundsBottom && isInsideRect(handBoundsBottom, cur.pos))
          addToHand(s, { color: s.orientation, role: cur.piece.role });
        unselect(s);
      }
      callUserFunction(s.events.change);
    }
    if (cur.fromBoard && (cur.fromBoard.orig === cur.fromBoard.previouslySelected || cur.fromBoard.keyHasChanged) && (cur.fromBoard.orig === dest || !dest)) {
      unselect2(s, cur, dest);
    } else if (!dest && ((_b = cur.fromOutside) == null ? void 0 : _b.leftOrigin) || ((_c = cur.fromOutside) == null ? void 0 : _c.originBounds) && isInsideRect(cur.fromOutside.originBounds, cur.pos) && cur.fromOutside.previouslySelectedPiece && samePiece(cur.fromOutside.previouslySelectedPiece, cur.piece)) {
      unselect2(s, cur, dest);
    } else if (!s.selectable.enabled && !s.promotion.current) {
      unselect2(s, cur, dest);
    }
    s.draggable.current = void 0;
    if (!s.highlight.hovered && !s.promotion.current) s.hovered = void 0;
    s.dom.redraw();
  }
  function unselect2(s, cur, dest) {
    var _a;
    if (cur.fromBoard && cur.fromBoard.orig === dest)
      callUserFunction(s.events.unselect, cur.fromBoard.orig);
    else if (((_a = cur.fromOutside) == null ? void 0 : _a.originBounds) && isInsideRect(cur.fromOutside.originBounds, cur.pos))
      callUserFunction(s.events.pieceUnselect, cur.piece);
    unselect(s);
  }
  function cancel2(s) {
    if (s.draggable.current) {
      s.draggable.current = void 0;
      if (!s.highlight.hovered) s.hovered = void 0;
      unselect(s);
      s.dom.redraw();
    }
  }
  function unwantedEvent(e) {
    return !e.isTrusted || e.button !== void 0 && e.button !== 0 || !!e.touches && e.touches.length > 1;
  }
  function validDestToHover(s, key) {
    return !!s.selected && (canMove(s, s.selected, key) || canPremove(s, s.selected, key)) || !!s.selectedPiece && (canDrop(s, s.selectedPiece, key) || canPredrop(s, s.selectedPiece, key));
  }
  function updateHoveredSquares(s, key) {
    var _a;
    const sqaureEls = (_a = s.dom.elements.board) == null ? void 0 : _a.squares.children;
    if (!sqaureEls || s.promotion.current) return;
    const prevHover = s.hovered;
    if (s.highlight.hovered || key && validDestToHover(s, key)) s.hovered = key;
    else s.hovered = void 0;
    const asSente = sentePov(s.orientation), curIndex = s.hovered && domSquareIndexOfKey(s.hovered, asSente, s.dimensions), curHoverEl = curIndex !== void 0 && sqaureEls[curIndex];
    if (curHoverEl) curHoverEl.classList.add("hover");
    const prevIndex = prevHover && domSquareIndexOfKey(prevHover, asSente, s.dimensions), prevHoverEl = prevIndex !== void 0 && sqaureEls[prevIndex];
    if (prevHoverEl) prevHoverEl.classList.remove("hover");
  }

  // src/coords.ts
  function coords(notation) {
    switch (notation) {
      case "dizhi":
        return [
          "",
          "",
          "",
          "",
          "亥",
          "戌",
          "酉",
          "申",
          "未",
          "午",
          "巳",
          "辰",
          "卯",
          "寅",
          "丑",
          "子"
        ];
      case "japanese":
        return [
          "十六",
          "十五",
          "十四",
          "十三",
          "十二",
          "十一",
          "十",
          "九",
          "八",
          "七",
          "六",
          "五",
          "四",
          "三",
          "二",
          "一"
        ];
      case "engine":
        return ["p", "o", "n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b", "a"];
      case "hex":
        return ["10", "f", "e", "d", "c", "b", "a", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
      default:
        return [
          "16",
          "15",
          "14",
          "13",
          "12",
          "11",
          "10",
          "9",
          "8",
          "7",
          "6",
          "5",
          "4",
          "3",
          "2",
          "1"
        ];
    }
  }

  // src/wrap.ts
  function wrapBoard(boardWrap, s) {
    const board = createEl("sg-board");
    const squares = renderSquares(s.dimensions, s.orientation);
    board.appendChild(squares);
    const pieces = createEl("sg-pieces");
    board.appendChild(pieces);
    let dragged, promotion, squareOver;
    if (!s.viewOnly) {
      dragged = createEl("piece");
      setDisplay(dragged, false);
      board.appendChild(dragged);
      promotion = createEl("sg-promotion");
      setDisplay(promotion, false);
      board.appendChild(promotion);
      squareOver = createEl("sg-square-over");
      setDisplay(squareOver, false);
      board.appendChild(squareOver);
    }
    let shapes;
    if (s.drawable.visible) {
      const svg = setAttributes(createSVGElement("svg"), {
        class: "sg-shapes",
        viewBox: `-${s.squareRatio[0] / 2} -${s.squareRatio[1] / 2} ${s.dimensions.files * s.squareRatio[0]} ${s.dimensions.ranks * s.squareRatio[1]}`
      });
      svg.appendChild(createSVGElement("defs"));
      svg.appendChild(createSVGElement("g"));
      const customSvg = setAttributes(createSVGElement("svg"), {
        class: "sg-custom-svgs",
        viewBox: `0 0 ${s.dimensions.files * s.squareRatio[0]} ${s.dimensions.ranks * s.squareRatio[1]}`
      });
      customSvg.appendChild(createSVGElement("g"));
      const freePieces = createEl("sg-free-pieces");
      board.appendChild(svg);
      board.appendChild(customSvg);
      board.appendChild(freePieces);
      shapes = {
        svg,
        freePieces,
        customSvg
      };
    }
    if (s.coordinates.enabled) {
      const orientClass = s.orientation === "gote" ? " gote" : "", ranks2 = coords(s.coordinates.ranks), files2 = coords(s.coordinates.files);
      board.appendChild(renderCoords(ranks2, "ranks" + orientClass, s.dimensions.ranks));
      board.appendChild(renderCoords(files2, "files" + orientClass, s.dimensions.files));
    }
    boardWrap.innerHTML = "";
    const dimCls = `d-${s.dimensions.files}x${s.dimensions.ranks}`;
    boardWrap.classList.forEach((c) => {
      if (c.substring(0, 2) === "d-" && c !== dimCls) boardWrap.classList.remove(c);
    });
    boardWrap.classList.add("sg-wrap", dimCls);
    for (const c of colors) boardWrap.classList.toggle("orientation-" + c, s.orientation === c);
    boardWrap.classList.toggle("manipulable", !s.viewOnly);
    boardWrap.appendChild(board);
    let hands;
    if (s.hands.inlined) {
      const handWrapTop = createEl("sg-hand-wrap", "inlined"), handWrapBottom = createEl("sg-hand-wrap", "inlined");
      boardWrap.insertBefore(handWrapBottom, board.nextElementSibling);
      boardWrap.insertBefore(handWrapTop, board);
      hands = {
        top: handWrapTop,
        bottom: handWrapBottom
      };
    }
    return {
      board,
      squares,
      pieces,
      promotion,
      squareOver,
      dragged,
      shapes,
      hands
    };
  }
  function wrapHand(handWrap, pos, s) {
    const hand = renderHand2(pos === "top" ? opposite(s.orientation) : s.orientation, s.hands.roles);
    handWrap.innerHTML = "";
    const roleCntCls = `r-${s.hands.roles.length}`;
    handWrap.classList.forEach((c) => {
      if (c.substring(0, 2) === "r-" && c !== roleCntCls) handWrap.classList.remove(c);
    });
    handWrap.classList.add("sg-hand-wrap", `hand-${pos}`, roleCntCls);
    handWrap.appendChild(hand);
    for (const c of colors) handWrap.classList.toggle("orientation-" + c, s.orientation === c);
    handWrap.classList.toggle("manipulable", !s.viewOnly);
    return hand;
  }
  function renderCoords(elems, className, trim) {
    const el = createEl("coords", className);
    let f;
    for (const elem of elems.slice(-trim)) {
      f = createEl("coord");
      f.textContent = elem;
      el.appendChild(f);
    }
    return el;
  }
  function renderSquares(dims, orientation) {
    const squares = createEl("sg-squares");
    for (let i = 0; i < dims.ranks * dims.files; i++) {
      const sq = createEl("sq");
      sq.sgKey = orientation === "sente" ? pos2key([dims.files - 1 - i % dims.files, Math.floor(i / dims.files)]) : pos2key([i % dims.files, dims.ranks - 1 - Math.floor(i / dims.files)]);
      squares.appendChild(sq);
    }
    return squares;
  }
  function renderHand2(color, roles) {
    const hand = createEl("sg-hand");
    for (const role of roles) {
      const piece = { role, color }, wrapEl = createEl("sg-hp-wrap"), pieceEl = createEl("piece", pieceNameOf(piece));
      pieceEl.sgColor = color;
      pieceEl.sgRole = role;
      wrapEl.appendChild(pieceEl);
      hand.appendChild(wrapEl);
    }
    return hand;
  }

  // src/events.ts
  function clearBounds(s) {
    s.dom.bounds.board.bounds.clear();
    s.dom.bounds.hands.bounds.clear();
    s.dom.bounds.hands.pieceBounds.clear();
  }
  function onResize(s) {
    return () => {
      clearBounds(s);
      if (usesBounds(s.drawable.shapes.concat(s.drawable.autoShapes))) s.dom.redrawShapes();
    };
  }
  function bindBoard(s, boardEls) {
    if ("ResizeObserver" in window) new ResizeObserver(onResize(s)).observe(boardEls.board);
    if (s.viewOnly) return;
    const piecesEl = boardEls.pieces, promotionEl = boardEls.promotion;
    const onStart = startDragOrDraw(s);
    piecesEl.addEventListener("touchstart", onStart, {
      passive: false
    });
    piecesEl.addEventListener("mousedown", onStart, {
      passive: false
    });
    if (s.disableContextMenu || s.drawable.enabled)
      piecesEl.addEventListener("contextmenu", (e) => e.preventDefault());
    if (promotionEl) {
      const pieceSelection = (e) => promote(s, e);
      promotionEl.addEventListener("click", pieceSelection);
      if (s.disableContextMenu)
        promotionEl.addEventListener("contextmenu", (e) => e.preventDefault());
    }
  }
  function bindHand(s, handEl) {
    if ("ResizeObserver" in window) new ResizeObserver(onResize(s)).observe(handEl);
    if (s.viewOnly) return;
    const onStart = startDragFromHand(s);
    handEl.addEventListener("mousedown", onStart, { passive: false });
    handEl.addEventListener("touchstart", onStart, {
      passive: false
    });
    handEl.addEventListener("click", () => {
      if (s.promotion.current) {
        cancelPromotion(s);
        s.dom.redraw();
      }
    });
    if (s.disableContextMenu || s.drawable.enabled)
      handEl.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  function bindDocument(s) {
    const unbinds = [];
    if (!("ResizeObserver" in window)) {
      unbinds.push(unbindable(document.body, "shogiground.resize", onResize(s)));
    }
    if (!s.viewOnly) {
      const onmove = dragOrDraw(s, move2, move), onend = dragOrDraw(s, end2, end);
      for (const ev of ["touchmove", "mousemove"])
        unbinds.push(unbindable(document, ev, onmove));
      for (const ev of ["touchend", "mouseup"])
        unbinds.push(unbindable(document, ev, onend));
      unbinds.push(
        unbindable(document, "scroll", () => clearBounds(s), { capture: true, passive: true })
      );
      unbinds.push(unbindable(window, "resize", () => clearBounds(s), { passive: true }));
    }
    return () => unbinds.forEach((f) => f());
  }
  function unbindable(el, eventName, callback, options) {
    el.addEventListener(eventName, callback, options);
    return () => el.removeEventListener(eventName, callback, options);
  }
  function startDragOrDraw(s) {
    return (e) => {
      if (s.draggable.current) cancel2(s);
      else if (s.drawable.current) cancel(s);
      else if (e.shiftKey || isRightButton(e) || s.drawable.forced) {
        if (s.drawable.enabled) start(s, e);
      } else if (!s.viewOnly && !unwantedEvent(e)) start2(s, e);
    };
  }
  function dragOrDraw(s, withDrag, withDraw) {
    return (e) => {
      if (s.drawable.current) {
        if (s.drawable.enabled) withDraw(s, e);
      } else if (!s.viewOnly) withDrag(s, e);
    };
  }
  function startDragFromHand(s) {
    return (e) => {
      if (s.promotion.current) return;
      const pos = eventPosition(e), piece = pos && getHandPieceAtDomPos(pos, s.hands.roles, s.dom.bounds.hands.pieceBounds());
      if (piece) {
        if (s.draggable.current) cancel2(s);
        else if (s.drawable.current) cancel(s);
        else if (isMiddleButton(e)) {
          if (s.drawable.enabled) {
            if (e.cancelable !== false) e.preventDefault();
            setDrawPiece(s, piece);
          }
        } else if (e.shiftKey || isRightButton(e) || s.drawable.forced) {
          if (s.drawable.enabled) startFromHand(s, piece, e);
        } else if (!s.viewOnly && !unwantedEvent(e)) {
          if (e.cancelable !== false) e.preventDefault();
          dragNewPiece(s, piece, e);
        }
      }
    };
  }
  function promote(s, e) {
    e.stopPropagation();
    const target = e.target, cur = s.promotion.current;
    if (target && isPieceNode(target) && cur) {
      const piece = { color: target.sgColor, role: target.sgRole }, prom = !samePiece(cur.piece, piece);
      if (cur.dragged || s.turnColor !== s.activeColor && s.activeColor !== "both") {
        if (s.selected) userMove(s, s.selected, cur.key, prom);
        else if (s.selectedPiece) userDrop(s, s.selectedPiece, cur.key, prom);
      } else anim((s2) => selectSquare(s2, cur.key, prom), s);
      callUserFunction(s.promotion.events.after, piece);
    } else anim((s2) => cancelPromotion(s2), s);
    s.promotion.current = void 0;
    s.dom.redraw();
  }

  // src/dom.ts
  function attachBoard(state, boardWrap) {
    const elements = wrapBoard(boardWrap, state);
    if (elements.hands) attachHands(state, elements.hands.top, elements.hands.bottom);
    state.dom.wrapElements.board = boardWrap;
    state.dom.elements.board = elements;
    state.dom.bounds.board.bounds.clear();
    bindBoard(state, elements);
    state.drawable.prevSvgHash = "";
    state.promotion.prevPromotionHash = "";
    render(state, elements);
  }
  function attachHands(state, handTopWrap, handBottomWrap) {
    if (!state.dom.elements.hands) state.dom.elements.hands = {};
    if (!state.dom.wrapElements.hands) state.dom.wrapElements.hands = {};
    if (handTopWrap) {
      const handTop = wrapHand(handTopWrap, "top", state);
      state.dom.wrapElements.hands.top = handTopWrap;
      state.dom.elements.hands.top = handTop;
      bindHand(state, handTop);
      renderHand(state, handTop);
    }
    if (handBottomWrap) {
      const handBottom = wrapHand(handBottomWrap, "bottom", state);
      state.dom.wrapElements.hands.bottom = handBottomWrap;
      state.dom.elements.hands.bottom = handBottom;
      bindHand(state, handBottom);
      renderHand(state, handBottom);
    }
    if (handTopWrap || handBottomWrap) {
      state.dom.bounds.hands.bounds.clear();
      state.dom.bounds.hands.pieceBounds.clear();
    }
  }
  function redrawAll(wrapElements, state) {
    var _a, _b, _c, _d;
    if (wrapElements.board) attachBoard(state, wrapElements.board);
    if (wrapElements.hands && !state.hands.inlined)
      attachHands(state, wrapElements.hands.top, wrapElements.hands.bottom);
    state.dom.redrawShapes();
    if (state.events.insert)
      state.events.insert(wrapElements.board && state.dom.elements.board, {
        top: ((_a = wrapElements.hands) == null ? void 0 : _a.top) && ((_b = state.dom.elements.hands) == null ? void 0 : _b.top),
        bottom: ((_c = wrapElements.hands) == null ? void 0 : _c.bottom) && ((_d = state.dom.elements.hands) == null ? void 0 : _d.bottom)
      });
  }
  function detachElements(web, state) {
    var _a, _b, _c, _d;
    if (web.board) {
      state.dom.wrapElements.board = void 0;
      state.dom.elements.board = void 0;
      state.dom.bounds.board.bounds.clear();
    }
    if (state.dom.elements.hands && state.dom.wrapElements.hands) {
      if ((_a = web.hands) == null ? void 0 : _a.top) {
        state.dom.wrapElements.hands.top = void 0;
        state.dom.elements.hands.top = void 0;
      }
      if ((_b = web.hands) == null ? void 0 : _b.bottom) {
        state.dom.wrapElements.hands.bottom = void 0;
        state.dom.elements.hands.bottom = void 0;
      }
      if (((_c = web.hands) == null ? void 0 : _c.top) || ((_d = web.hands) == null ? void 0 : _d.bottom)) {
        state.dom.bounds.hands.bounds.clear();
        state.dom.bounds.hands.pieceBounds.clear();
      }
    }
  }

  // src/api.ts
  function start3(state) {
    return {
      attach(wrapElements) {
        redrawAll(wrapElements, state);
      },
      detach(wrapElementsBoolean) {
        detachElements(wrapElementsBoolean, state);
      },
      set(config, skipAnimation) {
        var _a, _b, _c, _d;
        function getByPath(path, obj) {
          const properties = path.split(".");
          return properties.reduce((prev, curr) => prev && prev[curr], obj);
        }
        const forceRedrawProps = [
          "orientation",
          "viewOnly",
          "coordinates.enabled",
          "coordinates.notation",
          "drawable.visible",
          "hands.inlined"
        ];
        const newDims = ((_a = config.sfen) == null ? void 0 : _a.board) && inferDimensions(config.sfen.board);
        const toRedraw = forceRedrawProps.some((p) => {
          const cRes = getByPath(p, config);
          return cRes && cRes !== getByPath(p, state);
        }) || !!(newDims && (newDims.files !== state.dimensions.files || newDims.ranks !== state.dimensions.ranks)) || !!((_c = (_b = config.hands) == null ? void 0 : _b.roles) == null ? void 0 : _c.every((r, i) => r === state.hands.roles[i]));
        if (toRedraw) {
          reset(state);
          configure(state, config);
          redrawAll(state.dom.wrapElements, state);
        } else {
          applyAnimation(state, config);
          (((_d = config.sfen) == null ? void 0 : _d.board) && !skipAnimation ? anim : render2)(
            (state2) => configure(state2, config),
            state
          );
        }
      },
      state,
      getBoardSfen: () => boardToSfen(state.pieces, state.dimensions, state.forsyth.toForsyth),
      getHandsSfen: () => handsToSfen(state.hands.handMap, state.hands.roles, state.forsyth.toForsyth),
      toggleOrientation() {
        toggleOrientation(state);
        redrawAll(state.dom.wrapElements, state);
      },
      move(orig, dest, prom) {
        anim(
          (state2) => baseMove(state2, orig, dest, prom || state2.promotion.forceMovePromotion(orig, dest)),
          state
        );
      },
      drop(piece, key, prom, spare) {
        anim((state2) => {
          state2.droppable.spare = !!spare;
          baseDrop(state2, piece, key, prom || state2.promotion.forceDropPromotion(piece, key));
        }, state);
      },
      setPieces(pieces) {
        anim((state2) => setPieces(state2, pieces), state);
      },
      addToHand(piece, count) {
        render2((state2) => addToHand(state2, piece, count), state);
      },
      removeFromHand(piece, count) {
        render2((state2) => removeFromHand(state2, piece, count), state);
      },
      selectSquare(key, prom, force) {
        if (key) anim((state2) => selectSquare(state2, key, prom, force), state);
        else if (state.selected) {
          unselect(state);
          state.dom.redraw();
        }
      },
      selectPiece(piece, spare, force) {
        if (piece) render2((state2) => selectPiece(state2, piece, spare, force, true), state);
        else if (state.selectedPiece) {
          unselect(state);
          state.dom.redraw();
        }
      },
      playPremove() {
        if (state.premovable.current) {
          if (anim(playPremove, state)) return true;
          state.dom.redraw();
        }
        return false;
      },
      playPredrop() {
        if (state.predroppable.current) {
          if (anim(playPredrop, state)) return true;
          state.dom.redraw();
        }
        return false;
      },
      cancelPremove() {
        render2(unsetPremove, state);
      },
      cancelPredrop() {
        render2(unsetPredrop, state);
      },
      cancelMoveOrDrop() {
        render2((state2) => {
          cancelMoveOrDrop(state2);
          cancel2(state2);
        }, state);
      },
      stop() {
        render2((state2) => {
          stop(state2);
        }, state);
      },
      setAutoShapes(shapes) {
        render2((state2) => state2.drawable.autoShapes = shapes, state);
      },
      setShapes(shapes) {
        render2((state2) => state2.drawable.shapes = shapes, state);
      },
      setSquareHighlights(squares) {
        render2((state2) => state2.drawable.squares = squares, state);
      },
      dragNewPiece(piece, event, spare) {
        dragNewPiece(state, piece, event, spare);
      },
      destroy() {
        stop(state);
        state.dom.unbind();
        state.dom.destroyed = true;
      }
    };
  }

  // src/state.ts
  function defaults() {
    return {
      pieces: /* @__PURE__ */ new Map(),
      dimensions: { files: 9, ranks: 9 },
      orientation: "sente",
      turnColor: "sente",
      activeColor: "both",
      viewOnly: false,
      squareRatio: [11, 12],
      disableContextMenu: true,
      blockTouchScroll: false,
      scaleDownPieces: true,
      coordinates: { enabled: true, files: "numeric", ranks: "numeric" },
      highlight: { lastDests: true, check: true, checkRoles: ["king"], hovered: false },
      animation: { enabled: true, hands: true, duration: 250 },
      hands: {
        inlined: false,
        handMap: /* @__PURE__ */ new Map([
          ["sente", /* @__PURE__ */ new Map()],
          ["gote", /* @__PURE__ */ new Map()]
        ]),
        roles: ["rook", "bishop", "gold", "silver", "knight", "lance", "pawn"]
      },
      movable: { free: true, showDests: true, events: {} },
      droppable: { free: true, showDests: true, spare: false, events: {} },
      premovable: { enabled: true, showDests: true, events: {} },
      predroppable: { enabled: true, showDests: true, events: {} },
      draggable: {
        enabled: true,
        distance: 3,
        autoDistance: true,
        showGhost: true,
        showTouchSquareOverlay: true,
        deleteOnDropOff: false,
        addToHandOnDropOff: false
      },
      selectable: { enabled: true, forceSpares: false, deleteOnTouch: false, addSparesToHand: false },
      promotion: {
        movePromotionDialog: () => false,
        forceMovePromotion: () => false,
        dropPromotionDialog: () => false,
        forceDropPromotion: () => false,
        promotesTo: () => void 0,
        unpromotesTo: () => void 0,
        events: {},
        prevPromotionHash: ""
      },
      forsyth: {},
      events: {},
      drawable: {
        enabled: true,
        // can draw
        visible: true,
        // can view
        forced: false,
        // can only draw
        eraseOnClick: true,
        shapes: [],
        autoShapes: [],
        squares: [],
        prevSvgHash: ""
      },
      pieceCooldown: {
        enabled: false
      }
    };
  }

  // src/redraw.ts
  function redrawShapesNow(state) {
    var _a;
    if ((_a = state.dom.elements.board) == null ? void 0 : _a.shapes)
      renderShapes(
        state,
        state.dom.elements.board.shapes.svg,
        state.dom.elements.board.shapes.customSvg,
        state.dom.elements.board.shapes.freePieces
      );
  }
  function redrawNow(state, skipShapes) {
    const boardEls = state.dom.elements.board;
    if (boardEls) {
      render(state, boardEls);
      if (!skipShapes) redrawShapesNow(state);
    }
    const handEls = state.dom.elements.hands;
    if (handEls) {
      if (handEls.top) renderHand(state, handEls.top);
      if (handEls.bottom) renderHand(state, handEls.bottom);
    }
  }

  // src/shogiground.ts
  function Shogiground(config, wrapElements) {
    const state = defaults();
    configure(state, config || {});
    const redrawStateNow = (skipShapes) => {
      redrawNow(state, skipShapes);
    };
    state.dom = {
      wrapElements: wrapElements || {},
      elements: {},
      bounds: {
        board: {
          bounds: memo(() => {
            var _a;
            return (_a = state.dom.elements.board) == null ? void 0 : _a.pieces.getBoundingClientRect();
          })
        },
        hands: {
          bounds: memo(() => {
            const handsRects = /* @__PURE__ */ new Map(), handEls = state.dom.elements.hands;
            if (handEls == null ? void 0 : handEls.top) handsRects.set("top", handEls.top.getBoundingClientRect());
            if (handEls == null ? void 0 : handEls.bottom) handsRects.set("bottom", handEls.bottom.getBoundingClientRect());
            return handsRects;
          }),
          pieceBounds: memo(() => {
            const handPiecesRects = /* @__PURE__ */ new Map(), handEls = state.dom.elements.hands;
            if (handEls == null ? void 0 : handEls.top) {
              let wrapEl = handEls.top.firstElementChild;
              while (wrapEl) {
                const pieceEl = wrapEl.firstElementChild, piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
                handPiecesRects.set(pieceNameOf(piece), pieceEl.getBoundingClientRect());
                wrapEl = wrapEl.nextElementSibling;
              }
            }
            if (handEls == null ? void 0 : handEls.bottom) {
              let wrapEl = handEls.bottom.firstElementChild;
              while (wrapEl) {
                const pieceEl = wrapEl.firstElementChild, piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
                handPiecesRects.set(pieceNameOf(piece), pieceEl.getBoundingClientRect());
                wrapEl = wrapEl.nextElementSibling;
              }
            }
            return handPiecesRects;
          })
        }
      },
      redrawNow: redrawStateNow,
      redraw: debounceRedraw(redrawStateNow),
      redrawShapes: debounceRedraw(() => redrawShapesNow(state)),
      unbind: bindDocument(state),
      destroyed: false
    };
    if (wrapElements) redrawAll(wrapElements, state);
    return start3(state);
  }
  function debounceRedraw(f) {
    let redrawing = false;
    return (...args) => {
      if (redrawing) return;
      redrawing = true;
      requestAnimationFrame(() => {
        f(...args);
        redrawing = false;
      });
    };
  }

  // src/index.ts
  var index_default = Shogiground;
  return __toCommonJS(index_exports);
})();
Shogiground = Shogiground.default;
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9jb25zdGFudHMudHMiLCAiLi4vc3JjL3V0aWwudHMiLCAiLi4vc3JjL2hhbmRzLnRzIiwgIi4uL3NyYy9yZW5kZXIudHMiLCAiLi4vc3JjL2JvYXJkLnRzIiwgIi4uL3NyYy9zZmVuLnRzIiwgIi4uL3NyYy9jb25maWcudHMiLCAiLi4vc3JjL2FuaW0udHMiLCAiLi4vc3JjL3NoYXBlcy50cyIsICIuLi9zcmMvZHJhdy50cyIsICIuLi9zcmMvZHJhZy50cyIsICIuLi9zcmMvY29vcmRzLnRzIiwgIi4uL3NyYy93cmFwLnRzIiwgIi4uL3NyYy9ldmVudHMudHMiLCAiLi4vc3JjL2RvbS50cyIsICIuLi9zcmMvYXBpLnRzIiwgIi4uL3NyYy9zdGF0ZS50cyIsICIuLi9zcmMvcmVkcmF3LnRzIiwgIi4uL3NyYy9zaG9naWdyb3VuZC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgU2hvZ2lncm91bmQgfSBmcm9tICcuL3Nob2dpZ3JvdW5kLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgU2hvZ2lncm91bmQ7XG4iLCAiaW1wb3J0IHR5cGUgeyBLZXkgfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9ycyA9IFsnc2VudGUnLCAnZ290ZSddIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgZmlsZXMgPSBbXG4gICcxJyxcbiAgJzInLFxuICAnMycsXG4gICc0JyxcbiAgJzUnLFxuICAnNicsXG4gICc3JyxcbiAgJzgnLFxuICAnOScsXG4gICcxMCcsXG4gICcxMScsXG4gICcxMicsXG4gICcxMycsXG4gICcxNCcsXG4gICcxNScsXG4gICcxNicsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IGNvbnN0IHJhbmtzID0gW1xuICAnYScsXG4gICdiJyxcbiAgJ2MnLFxuICAnZCcsXG4gICdlJyxcbiAgJ2YnLFxuICAnZycsXG4gICdoJyxcbiAgJ2knLFxuICAnaicsXG4gICdrJyxcbiAgJ2wnLFxuICAnbScsXG4gICduJyxcbiAgJ28nLFxuICAncCcsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogcmVhZG9ubHkgS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KFxuICAuLi5yYW5rcy5tYXAoKHIpID0+IGZpbGVzLm1hcCgoZikgPT4gZiArIHIpKSxcbik7XG5cbmV4cG9ydCBjb25zdCBub3RhdGlvbnMgPSBbJ251bWVyaWMnLCAnamFwYW5lc2UnLCAnZW5naW5lJywgJ2hleCcsICdkaXpoaSddIGFzIGNvbnN0O1xuIiwgImltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBhbGxLZXlzLCBjb2xvcnMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5cbmV4cG9ydCBjb25zdCBwb3Mya2V5ID0gKHBvczogc2cuUG9zKTogc2cuS2V5ID0+IGFsbEtleXNbcG9zWzBdICsgMTYgKiBwb3NbMV1dO1xuXG5leHBvcnQgY29uc3Qga2V5MnBvcyA9IChrOiBzZy5LZXkpOiBzZy5Qb3MgPT4ge1xuICBpZiAoay5sZW5ndGggPiAyKSByZXR1cm4gW2suY2hhckNvZGVBdCgxKSAtIDM5LCBrLmNoYXJDb2RlQXQoMikgLSA5N107XG4gIGVsc2UgcmV0dXJuIFtrLmNoYXJDb2RlQXQoMCkgLSA0OSwgay5jaGFyQ29kZUF0KDEpIC0gOTddO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIG1lbW88QT4oZjogKCkgPT4gQSk6IHNnLk1lbW88QT4ge1xuICBsZXQgdjogQSB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcmV0ID0gKCk6IEEgPT4ge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHYgPSBmKCk7XG4gICAgcmV0dXJuIHY7XG4gIH07XG4gIHJldC5jbGVhciA9ICgpID0+IHtcbiAgICB2ID0gdW5kZWZpbmVkO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsbFVzZXJGdW5jdGlvbjxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPihcbiAgZjogVCB8IHVuZGVmaW5lZCxcbiAgLi4uYXJnczogUGFyYW1ldGVyczxUPlxuKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgY29uc3Qgb3Bwb3NpdGUgPSAoYzogc2cuQ29sb3IpOiBzZy5Db2xvciA9PiAoYyA9PT0gJ3NlbnRlJyA/ICdnb3RlJyA6ICdzZW50ZScpO1xuXG5leHBvcnQgY29uc3Qgc2VudGVQb3YgPSAobzogc2cuQ29sb3IpOiBib29sZWFuID0+IG8gPT09ICdzZW50ZSc7XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxID0gKHBvczE6IHNnLlBvcywgcG9zMjogc2cuUG9zKTogbnVtYmVyID0+IHtcbiAgY29uc3QgZHggPSBwb3MxWzBdIC0gcG9zMlswXSxcbiAgICBkeSA9IHBvczFbMV0gLSBwb3MyWzFdO1xuICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2FtZVBpZWNlID0gKHAxOiBzZy5QaWVjZSwgcDI6IHNnLlBpZWNlKTogYm9vbGVhbiA9PlxuICBwMS5yb2xlID09PSBwMi5yb2xlICYmIHAxLmNvbG9yID09PSBwMi5jb2xvcjtcblxuY29uc3QgcG9zVG9UcmFuc2xhdGVCYXNlID0gKFxuICBwb3M6IHNnLlBvcyxcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgYXNTZW50ZTogYm9vbGVhbixcbiAgeEZhY3RvcjogbnVtYmVyLFxuICB5RmFjdG9yOiBudW1iZXIsXG4pOiBzZy5OdW1iZXJQYWlyID0+IFtcbiAgKGFzU2VudGUgPyBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSA6IHBvc1swXSkgKiB4RmFjdG9yLFxuICAoYXNTZW50ZSA/IHBvc1sxXSA6IGRpbXMucmFua3MgLSAxIC0gcG9zWzFdKSAqIHlGYWN0b3IsXG5dO1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVBYnMgPSAoXG4gIGRpbXM6IHNnLkRpbWVuc2lvbnMsXG4gIGJvdW5kczogRE9NUmVjdCxcbik6ICgocG9zOiBzZy5Qb3MsIGFzU2VudGU6IGJvb2xlYW4pID0+IHNnLk51bWJlclBhaXIpID0+IHtcbiAgY29uc3QgeEZhY3RvciA9IGJvdW5kcy53aWR0aCAvIGRpbXMuZmlsZXMsXG4gICAgeUZhY3RvciA9IGJvdW5kcy5oZWlnaHQgLyBkaW1zLnJhbmtzO1xuICByZXR1cm4gKHBvcywgYXNTZW50ZSkgPT4gcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgZGltcywgYXNTZW50ZSwgeEZhY3RvciwgeUZhY3Rvcik7XG59O1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVSZWwgPVxuICAoZGltczogc2cuRGltZW5zaW9ucyk6ICgocG9zOiBzZy5Qb3MsIGFzU2VudGU6IGJvb2xlYW4pID0+IHNnLk51bWJlclBhaXIpID0+XG4gIChwb3MsIGFzU2VudGUpID0+XG4gICAgcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgZGltcywgYXNTZW50ZSwgMTAwLCAxMDApO1xuXG5leHBvcnQgY29uc3QgdHJhbnNsYXRlQWJzID0gKGVsOiBIVE1MRWxlbWVudCwgcG9zOiBzZy5OdW1iZXJQYWlyLCBzY2FsZTogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwb3NbMF19cHgsJHtwb3NbMV19cHgpIHNjYWxlKCR7c2NhbGV9YDtcbn07XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVSZWwgPSAoXG4gIGVsOiBIVE1MRWxlbWVudCxcbiAgcGVyY2VudHM6IHNnLk51bWJlclBhaXIsXG4gIHNjYWxlRmFjdG9yOiBudW1iZXIsXG4gIHNjYWxlPzogbnVtYmVyLFxuKTogdm9pZCA9PiB7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwZXJjZW50c1swXSAqIHNjYWxlRmFjdG9yfSUsJHtwZXJjZW50c1sxXSAqIHNjYWxlRmFjdG9yfSUpIHNjYWxlKCR7XG4gICAgc2NhbGUgfHwgc2NhbGVGYWN0b3JcbiAgfSlgO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldERpc3BsYXkgPSAoZWw6IEhUTUxFbGVtZW50LCB2OiBib29sZWFuKTogdm9pZCA9PiB7XG4gIGVsLnN0eWxlLmRpc3BsYXkgPSB2ID8gJycgOiAnbm9uZSc7XG59O1xuXG5leHBvcnQgY29uc3QgZXZlbnRQb3NpdGlvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KTogc2cuTnVtYmVyUGFpciB8IHVuZGVmaW5lZCA9PiB7XG4gIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZIV07XG4gIGlmIChlLnRhcmdldFRvdWNoZXM/LlswXSkgcmV0dXJuIFtlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WCwgZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFldO1xuICByZXR1cm47IC8vIHRvdWNoZW5kIGhhcyBubyBwb3NpdGlvbiFcbn07XG5cbmV4cG9ydCBjb25zdCBpc1JpZ2h0QnV0dG9uID0gKGU6IHNnLk1vdWNoRXZlbnQpOiBib29sZWFuID0+IGUuYnV0dG9ucyA9PT0gMiB8fCBlLmJ1dHRvbiA9PT0gMjtcblxuZXhwb3J0IGNvbnN0IGlzTWlkZGxlQnV0dG9uID0gKGU6IHNnLk1vdWNoRXZlbnQpOiBib29sZWFuID0+IGUuYnV0dG9ucyA9PT0gNCB8fCBlLmJ1dHRvbiA9PT0gMTtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUVsID0gKHRhZ05hbWU6IHN0cmluZywgY2xhc3NOYW1lPzogc3RyaW5nKTogSFRNTEVsZW1lbnQgPT4ge1xuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gIGlmIChjbGFzc05hbWUpIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcbiAgcmV0dXJuIGVsO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBpZWNlTmFtZU9mKHBpZWNlOiBzZy5QaWVjZSk6IHNnLlBpZWNlTmFtZSB7XG4gIHJldHVybiBgJHtwaWVjZS5jb2xvcn0gJHtwaWVjZS5yb2xlfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBpZWNlTmFtZShwaWVjZU5hbWU6IHNnLlBpZWNlTmFtZSk6IHNnLlBpZWNlIHtcbiAgY29uc3Qgc3BsaXR0ZWQgPSBwaWVjZU5hbWUuc3BsaXQoJyAnLCAyKTtcbiAgcmV0dXJuIHsgY29sb3I6IHNwbGl0dGVkWzBdIGFzIHNnLkNvbG9yLCByb2xlOiBzcGxpdHRlZFsxXSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQaWVjZU5vZGUoZWw6IEhUTUxFbGVtZW50KTogZWwgaXMgc2cuUGllY2VOb2RlIHtcbiAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdQSUVDRSc7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNTcXVhcmVOb2RlKGVsOiBIVE1MRWxlbWVudCk6IGVsIGlzIHNnLlNxdWFyZU5vZGUge1xuICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1NRJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVTcXVhcmVDZW50ZXIoXG4gIGtleTogc2cuS2V5LFxuICBhc1NlbnRlOiBib29sZWFuLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib3VuZHM6IERPTVJlY3QsXG4pOiBzZy5OdW1iZXJQYWlyIHtcbiAgY29uc3QgcG9zID0ga2V5MnBvcyhrZXkpO1xuICBpZiAoYXNTZW50ZSkge1xuICAgIHBvc1swXSA9IGRpbXMuZmlsZXMgLSAxIC0gcG9zWzBdO1xuICAgIHBvc1sxXSA9IGRpbXMucmFua3MgLSAxIC0gcG9zWzFdO1xuICB9XG4gIHJldHVybiBbXG4gICAgYm91bmRzLmxlZnQgKyAoYm91bmRzLndpZHRoICogcG9zWzBdKSAvIGRpbXMuZmlsZXMgKyBib3VuZHMud2lkdGggLyAoZGltcy5maWxlcyAqIDIpLFxuICAgIGJvdW5kcy50b3AgK1xuICAgICAgKGJvdW5kcy5oZWlnaHQgKiAoZGltcy5yYW5rcyAtIDEgLSBwb3NbMV0pKSAvIGRpbXMucmFua3MgK1xuICAgICAgYm91bmRzLmhlaWdodCAvIChkaW1zLnJhbmtzICogMiksXG4gIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb21TcXVhcmVJbmRleE9mS2V5KGtleTogc2cuS2V5LCBhc1NlbnRlOiBib29sZWFuLCBkaW1zOiBzZy5EaW1lbnNpb25zKTogbnVtYmVyIHtcbiAgY29uc3QgcG9zID0ga2V5MnBvcyhrZXkpO1xuICBsZXQgaW5kZXggPSBkaW1zLmZpbGVzIC0gMSAtIHBvc1swXSArIHBvc1sxXSAqIGRpbXMuZmlsZXM7XG4gIGlmICghYXNTZW50ZSkgaW5kZXggPSBkaW1zLmZpbGVzICogZGltcy5yYW5rcyAtIDEgLSBpbmRleDtcblxuICByZXR1cm4gaW5kZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0luc2lkZVJlY3QocmVjdDogRE9NUmVjdCwgcG9zOiBzZy5OdW1iZXJQYWlyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgcmVjdC5sZWZ0IDw9IHBvc1swXSAmJlxuICAgIHJlY3QudG9wIDw9IHBvc1sxXSAmJlxuICAgIHJlY3QubGVmdCArIHJlY3Qud2lkdGggPiBwb3NbMF0gJiZcbiAgICByZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID4gcG9zWzFdXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlBdERvbVBvcyhcbiAgcG9zOiBzZy5OdW1iZXJQYWlyLFxuICBhc1NlbnRlOiBib29sZWFuLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICBib3VuZHM6IERPTVJlY3QsXG4pOiBzZy5LZXkgfCB1bmRlZmluZWQge1xuICBsZXQgZmlsZSA9IE1hdGguZmxvb3IoKGRpbXMuZmlsZXMgKiAocG9zWzBdIC0gYm91bmRzLmxlZnQpKSAvIGJvdW5kcy53aWR0aCk7XG4gIGlmIChhc1NlbnRlKSBmaWxlID0gZGltcy5maWxlcyAtIDEgLSBmaWxlO1xuICBsZXQgcmFuayA9IE1hdGguZmxvb3IoKGRpbXMucmFua3MgKiAocG9zWzFdIC0gYm91bmRzLnRvcCkpIC8gYm91bmRzLmhlaWdodCk7XG4gIGlmICghYXNTZW50ZSkgcmFuayA9IGRpbXMucmFua3MgLSAxIC0gcmFuaztcbiAgcmV0dXJuIGZpbGUgPj0gMCAmJiBmaWxlIDwgZGltcy5maWxlcyAmJiByYW5rID49IDAgJiYgcmFuayA8IGRpbXMucmFua3NcbiAgICA/IHBvczJrZXkoW2ZpbGUsIHJhbmtdKVxuICAgIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3FFbEF0S2V5KGtleTogc2cuS2V5LCBzdGF0ZTogU3RhdGUpOiBzZy5LZXllZE5vZGUgfCB1bmRlZmluZWQge1xuICBjb25zdCBib2FyZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZDtcbiAgaWYgKGJvYXJkRWxzKSB7XG4gICAgY29uc3Qgc3F1YXJlc0VsOiBIVE1MRWxlbWVudCA9IGJvYXJkRWxzLnNxdWFyZXM7XG5cbiAgICBsZXQgc3FFbCA9IHNxdWFyZXNFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICB3aGlsZSAoc3FFbCAmJiBpc1NxdWFyZU5vZGUoc3FFbCkpIHtcbiAgICAgIGlmIChzcUVsLnNnS2V5ID09PSBrZXkpIHtcbiAgICAgICAgcmV0dXJuIHNxRWw7XG4gICAgICB9XG4gICAgICBzcUVsID0gc3FFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIYW5kUGllY2VBdERvbVBvcyhcbiAgcG9zOiBzZy5OdW1iZXJQYWlyLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICBib3VuZHM6IE1hcDxzZy5QaWVjZU5hbWUsIERPTVJlY3Q+LFxuKTogc2cuUGllY2UgfCB1bmRlZmluZWQge1xuICBmb3IgKGNvbnN0IGNvbG9yIG9mIGNvbG9ycykge1xuICAgIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgICAgY29uc3QgcGllY2UgPSB7IGNvbG9yLCByb2xlIH0sXG4gICAgICAgIHBpZWNlUmVjdCA9IGJvdW5kcy5nZXQocGllY2VOYW1lT2YocGllY2UpKTtcbiAgICAgIGlmIChwaWVjZVJlY3QgJiYgaXNJbnNpZGVSZWN0KHBpZWNlUmVjdCwgcG9zKSkgcmV0dXJuIHBpZWNlO1xuICAgIH1cbiAgfVxuICByZXR1cm47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb3NPZk91dHNpZGVFbChcbiAgbGVmdDogbnVtYmVyLFxuICB0b3A6IG51bWJlcixcbiAgYXNTZW50ZTogYm9vbGVhbixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgYm9hcmRCb3VuZHM6IERPTVJlY3QsXG4pOiBzZy5Qb3MgfCB1bmRlZmluZWQge1xuICBjb25zdCBzcVcgPSBib2FyZEJvdW5kcy53aWR0aCAvIGRpbXMuZmlsZXMsXG4gICAgc3FIID0gYm9hcmRCb3VuZHMuaGVpZ2h0IC8gZGltcy5yYW5rcztcbiAgaWYgKCFzcVcgfHwgIXNxSCkgcmV0dXJuO1xuICBsZXQgeE9mZiA9IChsZWZ0IC0gYm9hcmRCb3VuZHMubGVmdCkgLyBzcVc7XG4gIGlmIChhc1NlbnRlKSB4T2ZmID0gZGltcy5maWxlcyAtIDEgLSB4T2ZmO1xuICBsZXQgeU9mZiA9ICh0b3AgLSBib2FyZEJvdW5kcy50b3ApIC8gc3FIO1xuICBpZiAoIWFzU2VudGUpIHlPZmYgPSBkaW1zLnJhbmtzIC0gMSAtIHlPZmY7XG4gIHJldHVybiBbeE9mZiwgeU9mZl07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBIZWFkbGVzc1N0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgc2FtZVBpZWNlIH0gZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRvSGFuZChzOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGNudCA9IDEpOiB2b2lkIHtcbiAgY29uc3QgaGFuZCA9IHMuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpLFxuICAgIHJvbGUgPVxuICAgICAgKHMuaGFuZHMucm9sZXMuaW5jbHVkZXMocGllY2Uucm9sZSkgPyBwaWVjZS5yb2xlIDogcy5wcm9tb3Rpb24udW5wcm9tb3Rlc1RvKHBpZWNlLnJvbGUpKSB8fFxuICAgICAgcGllY2Uucm9sZTtcbiAgaWYgKGhhbmQgJiYgcy5oYW5kcy5yb2xlcy5pbmNsdWRlcyhyb2xlKSkgaGFuZC5zZXQocm9sZSwgKGhhbmQuZ2V0KHJvbGUpIHx8IDApICsgY250KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUZyb21IYW5kKHM6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgY250ID0gMSk6IHZvaWQge1xuICBjb25zdCBoYW5kID0gcy5oYW5kcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvciksXG4gICAgcm9sZSA9XG4gICAgICAocy5oYW5kcy5yb2xlcy5pbmNsdWRlcyhwaWVjZS5yb2xlKSA/IHBpZWNlLnJvbGUgOiBzLnByb21vdGlvbi51bnByb21vdGVzVG8ocGllY2Uucm9sZSkpIHx8XG4gICAgICBwaWVjZS5yb2xlLFxuICAgIG51bSA9IGhhbmQ/LmdldChyb2xlKTtcbiAgaWYgKGhhbmQgJiYgbnVtKSBoYW5kLnNldChyb2xlLCBNYXRoLm1heChudW0gLSBjbnQsIDApKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckhhbmQoczogSGVhZGxlc3NTdGF0ZSwgaGFuZEVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICBoYW5kRWwuY2xhc3NMaXN0LnRvZ2dsZSgncHJvbW90aW9uJywgISFzLnByb21vdGlvbi5jdXJyZW50KTtcbiAgbGV0IHdyYXBFbCA9IGhhbmRFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgd2hpbGUgKHdyYXBFbCkge1xuICAgIGNvbnN0IHBpZWNlRWwgPSB3cmFwRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgc2cuUGllY2VOb2RlLFxuICAgICAgcGllY2UgPSB7IHJvbGU6IHBpZWNlRWwuc2dSb2xlLCBjb2xvcjogcGllY2VFbC5zZ0NvbG9yIH0sXG4gICAgICBudW0gPSBzLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKT8uZ2V0KHBpZWNlLnJvbGUpIHx8IDAsXG4gICAgICBpc1NlbGVjdGVkID0gISFzLnNlbGVjdGVkUGllY2UgJiYgc2FtZVBpZWNlKHBpZWNlLCBzLnNlbGVjdGVkUGllY2UpICYmICFzLmRyb3BwYWJsZS5zcGFyZTtcblxuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ3NlbGVjdGVkJyxcbiAgICAgIChzLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHwgcy5hY3RpdmVDb2xvciA9PT0gcy50dXJuQ29sb3IpICYmIGlzU2VsZWN0ZWQsXG4gICAgKTtcbiAgICB3cmFwRWwuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICdwcmVzZWxlY3RlZCcsXG4gICAgICBzLmFjdGl2ZUNvbG9yICE9PSAnYm90aCcgJiYgcy5hY3RpdmVDb2xvciAhPT0gcy50dXJuQ29sb3IgJiYgaXNTZWxlY3RlZCxcbiAgICApO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ2xhc3QtZGVzdCcsXG4gICAgICBzLmhpZ2hsaWdodC5sYXN0RGVzdHMgJiYgISFzLmxhc3RQaWVjZSAmJiBzYW1lUGllY2UocGllY2UsIHMubGFzdFBpZWNlKSxcbiAgICApO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKCdkcmF3aW5nJywgISFzLmRyYXdhYmxlLnBpZWNlICYmIHNhbWVQaWVjZShzLmRyYXdhYmxlLnBpZWNlLCBwaWVjZSkpO1xuICAgIHdyYXBFbC5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ2N1cnJlbnQtcHJlJyxcbiAgICAgICEhcy5wcmVkcm9wcGFibGUuY3VycmVudCAmJiBzYW1lUGllY2Uocy5wcmVkcm9wcGFibGUuY3VycmVudC5waWVjZSwgcGllY2UpLFxuICAgICk7XG4gICAgd3JhcEVsLmRhdGFzZXQubmIgPSBudW0udG9TdHJpbmcoKTtcbiAgICB3cmFwRWwgPSB3cmFwRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBBbmltQ3VycmVudCwgQW5pbVZlY3RvcnMsIEFuaW1WZWN0b3IsIEFuaW1GYWRpbmdzLCBBbmltUHJvbW90aW9ucyB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBrZXkycG9zLFxuICBjcmVhdGVFbCxcbiAgc2V0RGlzcGxheSxcbiAgcG9zVG9UcmFuc2xhdGVSZWwsXG4gIHRyYW5zbGF0ZVJlbCxcbiAgcGllY2VOYW1lT2YsXG4gIHNlbnRlUG92LFxuICBpc1BpZWNlTm9kZSxcbiAgaXNTcXVhcmVOb2RlLCBnZXRTcUVsQXRLZXksXG59IGZyb20gJy4vdXRpbC5qcyc7XG5cbnR5cGUgU3F1YXJlQ2xhc3NlcyA9IE1hcDxzZy5LZXksIHN0cmluZz47XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoczogU3RhdGUsIGJvYXJkRWxzOiBzZy5Cb2FyZEVsZW1lbnRzKTogdm9pZCB7XG4gIGNvbnN0IGFzU2VudGU6IGJvb2xlYW4gPSBzZW50ZVBvdihzLm9yaWVudGF0aW9uKSxcbiAgICBzY2FsZURvd24gPSBzLnNjYWxlRG93blBpZWNlcyA/IDAuNSA6IDEsXG4gICAgcG9zVG9UcmFuc2xhdGUgPSBwb3NUb1RyYW5zbGF0ZVJlbChzLmRpbWVuc2lvbnMpLFxuICAgIHNxdWFyZXNFbDogSFRNTEVsZW1lbnQgPSBib2FyZEVscy5zcXVhcmVzLFxuICAgIHBpZWNlc0VsOiBIVE1MRWxlbWVudCA9IGJvYXJkRWxzLnBpZWNlcyxcbiAgICBkcmFnZ2VkRWw6IHNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCA9IGJvYXJkRWxzLmRyYWdnZWQsXG4gICAgc3F1YXJlT3ZlckVsOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IGJvYXJkRWxzLnNxdWFyZU92ZXIsXG4gICAgcHJvbW90aW9uRWw6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkID0gYm9hcmRFbHMucHJvbW90aW9uLFxuICAgIHBpZWNlczogc2cuUGllY2VzID0gcy5waWVjZXMsXG4gICAgY3VyQW5pbTogQW5pbUN1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmFuaW1hdGlvbi5jdXJyZW50LFxuICAgIGFuaW1zOiBBbmltVmVjdG9ycyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uYW5pbXMgOiBuZXcgTWFwKCksXG4gICAgZmFkaW5nczogQW5pbUZhZGluZ3MgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmZhZGluZ3MgOiBuZXcgTWFwKCksXG4gICAgcHJvbW90aW9uczogQW5pbVByb21vdGlvbnMgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLnByb21vdGlvbnMgOiBuZXcgTWFwKCksXG4gICAgY3VyRHJhZzogRHJhZ0N1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmRyYWdnYWJsZS5jdXJyZW50LFxuICAgIGN1clByb21LZXk6IHNnLktleSB8IHVuZGVmaW5lZCA9IHMucHJvbW90aW9uLmN1cnJlbnQ/LmRyYWdnZWQgPyBzLnNlbGVjdGVkIDogdW5kZWZpbmVkLFxuICAgIHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSBjb21wdXRlU3F1YXJlQ2xhc3NlcyhzKSxcbiAgICBzYW1lUGllY2VzID0gbmV3IFNldDxzZy5LZXk+KCksXG4gICAgbW92ZWRQaWVjZXMgPSBuZXcgTWFwPHNnLlBpZWNlTmFtZSwgc2cuUGllY2VOb2RlW10+KCk7XG5cbiAgLy8gaWYgcGllY2Ugbm90IGJlaW5nIGRyYWdnZWQgYW55bW9yZSwgaGlkZSBpdFxuICBpZiAoIWN1ckRyYWcgJiYgZHJhZ2dlZEVsPy5zZ0RyYWdnaW5nKSB7XG4gICAgZHJhZ2dlZEVsLnNnRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICBzZXREaXNwbGF5KGRyYWdnZWRFbCwgZmFsc2UpO1xuICAgIGlmIChzcXVhcmVPdmVyRWwpIHNldERpc3BsYXkoc3F1YXJlT3ZlckVsLCBmYWxzZSk7XG4gIH1cblxuICBsZXQgazogc2cuS2V5LFxuICAgIGVsOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCxcbiAgICBwaWVjZUF0S2V5OiBzZy5QaWVjZSB8IHVuZGVmaW5lZCxcbiAgICBlbFBpZWNlTmFtZTogc2cuUGllY2VOYW1lLFxuICAgIGFuaW06IEFuaW1WZWN0b3IgfCB1bmRlZmluZWQsXG4gICAgZmFkaW5nOiBzZy5QaWVjZSB8IHVuZGVmaW5lZCxcbiAgICBwcm9tOiBzZy5QaWVjZSB8IHVuZGVmaW5lZCxcbiAgICBwTXZkc2V0OiBzZy5QaWVjZU5vZGVbXSB8IHVuZGVmaW5lZCxcbiAgICBwTXZkOiBzZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQ7XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBib2FyZCBkb20gZWxlbWVudHMsIGFwcGx5IGFuaW1hdGlvbnMgYW5kIGZsYWcgbW92ZWQgcGllY2VzXG4gIGVsID0gcGllY2VzRWwuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIHdoaWxlIChlbCkge1xuICAgIGlmIChpc1BpZWNlTm9kZShlbCkpIHtcbiAgICAgIGsgPSBlbC5zZ0tleTtcbiAgICAgIHBpZWNlQXRLZXkgPSBwaWVjZXMuZ2V0KGspO1xuICAgICAgYW5pbSA9IGFuaW1zLmdldChrKTtcbiAgICAgIGZhZGluZyA9IGZhZGluZ3MuZ2V0KGspO1xuICAgICAgcHJvbSA9IHByb21vdGlvbnMuZ2V0KGspO1xuICAgICAgZWxQaWVjZU5hbWUgPSBwaWVjZU5hbWVPZih7IGNvbG9yOiBlbC5zZ0NvbG9yLCByb2xlOiBlbC5zZ1JvbGUgfSk7XG5cbiAgICAgIC8vIGlmIHBpZWNlIGRyYWdnZWQgYWRkIG9yIHJlbW92ZSBnaG9zdCBjbGFzcyBvciBpZiBwcm9tb3Rpb24gZGlhbG9nIGlzIGFjdGl2ZSBmb3IgdGhlIHBpZWNlIGFkZCBwcm9tIGNsYXNzXG4gICAgICBpZiAoXG4gICAgICAgICgoY3VyRHJhZz8uc3RhcnRlZCAmJiBjdXJEcmFnLmZyb21Cb2FyZD8ub3JpZyA9PT0gaykgfHwgKGN1clByb21LZXkgJiYgY3VyUHJvbUtleSA9PT0gaykpICYmXG4gICAgICAgICFlbC5zZ0dob3N0XG4gICAgICApIHtcbiAgICAgICAgZWwuc2dHaG9zdCA9IHRydWU7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2dob3N0Jyk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBlbC5zZ0dob3N0ICYmXG4gICAgICAgICghY3VyRHJhZyB8fCBjdXJEcmFnLmZyb21Cb2FyZD8ub3JpZyAhPT0gaykgJiZcbiAgICAgICAgKCFjdXJQcm9tS2V5IHx8IGN1clByb21LZXkgIT09IGspXG4gICAgICApIHtcbiAgICAgICAgZWwuc2dHaG9zdCA9IGZhbHNlO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnaG9zdCcpO1xuICAgICAgfVxuICAgICAgLy8gcmVtb3ZlIGZhZGluZyBjbGFzcyBpZiBpdCBzdGlsbCByZW1haW5zXG4gICAgICBpZiAoIWZhZGluZyAmJiBlbC5zZ0ZhZGluZykge1xuICAgICAgICBlbC5zZ0ZhZGluZyA9IGZhbHNlO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgIH1cbiAgICAgIC8vIHRoZXJlIGlzIG5vdyBhIHBpZWNlIGF0IHRoaXMgZG9tIGtleVxuICAgICAgaWYgKHBpZWNlQXRLZXkpIHtcbiAgICAgICAgLy8gY29udGludWUgYW5pbWF0aW9uIGlmIGFscmVhZHkgYW5pbWF0aW5nIGFuZCBzYW1lIHBpZWNlIG9yIHByb21vdGluZyBwaWVjZVxuICAgICAgICAvLyAob3RoZXJ3aXNlIGl0IGNvdWxkIGFuaW1hdGUgYSBjYXB0dXJlZCBwaWVjZSlcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGFuaW0gJiZcbiAgICAgICAgICBlbC5zZ0FuaW1hdGluZyAmJlxuICAgICAgICAgIChlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocGllY2VBdEtleSkgfHwgKHByb20gJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHByb20pKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgICB0cmFuc2xhdGVSZWwoZWwsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNTZW50ZSksIHNjYWxlRG93bik7XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuc2dBbmltYXRpbmcpIHtcbiAgICAgICAgICBlbC5zZ0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FuaW0nKTtcbiAgICAgICAgICB0cmFuc2xhdGVSZWwoZWwsIHBvc1RvVHJhbnNsYXRlKGtleTJwb3MoayksIGFzU2VudGUpLCBzY2FsZURvd24pO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNhbWUgcGllY2U6IGZsYWcgYXMgc2FtZVxuICAgICAgICBpZiAoZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpICYmICghZmFkaW5nIHx8ICFlbC5zZ0ZhZGluZykpIHtcbiAgICAgICAgICBzYW1lUGllY2VzLmFkZChrKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBkaWZmZXJlbnQgcGllY2U6IGZsYWcgYXMgbW92ZWQgdW5sZXNzIGl0IGlzIGEgZmFkaW5nIHBpZWNlIG9yIGFuIGFuaW1hdGVkIHByb21vdGluZyBwaWVjZVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoZmFkaW5nICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihmYWRpbmcpKSB7XG4gICAgICAgICAgICBlbC5zZ0ZhZGluZyA9IHRydWU7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdmYWRpbmcnKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHByb20gJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHByb20pKSB7XG4gICAgICAgICAgICBzYW1lUGllY2VzLmFkZChrKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXBwZW5kVmFsdWUobW92ZWRQaWVjZXMsIGVsUGllY2VOYW1lLCBlbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZTogZmxhZyBhcyBtb3ZlZFxuICAgICAgZWxzZSB7XG4gICAgICAgIGFwcGVuZFZhbHVlKG1vdmVkUGllY2VzLCBlbFBpZWNlTmFtZSwgZWwpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbCA9IGVsLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIHdhbGsgb3ZlciBhbGwgc3F1YXJlcyBhbmQgYXBwbHkgY2xhc3Nlc1xuICBsZXQgc3FFbCA9IHNxdWFyZXNFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgd2hpbGUgKHNxRWwgJiYgaXNTcXVhcmVOb2RlKHNxRWwpKSB7XG4gICAgc3FFbC5jbGFzc05hbWUgPSBzcXVhcmVzLmdldChzcUVsLnNnS2V5KSB8fCAnJztcbiAgICBzcUVsID0gc3FFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHBpZWNlcyBpbiBjdXJyZW50IHNldCwgYXBwbHkgZG9tIGNoYW5nZXMgdG8gbW92ZWQgcGllY2VzXG4gIC8vIG9yIGFwcGVuZCBuZXcgcGllY2VzXG4gIGZvciAoY29uc3QgW2ssIHBdIG9mIHBpZWNlcykge1xuICAgIGNvbnN0IHBpZWNlID0gcHJvbW90aW9ucy5nZXQoaykgfHwgcDtcbiAgICBhbmltID0gYW5pbXMuZ2V0KGspO1xuICAgIGlmICghc2FtZVBpZWNlcy5oYXMoaykpIHtcbiAgICAgIHBNdmRzZXQgPSBtb3ZlZFBpZWNlcy5nZXQocGllY2VOYW1lT2YocGllY2UpKTtcbiAgICAgIHBNdmQgPSBwTXZkc2V0Py5wb3AoKTtcbiAgICAgIC8vIGEgc2FtZSBwaWVjZSB3YXMgbW92ZWRcbiAgICAgIGlmIChwTXZkKSB7XG4gICAgICAgIC8vIGFwcGx5IGRvbSBjaGFuZ2VzXG4gICAgICAgIHBNdmQuc2dLZXkgPSBrO1xuICAgICAgICBpZiAocE12ZC5zZ0ZhZGluZykge1xuICAgICAgICAgIHBNdmQuc2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGluZycpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcE12ZC5zZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QuYWRkKCdhbmltJyk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNsYXRlUmVsKHBNdmQsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNTZW50ZSksIHNjYWxlRG93bik7XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZSBpbiBtb3ZlZCBvYmo6IGluc2VydCB0aGUgbmV3IHBpZWNlXG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgcGllY2VOb2RlID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lT2YocCkpIGFzIHNnLlBpZWNlTm9kZSxcbiAgICAgICAgICBwb3MgPSBrZXkycG9zKGspO1xuXG4gICAgICAgIHBpZWNlTm9kZS5zZ0NvbG9yID0gcC5jb2xvcjtcbiAgICAgICAgcGllY2VOb2RlLnNnUm9sZSA9IHAucm9sZTtcbiAgICAgICAgcGllY2VOb2RlLnNnS2V5ID0gaztcbiAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICBwaWVjZU5vZGUuc2dBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zbGF0ZVJlbChwaWVjZU5vZGUsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNTZW50ZSksIHNjYWxlRG93bik7XG5cbiAgICAgICAgcGllY2VzRWwuYXBwZW5kQ2hpbGQocGllY2VOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gcmVtb3ZlIGFueSBlbGVtZW50IHRoYXQgcmVtYWlucyBpbiB0aGUgbW92ZWQgc2V0c1xuICBmb3IgKGNvbnN0IG5vZGVzIG9mIG1vdmVkUGllY2VzLnZhbHVlcygpKSB7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICBwaWVjZXNFbC5yZW1vdmVDaGlsZChub2RlKTtcbiAgICB9XG4gIH1cblxuICBpZiAocHJvbW90aW9uRWwpIHJlbmRlclByb21vdGlvbihzLCBwcm9tb3Rpb25FbCk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZFZhbHVlPEssIFY+KG1hcDogTWFwPEssIFZbXT4sIGtleTogSywgdmFsdWU6IFYpOiB2b2lkIHtcbiAgY29uc3QgYXJyID0gbWFwLmdldChrZXkpO1xuICBpZiAoYXJyKSBhcnIucHVzaCh2YWx1ZSk7XG4gIGVsc2UgbWFwLnNldChrZXksIFt2YWx1ZV0pO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlU3F1YXJlQ2xhc3NlcyhzOiBTdGF0ZSk6IFNxdWFyZUNsYXNzZXMge1xuICBjb25zdCBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0gbmV3IE1hcCgpO1xuICBpZiAocy5sYXN0RGVzdHMgJiYgcy5oaWdobGlnaHQubGFzdERlc3RzKVxuICAgIGZvciAoY29uc3QgayBvZiBzLmxhc3REZXN0cykgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdsYXN0LWRlc3QnKTtcbiAgaWYgKHMuY2hlY2tzICYmIHMuaGlnaGxpZ2h0LmNoZWNrKVxuICAgIGZvciAoY29uc3QgY2hlY2sgb2Ygcy5jaGVja3MpIGFkZFNxdWFyZShzcXVhcmVzLCBjaGVjaywgJ2NoZWNrJyk7XG4gIGlmIChzLmhvdmVyZWQpIGFkZFNxdWFyZShzcXVhcmVzLCBzLmhvdmVyZWQsICdob3ZlcicpO1xuICBpZiAocy5zZWxlY3RlZCkge1xuICAgIGlmIChzLmFjdGl2ZUNvbG9yID09PSAnYm90aCcgfHwgcy5hY3RpdmVDb2xvciA9PT0gcy50dXJuQ29sb3IpXG4gICAgICBhZGRTcXVhcmUoc3F1YXJlcywgcy5zZWxlY3RlZCwgJ3NlbGVjdGVkJyk7XG4gICAgZWxzZSBhZGRTcXVhcmUoc3F1YXJlcywgcy5zZWxlY3RlZCwgJ3ByZXNlbGVjdGVkJyk7XG4gICAgaWYgKHMubW92YWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IGRlc3RzID0gcy5tb3ZhYmxlLmRlc3RzPy5nZXQocy5zZWxlY3RlZCk7XG4gICAgICBpZiAoZGVzdHMpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBkZXN0cykge1xuICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnZGVzdCcgKyAocy5waWVjZXMuaGFzKGspID8gJyBvYycgOiAnJykpO1xuICAgICAgICB9XG4gICAgICBjb25zdCBwRGVzdHMgPSBzLnByZW1vdmFibGUuZGVzdHM7XG4gICAgICBpZiAocERlc3RzKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgcERlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdwcmUtZGVzdCcgKyAocy5waWVjZXMuaGFzKGspID8gJyBvYycgOiAnJykpO1xuICAgICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGlmIChzLmRyb3BwYWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IGRlc3RzID0gcy5kcm9wcGFibGUuZGVzdHM/LmdldChwaWVjZU5hbWVPZihzLnNlbGVjdGVkUGllY2UpKTtcbiAgICAgIGlmIChkZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIGRlc3RzKSB7XG4gICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdkZXN0Jyk7XG4gICAgICAgIH1cbiAgICAgIGNvbnN0IHBEZXN0cyA9IHMucHJlZHJvcHBhYmxlLmRlc3RzO1xuICAgICAgaWYgKHBEZXN0cylcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIHBEZXN0cykge1xuICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAncHJlLWRlc3QnICsgKHMucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJycpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuICBjb25zdCBwcmVtb3ZlID0gcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGlmIChwcmVtb3ZlKSB7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHByZW1vdmUub3JpZywgJ2N1cnJlbnQtcHJlJyk7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHByZW1vdmUuZGVzdCwgJ2N1cnJlbnQtcHJlJyArIChwcmVtb3ZlLnByb20gPyAnIHByb20nIDogJycpKTtcbiAgfSBlbHNlIGlmIChzLnByZWRyb3BwYWJsZS5jdXJyZW50KVxuICAgIGFkZFNxdWFyZShcbiAgICAgIHNxdWFyZXMsXG4gICAgICBzLnByZWRyb3BwYWJsZS5jdXJyZW50LmtleSxcbiAgICAgICdjdXJyZW50LXByZScgKyAocy5wcmVkcm9wcGFibGUuY3VycmVudC5wcm9tID8gJyBwcm9tJyA6ICcnKSxcbiAgICApO1xuXG4gIGZvciAoY29uc3Qgc3FoIG9mIHMuZHJhd2FibGUuc3F1YXJlcykge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzcWgua2V5LCBzcWguY2xhc3NOYW1lKTtcbiAgfVxuXG4gIHJldHVybiBzcXVhcmVzO1xufVxuXG5mdW5jdGlvbiBhZGRTcXVhcmUoc3F1YXJlczogU3F1YXJlQ2xhc3Nlcywga2V5OiBzZy5LZXksIGtsYXNzOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgY2xhc3NlcyA9IHNxdWFyZXMuZ2V0KGtleSk7XG4gIGlmIChjbGFzc2VzKSBzcXVhcmVzLnNldChrZXksIGAke2NsYXNzZXN9ICR7a2xhc3N9YCk7XG4gIGVsc2Ugc3F1YXJlcy5zZXQoa2V5LCBrbGFzcyk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclByb21vdGlvbihzOiBTdGF0ZSwgcHJvbW90aW9uRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMucHJvbW90aW9uLmN1cnJlbnQsXG4gICAga2V5ID0gY3VyPy5rZXksXG4gICAgcGllY2VzID0gY3VyID8gW2N1ci5wcm9tb3RlZFBpZWNlLCBjdXIucGllY2VdIDogW10sXG4gICAgaGFzaCA9IHByb21vdGlvbkhhc2goISFjdXIsIGtleSwgcGllY2VzKTtcbiAgaWYgKHMucHJvbW90aW9uLnByZXZQcm9tb3Rpb25IYXNoID09PSBoYXNoKSByZXR1cm47XG4gIHMucHJvbW90aW9uLnByZXZQcm9tb3Rpb25IYXNoID0gaGFzaDtcblxuICBpZiAoa2V5KSB7XG4gICAgY29uc3QgYXNTZW50ZSA9IHNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgaW5pdFBvcyA9IGtleTJwb3Moa2V5KSxcbiAgICAgIGNvbG9yID0gY3VyLnBpZWNlLmNvbG9yLFxuICAgICAgcHJvbW90aW9uU3F1YXJlID0gY3JlYXRlRWwoJ3NnLXByb21vdGlvbi1zcXVhcmUnKSxcbiAgICAgIHByb21vdGlvbkNob2ljZXMgPSBjcmVhdGVFbCgnc2ctcHJvbW90aW9uLWNob2ljZXMnKTtcbiAgICBpZiAocy5vcmllbnRhdGlvbiAhPT0gY29sb3IpIHByb21vdGlvbkNob2ljZXMuY2xhc3NMaXN0LmFkZCgncmV2ZXJzZWQnKTtcbiAgICB0cmFuc2xhdGVSZWwocHJvbW90aW9uU3F1YXJlLCBwb3NUb1RyYW5zbGF0ZVJlbChzLmRpbWVuc2lvbnMpKGluaXRQb3MsIGFzU2VudGUpLCAxKTtcblxuICAgIGZvciAoY29uc3QgcCBvZiBwaWVjZXMpIHtcbiAgICAgIGNvbnN0IHBpZWNlTm9kZSA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHApKSBhcyBzZy5QaWVjZU5vZGU7XG4gICAgICBwaWVjZU5vZGUuc2dDb2xvciA9IHAuY29sb3I7XG4gICAgICBwaWVjZU5vZGUuc2dSb2xlID0gcC5yb2xlO1xuICAgICAgcHJvbW90aW9uQ2hvaWNlcy5hcHBlbmRDaGlsZChwaWVjZU5vZGUpO1xuICAgIH1cblxuICAgIHByb21vdGlvbkVsLmlubmVySFRNTCA9ICcnO1xuICAgIHByb21vdGlvblNxdWFyZS5hcHBlbmRDaGlsZChwcm9tb3Rpb25DaG9pY2VzKTtcbiAgICBwcm9tb3Rpb25FbC5hcHBlbmRDaGlsZChwcm9tb3Rpb25TcXVhcmUpO1xuICAgIHNldERpc3BsYXkocHJvbW90aW9uRWwsIHRydWUpO1xuICB9IGVsc2Uge1xuICAgIHNldERpc3BsYXkocHJvbW90aW9uRWwsIGZhbHNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9tb3Rpb25IYXNoKGFjdGl2ZTogYm9vbGVhbiwga2V5OiBzZy5LZXkgfCB1bmRlZmluZWQsIHBpZWNlczogc2cuUGllY2VbXSk6IHN0cmluZyB7XG4gIHJldHVybiBbYWN0aXZlLCBrZXksIHBpZWNlcy5tYXAoKHApID0+IHBpZWNlTmFtZU9mKHApKS5qb2luKCcgJyldLmpvaW4oJyAnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclNxdWFyZVRpbWVyKGtleTogc2cuS2V5LCBzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3Qgc3FFbCA9IGdldFNxRWxBdEtleShrZXksIHN0YXRlKTtcbiAgaWYgKCFzcUVsKSByZXR1cm47XG4gIHJlbW92ZUFjdGl2ZVRpbWVyKHNxRWwpO1xuICBjb25zdCB0aW1lckNvbXBvbmVudCA9IGNyZWF0ZUVsKFwiZGl2XCIsIFwidGltZXJcIik7XG4gIHRpbWVyQ29tcG9uZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhbmltYXRpb25lbmRcIiwgKCkgPT4ge1xuICAgIHRpbWVyQ29tcG9uZW50LnJlbW92ZSgpO1xuICB9KTtcbiAgc3FFbC5hcHBlbmRDaGlsZCh0aW1lckNvbXBvbmVudCk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUFjdGl2ZVRpbWVyKHNxRWw6IHNnLktleWVkTm9kZSk6IHZvaWQge1xuICBjb25zdCBjaGlsZHJlbiA9IEFycmF5LmZyb20oc3FFbC5jaGlsZE5vZGVzKTtcbiAgZm9yIChjb25zdCBub2RlIG9mIGNoaWxkcmVuKSB7XG4gICAgaWYgKChub2RlIGFzIEhUTUxFbGVtZW50KS5jbGFzc05hbWUgPT09IFwidGltZXJcIikge1xuICAgICAgc3FFbC5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgdHlwZSB7IEhlYWRsZXNzU3RhdGUsIFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgY2FsbFVzZXJGdW5jdGlvbiwgb3Bwb3NpdGUsIHBpZWNlTmFtZU9mLCBzYW1lUGllY2UgfSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgYWRkVG9IYW5kLCByZW1vdmVGcm9tSGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHsgcmVuZGVyU3F1YXJlVGltZXIgfSBmcm9tIFwiLi9yZW5kZXIuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm9yaWVudGF0aW9uID0gb3Bwb3NpdGUoc3RhdGUub3JpZW50YXRpb24pO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gICAgc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICBzdGF0ZS5ob3ZlcmVkID1cbiAgICBzdGF0ZS5zZWxlY3RlZCA9XG4gICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSA9XG4gICAgICB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIGNhbmNlbFByb21vdGlvbihzdGF0ZSk7XG4gIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPSBzdGF0ZS5ob3ZlcmVkID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UGllY2VzKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZXM6IHNnLlBpZWNlc0RpZmYpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBba2V5LCBwaWVjZV0gb2YgcGllY2VzKSB7XG4gICAgaWYgKHBpZWNlKSBzdGF0ZS5waWVjZXMuc2V0KGtleSwgcGllY2UpO1xuICAgIGVsc2Ugc3RhdGUucGllY2VzLmRlbGV0ZShrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDaGVja3Moc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNoZWNrc1ZhbHVlOiBzZy5LZXlbXSB8IHNnLkNvbG9yIHwgYm9vbGVhbik6IHZvaWQge1xuICBpZiAoQXJyYXkuaXNBcnJheShjaGVja3NWYWx1ZSkpIHtcbiAgICBzdGF0ZS5jaGVja3MgPSBjaGVja3NWYWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoY2hlY2tzVmFsdWUgPT09IHRydWUpIGNoZWNrc1ZhbHVlID0gc3RhdGUudHVybkNvbG9yO1xuICAgIGlmIChjaGVja3NWYWx1ZSkge1xuICAgICAgY29uc3QgY2hlY2tzOiBzZy5LZXlbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBbaywgcF0gb2Ygc3RhdGUucGllY2VzKSB7XG4gICAgICAgIGlmIChzdGF0ZS5oaWdobGlnaHQuY2hlY2tSb2xlcy5pbmNsdWRlcyhwLnJvbGUpICYmIHAuY29sb3IgPT09IGNoZWNrc1ZhbHVlKSBjaGVja3MucHVzaChrKTtcbiAgICAgIH1cbiAgICAgIHN0YXRlLmNoZWNrcyA9IGNoZWNrcztcbiAgICB9IGVsc2Ugc3RhdGUuY2hlY2tzID0gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogdm9pZCB7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHsgb3JpZywgZGVzdCwgcHJvbSB9O1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnNldCwgb3JpZywgZGVzdCwgcHJvbSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLnByZW1vdmFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnVuc2V0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0geyBwaWVjZSwga2V5LCBwcm9tIH07XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy5zZXQsIHBpZWNlLCBrZXksIHByb20pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVkcm9wKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VNb3ZlKFxuICBzdGF0ZTogU3RhdGUsXG4gIG9yaWc6IHNnLktleSxcbiAgZGVzdDogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuLFxuKTogc2cuUGllY2UgfCBib29sZWFuIHtcbiAgY29uc3Qgb3JpZ1BpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKSxcbiAgICBkZXN0UGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KGRlc3QpO1xuICBpZiAob3JpZyA9PT0gZGVzdCB8fCAhb3JpZ1BpZWNlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGNhcHR1cmVkID0gZGVzdFBpZWNlICYmIGRlc3RQaWVjZS5jb2xvciAhPT0gb3JpZ1BpZWNlLmNvbG9yID8gZGVzdFBpZWNlIDogdW5kZWZpbmVkLFxuICAgIHByb21QaWVjZSA9IHByb20gJiYgcHJvbW90ZVBpZWNlKHN0YXRlLCBvcmlnUGllY2UpO1xuICBpZiAoZGVzdCA9PT0gc3RhdGUuc2VsZWN0ZWQgfHwgb3JpZyA9PT0gc3RhdGUuc2VsZWN0ZWQpIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUucGllY2VzLnNldChkZXN0LCBwcm9tUGllY2UgfHwgb3JpZ1BpZWNlKTtcbiAgc3RhdGUucGllY2VzLmRlbGV0ZShvcmlnKTtcbiAgc3RhdGUubGFzdERlc3RzID0gW29yaWcsIGRlc3RdO1xuICBzdGF0ZS5sYXN0UGllY2UgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLmNoZWNrcyA9IHVuZGVmaW5lZDtcbiAgaWYgKGlzUGllY2VDb29sZG93bkVuYWJsZWQoc3RhdGUpKSB7XG4gICAgKHByb21QaWVjZSB8fCBvcmlnUGllY2UpLmxhc3RNb3ZlZCA9IERhdGUubm93KCk7XG4gICAgcmVuZGVyU3F1YXJlVGltZXIoZGVzdCwgc3RhdGUpO1xuICB9XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLm1vdmUsIG9yaWcsIGRlc3QsIHByb20sIGNhcHR1cmVkKTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgcmV0dXJuIGNhcHR1cmVkIHx8IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlRHJvcChcbiAgc3RhdGU6IFN0YXRlLFxuICBwaWVjZTogc2cuUGllY2UsXG4gIGtleTogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuLFxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlQ291bnQgPSBzdGF0ZS5oYW5kcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik/LmdldChwaWVjZS5yb2xlKSB8fCAwO1xuICBpZiAoIXBpZWNlQ291bnQgJiYgIXN0YXRlLmRyb3BwYWJsZS5zcGFyZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwcm9tUGllY2UgPSBwcm9tICYmIHByb21vdGVQaWVjZShzdGF0ZSwgcGllY2UpO1xuICBpZiAoXG4gICAga2V5ID09PSBzdGF0ZS5zZWxlY3RlZCB8fFxuICAgICghc3RhdGUuZHJvcHBhYmxlLnNwYXJlICYmXG4gICAgICBwaWVjZUNvdW50ID09PSAxICYmXG4gICAgICBzdGF0ZS5zZWxlY3RlZFBpZWNlICYmXG4gICAgICBzYW1lUGllY2Uoc3RhdGUuc2VsZWN0ZWRQaWVjZSwgcGllY2UpKVxuICApXG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICBzdGF0ZS5waWVjZXMuc2V0KGtleSwgcHJvbVBpZWNlIHx8IHBpZWNlKTtcbiAgc3RhdGUubGFzdERlc3RzID0gW2tleV07XG4gIHN0YXRlLmxhc3RQaWVjZSA9IHBpZWNlO1xuICBzdGF0ZS5jaGVja3MgPSB1bmRlZmluZWQ7XG4gIGlmICghc3RhdGUuZHJvcHBhYmxlLnNwYXJlKSByZW1vdmVGcm9tSGFuZChzdGF0ZSwgcGllY2UpO1xuICBpZiAoaXNQaWVjZUNvb2xkb3duRW5hYmxlZChzdGF0ZSkpIHtcbiAgICBwaWVjZS5sYXN0TW92ZWQgPSBEYXRlLm5vdygpO1xuICAgIHJlbmRlclNxdWFyZVRpbWVyKGtleSwgc3RhdGUpO1xuICB9XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmRyb3AsIHBpZWNlLCBrZXksIHByb20pO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gYmFzZVVzZXJNb3ZlKFxuICBzdGF0ZTogU3RhdGUsXG4gIG9yaWc6IHNnLktleSxcbiAgZGVzdDogc2cuS2V5LFxuICBwcm9tOiBib29sZWFuLFxuKTogc2cuUGllY2UgfCBib29sZWFuIHtcbiAgY29uc3QgcmVzdWx0ID0gYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHByb20pO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kcm9wcGFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlckRyb3Aoc3RhdGU6IFN0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VEcm9wKHN0YXRlLCBwaWVjZSwga2V5LCBwcm9tKTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJEcm9wKFxuICBzdGF0ZTogU3RhdGUsXG4gIHBpZWNlOiBzZy5QaWVjZSxcbiAga2V5OiBzZy5LZXksXG4gIHByb20/OiBib29sZWFuLFxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlYWxQcm9tID0gcHJvbSB8fCBzdGF0ZS5wcm9tb3Rpb24uZm9yY2VEcm9wUHJvbW90aW9uKHBpZWNlLCBrZXkpO1xuICBpZiAoY2FuRHJvcChzdGF0ZSwgcGllY2UsIGtleSkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlckRyb3Aoc3RhdGUsIHBpZWNlLCBrZXksIHJlYWxQcm9tKTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmRyb3BwYWJsZS5ldmVudHMuYWZ0ZXIsIHBpZWNlLCBrZXksIHJlYWxQcm9tLCB7IHByZW1hZGU6IGZhbHNlIH0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKGNhblByZWRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpKSB7XG4gICAgc2V0UHJlZHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcmVhbFByb20pO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJNb3ZlKFxuICBzdGF0ZTogU3RhdGUsXG4gIG9yaWc6IHNnLktleSxcbiAgZGVzdDogc2cuS2V5LFxuICBwcm9tPzogYm9vbGVhbixcbik6IGJvb2xlYW4ge1xuICBjb25zdCByZWFsUHJvbSA9IHByb20gfHwgc3RhdGUucHJvbW90aW9uLmZvcmNlTW92ZVByb21vdGlvbihvcmlnLCBkZXN0KTtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCByZWFsUHJvbSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgY29uc3QgbWV0YWRhdGE6IHNnLk1vdmVNZXRhZGF0YSA9IHsgcHJlbWFkZTogZmFsc2UgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgcmVhbFByb20sIG1ldGFkYXRhKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjYW5QcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHNldFByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHJlYWxQcm9tKTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlUHJvbW90aW9uRGlhbG9nKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHByb21vdGVkUGllY2UgPSBwcm9tb3RlUGllY2Uoc3RhdGUsIHBpZWNlKTtcbiAgaWYgKHN0YXRlLnZpZXdPbmx5IHx8IHN0YXRlLnByb21vdGlvbi5jdXJyZW50IHx8ICFwcm9tb3RlZFBpZWNlKSByZXR1cm4gZmFsc2U7XG5cbiAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPSB7IHBpZWNlLCBwcm9tb3RlZFBpZWNlLCBrZXksIGRyYWdnZWQ6ICEhc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgfTtcbiAgc3RhdGUuaG92ZXJlZCA9IGtleTtcblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb21vdGlvbkRpYWxvZ0Ryb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgaWYgKFxuICAgIGNhbkRyb3BQcm9tb3RlKHN0YXRlLCBwaWVjZSwga2V5KSAmJlxuICAgIChjYW5Ecm9wKHN0YXRlLCBwaWVjZSwga2V5KSB8fCBjYW5QcmVkcm9wKHN0YXRlLCBwaWVjZSwga2V5KSlcbiAgKSB7XG4gICAgaWYgKGJhc2VQcm9tb3Rpb25EaWFsb2coc3RhdGUsIHBpZWNlLCBrZXkpKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByb21vdGlvbi5ldmVudHMuaW5pdGlhdGVkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9tb3Rpb25EaWFsb2dNb3ZlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoXG4gICAgY2FuTW92ZVByb21vdGUoc3RhdGUsIG9yaWcsIGRlc3QpICYmXG4gICAgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpIHx8IGNhblByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKVxuICApIHtcbiAgICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gICAgaWYgKHBpZWNlICYmIGJhc2VQcm9tb3Rpb25EaWFsb2coc3RhdGUsIHBpZWNlLCBkZXN0KSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcm9tb3Rpb24uZXZlbnRzLmluaXRpYXRlZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBwcm9tb3RlUGllY2UoczogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogc2cuUGllY2UgfCB1bmRlZmluZWQge1xuICBjb25zdCBwcm9tUm9sZSA9IHMucHJvbW90aW9uLnByb21vdGVzVG8ocGllY2Uucm9sZSk7XG4gIHJldHVybiBwcm9tUm9sZSAhPT0gdW5kZWZpbmVkID8geyBjb2xvcjogcGllY2UuY29sb3IsIHJvbGU6IHByb21Sb2xlLCBsYXN0TW92ZWQ6IHBpZWNlLmxhc3RNb3ZlZCB9IDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlUGllY2Uoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGtleTogc2cuS2V5KTogdm9pZCB7XG4gIGlmIChzdGF0ZS5waWVjZXMuZGVsZXRlKGtleSkpIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RTcXVhcmUoXG4gIHN0YXRlOiBTdGF0ZSxcbiAga2V5OiBzZy5LZXksXG4gIHByb20/OiBib29sZWFuLFxuICBmb3JjZT86IGJvb2xlYW4sXG4pOiB2b2lkIHtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuc2VsZWN0LCBrZXkpO1xuXG4gIC8vIHVuc2VsZWN0IGlmIHNlbGVjdGluZyBzZWxlY3RlZCBrZXksIGtlZXAgc2VsZWN0ZWQgZm9yIGRyYWdcbiAgaWYgKCFzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJiBzdGF0ZS5zZWxlY3RlZCA9PT0ga2V5KSB7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMudW5zZWxlY3QsIGtleSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHRyeSBtb3ZpbmcvZHJvcHBpbmdcbiAgaWYgKFxuICAgIHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fFxuICAgIGZvcmNlIHx8XG4gICAgKHN0YXRlLnNlbGVjdGFibGUuZm9yY2VTcGFyZXMgJiYgc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJiBzdGF0ZS5kcm9wcGFibGUuc3BhcmUpXG4gICkge1xuICAgIGlmIChzdGF0ZS5zZWxlY3RlZFBpZWNlICYmIHVzZXJEcm9wKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZFBpZWNlLCBrZXksIHByb20pKSByZXR1cm47XG4gICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWQgJiYgdXNlck1vdmUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkLCBrZXksIHByb20pKSByZXR1cm47XG4gIH1cblxuICBpZiAoXG4gICAgKHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fCBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCB8fCBmb3JjZSkgJiZcbiAgICAoaXNNb3ZhYmxlKHN0YXRlLCBrZXkpIHx8IGlzUHJlbW92YWJsZShzdGF0ZSwga2V5KSlcbiAgKSB7XG4gICAgaWYgKGlzUGllY2VDb29sZG93bkVuYWJsZWQoc3RhdGUpKSB7XG4gICAgICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQoa2V5KTtcbiAgICAgIGlmIChwaWVjZSAmJiBpc1BpZWNlT25Db29sZG93bihzdGF0ZSwgcGllY2UpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgc2V0U2VsZWN0ZWQoc3RhdGUsIGtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdFBpZWNlKFxuICBzdGF0ZTogSGVhZGxlc3NTdGF0ZSxcbiAgcGllY2U6IHNnLlBpZWNlLFxuICBzcGFyZT86IGJvb2xlYW4sXG4gIGZvcmNlPzogYm9vbGVhbixcbiAgYXBpPzogYm9vbGVhbixcbik6IHZvaWQge1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5waWVjZVNlbGVjdCwgcGllY2UpO1xuXG4gIGlmIChzdGF0ZS5zZWxlY3RhYmxlLmFkZFNwYXJlc1RvSGFuZCAmJiBzdGF0ZS5kcm9wcGFibGUuc3BhcmUgJiYgc3RhdGUuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGFkZFRvSGFuZChzdGF0ZSwgeyByb2xlOiBzdGF0ZS5zZWxlY3RlZFBpZWNlLnJvbGUsIGNvbG9yOiBwaWVjZS5jb2xvciB9KTtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgfSBlbHNlIGlmIChcbiAgICAhYXBpICYmXG4gICAgIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmXG4gICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJlxuICAgIHNhbWVQaWVjZShzdGF0ZS5zZWxlY3RlZFBpZWNlLCBwaWVjZSlcbiAgKSB7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMucGllY2VVbnNlbGVjdCwgcGllY2UpO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgfSBlbHNlIGlmIChcbiAgICAoc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8IHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkIHx8IGZvcmNlKSAmJlxuICAgIChpc0Ryb3BwYWJsZShzdGF0ZSwgcGllY2UsICEhc3BhcmUpIHx8IGlzUHJlZHJvcHBhYmxlKHN0YXRlLCBwaWVjZSkpXG4gICkge1xuICAgIHNldFNlbGVjdGVkUGllY2Uoc3RhdGUsIHBpZWNlKTtcbiAgICBzdGF0ZS5kcm9wcGFibGUuc3BhcmUgPSAhIXNwYXJlO1xuICB9IGVsc2Uge1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2VsZWN0ZWQoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGtleTogc2cuS2V5KTogdm9pZCB7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUuc2VsZWN0ZWQgPSBrZXk7XG4gIHNldFByZURlc3RzKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlbGVjdGVkUGllY2Uoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IHZvaWQge1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLnNlbGVjdGVkUGllY2UgPSBwaWVjZTtcbiAgc2V0UHJlRGVzdHMoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJlRGVzdHMoc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHN0YXRlLnByZWRyb3BwYWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcblxuICBpZiAoc3RhdGUuc2VsZWN0ZWQgJiYgaXNQcmVtb3ZhYmxlKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZCkgJiYgc3RhdGUucHJlbW92YWJsZS5nZW5lcmF0ZSlcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gc3RhdGUucHJlbW92YWJsZS5nZW5lcmF0ZShzdGF0ZS5zZWxlY3RlZCwgc3RhdGUucGllY2VzKTtcbiAgZWxzZSBpZiAoXG4gICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSAmJlxuICAgIGlzUHJlZHJvcHBhYmxlKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZFBpZWNlKSAmJlxuICAgIHN0YXRlLnByZWRyb3BwYWJsZS5nZW5lcmF0ZVxuICApXG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmRlc3RzID0gc3RhdGUucHJlZHJvcHBhYmxlLmdlbmVyYXRlKHN0YXRlLnNlbGVjdGVkUGllY2UsIHN0YXRlLnBpZWNlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNlbGVjdChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5zZWxlY3RlZCA9XG4gICAgc3RhdGUuc2VsZWN0ZWRQaWVjZSA9XG4gICAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9XG4gICAgc3RhdGUucHJlZHJvcHBhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCA9XG4gICAgICB1bmRlZmluZWQ7XG4gIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpc01vdmFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gIHJldHVybiAoXG4gICAgISFwaWVjZSAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IpKVxuICApO1xufVxuXG5mdW5jdGlvbiBpc0Ryb3BwYWJsZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBzcGFyZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIChzcGFyZSB8fCAhIXN0YXRlLmhhbmRzLmhhbmRNYXAuZ2V0KHBpZWNlLmNvbG9yKT8uZ2V0KHBpZWNlLnJvbGUpKSAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuTW92ZShzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgb3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBvcmlnICE9PSBkZXN0ICYmXG4gICAgaXNNb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJlxuICAgIChzdGF0ZS5tb3ZhYmxlLmZyZWUgfHwgISFzdGF0ZS5tb3ZhYmxlLmRlc3RzPy5nZXQob3JpZyk/LmluY2x1ZGVzKGRlc3QpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlLCBkZXN0OiBzZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBpc0Ryb3BwYWJsZShzdGF0ZSwgcGllY2UsIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSkgJiZcbiAgICAoc3RhdGUuZHJvcHBhYmxlLmZyZWUgfHxcbiAgICAgIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSB8fFxuICAgICAgISFzdGF0ZS5kcm9wcGFibGUuZGVzdHM/LmdldChwaWVjZU5hbWVPZihwaWVjZSkpPy5pbmNsdWRlcyhkZXN0KSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2FuTW92ZVByb21vdGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgcmV0dXJuICEhcGllY2UgJiYgc3RhdGUucHJvbW90aW9uLm1vdmVQcm9tb3Rpb25EaWFsb2cob3JpZywgZGVzdCk7XG59XG5cbmZ1bmN0aW9uIGNhbkRyb3BQcm9tb3RlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAhc3RhdGUuZHJvcHBhYmxlLnNwYXJlICYmIHN0YXRlLnByb21vdGlvbi5kcm9wUHJvbW90aW9uRGlhbG9nKHBpZWNlLCBrZXkpO1xufVxuXG5mdW5jdGlvbiBpc1ByZW1vdmFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gIHJldHVybiAoXG4gICAgISFwaWVjZSAmJlxuICAgIHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3JcbiAgKTtcbn1cblxuZnVuY3Rpb24gaXNQcmVkcm9wcGFibGUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgICEhc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpPy5nZXQocGllY2Uucm9sZSkgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZW5hYmxlZCAmJlxuICAgIHN0YXRlLmFjdGl2ZUNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3JcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblByZW1vdmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgb3JpZyAhPT0gZGVzdCAmJlxuICAgIGlzUHJlbW92YWJsZShzdGF0ZSwgb3JpZykgJiZcbiAgICAhIXN0YXRlLnByZW1vdmFibGUuZ2VuZXJhdGUgJiZcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmdlbmVyYXRlKG9yaWcsIHN0YXRlLnBpZWNlcykuaW5jbHVkZXMoZGVzdClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhblByZWRyb3Aoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZGVzdDogc2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IGRlc3RQaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQoZGVzdCk7XG4gIHJldHVybiAoXG4gICAgaXNQcmVkcm9wcGFibGUoc3RhdGUsIHBpZWNlKSAmJlxuICAgICghZGVzdFBpZWNlIHx8IGRlc3RQaWVjZS5jb2xvciAhPT0gc3RhdGUuYWN0aXZlQ29sb3IpICYmXG4gICAgISFzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUgJiZcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZ2VuZXJhdGUocGllY2UsIHN0YXRlLnBpZWNlcykuaW5jbHVkZXMoZGVzdClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHJhZ2dhYmxlKHN0YXRlOiBIZWFkbGVzc1N0YXRlLCBwaWVjZTogc2cuUGllY2UpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJlxuICAgIChzdGF0ZS5hY3RpdmVDb2xvciA9PT0gJ2JvdGgnIHx8XG4gICAgICAoc3RhdGUuYWN0aXZlQ29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgICAgIChzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yIHx8IHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCkpKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZW1vdmUoc3RhdGU6IFN0YXRlKTogYm9vbGVhbiB7XG4gIGNvbnN0IG1vdmUgPSBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGlmICghbW92ZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBvcmlnID0gbW92ZS5vcmlnLFxuICAgIGRlc3QgPSBtb3ZlLmRlc3QsXG4gICAgcHJvbSA9IG1vdmUucHJvbTtcbiAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCBwcm9tKTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zdCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhID0geyBwcmVtYWRlOiB0cnVlIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIHByb20sIG1ldGFkYXRhKTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIH1cbiAgfVxuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICByZXR1cm4gc3VjY2Vzcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVkcm9wKHN0YXRlOiBTdGF0ZSk6IGJvb2xlYW4ge1xuICBjb25zdCBkcm9wID0gc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQ7XG4gIGlmICghZHJvcCkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwaWVjZSA9IGRyb3AucGllY2UsXG4gICAga2V5ID0gZHJvcC5rZXksXG4gICAgcHJvbSA9IGRyb3AucHJvbTtcbiAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKGNhbkRyb3Aoc3RhdGUsIHBpZWNlLCBrZXkpKSB7XG4gICAgaWYgKGJhc2VVc2VyRHJvcChzdGF0ZSwgcGllY2UsIGtleSwgcHJvbSkpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZHJvcHBhYmxlLmV2ZW50cy5hZnRlciwgcGllY2UsIGtleSwgcHJvbSwgeyBwcmVtYWRlOiB0cnVlIH0pO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsTW92ZU9yRHJvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICB1bnNlbGVjdChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxQcm9tb3Rpb24oc3RhdGU6IEhlYWRsZXNzU3RhdGUpOiB2b2lkIHtcbiAgaWYgKCFzdGF0ZS5wcm9tb3Rpb24uY3VycmVudCkgcmV0dXJuO1xuXG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgc3RhdGUucHJvbW90aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJvbW90aW9uLmV2ZW50cy5jYW5jZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcChzdGF0ZTogSGVhZGxlc3NTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5hY3RpdmVDb2xvciA9XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9XG4gICAgc3RhdGUuZHJvcHBhYmxlLmRlc3RzID1cbiAgICBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCA9XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPVxuICAgIHN0YXRlLnByb21vdGlvbi5jdXJyZW50ID1cbiAgICBzdGF0ZS5ob3ZlcmVkID1cbiAgICAgIHVuZGVmaW5lZDtcbiAgY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BpZWNlQ29vbGRvd25FbmFibGVkKHN0YXRlOiBIZWFkbGVzc1N0YXRlKTogYm9vbGVhbiB7XG4gIHJldHVybiAhIShzdGF0ZS5waWVjZUNvb2xkb3duICYmIHN0YXRlLnBpZWNlQ29vbGRvd24uY29vbGRvd25UaW1lICYmIHN0YXRlLnBpZWNlQ29vbGRvd24uZW5hYmxlZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BpZWNlT25Db29sZG93bihzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogYm9vbGVhbiB7XG4gIGlmIChzdGF0ZS5waWVjZUNvb2xkb3duICYmIHN0YXRlLnBpZWNlQ29vbGRvd24uY29vbGRvd25UaW1lICYmICEhc3RhdGUucGllY2VDb29sZG93bi5lbmFibGVkICYmIHBpZWNlLmxhc3RNb3ZlZCkge1xuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgcmV0dXJuIHBpZWNlLmxhc3RNb3ZlZCArIHN0YXRlLnBpZWNlQ29vbGRvd24uY29vbGRvd25UaW1lID4gbm93O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbiIsICJpbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgZmlsZXMsIHJhbmtzIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgcG9zMmtleSB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmZlckRpbWVuc2lvbnMoYm9hcmRTZmVuOiBzZy5Cb2FyZFNmZW4pOiBzZy5EaW1lbnNpb25zIHtcbiAgY29uc3QgcmFua3MgPSBib2FyZFNmZW4uc3BsaXQoJy8nKSxcbiAgICBmaXJzdEZpbGUgPSByYW5rc1swXS5zcGxpdCgnJyk7XG4gIGxldCBmaWxlc0NudCA9IDAsXG4gICAgY250ID0gMDtcbiAgZm9yIChjb25zdCBjIG9mIGZpcnN0RmlsZSkge1xuICAgIGNvbnN0IG5iID0gYy5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChuYiA8IDU4ICYmIG5iID4gNDcpIGNudCA9IGNudCAqIDEwICsgbmIgLSA0ODtcbiAgICBlbHNlIGlmIChjICE9PSAnKycpIHtcbiAgICAgIGZpbGVzQ250ICs9IGNudCArIDE7XG4gICAgICBjbnQgPSAwO1xuICAgIH1cbiAgfVxuICBmaWxlc0NudCArPSBjbnQ7XG4gIHJldHVybiB7IGZpbGVzOiBmaWxlc0NudCwgcmFua3M6IHJhbmtzLmxlbmd0aCB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2ZlblRvQm9hcmQoXG4gIHNmZW46IHNnLkJvYXJkU2ZlbixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgZnJvbUZvcnN5dGg/OiAoZm9yc3l0aDogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuUGllY2VzIHtcbiAgY29uc3Qgc2ZlblBhcnNlciA9IGZyb21Gb3JzeXRoIHx8IHN0YW5kYXJkRnJvbUZvcnN5dGgsXG4gICAgcGllY2VzOiBzZy5QaWVjZXMgPSBuZXcgTWFwKCk7XG4gIGxldCB4ID0gZGltcy5maWxlcyAtIDEsXG4gICAgeSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Zlbi5sZW5ndGg7IGkrKykge1xuICAgIHN3aXRjaCAoc2ZlbltpXSkge1xuICAgICAgY2FzZSAnICc6XG4gICAgICBjYXNlICdfJzpcbiAgICAgICAgcmV0dXJuIHBpZWNlcztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICArK3k7XG4gICAgICAgIGlmICh5ID4gZGltcy5yYW5rcyAtIDEpIHJldHVybiBwaWVjZXM7XG4gICAgICAgIHggPSBkaW1zLmZpbGVzIC0gMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGNvbnN0IG5iMSA9IHNmZW5baV0uY2hhckNvZGVBdCgwKSxcbiAgICAgICAgICBuYjIgPSBzZmVuW2kgKyAxXSAmJiBzZmVuW2kgKyAxXS5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAobmIxIDwgNTggJiYgbmIxID4gNDcpIHtcbiAgICAgICAgICBpZiAobmIyICYmIG5iMiA8IDU4ICYmIG5iMiA+IDQ3KSB7XG4gICAgICAgICAgICB4IC09IChuYjEgLSA0OCkgKiAxMCArIChuYjIgLSA0OCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfSBlbHNlIHggLT0gbmIxIC0gNDg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgcm9sZVN0ciA9IHNmZW5baV0gPT09ICcrJyAmJiBzZmVuLmxlbmd0aCA+IGkgKyAxID8gJysnICsgc2ZlblsrK2ldIDogc2ZlbltpXSxcbiAgICAgICAgICAgIHJvbGUgPSBzZmVuUGFyc2VyKHJvbGVTdHIpO1xuICAgICAgICAgIGlmICh4ID49IDAgJiYgcm9sZSkge1xuICAgICAgICAgICAgY29uc3QgY29sb3IgPSByb2xlU3RyID09PSByb2xlU3RyLnRvTG93ZXJDYXNlKCkgPyAnZ290ZScgOiAnc2VudGUnO1xuICAgICAgICAgICAgcGllY2VzLnNldChwb3Mya2V5KFt4LCB5XSksIHtcbiAgICAgICAgICAgICAgcm9sZTogcm9sZSxcbiAgICAgICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC0teDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcGllY2VzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9hcmRUb1NmZW4oXG4gIHBpZWNlczogc2cuUGllY2VzLFxuICBkaW1zOiBzZy5EaW1lbnNpb25zLFxuICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuQm9hcmRTZmVuIHtcbiAgY29uc3Qgc2ZlblJlbmRlcmVyID0gdG9Gb3JzeXRoIHx8IHN0YW5kYXJkVG9Gb3JzeXRoLFxuICAgIHJldmVyc2VkRmlsZXMgPSBmaWxlcy5zbGljZSgwLCBkaW1zLmZpbGVzKS5yZXZlcnNlKCk7XG4gIHJldHVybiByYW5rc1xuICAgIC5zbGljZSgwLCBkaW1zLnJhbmtzKVxuICAgIC5tYXAoKHkpID0+XG4gICAgICByZXZlcnNlZEZpbGVzXG4gICAgICAgIC5tYXAoKHgpID0+IHtcbiAgICAgICAgICBjb25zdCBwaWVjZSA9IHBpZWNlcy5nZXQoKHggKyB5KSBhcyBzZy5LZXkpLFxuICAgICAgICAgICAgZm9yc3l0aCA9IHBpZWNlICYmIHNmZW5SZW5kZXJlcihwaWVjZS5yb2xlKTtcbiAgICAgICAgICBpZiAoZm9yc3l0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHBpZWNlLmNvbG9yID09PSAnc2VudGUnID8gZm9yc3l0aC50b1VwcGVyQ2FzZSgpIDogZm9yc3l0aC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIH0gZWxzZSByZXR1cm4gJzEnO1xuICAgICAgICB9KVxuICAgICAgICAuam9pbignJyksXG4gICAgKVxuICAgIC5qb2luKCcvJylcbiAgICAucmVwbGFjZSgvMXsyLH0vZywgKHMpID0+IHMubGVuZ3RoLnRvU3RyaW5nKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2ZlblRvSGFuZHMoXG4gIHNmZW46IHNnLkhhbmRzU2ZlbixcbiAgZnJvbUZvcnN5dGg/OiAoZm9yc3l0aDogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuSGFuZHMge1xuICBjb25zdCBzZmVuUGFyc2VyID0gZnJvbUZvcnN5dGggfHwgc3RhbmRhcmRGcm9tRm9yc3l0aCxcbiAgICBzZW50ZTogc2cuSGFuZCA9IG5ldyBNYXAoKSxcbiAgICBnb3RlOiBzZy5IYW5kID0gbmV3IE1hcCgpO1xuXG4gIGxldCB0bXBOdW0gPSAwLFxuICAgIG51bSA9IDE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Zlbi5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG5iID0gc2ZlbltpXS5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChuYiA8IDU4ICYmIG5iID4gNDcpIHtcbiAgICAgIHRtcE51bSA9IHRtcE51bSAqIDEwICsgbmIgLSA0ODtcbiAgICAgIG51bSA9IHRtcE51bTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgcm9sZVN0ciA9IHNmZW5baV0gPT09ICcrJyAmJiBzZmVuLmxlbmd0aCA+IGkgKyAxID8gJysnICsgc2ZlblsrK2ldIDogc2ZlbltpXSxcbiAgICAgICAgcm9sZSA9IHNmZW5QYXJzZXIocm9sZVN0cik7XG4gICAgICBpZiAocm9sZSkge1xuICAgICAgICBjb25zdCBjb2xvciA9IHJvbGVTdHIgPT09IHJvbGVTdHIudG9Mb3dlckNhc2UoKSA/ICdnb3RlJyA6ICdzZW50ZSc7XG4gICAgICAgIGlmIChjb2xvciA9PT0gJ3NlbnRlJykgc2VudGUuc2V0KHJvbGUsIChzZW50ZS5nZXQocm9sZSkgfHwgMCkgKyBudW0pO1xuICAgICAgICBlbHNlIGdvdGUuc2V0KHJvbGUsIChnb3RlLmdldChyb2xlKSB8fCAwKSArIG51bSk7XG4gICAgICB9XG4gICAgICB0bXBOdW0gPSAwO1xuICAgICAgbnVtID0gMTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IE1hcChbXG4gICAgWydzZW50ZScsIHNlbnRlXSxcbiAgICBbJ2dvdGUnLCBnb3RlXSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kc1RvU2ZlbihcbiAgaGFuZHM6IHNnLkhhbmRzLFxuICByb2xlczogc2cuUm9sZVN0cmluZ1tdLFxuICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogc2cuSGFuZHNTZmVuIHtcbiAgY29uc3Qgc2ZlblJlbmRlcmVyID0gdG9Gb3JzeXRoIHx8IHN0YW5kYXJkVG9Gb3JzeXRoO1xuXG4gIGxldCBzZW50ZUhhbmRTdHIgPSAnJyxcbiAgICBnb3RlSGFuZFN0ciA9ICcnO1xuICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICBjb25zdCBmb3JzeXRoID0gc2ZlblJlbmRlcmVyKHJvbGUpO1xuICAgIGlmIChmb3JzeXRoKSB7XG4gICAgICBjb25zdCBzZW50ZUNudCA9IGhhbmRzLmdldCgnc2VudGUnKT8uZ2V0KHJvbGUpLFxuICAgICAgICBnb3RlQ250ID0gaGFuZHMuZ2V0KCdnb3RlJyk/LmdldChyb2xlKTtcbiAgICAgIGlmIChzZW50ZUNudCkgc2VudGVIYW5kU3RyICs9IHNlbnRlQ250ID4gMSA/IHNlbnRlQ250LnRvU3RyaW5nKCkgKyBmb3JzeXRoIDogZm9yc3l0aDtcbiAgICAgIGlmIChnb3RlQ250KSBnb3RlSGFuZFN0ciArPSBnb3RlQ250ID4gMSA/IGdvdGVDbnQudG9TdHJpbmcoKSArIGZvcnN5dGggOiBmb3JzeXRoO1xuICAgIH1cbiAgfVxuICBpZiAoc2VudGVIYW5kU3RyIHx8IGdvdGVIYW5kU3RyKSByZXR1cm4gc2VudGVIYW5kU3RyLnRvVXBwZXJDYXNlKCkgKyBnb3RlSGFuZFN0ci50b0xvd2VyQ2FzZSgpO1xuICBlbHNlIHJldHVybiAnLSc7XG59XG5cbmZ1bmN0aW9uIHN0YW5kYXJkRnJvbUZvcnN5dGgoZm9yc3l0aDogc3RyaW5nKTogc2cuUm9sZVN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHN3aXRjaCAoZm9yc3l0aC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAncCc6XG4gICAgICByZXR1cm4gJ3Bhd24nO1xuICAgIGNhc2UgJ2wnOlxuICAgICAgcmV0dXJuICdsYW5jZSc7XG4gICAgY2FzZSAnbic6XG4gICAgICByZXR1cm4gJ2tuaWdodCc7XG4gICAgY2FzZSAncyc6XG4gICAgICByZXR1cm4gJ3NpbHZlcic7XG4gICAgY2FzZSAnZyc6XG4gICAgICByZXR1cm4gJ2dvbGQnO1xuICAgIGNhc2UgJ2InOlxuICAgICAgcmV0dXJuICdiaXNob3AnO1xuICAgIGNhc2UgJ3InOlxuICAgICAgcmV0dXJuICdyb29rJztcbiAgICBjYXNlICcrcCc6XG4gICAgICByZXR1cm4gJ3Rva2luJztcbiAgICBjYXNlICcrbCc6XG4gICAgICByZXR1cm4gJ3Byb21vdGVkbGFuY2UnO1xuICAgIGNhc2UgJytuJzpcbiAgICAgIHJldHVybiAncHJvbW90ZWRrbmlnaHQnO1xuICAgIGNhc2UgJytzJzpcbiAgICAgIHJldHVybiAncHJvbW90ZWRzaWx2ZXInO1xuICAgIGNhc2UgJytiJzpcbiAgICAgIHJldHVybiAnaG9yc2UnO1xuICAgIGNhc2UgJytyJzpcbiAgICAgIHJldHVybiAnZHJhZ29uJztcbiAgICBjYXNlICdrJzpcbiAgICAgIHJldHVybiAna2luZyc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybjtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHN0YW5kYXJkVG9Gb3JzeXRoKHJvbGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHN3aXRjaCAocm9sZSkge1xuICAgIGNhc2UgJ3Bhd24nOlxuICAgICAgcmV0dXJuICdwJztcbiAgICBjYXNlICdsYW5jZSc6XG4gICAgICByZXR1cm4gJ2wnO1xuICAgIGNhc2UgJ2tuaWdodCc6XG4gICAgICByZXR1cm4gJ24nO1xuICAgIGNhc2UgJ3NpbHZlcic6XG4gICAgICByZXR1cm4gJ3MnO1xuICAgIGNhc2UgJ2dvbGQnOlxuICAgICAgcmV0dXJuICdnJztcbiAgICBjYXNlICdiaXNob3AnOlxuICAgICAgcmV0dXJuICdiJztcbiAgICBjYXNlICdyb29rJzpcbiAgICAgIHJldHVybiAncic7XG4gICAgY2FzZSAndG9raW4nOlxuICAgICAgcmV0dXJuICcrcCc7XG4gICAgY2FzZSAncHJvbW90ZWRsYW5jZSc6XG4gICAgICByZXR1cm4gJytsJztcbiAgICBjYXNlICdwcm9tb3RlZGtuaWdodCc6XG4gICAgICByZXR1cm4gJytuJztcbiAgICBjYXNlICdwcm9tb3RlZHNpbHZlcic6XG4gICAgICByZXR1cm4gJytzJztcbiAgICBjYXNlICdob3JzZSc6XG4gICAgICByZXR1cm4gJytiJztcbiAgICBjYXNlICdkcmFnb24nOlxuICAgICAgcmV0dXJuICcrcic7XG4gICAgY2FzZSAna2luZyc6XG4gICAgICByZXR1cm4gJ2snO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm47XG4gIH1cbn1cbiIsICJpbXBvcnQgdHlwZSB7IEhlYWRsZXNzU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhd1NoYXBlLCBTcXVhcmVIaWdobGlnaHQgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHNldENoZWNrcywgc2V0UHJlRGVzdHMgfSBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IGluZmVyRGltZW5zaW9ucywgc2ZlblRvQm9hcmQsIHNmZW5Ub0hhbmRzIH0gZnJvbSAnLi9zZmVuLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xuICBzZmVuPzoge1xuICAgIGJvYXJkPzogc2cuQm9hcmRTZmVuOyAvLyBwaWVjZXMgb24gdGhlIGJvYXJkIGluIEZvcnN5dGggbm90YXRpb25cbiAgICBoYW5kcz86IHNnLkhhbmRzU2ZlbjsgLy8gcGllY2VzIGluIGhhbmQgaW4gRm9yc3l0aCBub3RhdGlvblxuICB9O1xuICBvcmllbnRhdGlvbj86IHNnLkNvbG9yOyAvLyBib2FyZCBvcmllbnRhdGlvbi4gc2VudGUgfCBnb3RlXG4gIHR1cm5Db2xvcj86IHNnLkNvbG9yOyAvLyB0dXJuIHRvIHBsYXkuIHNlbnRlIHwgZ290ZVxuICBhY3RpdmVDb2xvcj86IHNnLkNvbG9yIHwgJ2JvdGgnOyAvLyBjb2xvciB0aGF0IGNhbiBtb3ZlIG9yIGRyb3AuIHNlbnRlIHwgZ290ZSB8IGJvdGggfCB1bmRlZmluZWRcbiAgY2hlY2tzPzogc2cuS2V5W10gfCBzZy5Db2xvciB8IGJvb2xlYW47IC8vIHNxdWFyZXMgY3VycmVudGx5IGluIGNoZWNrIFtcIjVhXCJdLCBjb2xvciBpbiBjaGVjayAoc2VlIGhpZ2hsaWdodC5jaGVja1JvbGVzKSBvciBib29sZWFuIGZvciBjdXJyZW50IHR1cm4gY29sb3JcbiAgbGFzdERlc3RzPzogc2cuS2V5W107IC8vIHNxdWFyZXMgcGFydCBvZiB0aGUgbGFzdCBtb3ZlIG9yIGRyb3AgW1wiM2NcIiwgXCI0Y1wiXVxuICBsYXN0UGllY2U/OiBzZy5QaWVjZTsgLy8gcGllY2UgcGFydCBvZiB0aGUgbGFzdCBkcm9wXG4gIHNlbGVjdGVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiMWFcIlxuICBzZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIGluIGhhbmQgY3VycmVudGx5IHNlbGVjdGVkXG4gIGhvdmVyZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZFxuICB2aWV3T25seT86IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gIHNxdWFyZVJhdGlvPzogc2cuTnVtYmVyUGFpcjsgLy8gcmF0aW8gb2YgYSBzaW5nbGUgc3F1YXJlIFt3aWR0aCwgaGVpZ2h0XVxuICBkaXNhYmxlQ29udGV4dE1lbnU/OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIGJvYXJkLCBvbmx5IHdpdGhvdXQgdmlld09ubHlcbiAgYmxvY2tUb3VjaFNjcm9sbD86IGJvb2xlYW47IC8vIGJsb2NrIHNjcm9sbGluZyB2aWEgdG91Y2ggZHJhZ2dpbmcgb24gdGhlIGJvYXJkLCBlLmcuIGZvciBjb29yZGluYXRlIHRyYWluaW5nXG4gIHNjYWxlRG93blBpZWNlcz86IGJvb2xlYW47IC8vIGhlbHBmdWwgZm9yIHBuZ3MgLSBodHRwczovL2N0aWRkLmNvbS8yMDE1L3N2Zy1iYWNrZ3JvdW5kLXNjYWxpbmdcbiAgY29vcmRpbmF0ZXM/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgICBmaWxlcz86IHNnLk5vdGF0aW9uO1xuICAgIHJhbmtzPzogc2cuTm90YXRpb247XG4gIH07XG4gIGhpZ2hsaWdodD86IHtcbiAgICBsYXN0RGVzdHM/OiBib29sZWFuOyAvLyBhZGQgbGFzdC1kZXN0IGNsYXNzIHRvIHNxdWFyZXMgYW5kIHBpZWNlc1xuICAgIGNoZWNrPzogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVja1JvbGVzPzogc2cuUm9sZVN0cmluZ1tdOyAvLyByb2xlcyB0byBiZSBoaWdobGlnaHRlZCB3aGVuIGNoZWNrIGlzIGJvb2xlYW4gaXMgcGFzc2VkIGZyb20gY29uZmlnXG4gICAgaG92ZXJlZD86IGJvb2xlYW47IC8vIGFkZCBob3ZlciBjbGFzcyB0byBob3ZlcmVkIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uPzogeyBlbmFibGVkPzogYm9vbGVhbjsgaGFuZHM/OiBib29sZWFuOyBkdXJhdGlvbj86IG51bWJlciB9O1xuICBoYW5kcz86IHtcbiAgICBpbmxpbmVkPzogYm9vbGVhbjsgLy8gYXR0YWNoZXMgc2ctaGFuZHMgZGlyZWN0bHkgdG8gc2ctd3JhcCwgaWdub3JlcyBIVE1MRWxlbWVudHMgcGFzc2VkIHRvIFNob2dpZ3JvdW5kXG4gICAgcm9sZXM/OiBzZy5Sb2xlU3RyaW5nW107IC8vIHJvbGVzIHRvIHJlbmRlciBpbiBzZy1oYW5kXG4gIH07XG4gIG1vdmFibGU/OiB7XG4gICAgZnJlZT86IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBkZXN0cz86IHNnLk1vdmVEZXN0czsgLy8gdmFsaWQgbW92ZXMuIHtcIjJhXCIgW1wiM2FcIiBcIjRhXCJdIFwiMWJcIiBbXCIzYVwiIFwiM2NcIl19XG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGV2ZW50cz86IHtcbiAgICAgIGFmdGVyPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaGFzIGJlZW4gcGxheWVkXG4gICAgfTtcbiAgfTtcbiAgZHJvcHBhYmxlPzoge1xuICAgIGZyZWU/OiBib29sZWFuOyAvLyBhbGwgZHJvcHMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgZGVzdHM/OiBzZy5Ecm9wRGVzdHM7IC8vIHZhbGlkIGRyb3BzLiB7XCJzZW50ZSBwYXduXCIgW1wiM2FcIiBcIjRhXCJdIFwic2VudGUgbGFuY2VcIiBbXCIzYVwiIFwiM2NcIl19XG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIHNwYXJlPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byByZW1vdmUgZHJvcHBlZCBwaWVjZSBmcm9tIGhhbmQgYWZ0ZXIgZHJvcCAtIGJvYXJkIGVkaXRvclxuICAgIGV2ZW50cz86IHtcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4sIG1ldGFkYXRhOiBzZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgZHJvcCBoYXMgYmVlbiBwbGF5ZWRcbiAgICB9O1xuICB9O1xuICBwcmVtb3ZhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBwcmVtb3ZlcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGRlc3RzPzogc2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBnZW5lcmF0ZT86IChrZXk6IHNnLktleSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdOyAvLyBmdW5jdGlvbiB0byBnZW5lcmF0ZSBkZXN0aW5hdGlvbnMgdGhhdCB1c2VyIGNhbiBwcmVtb3ZlIHRvXG4gICAgZXZlbnRzPzoge1xuICAgICAgc2V0PzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgIH07XG4gIH07XG4gIHByZWRyb3BwYWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gYWxsb3cgcHJlZHJvcHMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXMgZm9yIGRyb3BzXG4gICAgZGVzdHM/OiBzZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBkcm9wIHNlbGVjdGlvblxuICAgIGdlbmVyYXRlPzogKHBpZWNlOiBzZy5QaWVjZSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdOyAvLyBmdW5jdGlvbiB0byBnZW5lcmF0ZSBkZXN0aW5hdGlvbnMgdGhhdCB1c2VyIGNhbiBwcmVkcm9wIG9uXG4gICAgZXZlbnRzPzoge1xuICAgICAgc2V0PzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfTtcbiAgfTtcbiAgZHJhZ2dhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlPzogbnVtYmVyOyAvLyBtaW5pbXVtIGRpc3RhbmNlIHRvIGluaXRpYXRlIGEgZHJhZzsgaW4gcGl4ZWxzXG4gICAgYXV0b0Rpc3RhbmNlPzogYm9vbGVhbjsgLy8gbGV0cyBzaG9naWdyb3VuZCBzZXQgZGlzdGFuY2UgdG8gemVybyB3aGVuIHVzZXIgZHJhZ3MgcGllY2VzXG4gICAgc2hvd0dob3N0PzogYm9vbGVhbjsgLy8gc2hvdyBnaG9zdCBvZiBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gICAgc2hvd1RvdWNoU3F1YXJlT3ZlcmxheT86IGJvb2xlYW47IC8vIHNob3cgc3F1YXJlIG92ZXJsYXkgb24gdGhlIHNxdWFyZSB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBob3ZlcmVkLCB0b3VjaCBvbmx5XG4gICAgZGVsZXRlT25Ecm9wT2ZmPzogYm9vbGVhbjsgLy8gZGVsZXRlIGEgcGllY2Ugd2hlbiBpdCBpcyBkcm9wcGVkIG9mZiB0aGUgYm9hcmRcbiAgICBhZGRUb0hhbmRPbkRyb3BPZmY/OiBib29sZWFuOyAvLyBhZGQgYSBwaWVjZSB0byBoYW5kIHdoZW4gaXQgaXMgZHJvcHBlZCBvbiBpdCwgcmVxdWlyZXMgZGVsZXRlT25Ecm9wT2ZmXG4gIH07XG4gIHNlbGVjdGFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGRpc2FibGUgdG8gZW5mb3JjZSBkcmFnZ2luZyBvdmVyIGNsaWNrLWNsaWNrIG1vdmVcbiAgICBmb3JjZVNwYXJlcz86IGJvb2xlYW47IC8vIGFsbG93IGRyb3BwaW5nIHNwYXJlIHBpZWNlcyBldmVuIHdpdGggc2VsZWN0YWJsZSBkaXNhYmxlZFxuICAgIGRlbGV0ZU9uVG91Y2g/OiBib29sZWFuOyAvLyBzZWxlY3RpbmcgYSBwaWVjZSBvbiB0aGUgYm9hcmQgb3IgaW4gaGFuZCB3aWxsIHJlbW92ZSBpdCAtIGJvYXJkIGVkaXRvclxuICAgIGFkZFNwYXJlc1RvSGFuZD86IGJvb2xlYW47IC8vIGFkZCBzZWxlY3RlZCBzcGFyZSBwaWVjZSB0byBoYW5kIC0gYm9hcmQgZWRpdG9yXG4gIH07XG4gIGV2ZW50cz86IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIG1vdmU/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIGNhcHR1cmVkUGllY2U/OiBzZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNxdWFyZSBpcyBzZWxlY3RlZFxuICAgIHVuc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNlbGVjdGVkIHNxdWFyZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIG9yaWdpbmFsIHNxdWFyZVxuICAgIHBpZWNlU2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBwaWVjZSBpbiBoYW5kIGlzIHNlbGVjdGVkXG4gICAgcGllY2VVbnNlbGVjdD86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgcGllY2UgaXMgZGlyZWN0bHkgdW5zZWxlY3RlZCAtIGRyb3BwZWQgYmFjayBvciBjbGlja2VkIG9uIHRoZSBzYW1lIHBpZWNlXG4gICAgaW5zZXJ0PzogKGJvYXJkRWxlbWVudHM/OiBzZy5Cb2FyZEVsZW1lbnRzLCBoYW5kRWxlbWVudHM/OiBzZy5IYW5kRWxlbWVudHMpID0+IHZvaWQ7IC8vIHdoZW4gdGhlIGJvYXJkL2hhbmRzIERPTSBoYXMgYmVlbiAocmUpaW5zZXJ0ZWRcbiAgfTtcbiAgZHJhd2FibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGNhbiBkcmF3XG4gICAgdmlzaWJsZT86IGJvb2xlYW47IC8vIGNhbiB2aWV3XG4gICAgZm9yY2VkPzogYm9vbGVhbjsgLy8gY2FuIG9ubHkgZHJhd1xuICAgIGVyYXNlT25DbGljaz86IGJvb2xlYW47XG4gICAgc2hhcGVzPzogRHJhd1NoYXBlW107XG4gICAgYXV0b1NoYXBlcz86IERyYXdTaGFwZVtdO1xuICAgIHNxdWFyZXM/OiBTcXVhcmVIaWdobGlnaHRbXTtcbiAgICBvbkNoYW5nZT86IChzaGFwZXM6IERyYXdTaGFwZVtdKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgZHJhd2FibGUgc2hhcGVzIGNoYW5nZVxuICB9O1xuICBmb3JzeXRoPzoge1xuICAgIHRvRm9yc3l0aD86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgZnJvbUZvcnN5dGg/OiAoc3RyOiBzdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gIH07XG4gIHByb21vdGlvbj86IHtcbiAgICBwcm9tb3Rlc1RvPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgdW5wcm9tb3Rlc1RvPzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgbW92ZVByb21vdGlvbkRpYWxvZz86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjsgLy8gYWN0aXZhdGUgcHJvbW90aW9uIGRpYWxvZ1xuICAgIGZvcmNlTW92ZVByb21vdGlvbj86IChvcmlnOiBzZy5LZXksIGRlc3Q6IHNnLktleSkgPT4gYm9vbGVhbjsgLy8gYXV0byBwcm9tb3RlIGFmdGVyIG1vdmVcbiAgICBkcm9wUHJvbW90aW9uRGlhbG9nPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpID0+IGJvb2xlYW47IC8vIGFjdGl2YXRlIHByb21vdGlvbiBkaWFsb2dcbiAgICBmb3JjZURyb3BQcm9tb3Rpb24/OiAocGllY2U6IHNnLlBpZWNlLCBrZXk6IHNnLktleSkgPT4gYm9vbGVhbjsgLy8gYXV0byBwcm9tb3RlIGFmdGVyIGRyb3BcbiAgICBldmVudHM/OiB7XG4gICAgICBpbml0aWF0ZWQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBwcm9tb3Rpb24gZGlhbG9nIGlzIHN0YXJ0ZWRcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHVzZXIgc2VsZWN0cyBhIHBpZWNlXG4gICAgICBjYW5jZWw/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdXNlciBjYW5jZWxzIHRoZSBzZWxlY3Rpb25cbiAgICB9O1xuICB9O1xuICBwaWVjZUNvb2xkb3duPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuO1xuICAgIGNvb2xkb3duVGltZT86IG51bWJlcjsgLy8gY29vbGRvd24gaW4gbWlsbGlzZWNvbmRzXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUFuaW1hdGlvbihzdGF0ZTogSGVhZGxlc3NTdGF0ZSwgY29uZmlnOiBDb25maWcpOiB2b2lkIHtcbiAgaWYgKGNvbmZpZy5hbmltYXRpb24pIHtcbiAgICBkZWVwTWVyZ2Uoc3RhdGUuYW5pbWF0aW9uLCBjb25maWcuYW5pbWF0aW9uKTtcbiAgICAvLyBubyBuZWVkIGZvciBzdWNoIHNob3J0IGFuaW1hdGlvbnNcbiAgICBpZiAoKHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiB8fCAwKSA8IDcwKSBzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoc3RhdGU6IEhlYWRsZXNzU3RhdGUsIGNvbmZpZzogQ29uZmlnKTogdm9pZCB7XG4gIC8vIGRvbid0IG1lcmdlLCBqdXN0IG92ZXJyaWRlLlxuICBpZiAoY29uZmlnLm1vdmFibGU/LmRlc3RzKSBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBpZiAoY29uZmlnLmRyb3BwYWJsZT8uZGVzdHMpIHN0YXRlLmRyb3BwYWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uc2hhcGVzKSBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgaWYgKGNvbmZpZy5kcmF3YWJsZT8uYXV0b1NoYXBlcykgc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IFtdO1xuICBpZiAoY29uZmlnLmRyYXdhYmxlPy5zcXVhcmVzKSBzdGF0ZS5kcmF3YWJsZS5zcXVhcmVzID0gW107XG4gIGlmIChjb25maWcuaGFuZHM/LnJvbGVzKSBzdGF0ZS5oYW5kcy5yb2xlcyA9IFtdO1xuXG4gIGRlZXBNZXJnZShzdGF0ZSwgY29uZmlnKTtcblxuICAvLyBpZiBhIHNmZW4gd2FzIHByb3ZpZGVkLCByZXBsYWNlIHRoZSBwaWVjZXMsIGV4Y2VwdCB0aGUgY3VycmVudGx5IGRyYWdnZWQgb25lXG4gIGlmIChjb25maWcuc2Zlbj8uYm9hcmQpIHtcbiAgICBzdGF0ZS5kaW1lbnNpb25zID0gaW5mZXJEaW1lbnNpb25zKGNvbmZpZy5zZmVuLmJvYXJkKTtcbiAgICBzdGF0ZS5waWVjZXMgPSBzZmVuVG9Cb2FyZChjb25maWcuc2Zlbi5ib2FyZCwgc3RhdGUuZGltZW5zaW9ucywgc3RhdGUuZm9yc3l0aC5mcm9tRm9yc3l0aCk7XG4gICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gY29uZmlnLmRyYXdhYmxlPy5zaGFwZXMgfHwgW107XG4gIH1cblxuICBpZiAoY29uZmlnLnNmZW4/LmhhbmRzKSB7XG4gICAgc3RhdGUuaGFuZHMuaGFuZE1hcCA9IHNmZW5Ub0hhbmRzKGNvbmZpZy5zZmVuLmhhbmRzLCBzdGF0ZS5mb3JzeXRoLmZyb21Gb3JzeXRoKTtcbiAgfVxuXG4gIC8vIGFwcGx5IGNvbmZpZyB2YWx1ZXMgdGhhdCBjb3VsZCBiZSB1bmRlZmluZWQgeWV0IG1lYW5pbmdmdWxcbiAgaWYgKCdjaGVja3MnIGluIGNvbmZpZykgc2V0Q2hlY2tzKHN0YXRlLCBjb25maWcuY2hlY2tzIHx8IGZhbHNlKTtcbiAgaWYgKCdsYXN0UGllY2UnIGluIGNvbmZpZyAmJiAhY29uZmlnLmxhc3RQaWVjZSkgc3RhdGUubGFzdFBpZWNlID0gdW5kZWZpbmVkO1xuXG4gIC8vIGluIGNhc2Ugb2YgZHJvcCBsYXN0IG1vdmUsIHRoZXJlJ3MgYSBzaW5nbGUgc3F1YXJlLlxuICAvLyBpZiB0aGUgcHJldmlvdXMgbGFzdCBtb3ZlIGhhZCB0d28gc3F1YXJlcyxcbiAgLy8gdGhlIG1lcmdlIGFsZ29yaXRobSB3aWxsIGluY29ycmVjdGx5IGtlZXAgdGhlIHNlY29uZCBzcXVhcmUuXG4gIGlmICgnbGFzdERlc3RzJyBpbiBjb25maWcgJiYgIWNvbmZpZy5sYXN0RGVzdHMpIHN0YXRlLmxhc3REZXN0cyA9IHVuZGVmaW5lZDtcbiAgZWxzZSBpZiAoY29uZmlnLmxhc3REZXN0cykgc3RhdGUubGFzdERlc3RzID0gY29uZmlnLmxhc3REZXN0cztcblxuICAvLyBmaXggbW92ZS9wcmVtb3ZlIGRlc3RzXG4gIHNldFByZURlc3RzKHN0YXRlKTtcblxuICBhcHBseUFuaW1hdGlvbihzdGF0ZSwgY29uZmlnKTtcbn1cblxuZnVuY3Rpb24gZGVlcE1lcmdlKGJhc2U6IGFueSwgZXh0ZW5kOiBhbnkpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBrZXkgaW4gZXh0ZW5kKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHRlbmQsIGtleSkpIHtcbiAgICAgIGlmIChcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGJhc2UsIGtleSkgJiZcbiAgICAgICAgaXNQbGFpbk9iamVjdChiYXNlW2tleV0pICYmXG4gICAgICAgIGlzUGxhaW5PYmplY3QoZXh0ZW5kW2tleV0pXG4gICAgICApXG4gICAgICAgIGRlZXBNZXJnZShiYXNlW2tleV0sIGV4dGVuZFtrZXldKTtcbiAgICAgIGVsc2UgYmFzZVtrZXldID0gZXh0ZW5kW2tleV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QobzogdW5rbm93bik6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIG8gIT09ICdvYmplY3QnIHx8IG8gPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7XG4gIHJldHVybiBwcm90byA9PT0gT2JqZWN0LnByb3RvdHlwZSB8fCBwcm90byA9PT0gbnVsbDtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgYWxsS2V5cywgY29sb3JzIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgdHlwZSBNdXRhdGlvbjxBPiA9IChzdGF0ZTogU3RhdGUpID0+IEE7XG5cbi8vIDAsMSBhbmltYXRpb24gZ29hbFxuLy8gMiwzIGFuaW1hdGlvbiBjdXJyZW50IHN0YXR1c1xuZXhwb3J0IHR5cGUgQW5pbVZlY3RvciA9IHNnLk51bWJlclF1YWQ7XG5cbmV4cG9ydCB0eXBlIEFuaW1WZWN0b3JzID0gTWFwPHNnLktleSwgQW5pbVZlY3Rvcj47XG5cbmV4cG9ydCB0eXBlIEFuaW1GYWRpbmdzID0gTWFwPHNnLktleSwgc2cuUGllY2U+O1xuXG5leHBvcnQgdHlwZSBBbmltUHJvbW90aW9ucyA9IE1hcDxzZy5LZXksIHNnLlBpZWNlPjtcblxuZXhwb3J0IGludGVyZmFjZSBBbmltUGxhbiB7XG4gIGFuaW1zOiBBbmltVmVjdG9ycztcbiAgZmFkaW5nczogQW5pbUZhZGluZ3M7XG4gIHByb21vdGlvbnM6IEFuaW1Qcm9tb3Rpb25zO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1DdXJyZW50IHtcbiAgc3RhcnQ6IERPTUhpZ2hSZXNUaW1lU3RhbXA7XG4gIGZyZXF1ZW5jeTogc2cuS0h6O1xuICBwbGFuOiBBbmltUGxhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuaW08QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgcmV0dXJuIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID8gYW5pbWF0ZShtdXRhdGlvbiwgc3RhdGUpIDogcmVuZGVyKG11dGF0aW9uLCBzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXI8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmludGVyZmFjZSBBbmltUGllY2Uge1xuICBrZXk/OiBzZy5LZXk7XG4gIHBvczogc2cuUG9zO1xuICBwaWVjZTogc2cuUGllY2U7XG59XG5cbmZ1bmN0aW9uIG1ha2VQaWVjZShrZXk6IHNnLktleSwgcGllY2U6IHNnLlBpZWNlKTogQW5pbVBpZWNlIHtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IGtleSxcbiAgICBwb3M6IHV0aWwua2V5MnBvcyhrZXkpLFxuICAgIHBpZWNlOiBwaWVjZSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xvc2VyKHBpZWNlOiBBbmltUGllY2UsIHBpZWNlczogQW5pbVBpZWNlW10pOiBBbmltUGllY2UgfCB1bmRlZmluZWQge1xuICByZXR1cm4gcGllY2VzLnNvcnQoKHAxLCBwMikgPT4ge1xuICAgIHJldHVybiB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMS5wb3MpIC0gdXRpbC5kaXN0YW5jZVNxKHBpZWNlLnBvcywgcDIucG9zKTtcbiAgfSlbMF07XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVQbGFuKHByZXZQaWVjZXM6IHNnLlBpZWNlcywgcHJldkhhbmRzOiBzZy5IYW5kcywgY3VycmVudDogU3RhdGUpOiBBbmltUGxhbiB7XG4gIGNvbnN0IGFuaW1zOiBBbmltVmVjdG9ycyA9IG5ldyBNYXAoKSxcbiAgICBhbmltZWRPcmlnczogc2cuS2V5W10gPSBbXSxcbiAgICBmYWRpbmdzOiBBbmltRmFkaW5ncyA9IG5ldyBNYXAoKSxcbiAgICBwcm9tb3Rpb25zOiBBbmltUHJvbW90aW9ucyA9IG5ldyBNYXAoKSxcbiAgICBtaXNzaW5nczogQW5pbVBpZWNlW10gPSBbXSxcbiAgICBuZXdzOiBBbmltUGllY2VbXSA9IFtdLFxuICAgIHByZVBpZWNlcyA9IG5ldyBNYXA8c2cuS2V5LCBBbmltUGllY2U+KCk7XG5cbiAgZm9yIChjb25zdCBbaywgcF0gb2YgcHJldlBpZWNlcykge1xuICAgIHByZVBpZWNlcy5zZXQoaywgbWFrZVBpZWNlKGssIHApKTtcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiBhbGxLZXlzKSB7XG4gICAgY29uc3QgY3VyUCA9IGN1cnJlbnQucGllY2VzLmdldChrZXkpLFxuICAgICAgcHJlUCA9IHByZVBpZWNlcy5nZXQoa2V5KTtcbiAgICBpZiAoY3VyUCkge1xuICAgICAgaWYgKHByZVApIHtcbiAgICAgICAgaWYgKCF1dGlsLnNhbWVQaWVjZShjdXJQLCBwcmVQLnBpZWNlKSkge1xuICAgICAgICAgIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gICAgICAgICAgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIG5ld3MucHVzaChtYWtlUGllY2Uoa2V5LCBjdXJQKSk7XG4gICAgfSBlbHNlIGlmIChwcmVQKSBtaXNzaW5ncy5wdXNoKHByZVApO1xuICB9XG4gIGlmIChjdXJyZW50LmFuaW1hdGlvbi5oYW5kcykge1xuICAgIGZvciAoY29uc3QgY29sb3Igb2YgY29sb3JzKSB7XG4gICAgICBjb25zdCBjdXJIID0gY3VycmVudC5oYW5kcy5oYW5kTWFwLmdldChjb2xvciksXG4gICAgICAgIHByZUggPSBwcmV2SGFuZHMuZ2V0KGNvbG9yKTtcbiAgICAgIGlmIChwcmVIICYmIGN1ckgpIHtcbiAgICAgICAgZm9yIChjb25zdCBbcm9sZSwgbl0gb2YgcHJlSCkge1xuICAgICAgICAgIGNvbnN0IHBpZWNlOiBzZy5QaWVjZSA9IHsgcm9sZSwgY29sb3IgfSxcbiAgICAgICAgICAgIGN1ck4gPSBjdXJILmdldChyb2xlKSB8fCAwO1xuICAgICAgICAgIGlmIChjdXJOIDwgbikge1xuICAgICAgICAgICAgY29uc3QgaGFuZFBpZWNlT2Zmc2V0ID0gY3VycmVudC5kb20uYm91bmRzLmhhbmRzXG4gICAgICAgICAgICAgICAgLnBpZWNlQm91bmRzKClcbiAgICAgICAgICAgICAgICAuZ2V0KHV0aWwucGllY2VOYW1lT2YocGllY2UpKSxcbiAgICAgICAgICAgICAgYm91bmRzID0gY3VycmVudC5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpLFxuICAgICAgICAgICAgICBvdXRQb3MgPVxuICAgICAgICAgICAgICAgIGhhbmRQaWVjZU9mZnNldCAmJiBib3VuZHNcbiAgICAgICAgICAgICAgICAgID8gdXRpbC5wb3NPZk91dHNpZGVFbChcbiAgICAgICAgICAgICAgICAgICAgICBoYW5kUGllY2VPZmZzZXQubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICBoYW5kUGllY2VPZmZzZXQudG9wLFxuICAgICAgICAgICAgICAgICAgICAgIHV0aWwuc2VudGVQb3YoY3VycmVudC5vcmllbnRhdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5kaW1lbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICAgIGJvdW5kcyxcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAob3V0UG9zKVxuICAgICAgICAgICAgICBtaXNzaW5ncy5wdXNoKHtcbiAgICAgICAgICAgICAgICBwb3M6IG91dFBvcyxcbiAgICAgICAgICAgICAgICBwaWVjZTogcGllY2UsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IG5ld1Agb2YgbmV3cykge1xuICAgIGNvbnN0IHByZVAgPSBjbG9zZXIoXG4gICAgICBuZXdQLFxuICAgICAgbWlzc2luZ3MuZmlsdGVyKChwKSA9PiB7XG4gICAgICAgIGlmICh1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwLnBpZWNlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGNoZWNraW5nIHdoZXRoZXIgcHJvbW90ZWQgcGllY2VzIGFyZSB0aGUgc2FtZVxuICAgICAgICBjb25zdCBwUm9sZSA9IGN1cnJlbnQucHJvbW90aW9uLnByb21vdGVzVG8ocC5waWVjZS5yb2xlKSxcbiAgICAgICAgICBwUGllY2UgPSBwUm9sZSAmJiB7IGNvbG9yOiBwLnBpZWNlLmNvbG9yLCByb2xlOiBwUm9sZSB9O1xuICAgICAgICBjb25zdCBuUm9sZSA9IGN1cnJlbnQucHJvbW90aW9uLnByb21vdGVzVG8obmV3UC5waWVjZS5yb2xlKSxcbiAgICAgICAgICBuUGllY2UgPSBuUm9sZSAmJiB7IGNvbG9yOiBuZXdQLnBpZWNlLmNvbG9yLCByb2xlOiBuUm9sZSB9O1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICghIXBQaWVjZSAmJiB1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwUGllY2UpKSB8fFxuICAgICAgICAgICghIW5QaWVjZSAmJiB1dGlsLnNhbWVQaWVjZShuUGllY2UsIHAucGllY2UpKVxuICAgICAgICApO1xuICAgICAgfSksXG4gICAgKTtcbiAgICBpZiAocHJlUCkge1xuICAgICAgY29uc3QgdmVjdG9yID0gW3ByZVAucG9zWzBdIC0gbmV3UC5wb3NbMF0sIHByZVAucG9zWzFdIC0gbmV3UC5wb3NbMV1dO1xuICAgICAgYW5pbXMuc2V0KG5ld1Aua2V5ISwgdmVjdG9yLmNvbmNhdCh2ZWN0b3IpIGFzIEFuaW1WZWN0b3IpO1xuICAgICAgaWYgKHByZVAua2V5KSBhbmltZWRPcmlncy5wdXNoKHByZVAua2V5KTtcbiAgICAgIGlmICghdXRpbC5zYW1lUGllY2UobmV3UC5waWVjZSwgcHJlUC5waWVjZSkgJiYgbmV3UC5rZXkpIHByb21vdGlvbnMuc2V0KG5ld1Aua2V5LCBwcmVQLnBpZWNlKTtcbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBwIG9mIG1pc3NpbmdzKSB7XG4gICAgaWYgKHAua2V5ICYmICFhbmltZWRPcmlncy5pbmNsdWRlcyhwLmtleSkpIGZhZGluZ3Muc2V0KHAua2V5LCBwLnBpZWNlKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYW5pbXM6IGFuaW1zLFxuICAgIGZhZGluZ3M6IGZhZGluZ3MsXG4gICAgcHJvbW90aW9uczogcHJvbW90aW9ucyxcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RlcChzdGF0ZTogU3RhdGUsIG5vdzogRE9NSGlnaFJlc1RpbWVTdGFtcCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzdGF0ZS5hbmltYXRpb24uY3VycmVudDtcbiAgaWYgKGN1ciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gYW5pbWF0aW9uIHdhcyBjYW5jZWxlZCA6KFxuICAgIGlmICghc3RhdGUuZG9tLmRlc3Ryb3llZCkgc3RhdGUuZG9tLnJlZHJhd05vdygpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCByZXN0ID0gMSAtIChub3cgLSBjdXIuc3RhcnQpICogY3VyLmZyZXF1ZW5jeTtcbiAgaWYgKHJlc3QgPD0gMCkge1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBlYXNlID0gZWFzaW5nKHJlc3QpO1xuICAgIGZvciAoY29uc3QgY2ZnIG9mIGN1ci5wbGFuLmFuaW1zLnZhbHVlcygpKSB7XG4gICAgICBjZmdbMl0gPSBjZmdbMF0gKiBlYXNlO1xuICAgICAgY2ZnWzNdID0gY2ZnWzFdICogZWFzZTtcbiAgICB9XG4gICAgc3RhdGUuZG9tLnJlZHJhd05vdyh0cnVlKTsgLy8gb3B0aW1pc2F0aW9uOiBkb24ndCByZW5kZXIgU1ZHIGNoYW5nZXMgZHVyaW5nIGFuaW1hdGlvbnNcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpKSA9PiBzdGVwKHN0YXRlLCBub3cpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhbmltYXRlPEE+KG11dGF0aW9uOiBNdXRhdGlvbjxBPiwgc3RhdGU6IFN0YXRlKTogQSB7XG4gIC8vIGNsb25lIHN0YXRlIGJlZm9yZSBtdXRhdGluZyBpdFxuICBjb25zdCBwcmV2UGllY2VzOiBzZy5QaWVjZXMgPSBuZXcgTWFwKHN0YXRlLnBpZWNlcyksXG4gICAgcHJldkhhbmRzOiBzZy5IYW5kcyA9IG5ldyBNYXAoW1xuICAgICAgWydzZW50ZScsIG5ldyBNYXAoc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQoJ3NlbnRlJykpXSxcbiAgICAgIFsnZ290ZScsIG5ldyBNYXAoc3RhdGUuaGFuZHMuaGFuZE1hcC5nZXQoJ2dvdGUnKSldLFxuICAgIF0pO1xuXG4gIGNvbnN0IHJlc3VsdCA9IG11dGF0aW9uKHN0YXRlKSxcbiAgICBwbGFuID0gY29tcHV0ZVBsYW4ocHJldlBpZWNlcywgcHJldkhhbmRzLCBzdGF0ZSk7XG4gIGlmIChwbGFuLmFuaW1zLnNpemUgfHwgcGxhbi5mYWRpbmdzLnNpemUpIHtcbiAgICBjb25zdCBhbHJlYWR5UnVubmluZyA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50Py5zdGFydCAhPT0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0ge1xuICAgICAgc3RhcnQ6IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgZnJlcXVlbmN5OiAxIC8gTWF0aC5tYXgoc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uLCAxKSxcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgfTtcbiAgICBpZiAoIWFscmVhZHlSdW5uaW5nKSBzdGVwKHN0YXRlLCBwZXJmb3JtYW5jZS5ub3coKSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gZG9uJ3QgYW5pbWF0ZSwganVzdCByZW5kZXIgcmlnaHQgYXdheVxuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuZnVuY3Rpb24gZWFzaW5nKHQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiB0IDwgMC41ID8gNCAqIHQgKiB0ICogdCA6ICh0IC0gMSkgKiAoMiAqIHQgLSAyKSAqICgyICogdCAtIDIpICsgMTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYXdTaGFwZSwgRHJhd1NoYXBlUGllY2UsIERyYXdDdXJyZW50IH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBjcmVhdGVFbCxcbiAga2V5MnBvcyxcbiAgcGllY2VOYW1lT2YsXG4gIHBvc1RvVHJhbnNsYXRlUmVsLFxuICBzYW1lUGllY2UsXG4gIHRyYW5zbGF0ZVJlbCxcbiAgcG9zT2ZPdXRzaWRlRWwsXG4gIHNlbnRlUG92LFxufSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU1ZHRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcpOiBTVkdFbGVtZW50IHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCB0YWdOYW1lKTtcbn1cblxuaW50ZXJmYWNlIFNoYXBlIHtcbiAgc2hhcGU6IERyYXdTaGFwZTtcbiAgaGFzaDogSGFzaDtcbiAgY3VycmVudD86IGJvb2xlYW47XG59XG5cbnR5cGUgQXJyb3dEZXN0cyA9IE1hcDxzZy5LZXkgfCBzZy5QaWVjZU5hbWUsIG51bWJlcj47IC8vIGhvdyBtYW55IGFycm93cyBsYW5kIG9uIGEgc3F1YXJlXG5cbnR5cGUgSGFzaCA9IHN0cmluZztcblxuY29uc3Qgb3V0c2lkZUFycm93SGFzaCA9ICdvdXRzaWRlQXJyb3cnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyU2hhcGVzKFxuICBzdGF0ZTogU3RhdGUsXG4gIHN2ZzogU1ZHRWxlbWVudCxcbiAgY3VzdG9tU3ZnOiBTVkdFbGVtZW50LFxuICBmcmVlUGllY2VzOiBIVE1MRWxlbWVudCxcbik6IHZvaWQge1xuICBjb25zdCBkID0gc3RhdGUuZHJhd2FibGUsXG4gICAgY3VyRCA9IGQuY3VycmVudCxcbiAgICBjdXIgPSBjdXJEPy5kZXN0ID8gKGN1ckQgYXMgRHJhd1NoYXBlKSA6IHVuZGVmaW5lZCxcbiAgICBvdXRzaWRlQXJyb3cgPSAhIWN1ckQgJiYgIWN1cixcbiAgICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzID0gbmV3IE1hcCgpLFxuICAgIHBpZWNlTWFwID0gbmV3IE1hcDxzZy5LZXksIERyYXdTaGFwZT4oKTtcblxuICBjb25zdCBoYXNoQm91bmRzID0gKCkgPT4ge1xuICAgIC8vIHRvZG8gYWxzbyBwb3NzaWJsZSBwaWVjZSBib3VuZHNcbiAgICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIHJldHVybiAoYm91bmRzICYmIGJvdW5kcy53aWR0aC50b1N0cmluZygpICsgYm91bmRzLmhlaWdodCkgfHwgJyc7XG4gIH07XG5cbiAgZm9yIChjb25zdCBzIG9mIGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLmNvbmNhdChjdXIgPyBbY3VyXSA6IFtdKSkge1xuICAgIGNvbnN0IGRlc3ROYW1lID0gaXNQaWVjZShzLmRlc3QpID8gcGllY2VOYW1lT2Yocy5kZXN0KSA6IHMuZGVzdDtcbiAgICBpZiAoIXNhbWVQaWVjZU9yS2V5KHMuZGVzdCwgcy5vcmlnKSlcbiAgICAgIGFycm93RGVzdHMuc2V0KGRlc3ROYW1lLCAoYXJyb3dEZXN0cy5nZXQoZGVzdE5hbWUpIHx8IDApICsgMSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IHMgb2YgZC5zaGFwZXMuY29uY2F0KGN1ciA/IFtjdXJdIDogW10pLmNvbmNhdChkLmF1dG9TaGFwZXMpKSB7XG4gICAgaWYgKHMucGllY2UgJiYgIWlzUGllY2Uocy5vcmlnKSkgcGllY2VNYXAuc2V0KHMub3JpZywgcyk7XG4gIH1cbiAgY29uc3QgcGllY2VTaGFwZXMgPSBbLi4ucGllY2VNYXAudmFsdWVzKCldLm1hcCgocykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzaGFwZTogcyxcbiAgICAgIGhhc2g6IHNoYXBlSGFzaChzLCBhcnJvd0Rlc3RzLCBmYWxzZSwgaGFzaEJvdW5kcyksXG4gICAgfTtcbiAgfSk7XG5cbiAgY29uc3Qgc2hhcGVzOiBTaGFwZVtdID0gZC5zaGFwZXMuY29uY2F0KGQuYXV0b1NoYXBlcykubWFwKChzOiBEcmF3U2hhcGUpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hhcGU6IHMsXG4gICAgICBoYXNoOiBzaGFwZUhhc2gocywgYXJyb3dEZXN0cywgZmFsc2UsIGhhc2hCb3VuZHMpLFxuICAgIH07XG4gIH0pO1xuICBpZiAoY3VyKVxuICAgIHNoYXBlcy5wdXNoKHtcbiAgICAgIHNoYXBlOiBjdXIsXG4gICAgICBoYXNoOiBzaGFwZUhhc2goY3VyLCBhcnJvd0Rlc3RzLCB0cnVlLCBoYXNoQm91bmRzKSxcbiAgICAgIGN1cnJlbnQ6IHRydWUsXG4gICAgfSk7XG5cbiAgY29uc3QgZnVsbEhhc2ggPSBzaGFwZXMubWFwKChzYykgPT4gc2MuaGFzaCkuam9pbignOycpICsgKG91dHNpZGVBcnJvdyA/IG91dHNpZGVBcnJvd0hhc2ggOiAnJyk7XG4gIGlmIChmdWxsSGFzaCA9PT0gc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2gpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSBmdWxsSGFzaDtcblxuICAvKlxuICAgIC0tIERPTSBoaWVyYXJjaHkgLS1cbiAgICA8c3ZnIGNsYXNzPVwic2ctc2hhcGVzXCI+ICg8PSBzdmcpXG4gICAgICA8ZGVmcz5cbiAgICAgICAgLi4uKGZvciBicnVzaGVzKS4uLlxuICAgICAgPC9kZWZzPlxuICAgICAgPGc+XG4gICAgICAgIC4uLihmb3IgYXJyb3dzIGFuZCBjaXJjbGVzKS4uLlxuICAgICAgPC9nPlxuICAgIDwvc3ZnPlxuICAgIDxzdmcgY2xhc3M9XCJzZy1jdXN0b20tc3Znc1wiPiAoPD0gY3VzdG9tU3ZnKVxuICAgICAgPGc+XG4gICAgICAgIC4uLihmb3IgY3VzdG9tIHN2Z3MpLi4uXG4gICAgICA8L2c+XG4gICAgPHNnLWZyZWUtcGllY2VzPiAoPD0gZnJlZVBpZWNlcylcbiAgICAgIC4uLihmb3IgcGllY2VzKS4uLlxuICAgIDwvc2ctZnJlZS1waWVjZXM+XG4gICAgPC9zdmc+XG4gICovXG4gIGNvbnN0IGRlZnNFbCA9IHN2Zy5xdWVyeVNlbGVjdG9yKCdkZWZzJykgYXMgU1ZHRWxlbWVudCxcbiAgICBzaGFwZXNFbCA9IHN2Zy5xdWVyeVNlbGVjdG9yKCdnJykgYXMgU1ZHRWxlbWVudCxcbiAgICBjdXN0b21TdmdzRWwgPSBjdXN0b21TdmcucXVlcnlTZWxlY3RvcignZycpIGFzIFNWR0VsZW1lbnQ7XG5cbiAgc3luY0RlZnMoc2hhcGVzLCBvdXRzaWRlQXJyb3cgPyBjdXJEIDogdW5kZWZpbmVkLCBkZWZzRWwpO1xuICBzeW5jU2hhcGVzKFxuICAgIHNoYXBlcy5maWx0ZXIoKHMpID0+ICFzLnNoYXBlLmN1c3RvbVN2ZyAmJiAoIXMuc2hhcGUucGllY2UgfHwgcy5jdXJyZW50KSksXG4gICAgc2hhcGVzRWwsXG4gICAgKHNoYXBlKSA9PiByZW5kZXJTVkdTaGFwZShzdGF0ZSwgc2hhcGUsIGFycm93RGVzdHMpLFxuICAgIG91dHNpZGVBcnJvdyxcbiAgKTtcbiAgc3luY1NoYXBlcyhcbiAgICBzaGFwZXMuZmlsdGVyKChzKSA9PiBzLnNoYXBlLmN1c3RvbVN2ZyksXG4gICAgY3VzdG9tU3Znc0VsLFxuICAgIChzaGFwZSkgPT4gcmVuZGVyU1ZHU2hhcGUoc3RhdGUsIHNoYXBlLCBhcnJvd0Rlc3RzKSxcbiAgKTtcbiAgc3luY1NoYXBlcyhwaWVjZVNoYXBlcywgZnJlZVBpZWNlcywgKHNoYXBlKSA9PiByZW5kZXJQaWVjZShzdGF0ZSwgc2hhcGUpKTtcblxuICBpZiAoIW91dHNpZGVBcnJvdyAmJiBjdXJEKSBjdXJELmFycm93ID0gdW5kZWZpbmVkO1xuXG4gIGlmIChvdXRzaWRlQXJyb3cgJiYgIWN1ckQuYXJyb3cpIHtcbiAgICBjb25zdCBvcmlnID0gcGllY2VPcktleVRvUG9zKGN1ckQub3JpZywgc3RhdGUpO1xuICAgIGlmIChvcmlnKSB7XG4gICAgICBjb25zdCBnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdnJyksIHtcbiAgICAgICAgICBjbGFzczogc2hhcGVDbGFzcyhjdXJELmJydXNoLCB0cnVlLCB0cnVlKSxcbiAgICAgICAgICBzZ0hhc2g6IG91dHNpZGVBcnJvd0hhc2gsXG4gICAgICAgIH0pLFxuICAgICAgICBlbCA9IHJlbmRlckFycm93KGN1ckQuYnJ1c2gsIG9yaWcsIG9yaWcsIHN0YXRlLnNxdWFyZVJhdGlvLCB0cnVlLCBmYWxzZSk7XG4gICAgICBnLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgIGN1ckQuYXJyb3cgPSBlbDtcbiAgICAgIHNoYXBlc0VsLmFwcGVuZENoaWxkKGcpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBhcHBlbmQgb25seS4gRG9uJ3QgdHJ5IHRvIHVwZGF0ZS9yZW1vdmUuXG5mdW5jdGlvbiBzeW5jRGVmcyhcbiAgc2hhcGVzOiBTaGFwZVtdLFxuICBvdXRzaWRlU2hhcGU6IERyYXdDdXJyZW50IHwgdW5kZWZpbmVkLFxuICBkZWZzRWw6IFNWR0VsZW1lbnQsXG4pOiB2b2lkIHtcbiAgY29uc3QgYnJ1c2hlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IHMgb2Ygc2hhcGVzKSB7XG4gICAgaWYgKCFzYW1lUGllY2VPcktleShzLnNoYXBlLmRlc3QsIHMuc2hhcGUub3JpZykpIGJydXNoZXMuYWRkKHMuc2hhcGUuYnJ1c2gpO1xuICB9XG4gIGlmIChvdXRzaWRlU2hhcGUpIGJydXNoZXMuYWRkKG91dHNpZGVTaGFwZS5icnVzaCk7XG4gIGNvbnN0IGtleXNJbkRvbSA9IG5ldyBTZXQoKTtcbiAgbGV0IGVsOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkID0gZGVmc0VsLmZpcnN0RWxlbWVudENoaWxkIGFzIFNWR0VsZW1lbnQ7XG4gIHdoaWxlIChlbCkge1xuICAgIGtleXNJbkRvbS5hZGQoZWwuZ2V0QXR0cmlidXRlKCdzZ0tleScpKTtcbiAgICBlbCA9IGVsLm5leHRFbGVtZW50U2libGluZyBhcyBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIGJydXNoZXMpIHtcbiAgICBjb25zdCBicnVzaCA9IGtleSB8fCAncHJpbWFyeSc7XG4gICAgaWYgKCFrZXlzSW5Eb20uaGFzKGJydXNoKSkgZGVmc0VsLmFwcGVuZENoaWxkKHJlbmRlck1hcmtlcihicnVzaCkpO1xuICB9XG59XG5cbi8vIGFwcGVuZCBhbmQgcmVtb3ZlIG9ubHkuIE5vIHVwZGF0ZXMuXG5leHBvcnQgZnVuY3Rpb24gc3luY1NoYXBlcyhcbiAgc2hhcGVzOiBTaGFwZVtdLFxuICByb290OiBIVE1MRWxlbWVudCB8IFNWR0VsZW1lbnQsXG4gIHJlbmRlclNoYXBlOiAoc2hhcGU6IFNoYXBlKSA9PiBIVE1MRWxlbWVudCB8IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQsXG4gIG91dHNpZGVBcnJvdz86IGJvb2xlYW4sXG4pOiB2b2lkIHtcbiAgY29uc3QgaGFzaGVzSW5Eb20gPSBuZXcgTWFwKCksIC8vIGJ5IGhhc2hcbiAgICB0b1JlbW92ZTogU1ZHRWxlbWVudFtdID0gW107XG4gIGZvciAoY29uc3Qgc2Mgb2Ygc2hhcGVzKSBoYXNoZXNJbkRvbS5zZXQoc2MuaGFzaCwgZmFsc2UpO1xuICBpZiAob3V0c2lkZUFycm93KSBoYXNoZXNJbkRvbS5zZXQob3V0c2lkZUFycm93SGFzaCwgdHJ1ZSk7XG4gIGxldCBlbDogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZCA9IHJvb3QuZmlyc3RFbGVtZW50Q2hpbGQgYXMgU1ZHRWxlbWVudCxcbiAgICBlbEhhc2g6IEhhc2g7XG4gIHdoaWxlIChlbCkge1xuICAgIGVsSGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnc2dIYXNoJykhO1xuICAgIC8vIGZvdW5kIGEgc2hhcGUgZWxlbWVudCB0aGF0J3MgaGVyZSB0byBzdGF5XG4gICAgaWYgKGhhc2hlc0luRG9tLmhhcyhlbEhhc2gpKSBoYXNoZXNJbkRvbS5zZXQoZWxIYXNoLCB0cnVlKTtcbiAgICAvLyBvciByZW1vdmUgaXRcbiAgICBlbHNlIHRvUmVtb3ZlLnB1c2goZWwpO1xuICAgIGVsID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIH1cbiAgLy8gcmVtb3ZlIG9sZCBzaGFwZXNcbiAgZm9yIChjb25zdCBlbCBvZiB0b1JlbW92ZSkgcm9vdC5yZW1vdmVDaGlsZChlbCk7XG4gIC8vIGluc2VydCBzaGFwZXMgdGhhdCBhcmUgbm90IHlldCBpbiBkb21cbiAgZm9yIChjb25zdCBzYyBvZiBzaGFwZXMpIHtcbiAgICBpZiAoIWhhc2hlc0luRG9tLmdldChzYy5oYXNoKSkge1xuICAgICAgY29uc3Qgc2hhcGVFbCA9IHJlbmRlclNoYXBlKHNjKTtcbiAgICAgIGlmIChzaGFwZUVsKSByb290LmFwcGVuZENoaWxkKHNoYXBlRWwpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaGFwZUhhc2goXG4gIHsgb3JpZywgZGVzdCwgYnJ1c2gsIHBpZWNlLCBjdXN0b21TdmcsIGRlc2NyaXB0aW9uIH06IERyYXdTaGFwZSxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyxcbiAgY3VycmVudDogYm9vbGVhbixcbiAgYm91bmRIYXNoOiAoKSA9PiBzdHJpbmcsXG4pOiBIYXNoIHtcbiAgcmV0dXJuIFtcbiAgICBjdXJyZW50LFxuICAgIChpc1BpZWNlKG9yaWcpIHx8IGlzUGllY2UoZGVzdCkpICYmIGJvdW5kSGFzaCgpLFxuICAgIGlzUGllY2Uob3JpZykgPyBwaWVjZUhhc2gob3JpZykgOiBvcmlnLFxuICAgIGlzUGllY2UoZGVzdCkgPyBwaWVjZUhhc2goZGVzdCkgOiBkZXN0LFxuICAgIGJydXNoLFxuICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKGRlc3QpID8gcGllY2VOYW1lT2YoZGVzdCkgOiBkZXN0KSB8fCAwKSA+IDEsXG4gICAgcGllY2UgJiYgcGllY2VIYXNoKHBpZWNlKSxcbiAgICBjdXN0b21TdmcgJiYgY3VzdG9tU3ZnSGFzaChjdXN0b21TdmcpLFxuICAgIGRlc2NyaXB0aW9uLFxuICBdXG4gICAgLmZpbHRlcigoeCkgPT4geClcbiAgICAuam9pbignLCcpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUhhc2gocGllY2U6IERyYXdTaGFwZVBpZWNlKTogSGFzaCB7XG4gIHJldHVybiBbcGllY2UuY29sb3IsIHBpZWNlLnJvbGUsIHBpZWNlLnNjYWxlXS5maWx0ZXIoKHgpID0+IHgpLmpvaW4oJywnKTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tU3ZnSGFzaChzOiBzdHJpbmcpOiBIYXNoIHtcbiAgLy8gUm9sbGluZyBoYXNoIHdpdGggYmFzZSAzMSAoY2YuIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc2MTY0NjEvZ2VuZXJhdGUtYS1oYXNoLWZyb20tc3RyaW5nLWluLWphdmFzY3JpcHQpXG4gIGxldCBoID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XG4gICAgaCA9ICgoaCA8PCA1KSAtIGggKyBzLmNoYXJDb2RlQXQoaSkpID4+PiAwO1xuICB9XG4gIHJldHVybiAnY3VzdG9tLScgKyBoLnRvU3RyaW5nKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNWR1NoYXBlKFxuICBzdGF0ZTogU3RhdGUsXG4gIHsgc2hhcGUsIGN1cnJlbnQsIGhhc2ggfTogU2hhcGUsXG4gIGFycm93RGVzdHM6IEFycm93RGVzdHMsXG4pOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgb3JpZyA9IHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5vcmlnLCBzdGF0ZSk7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBpZiAoc2hhcGUuY3VzdG9tU3ZnKSB7XG4gICAgcmV0dXJuIHJlbmRlckN1c3RvbVN2ZyhzaGFwZS5icnVzaCwgc2hhcGUuY3VzdG9tU3ZnLCBvcmlnLCBzdGF0ZS5zcXVhcmVSYXRpbyk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGVsOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGRlc3QgPSAhc2FtZVBpZWNlT3JLZXkoc2hhcGUub3JpZywgc2hhcGUuZGVzdCkgJiYgcGllY2VPcktleVRvUG9zKHNoYXBlLmRlc3QsIHN0YXRlKTtcbiAgICBpZiAoZGVzdCkge1xuICAgICAgZWwgPSByZW5kZXJBcnJvdyhcbiAgICAgICAgc2hhcGUuYnJ1c2gsXG4gICAgICAgIG9yaWcsXG4gICAgICAgIGRlc3QsXG4gICAgICAgIHN0YXRlLnNxdWFyZVJhdGlvLFxuICAgICAgICAhIWN1cnJlbnQsXG4gICAgICAgIChhcnJvd0Rlc3RzLmdldChpc1BpZWNlKHNoYXBlLmRlc3QpID8gcGllY2VOYW1lT2Yoc2hhcGUuZGVzdCkgOiBzaGFwZS5kZXN0KSB8fCAwKSA+IDEsXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoc2FtZVBpZWNlT3JLZXkoc2hhcGUuZGVzdCwgc2hhcGUub3JpZykpIHtcbiAgICAgIGxldCByYXRpbzogc2cuTnVtYmVyUGFpciA9IHN0YXRlLnNxdWFyZVJhdGlvO1xuICAgICAgaWYgKGlzUGllY2Uoc2hhcGUub3JpZykpIHtcbiAgICAgICAgY29uc3QgcGllY2VCb3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkuZ2V0KHBpZWNlTmFtZU9mKHNoYXBlLm9yaWcpKSxcbiAgICAgICAgICBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgICAgICBpZiAocGllY2VCb3VuZHMgJiYgYm91bmRzKSB7XG4gICAgICAgICAgY29uc3QgaGVpZ2h0QmFzZSA9IHBpZWNlQm91bmRzLmhlaWdodCAvIChib3VuZHMuaGVpZ2h0IC8gc3RhdGUuZGltZW5zaW9ucy5yYW5rcyk7XG4gICAgICAgICAgLy8gd2Ugd2FudCB0byBrZWVwIHRoZSByYXRpbyB0aGF0IGlzIG9uIHRoZSBib2FyZFxuICAgICAgICAgIHJhdGlvID0gW2hlaWdodEJhc2UgKiBzdGF0ZS5zcXVhcmVSYXRpb1swXSwgaGVpZ2h0QmFzZSAqIHN0YXRlLnNxdWFyZVJhdGlvWzFdXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWwgPSByZW5kZXJFbGxpcHNlKG9yaWcsIHJhdGlvLCAhIWN1cnJlbnQpO1xuICAgIH1cbiAgICBpZiAoZWwpIHtcbiAgICAgIGNvbnN0IGcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSwge1xuICAgICAgICBjbGFzczogc2hhcGVDbGFzcyhzaGFwZS5icnVzaCwgISFjdXJyZW50LCBmYWxzZSksXG4gICAgICAgIHNnSGFzaDogaGFzaCxcbiAgICAgIH0pO1xuICAgICAgZy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICBjb25zdCBkZXNjRWwgPSBzaGFwZS5kZXNjcmlwdGlvbiAmJiByZW5kZXJEZXNjcmlwdGlvbihzdGF0ZSwgc2hhcGUsIGFycm93RGVzdHMpO1xuICAgICAgaWYgKGRlc2NFbCkgZy5hcHBlbmRDaGlsZChkZXNjRWwpO1xuICAgICAgcmV0dXJuIGc7XG4gICAgfSBlbHNlIHJldHVybjtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJDdXN0b21TdmcoXG4gIGJydXNoOiBzdHJpbmcsXG4gIGN1c3RvbVN2Zzogc3RyaW5nLFxuICBwb3M6IHNnLlBvcyxcbiAgcmF0aW86IHNnLk51bWJlclBhaXIsXG4pOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgW3gsIHldID0gcG9zO1xuXG4gIC8vIFRyYW5zbGF0ZSB0byB0b3AtbGVmdCBvZiBgb3JpZ2Agc3F1YXJlXG4gIGNvbnN0IGcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSwgeyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt4fSwke3l9KWAgfSk7XG5cbiAgY29uc3Qgc3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdzdmcnKSwge1xuICAgIGNsYXNzOiBicnVzaCxcbiAgICB3aWR0aDogcmF0aW9bMF0sXG4gICAgaGVpZ2h0OiByYXRpb1sxXSxcbiAgICB2aWV3Qm94OiBgMCAwICR7cmF0aW9bMF0gKiAxMH0gJHtyYXRpb1sxXSAqIDEwfWAsXG4gIH0pO1xuXG4gIGcuYXBwZW5kQ2hpbGQoc3ZnKTtcbiAgc3ZnLmlubmVySFRNTCA9IGN1c3RvbVN2ZztcblxuICByZXR1cm4gZztcbn1cblxuZnVuY3Rpb24gcmVuZGVyRWxsaXBzZShwb3M6IHNnLlBvcywgcmF0aW86IHNnLk51bWJlclBhaXIsIGN1cnJlbnQ6IGJvb2xlYW4pOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbyA9IHBvcyxcbiAgICB3aWR0aHMgPSBlbGxpcHNlV2lkdGgocmF0aW8pO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdlbGxpcHNlJyksIHtcbiAgICAnc3Ryb2tlLXdpZHRoJzogd2lkdGhzW2N1cnJlbnQgPyAwIDogMV0sXG4gICAgZmlsbDogJ25vbmUnLFxuICAgIGN4OiBvWzBdLFxuICAgIGN5OiBvWzFdLFxuICAgIHJ4OiByYXRpb1swXSAvIDIgLSB3aWR0aHNbMV0gLyAyLFxuICAgIHJ5OiByYXRpb1sxXSAvIDIgLSB3aWR0aHNbMV0gLyAyLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQXJyb3coXG4gIGJydXNoOiBzdHJpbmcsXG4gIG9yaWc6IHNnLlBvcyxcbiAgZGVzdDogc2cuUG9zLFxuICByYXRpbzogc2cuTnVtYmVyUGFpcixcbiAgY3VycmVudDogYm9vbGVhbixcbiAgc2hvcnRlbjogYm9vbGVhbixcbik6IFNWR0VsZW1lbnQge1xuICBjb25zdCBtID0gYXJyb3dNYXJnaW4oc2hvcnRlbiAmJiAhY3VycmVudCwgcmF0aW8pLFxuICAgIGEgPSBvcmlnLFxuICAgIGIgPSBkZXN0LFxuICAgIGR4ID0gYlswXSAtIGFbMF0sXG4gICAgZHkgPSBiWzFdIC0gYVsxXSxcbiAgICBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KSxcbiAgICB4byA9IE1hdGguY29zKGFuZ2xlKSAqIG0sXG4gICAgeW8gPSBNYXRoLnNpbihhbmdsZSkgKiBtO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdsaW5lJyksIHtcbiAgICAnc3Ryb2tlLXdpZHRoJzogbGluZVdpZHRoKGN1cnJlbnQsIHJhdGlvKSxcbiAgICAnc3Ryb2tlLWxpbmVjYXAnOiAncm91bmQnLFxuICAgICdtYXJrZXItZW5kJzogJ3VybCgjYXJyb3doZWFkLScgKyAoYnJ1c2ggfHwgJ3ByaW1hcnknKSArICcpJyxcbiAgICB4MTogYVswXSxcbiAgICB5MTogYVsxXSxcbiAgICB4MjogYlswXSAtIHhvLFxuICAgIHkyOiBiWzFdIC0geW8sXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyUGllY2Uoc3RhdGU6IFN0YXRlLCB7IHNoYXBlIH06IFNoYXBlKTogc2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKCFzaGFwZS5waWVjZSB8fCBpc1BpZWNlKHNoYXBlLm9yaWcpKSByZXR1cm47XG5cbiAgY29uc3Qgb3JpZyA9IHNoYXBlLm9yaWcsXG4gICAgc2NhbGUgPSAoc2hhcGUucGllY2Uuc2NhbGUgfHwgMSkgKiAoc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSk7XG5cbiAgY29uc3QgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHNoYXBlLnBpZWNlKSkgYXMgc2cuUGllY2VOb2RlO1xuICBwaWVjZUVsLnNnS2V5ID0gb3JpZztcbiAgcGllY2VFbC5zZ1NjYWxlID0gc2NhbGU7XG4gIHRyYW5zbGF0ZVJlbChcbiAgICBwaWVjZUVsLFxuICAgIHBvc1RvVHJhbnNsYXRlUmVsKHN0YXRlLmRpbWVuc2lvbnMpKGtleTJwb3Mob3JpZyksIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSksXG4gICAgc3RhdGUuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSxcbiAgICBzY2FsZSxcbiAgKTtcblxuICByZXR1cm4gcGllY2VFbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyRGVzY3JpcHRpb24oXG4gIHN0YXRlOiBTdGF0ZSxcbiAgc2hhcGU6IERyYXdTaGFwZSxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyxcbik6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQge1xuICBjb25zdCBvcmlnID0gcGllY2VPcktleVRvUG9zKHNoYXBlLm9yaWcsIHN0YXRlKTtcbiAgaWYgKCFvcmlnIHx8ICFzaGFwZS5kZXNjcmlwdGlvbikgcmV0dXJuO1xuICBjb25zdCBkZXN0ID0gIXNhbWVQaWVjZU9yS2V5KHNoYXBlLm9yaWcsIHNoYXBlLmRlc3QpICYmIHBpZWNlT3JLZXlUb1BvcyhzaGFwZS5kZXN0LCBzdGF0ZSksXG4gICAgZGlmZiA9IGRlc3QgPyBbZGVzdFswXSAtIG9yaWdbMF0sIGRlc3RbMV0gLSBvcmlnWzFdXSA6IFswLCAwXSxcbiAgICBvZmZzZXQgPVxuICAgICAgKGFycm93RGVzdHMuZ2V0KGlzUGllY2Uoc2hhcGUuZGVzdCkgPyBwaWVjZU5hbWVPZihzaGFwZS5kZXN0KSA6IHNoYXBlLmRlc3QpIHx8IDApID4gMVxuICAgICAgICA/IDAuM1xuICAgICAgICA6IDAuMTUsXG4gICAgY2xvc2UgPVxuICAgICAgKGRpZmZbMF0gPT09IDAgfHwgTWF0aC5hYnMoZGlmZlswXSkgPT09IHN0YXRlLnNxdWFyZVJhdGlvWzBdKSAmJlxuICAgICAgKGRpZmZbMV0gPT09IDAgfHwgTWF0aC5hYnMoZGlmZlsxXSkgPT09IHN0YXRlLnNxdWFyZVJhdGlvWzFdKSxcbiAgICByYXRpbyA9IGRlc3QgPyAwLjU1IC0gKGNsb3NlID8gb2Zmc2V0IDogMCkgOiAwLFxuICAgIG1pZDogc2cuUG9zID0gW29yaWdbMF0gKyBkaWZmWzBdICogcmF0aW8sIG9yaWdbMV0gKyBkaWZmWzFdICogcmF0aW9dLFxuICAgIHRleHRMZW5ndGggPSBzaGFwZS5kZXNjcmlwdGlvbi5sZW5ndGg7XG4gIGNvbnN0IGcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSwgeyBjbGFzczogJ2Rlc2NyaXB0aW9uJyB9KSxcbiAgICBjaXJjbGUgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ2VsbGlwc2UnKSwge1xuICAgICAgY3g6IG1pZFswXSxcbiAgICAgIGN5OiBtaWRbMV0sXG4gICAgICByeDogdGV4dExlbmd0aCArIDEuNSxcbiAgICAgIHJ5OiAyLjUsXG4gICAgfSksXG4gICAgdGV4dCA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHRWxlbWVudCgndGV4dCcpLCB7XG4gICAgICB4OiBtaWRbMF0sXG4gICAgICB5OiBtaWRbMV0sXG4gICAgICAndGV4dC1hbmNob3InOiAnbWlkZGxlJyxcbiAgICAgICdkb21pbmFudC1iYXNlbGluZSc6ICdjZW50cmFsJyxcbiAgICB9KTtcbiAgZy5hcHBlbmRDaGlsZChjaXJjbGUpO1xuICB0ZXh0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHNoYXBlLmRlc2NyaXB0aW9uKSk7XG4gIGcuYXBwZW5kQ2hpbGQodGV4dCk7XG4gIHJldHVybiBnO1xufVxuXG5mdW5jdGlvbiByZW5kZXJNYXJrZXIoYnJ1c2g6IHN0cmluZyk6IFNWR0VsZW1lbnQge1xuICBjb25zdCBtYXJrZXIgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ21hcmtlcicpLCB7XG4gICAgaWQ6ICdhcnJvd2hlYWQtJyArIGJydXNoLFxuICAgIG9yaWVudDogJ2F1dG8nLFxuICAgIG1hcmtlcldpZHRoOiA0LFxuICAgIG1hcmtlckhlaWdodDogOCxcbiAgICByZWZYOiAyLjA1LFxuICAgIHJlZlk6IDIuMDEsXG4gIH0pO1xuICBtYXJrZXIuYXBwZW5kQ2hpbGQoXG4gICAgc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdwYXRoJyksIHtcbiAgICAgIGQ6ICdNMCwwIFY0IEwzLDIgWicsXG4gICAgfSksXG4gICk7XG4gIG1hcmtlci5zZXRBdHRyaWJ1dGUoJ3NnS2V5JywgYnJ1c2gpO1xuICByZXR1cm4gbWFya2VyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhlbDogU1ZHRWxlbWVudCwgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4pOiBTVkdFbGVtZW50IHtcbiAgZm9yIChjb25zdCBrZXkgaW4gYXR0cnMpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGF0dHJzLCBrZXkpKSBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb3MydXNlcihcbiAgcG9zOiBzZy5Qb3MsXG4gIGNvbG9yOiBzZy5Db2xvcixcbiAgZGltczogc2cuRGltZW5zaW9ucyxcbiAgcmF0aW86IHNnLk51bWJlclBhaXIsXG4pOiBzZy5OdW1iZXJQYWlyIHtcbiAgcmV0dXJuIGNvbG9yID09PSAnc2VudGUnXG4gICAgPyBbKGRpbXMuZmlsZXMgLSAxIC0gcG9zWzBdKSAqIHJhdGlvWzBdLCBwb3NbMV0gKiByYXRpb1sxXV1cbiAgICA6IFtwb3NbMF0gKiByYXRpb1swXSwgKGRpbXMucmFua3MgLSAxIC0gcG9zWzFdKSAqIHJhdGlvWzFdXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGllY2UoeDogc2cuS2V5IHwgc2cuUGllY2UpOiB4IGlzIHNnLlBpZWNlIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhbWVQaWVjZU9yS2V5KGtwMTogc2cuS2V5IHwgc2cuUGllY2UsIGtwMjogc2cuS2V5IHwgc2cuUGllY2UpOiBib29sZWFuIHtcbiAgcmV0dXJuIChpc1BpZWNlKGtwMSkgJiYgaXNQaWVjZShrcDIpICYmIHNhbWVQaWVjZShrcDEsIGtwMikpIHx8IGtwMSA9PT0ga3AyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlc0JvdW5kcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogYm9vbGVhbiB7XG4gIHJldHVybiBzaGFwZXMuc29tZSgocykgPT4gaXNQaWVjZShzLm9yaWcpIHx8IGlzUGllY2Uocy5kZXN0KSk7XG59XG5cbmZ1bmN0aW9uIHNoYXBlQ2xhc3MoYnJ1c2g6IHN0cmluZywgY3VycmVudDogYm9vbGVhbiwgb3V0c2lkZTogYm9vbGVhbik6IHN0cmluZyB7XG4gIHJldHVybiBicnVzaCArIChjdXJyZW50ID8gJyBjdXJyZW50JyA6ICcnKSArIChvdXRzaWRlID8gJyBvdXRzaWRlJyA6ICcnKTtcbn1cblxuZnVuY3Rpb24gcmF0aW9BdmVyYWdlKHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogbnVtYmVyIHtcbiAgcmV0dXJuIChyYXRpb1swXSArIHJhdGlvWzFdKSAvIDI7XG59XG5cbmZ1bmN0aW9uIGVsbGlwc2VXaWR0aChyYXRpbzogc2cuTnVtYmVyUGFpcik6IFtudW1iZXIsIG51bWJlcl0ge1xuICByZXR1cm4gWygzIC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKSwgKDQgLyA2NCkgKiByYXRpb0F2ZXJhZ2UocmF0aW8pXTtcbn1cblxuZnVuY3Rpb24gbGluZVdpZHRoKGN1cnJlbnQ6IGJvb2xlYW4sIHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogbnVtYmVyIHtcbiAgcmV0dXJuICgoY3VycmVudCA/IDguNSA6IDEwKSAvIDY0KSAqIHJhdGlvQXZlcmFnZShyYXRpbyk7XG59XG5cbmZ1bmN0aW9uIGFycm93TWFyZ2luKHNob3J0ZW46IGJvb2xlYW4sIHJhdGlvOiBzZy5OdW1iZXJQYWlyKTogbnVtYmVyIHtcbiAgcmV0dXJuICgoc2hvcnRlbiA/IDIwIDogMTApIC8gNjQpICogcmF0aW9BdmVyYWdlKHJhdGlvKTtcbn1cblxuZnVuY3Rpb24gcGllY2VPcktleVRvUG9zKGtwOiBzZy5LZXkgfCBzZy5QaWVjZSwgc3RhdGU6IFN0YXRlKTogc2cuUG9zIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGlzUGllY2Uoa3ApKSB7XG4gICAgY29uc3QgcGllY2VCb3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkuZ2V0KHBpZWNlTmFtZU9mKGtwKSksXG4gICAgICBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpLFxuICAgICAgb2Zmc2V0ID0gc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pID8gWzAuNSwgLTAuNV0gOiBbLTAuNSwgMC41XSxcbiAgICAgIHBvcyA9XG4gICAgICAgIHBpZWNlQm91bmRzICYmXG4gICAgICAgIGJvdW5kcyAmJlxuICAgICAgICBwb3NPZk91dHNpZGVFbChcbiAgICAgICAgICBwaWVjZUJvdW5kcy5sZWZ0ICsgcGllY2VCb3VuZHMud2lkdGggLyAyLFxuICAgICAgICAgIHBpZWNlQm91bmRzLnRvcCArIHBpZWNlQm91bmRzLmhlaWdodCAvIDIsXG4gICAgICAgICAgc2VudGVQb3Yoc3RhdGUub3JpZW50YXRpb24pLFxuICAgICAgICAgIHN0YXRlLmRpbWVuc2lvbnMsXG4gICAgICAgICAgYm91bmRzLFxuICAgICAgICApO1xuICAgIHJldHVybiAoXG4gICAgICBwb3MgJiZcbiAgICAgIHBvczJ1c2VyKFxuICAgICAgICBbcG9zWzBdICsgb2Zmc2V0WzBdLCBwb3NbMV0gKyBvZmZzZXRbMV1dLFxuICAgICAgICBzdGF0ZS5vcmllbnRhdGlvbixcbiAgICAgICAgc3RhdGUuZGltZW5zaW9ucyxcbiAgICAgICAgc3RhdGUuc3F1YXJlUmF0aW8sXG4gICAgICApXG4gICAgKTtcbiAgfSBlbHNlIHJldHVybiBwb3MydXNlcihrZXkycG9zKGtwKSwgc3RhdGUub3JpZW50YXRpb24sIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLnNxdWFyZVJhdGlvKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHNnIGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgdW5zZWxlY3QsIGNhbmNlbE1vdmVPckRyb3AgfSBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7XG4gIGV2ZW50UG9zaXRpb24sXG4gIGlzUmlnaHRCdXR0b24sXG4gIHBvc09mT3V0c2lkZUVsLFxuICBzYW1lUGllY2UsXG4gIGdldEhhbmRQaWVjZUF0RG9tUG9zLFxuICBnZXRLZXlBdERvbVBvcyxcbiAgc2VudGVQb3YsXG59IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBpc1BpZWNlLCBwb3MydXNlciwgc2FtZVBpZWNlT3JLZXksIHNldEF0dHJpYnV0ZXMgfSBmcm9tICcuL3NoYXBlcy5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd1NoYXBlIHtcbiAgb3JpZzogc2cuS2V5IHwgc2cuUGllY2U7XG4gIGRlc3Q6IHNnLktleSB8IHNnLlBpZWNlO1xuICBwaWVjZT86IERyYXdTaGFwZVBpZWNlO1xuICBjdXN0b21Tdmc/OiBzdHJpbmc7IC8vIHN2Z1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgYnJ1c2g6IHN0cmluZzsgLy8gY3NzIGNsYXNzIHRvIGJlIGFwcGVuZGVkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3F1YXJlSGlnaGxpZ2h0IHtcbiAga2V5OiBzZy5LZXk7XG4gIGNsYXNzTmFtZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdTaGFwZVBpZWNlIHtcbiAgcm9sZTogc2cuUm9sZVN0cmluZztcbiAgY29sb3I6IHNnLkNvbG9yO1xuICBzY2FsZT86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3YWJsZSB7XG4gIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGNhbiBkcmF3XG4gIHZpc2libGU6IGJvb2xlYW47IC8vIGNhbiB2aWV3XG4gIGZvcmNlZDogYm9vbGVhbjsgLy8gY2FuIG9ubHkgZHJhd1xuICBlcmFzZU9uQ2xpY2s6IGJvb2xlYW47XG4gIG9uQ2hhbmdlPzogKHNoYXBlczogRHJhd1NoYXBlW10pID0+IHZvaWQ7XG4gIHNoYXBlczogRHJhd1NoYXBlW107IC8vIHVzZXIgc2hhcGVzXG4gIGF1dG9TaGFwZXM6IERyYXdTaGFwZVtdOyAvLyBjb21wdXRlciBzaGFwZXNcbiAgc3F1YXJlczogU3F1YXJlSGlnaGxpZ2h0W107XG4gIGN1cnJlbnQ/OiBEcmF3Q3VycmVudDtcbiAgcHJldlN2Z0hhc2g6IHN0cmluZztcbiAgcGllY2U/OiBzZy5QaWVjZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3Q3VycmVudCB7XG4gIG9yaWc6IHNnLktleSB8IHNnLlBpZWNlO1xuICBkZXN0Pzogc2cuS2V5IHwgc2cuUGllY2U7IC8vIHVuZGVmaW5lZCBpZiBvdXRzaWRlIGJvYXJkL2hhbmRzXG4gIGFycm93PzogU1ZHRWxlbWVudDtcbiAgcGllY2U/OiBzZy5QaWVjZTtcbiAgcG9zOiBzZy5OdW1iZXJQYWlyO1xuICBicnVzaDogc3RyaW5nOyAvLyBicnVzaCBuYW1lIGZvciBzaGFwZVxufVxuXG5jb25zdCBicnVzaGVzID0gWydwcmltYXJ5JywgJ2FsdGVybmF0aXZlMCcsICdhbHRlcm5hdGl2ZTEnLCAnYWx0ZXJuYXRpdmUyJ107XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzdGF0ZTogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSkgcmV0dXJuO1xuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgaWYgKGUuY3RybEtleSkgdW5zZWxlY3Qoc3RhdGUpO1xuICBlbHNlIGNhbmNlbE1vdmVPckRyb3Aoc3RhdGUpO1xuXG4gIGNvbnN0IHBvcyA9IGV2ZW50UG9zaXRpb24oZSksXG4gICAgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKSxcbiAgICBvcmlnID1cbiAgICAgIHBvcyAmJiBib3VuZHMgJiYgZ2V0S2V5QXREb21Qb3MocG9zLCBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksIHN0YXRlLmRpbWVuc2lvbnMsIGJvdW5kcyksXG4gICAgcGllY2UgPSBzdGF0ZS5kcmF3YWJsZS5waWVjZTtcbiAgaWYgKCFvcmlnKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZyxcbiAgICBkZXN0OiB1bmRlZmluZWQsXG4gICAgcG9zLFxuICAgIHBpZWNlLFxuICAgIGJydXNoOiBldmVudEJydXNoKGUsIGlzUmlnaHRCdXR0b24oZSkgfHwgc3RhdGUuZHJhd2FibGUuZm9yY2VkKSxcbiAgfTtcbiAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRGcm9tSGFuZChzdGF0ZTogU3RhdGUsIHBpZWNlOiBzZy5QaWVjZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcblxuICBpZiAoZS5jdHJsS2V5KSB1bnNlbGVjdChzdGF0ZSk7XG4gIGVsc2UgY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG5cbiAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKTtcbiAgaWYgKCFwb3MpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHtcbiAgICBvcmlnOiBwaWVjZSxcbiAgICBkZXN0OiB1bmRlZmluZWQsXG4gICAgcG9zLFxuICAgIGJydXNoOiBldmVudEJydXNoKGUsIGlzUmlnaHRCdXR0b24oZSkgfHwgc3RhdGUuZHJhd2FibGUuZm9yY2VkKSxcbiAgfTtcbiAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRHJhdyhzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50LFxuICAgICAgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcy5ib2FyZC5ib3VuZHMoKTtcbiAgICBpZiAoY3VyICYmIGJvdW5kcykge1xuICAgICAgY29uc3QgZGVzdCA9XG4gICAgICAgIGdldEtleUF0RG9tUG9zKGN1ci5wb3MsIHNlbnRlUG92KHN0YXRlLm9yaWVudGF0aW9uKSwgc3RhdGUuZGltZW5zaW9ucywgYm91bmRzKSB8fFxuICAgICAgICBnZXRIYW5kUGllY2VBdERvbVBvcyhjdXIucG9zLCBzdGF0ZS5oYW5kcy5yb2xlcywgc3RhdGUuZG9tLmJvdW5kcy5oYW5kcy5waWVjZUJvdW5kcygpKTtcbiAgICAgIGlmIChjdXIuZGVzdCAhPT0gZGVzdCAmJiAhKGN1ci5kZXN0ICYmIGRlc3QgJiYgc2FtZVBpZWNlT3JLZXkoZGVzdCwgY3VyLmRlc3QpKSkge1xuICAgICAgICBjdXIuZGVzdCA9IGRlc3Q7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG91dFBvcyA9IHBvc09mT3V0c2lkZUVsKFxuICAgICAgICBjdXIucG9zWzBdLFxuICAgICAgICBjdXIucG9zWzFdLFxuICAgICAgICBzZW50ZVBvdihzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgICAgIHN0YXRlLmRpbWVuc2lvbnMsXG4gICAgICAgIGJvdW5kcyxcbiAgICAgICk7XG4gICAgICBpZiAoIWN1ci5kZXN0ICYmIGN1ci5hcnJvdyAmJiBvdXRQb3MpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IHBvczJ1c2VyKG91dFBvcywgc3RhdGUub3JpZW50YXRpb24sIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLnNxdWFyZVJhdGlvKTtcblxuICAgICAgICBzZXRBdHRyaWJ1dGVzKGN1ci5hcnJvdywge1xuICAgICAgICAgIHgyOiBkZXN0WzBdIC0gc3RhdGUuc3F1YXJlUmF0aW9bMF0gLyAyLFxuICAgICAgICAgIHkyOiBkZXN0WzFdIC0gc3RhdGUuc3F1YXJlUmF0aW9bMV0gLyAyLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHByb2Nlc3NEcmF3KHN0YXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzdGF0ZTogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQpIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQucG9zID0gZXZlbnRQb3NpdGlvbihlKSE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoc3RhdGU6IFN0YXRlLCBfOiBzZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gIGlmIChjdXIpIHtcbiAgICBhZGRTaGFwZShzdGF0ZS5kcmF3YWJsZSwgY3VyKTtcbiAgICBjYW5jZWwoc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBkcmF3YWJsZUxlbmd0aCA9IHN0YXRlLmRyYXdhYmxlLnNoYXBlcy5sZW5ndGg7XG4gIGlmIChkcmF3YWJsZUxlbmd0aCB8fCBzdGF0ZS5kcmF3YWJsZS5waWVjZSkge1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICAgIHN0YXRlLmRyYXdhYmxlLnBpZWNlID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICBpZiAoZHJhd2FibGVMZW5ndGgpIG9uQ2hhbmdlKHN0YXRlLmRyYXdhYmxlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RHJhd1BpZWNlKHN0YXRlOiBTdGF0ZSwgcGllY2U6IHNnLlBpZWNlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5waWVjZSAmJiBzYW1lUGllY2Uoc3RhdGUuZHJhd2FibGUucGllY2UsIHBpZWNlKSlcbiAgICBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHVuZGVmaW5lZDtcbiAgZWxzZSBzdGF0ZS5kcmF3YWJsZS5waWVjZSA9IHBpZWNlO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG59XG5cbmZ1bmN0aW9uIGV2ZW50QnJ1c2goZTogc2cuTW91Y2hFdmVudCwgYWxsb3dGaXJzdE1vZGlmaWVyOiBib29sZWFuKTogc3RyaW5nIHtcbiAgY29uc3QgbW9kQSA9IGFsbG93Rmlyc3RNb2RpZmllciAmJiAoZS5zaGlmdEtleSB8fCBlLmN0cmxLZXkpLFxuICAgIG1vZEIgPSBlLmFsdEtleSB8fCBlLm1ldGFLZXkgfHwgZS5nZXRNb2RpZmllclN0YXRlPy4oJ0FsdEdyYXBoJyk7XG4gIHJldHVybiBicnVzaGVzWyhtb2RBID8gMSA6IDApICsgKG1vZEIgPyAyIDogMCldO1xufVxuXG5mdW5jdGlvbiBhZGRTaGFwZShkcmF3YWJsZTogRHJhd2FibGUsIGN1cjogRHJhd0N1cnJlbnQpOiB2b2lkIHtcbiAgaWYgKCFjdXIuZGVzdCkgcmV0dXJuO1xuXG4gIGNvbnN0IHNpbWlsYXJTaGFwZSA9IChzOiBEcmF3U2hhcGUpID0+XG4gICAgY3VyLmRlc3QgJiYgc2FtZVBpZWNlT3JLZXkoY3VyLm9yaWcsIHMub3JpZykgJiYgc2FtZVBpZWNlT3JLZXkoY3VyLmRlc3QsIHMuZGVzdCk7XG5cbiAgLy8gc2VwYXJhdGUgc2hhcGUgZm9yIHBpZWNlc1xuICBjb25zdCBwaWVjZSA9IGN1ci5waWVjZTtcbiAgY3VyLnBpZWNlID0gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHNpbWlsYXIgPSBkcmF3YWJsZS5zaGFwZXMuZmluZChzaW1pbGFyU2hhcGUpLFxuICAgIHJlbW92ZVBpZWNlID0gZHJhd2FibGUuc2hhcGVzLmZpbmQoXG4gICAgICAocykgPT4gc2ltaWxhclNoYXBlKHMpICYmIHBpZWNlICYmIHMucGllY2UgJiYgc2FtZVBpZWNlKHBpZWNlLCBzLnBpZWNlKSxcbiAgICApLFxuICAgIGRpZmZQaWVjZSA9IGRyYXdhYmxlLnNoYXBlcy5maW5kKFxuICAgICAgKHMpID0+IHNpbWlsYXJTaGFwZShzKSAmJiBwaWVjZSAmJiBzLnBpZWNlICYmICFzYW1lUGllY2UocGllY2UsIHMucGllY2UpLFxuICAgICk7XG5cbiAgLy8gcmVtb3ZlIGV2ZXJ5IHNpbWlsYXIgc2hhcGVcbiAgaWYgKHNpbWlsYXIpIGRyYXdhYmxlLnNoYXBlcyA9IGRyYXdhYmxlLnNoYXBlcy5maWx0ZXIoKHMpID0+ICFzaW1pbGFyU2hhcGUocykpO1xuXG4gIGlmICghaXNQaWVjZShjdXIub3JpZykgJiYgcGllY2UgJiYgIXJlbW92ZVBpZWNlKSB7XG4gICAgZHJhd2FibGUuc2hhcGVzLnB1c2goeyBvcmlnOiBjdXIub3JpZywgZGVzdDogY3VyLm9yaWcsIHBpZWNlOiBwaWVjZSwgYnJ1c2g6IGN1ci5icnVzaCB9KTtcbiAgICAvLyBmb3JjZSBjaXJjbGUgYXJvdW5kIGRyYXduIHBpZWNlc1xuICAgIGlmICghc2FtZVBpZWNlT3JLZXkoY3VyLm9yaWcsIGN1ci5kZXN0KSlcbiAgICAgIGRyYXdhYmxlLnNoYXBlcy5wdXNoKHsgb3JpZzogY3VyLm9yaWcsIGRlc3Q6IGN1ci5vcmlnLCBicnVzaDogY3VyLmJydXNoIH0pO1xuICB9XG5cbiAgaWYgKCFzaW1pbGFyIHx8IGRpZmZQaWVjZSB8fCBzaW1pbGFyLmJydXNoICE9PSBjdXIuYnJ1c2gpIGRyYXdhYmxlLnNoYXBlcy5wdXNoKGN1ciBhcyBEcmF3U2hhcGUpO1xuICBvbkNoYW5nZShkcmF3YWJsZSk7XG59XG5cbmZ1bmN0aW9uIG9uQ2hhbmdlKGRyYXdhYmxlOiBEcmF3YWJsZSk6IHZvaWQge1xuICBpZiAoZHJhd2FibGUub25DaGFuZ2UpIGRyYXdhYmxlLm9uQ2hhbmdlKGRyYXdhYmxlLnNoYXBlcyk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHsgYWRkVG9IYW5kLCByZW1vdmVGcm9tSGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHsgY2xlYXIgYXMgZHJhd0NsZWFyIH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB7IGFuaW0gfSBmcm9tICcuL2FuaW0uanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYWdDdXJyZW50IHtcbiAgcGllY2U6IHNnLlBpZWNlOyAvLyBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gIHBvczogc2cuTnVtYmVyUGFpcjsgLy8gbGF0ZXN0IGV2ZW50IHBvc2l0aW9uXG4gIG9yaWdQb3M6IHNnLk51bWJlclBhaXI7IC8vIGZpcnN0IGV2ZW50IHBvc2l0aW9uXG4gIHN0YXJ0ZWQ6IGJvb2xlYW47IC8vIHdoZXRoZXIgdGhlIGRyYWcgaGFzIHN0YXJ0ZWQ7IGFzIHBlciB0aGUgZGlzdGFuY2Ugc2V0dGluZ1xuICBzcGFyZTogYm9vbGVhbjsgLy8gd2hldGhlciB0aGlzIHBpZWNlIGlzIGEgc3BhcmUgb25lXG4gIHRvdWNoOiBib29sZWFuOyAvLyB3YXMgdGhlIGRyYWdnaW5nIGluaXRpYXRlZCBmcm9tIHRvdWNoIGV2ZW50XG4gIG9yaWdpblRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsO1xuICBmcm9tQm9hcmQ/OiB7XG4gICAgb3JpZzogc2cuS2V5OyAvLyBvcmlnIGtleSBvZiBkcmFnZ2luZyBwaWVjZVxuICAgIHByZXZpb3VzbHlTZWxlY3RlZD86IHNnLktleTsgLy8gc2VsZWN0ZWQgcGllY2UgYmVmb3JlIGRyYWcgYmVnYW5cbiAgICBrZXlIYXNDaGFuZ2VkOiBib29sZWFuOyAvLyB3aGV0aGVyIHRoZSBkcmFnIGhhcyBsZWZ0IHRoZSBvcmlnIGtleSBvciBwaWVjZVxuICB9O1xuICBmcm9tT3V0c2lkZT86IHtcbiAgICBvcmlnaW5Cb3VuZHM6IERPTVJlY3QgfCB1bmRlZmluZWQ7IC8vIGJvdW5kcyBvZiB0aGUgcGllY2UgdGhhdCBpbml0aWF0ZWQgdGhlIGRyYWdcbiAgICBsZWZ0T3JpZ2luOiBib29sZWFuOyAvLyBoYXZlIHdlIGV2ZXIgbGVmdCBvcmlnaW5Cb3VuZHNcbiAgICBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZT86IHNnLlBpZWNlO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgYm91bmRzID0gcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpLFxuICAgIHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpLFxuICAgIG9yaWcgPVxuICAgICAgYm91bmRzICYmXG4gICAgICBwb3NpdGlvbiAmJlxuICAgICAgdXRpbC5nZXRLZXlBdERvbVBvcyhwb3NpdGlvbiwgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSwgcy5kaW1lbnNpb25zLCBib3VuZHMpO1xuXG4gIGlmICghb3JpZykgcmV0dXJuO1xuXG4gIGNvbnN0IHBpZWNlID0gcy5waWVjZXMuZ2V0KG9yaWcpLFxuICAgIHByZXZpb3VzbHlTZWxlY3RlZCA9IHMuc2VsZWN0ZWQ7XG4gIGlmIChcbiAgICAhcHJldmlvdXNseVNlbGVjdGVkICYmXG4gICAgcy5kcmF3YWJsZS5lbmFibGVkICYmXG4gICAgKHMuZHJhd2FibGUuZXJhc2VPbkNsaWNrIHx8ICFwaWVjZSB8fCBwaWVjZS5jb2xvciAhPT0gcy50dXJuQ29sb3IpXG4gIClcbiAgICBkcmF3Q2xlYXIocyk7XG5cbiAgLy8gUHJldmVudCB0b3VjaCBzY3JvbGwgYW5kIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50LCBpZiB0aGVyZVxuICAvLyBpcyBhbiBpbnRlbnQgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgYm9hcmQuXG4gIGlmIChcbiAgICBlLmNhbmNlbGFibGUgIT09IGZhbHNlICYmXG4gICAgKCFlLnRvdWNoZXMgfHxcbiAgICAgIHMuYmxvY2tUb3VjaFNjcm9sbCB8fFxuICAgICAgcy5zZWxlY3RlZFBpZWNlIHx8XG4gICAgICBwaWVjZSB8fFxuICAgICAgcHJldmlvdXNseVNlbGVjdGVkIHx8XG4gICAgICBwaWVjZUNsb3NlVG8ocywgcG9zaXRpb24sIGJvdW5kcykpXG4gIClcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnN0IGhhZFByZW1vdmUgPSAhIXMucHJlbW92YWJsZS5jdXJyZW50O1xuICBjb25zdCBoYWRQcmVkcm9wID0gISFzLnByZWRyb3BwYWJsZS5jdXJyZW50O1xuICBpZiAocy5zZWxlY3RhYmxlLmRlbGV0ZU9uVG91Y2gpIGJvYXJkLmRlbGV0ZVBpZWNlKHMsIG9yaWcpO1xuICBlbHNlIGlmIChzLnNlbGVjdGVkKSB7XG4gICAgaWYgKCFib2FyZC5wcm9tb3Rpb25EaWFsb2dNb3ZlKHMsIHMuc2VsZWN0ZWQsIG9yaWcpKSB7XG4gICAgICBpZiAoYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBvcmlnKSkgYW5pbSgoc3RhdGUpID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgICAgZWxzZSBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHMuc2VsZWN0ZWRQaWVjZSkge1xuICAgIGlmICghYm9hcmQucHJvbW90aW9uRGlhbG9nRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIG9yaWcpKSB7XG4gICAgICBpZiAoYm9hcmQuY2FuRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIG9yaWcpKVxuICAgICAgICBhbmltKChzdGF0ZSkgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBvcmlnKSwgcyk7XG4gICAgICBlbHNlIGJvYXJkLnNlbGVjdFNxdWFyZShzLCBvcmlnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYm9hcmQuc2VsZWN0U3F1YXJlKHMsIG9yaWcpO1xuICB9XG5cbiAgY29uc3Qgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWQgPT09IG9yaWcsXG4gICAgZHJhZ2dlZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LmRyYWdnZWQ7XG5cbiAgaWYgKHBpZWNlICYmIGRyYWdnZWRFbCAmJiBzdGlsbFNlbGVjdGVkICYmIGJvYXJkLmlzRHJhZ2dhYmxlKHMsIHBpZWNlKSkge1xuICAgIGNvbnN0IHRvdWNoID0gZS50eXBlID09PSAndG91Y2hzdGFydCc7XG5cbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgICAgcGllY2UsXG4gICAgICBwb3M6IHBvc2l0aW9uLFxuICAgICAgb3JpZ1BvczogcG9zaXRpb24sXG4gICAgICBzdGFydGVkOiBzLmRyYWdnYWJsZS5hdXRvRGlzdGFuY2UgJiYgIXRvdWNoLFxuICAgICAgc3BhcmU6IGZhbHNlLFxuICAgICAgdG91Y2gsXG4gICAgICBvcmlnaW5UYXJnZXQ6IGUudGFyZ2V0LFxuICAgICAgZnJvbUJvYXJkOiB7XG4gICAgICAgIG9yaWcsXG4gICAgICAgIHByZXZpb3VzbHlTZWxlY3RlZCxcbiAgICAgICAga2V5SGFzQ2hhbmdlZDogZmFsc2UsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBkcmFnZ2VkRWwuc2dDb2xvciA9IHBpZWNlLmNvbG9yO1xuICAgIGRyYWdnZWRFbC5zZ1JvbGUgPSBwaWVjZS5yb2xlO1xuICAgIGRyYWdnZWRFbC5jbGFzc05hbWUgPSBgZHJhZ2dpbmcgJHt1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKX1gO1xuICAgIGRyYWdnZWRFbC5jbGFzc0xpc3QudG9nZ2xlKCd0b3VjaCcsIHRvdWNoKTtcblxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9IGVsc2Uge1xuICAgIGlmIChoYWRQcmVtb3ZlKSBib2FyZC51bnNldFByZW1vdmUocyk7XG4gICAgaWYgKGhhZFByZWRyb3ApIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgfVxuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZnVuY3Rpb24gcGllY2VDbG9zZVRvKHM6IFN0YXRlLCBwb3M6IHNnLk51bWJlclBhaXIsIGJvdW5kczogRE9NUmVjdCk6IGJvb2xlYW4ge1xuICBjb25zdCBhc1NlbnRlID0gdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSxcbiAgICByYWRpdXNTcSA9IE1hdGgucG93KGJvdW5kcy53aWR0aCAvIHMuZGltZW5zaW9ucy5maWxlcywgMik7XG4gIGZvciAoY29uc3Qga2V5IG9mIHMucGllY2VzLmtleXMoKSkge1xuICAgIGNvbnN0IGNlbnRlciA9IHV0aWwuY29tcHV0ZVNxdWFyZUNlbnRlcihrZXksIGFzU2VudGUsIHMuZGltZW5zaW9ucywgYm91bmRzKTtcbiAgICBpZiAodXRpbC5kaXN0YW5jZVNxKGNlbnRlciwgcG9zKSA8PSByYWRpdXNTcSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhZ05ld1BpZWNlKHM6IFN0YXRlLCBwaWVjZTogc2cuUGllY2UsIGU6IHNnLk1vdWNoRXZlbnQsIHNwYXJlPzogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBwcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSA9IHMuc2VsZWN0ZWRQaWVjZSxcbiAgICBkcmFnZ2VkRWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZD8uZHJhZ2dlZCxcbiAgICBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSxcbiAgICB0b3VjaCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuXG4gIGlmICghcHJldmlvdXNseVNlbGVjdGVkUGllY2UgJiYgIXNwYXJlICYmIHMuZHJhd2FibGUuZW5hYmxlZCAmJiBzLmRyYXdhYmxlLmVyYXNlT25DbGljaylcbiAgICBkcmF3Q2xlYXIocyk7XG5cbiAgaWYgKCFzcGFyZSAmJiBzLnNlbGVjdGFibGUuZGVsZXRlT25Ub3VjaCkgcmVtb3ZlRnJvbUhhbmQocywgcGllY2UpO1xuICBlbHNlIGJvYXJkLnNlbGVjdFBpZWNlKHMsIHBpZWNlLCBzcGFyZSk7XG5cbiAgY29uc3QgaGFkUHJlbW92ZSA9ICEhcy5wcmVtb3ZhYmxlLmN1cnJlbnQsXG4gICAgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudCxcbiAgICBzdGlsbFNlbGVjdGVkID0gcy5zZWxlY3RlZFBpZWNlICYmIHV0aWwuc2FtZVBpZWNlKHMuc2VsZWN0ZWRQaWVjZSwgcGllY2UpO1xuXG4gIGlmIChkcmFnZ2VkRWwgJiYgcG9zaXRpb24gJiYgcy5zZWxlY3RlZFBpZWNlICYmIHN0aWxsU2VsZWN0ZWQgJiYgYm9hcmQuaXNEcmFnZ2FibGUocywgcGllY2UpKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgIHBpZWNlOiBzLnNlbGVjdGVkUGllY2UsXG4gICAgICBwb3M6IHBvc2l0aW9uLFxuICAgICAgb3JpZ1BvczogcG9zaXRpb24sXG4gICAgICB0b3VjaCxcbiAgICAgIHN0YXJ0ZWQ6IHMuZHJhZ2dhYmxlLmF1dG9EaXN0YW5jZSAmJiAhdG91Y2gsXG4gICAgICBzcGFyZTogISFzcGFyZSxcbiAgICAgIG9yaWdpblRhcmdldDogZS50YXJnZXQsXG4gICAgICBmcm9tT3V0c2lkZToge1xuICAgICAgICBvcmlnaW5Cb3VuZHM6ICFzcGFyZVxuICAgICAgICAgID8gcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkuZ2V0KHV0aWwucGllY2VOYW1lT2YocGllY2UpKVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICBsZWZ0T3JpZ2luOiBmYWxzZSxcbiAgICAgICAgcHJldmlvdXNseVNlbGVjdGVkUGllY2U6ICFzcGFyZSA/IHByZXZpb3VzbHlTZWxlY3RlZFBpZWNlIDogdW5kZWZpbmVkLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgZHJhZ2dlZEVsLnNnQ29sb3IgPSBwaWVjZS5jb2xvcjtcbiAgICBkcmFnZ2VkRWwuc2dSb2xlID0gcGllY2Uucm9sZTtcbiAgICBkcmFnZ2VkRWwuY2xhc3NOYW1lID0gYGRyYWdnaW5nICR7dXRpbC5waWVjZU5hbWVPZihwaWVjZSl9YDtcbiAgICBkcmFnZ2VkRWwuY2xhc3NMaXN0LnRvZ2dsZSgndG91Y2gnLCB0b3VjaCk7XG5cbiAgICBwcm9jZXNzRHJhZyhzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaGFkUHJlbW92ZSkgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICAgIGlmIChoYWRQcmVkcm9wKSBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NEcmFnKHM6IFN0YXRlKTogdm9pZCB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgY29uc3QgY3VyID0gcy5kcmFnZ2FibGUuY3VycmVudCxcbiAgICAgIGRyYWdnZWRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkPy5kcmFnZ2VkLFxuICAgICAgYm91bmRzID0gcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpO1xuICAgIGlmICghY3VyIHx8ICFkcmFnZ2VkRWwgfHwgIWJvdW5kcykgcmV0dXJuO1xuICAgIC8vIGNhbmNlbCBhbmltYXRpb25zIHdoaWxlIGRyYWdnaW5nXG4gICAgaWYgKGN1ci5mcm9tQm9hcmQ/Lm9yaWcgJiYgcy5hbmltYXRpb24uY3VycmVudD8ucGxhbi5hbmltcy5oYXMoY3VyLmZyb21Cb2FyZC5vcmlnKSlcbiAgICAgIHMuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgLy8gaWYgbW92aW5nIHBpZWNlIGlzIGdvbmUsIGNhbmNlbFxuICAgIGNvbnN0IG9yaWdQaWVjZSA9IGN1ci5mcm9tQm9hcmQgPyBzLnBpZWNlcy5nZXQoY3VyLmZyb21Cb2FyZC5vcmlnKSA6IGN1ci5waWVjZTtcbiAgICBpZiAoIW9yaWdQaWVjZSB8fCAhdXRpbC5zYW1lUGllY2Uob3JpZ1BpZWNlLCBjdXIucGllY2UpKSBjYW5jZWwocyk7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoXG4gICAgICAgICFjdXIuc3RhcnRlZCAmJlxuICAgICAgICB1dGlsLmRpc3RhbmNlU3EoY3VyLnBvcywgY3VyLm9yaWdQb3MpID49IE1hdGgucG93KHMuZHJhZ2dhYmxlLmRpc3RhbmNlLCAyKVxuICAgICAgKSB7XG4gICAgICAgIGN1ci5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgcy5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICBpZiAoY3VyLnN0YXJ0ZWQpIHtcbiAgICAgICAgdXRpbC50cmFuc2xhdGVBYnMoXG4gICAgICAgICAgZHJhZ2dlZEVsLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIGN1ci5wb3NbMF0gLSBib3VuZHMubGVmdCAtIGJvdW5kcy53aWR0aCAvIChzLmRpbWVuc2lvbnMuZmlsZXMgKiAyKSxcbiAgICAgICAgICAgIGN1ci5wb3NbMV0gLSBib3VuZHMudG9wIC0gYm91bmRzLmhlaWdodCAvIChzLmRpbWVuc2lvbnMucmFua3MgKiAyKSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHMuc2NhbGVEb3duUGllY2VzID8gMC41IDogMSxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoIWRyYWdnZWRFbC5zZ0RyYWdnaW5nKSB7XG4gICAgICAgICAgZHJhZ2dlZEVsLnNnRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgIHV0aWwuc2V0RGlzcGxheShkcmFnZ2VkRWwsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhvdmVyID0gdXRpbC5nZXRLZXlBdERvbVBvcyhcbiAgICAgICAgICBjdXIucG9zLFxuICAgICAgICAgIHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgICAgICAgcy5kaW1lbnNpb25zLFxuICAgICAgICAgIGJvdW5kcyxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoY3VyLmZyb21Cb2FyZClcbiAgICAgICAgICBjdXIuZnJvbUJvYXJkLmtleUhhc0NoYW5nZWQgPSBjdXIuZnJvbUJvYXJkLmtleUhhc0NoYW5nZWQgfHwgY3VyLmZyb21Cb2FyZC5vcmlnICE9PSBob3ZlcjtcbiAgICAgICAgZWxzZSBpZiAoY3VyLmZyb21PdXRzaWRlKVxuICAgICAgICAgIGN1ci5mcm9tT3V0c2lkZS5sZWZ0T3JpZ2luID1cbiAgICAgICAgICAgIGN1ci5mcm9tT3V0c2lkZS5sZWZ0T3JpZ2luIHx8XG4gICAgICAgICAgICAoISFjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzICYmXG4gICAgICAgICAgICAgICF1dGlsLmlzSW5zaWRlUmVjdChjdXIuZnJvbU91dHNpZGUub3JpZ2luQm91bmRzLCBjdXIucG9zKSk7XG5cbiAgICAgICAgLy8gaWYgdGhlIGhvdmVyZWQgc3F1YXJlIGNoYW5nZWRcbiAgICAgICAgaWYgKGhvdmVyICE9PSBzLmhvdmVyZWQpIHtcbiAgICAgICAgICB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzLCBob3Zlcik7XG4gICAgICAgICAgaWYgKGN1ci50b3VjaCAmJiBzLmRvbS5lbGVtZW50cy5ib2FyZD8uc3F1YXJlT3Zlcikge1xuICAgICAgICAgICAgaWYgKGhvdmVyICYmIHMuZHJhZ2dhYmxlLnNob3dUb3VjaFNxdWFyZU92ZXJsYXkpIHtcbiAgICAgICAgICAgICAgdXRpbC50cmFuc2xhdGVBYnMoXG4gICAgICAgICAgICAgICAgcy5kb20uZWxlbWVudHMuYm9hcmQuc3F1YXJlT3ZlcixcbiAgICAgICAgICAgICAgICB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKHMuZGltZW5zaW9ucywgYm91bmRzKShcbiAgICAgICAgICAgICAgICAgIHV0aWwua2V5MnBvcyhob3ZlciksXG4gICAgICAgICAgICAgICAgICB1dGlsLnNlbnRlUG92KHMub3JpZW50YXRpb24pLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgdXRpbC5zZXREaXNwbGF5KHMuZG9tLmVsZW1lbnRzLmJvYXJkLnNxdWFyZU92ZXIsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdXRpbC5zZXREaXNwbGF5KHMuZG9tLmVsZW1lbnRzLmJvYXJkLnNxdWFyZU92ZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzOiBTdGF0ZSwgZTogc2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCAmJiAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoIDwgMikpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50LnBvcyA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSE7XG4gIH0gZWxzZSBpZiAoXG4gICAgKHMuc2VsZWN0ZWQgfHwgcy5zZWxlY3RlZFBpZWNlIHx8IHMuaGlnaGxpZ2h0LmhvdmVyZWQpICYmXG4gICAgIXMuZHJhZ2dhYmxlLmN1cnJlbnQgJiZcbiAgICAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoIDwgMilcbiAgKSB7XG4gICAgY29uc3QgYm91bmRzID0gcy5kb20uYm91bmRzLmJvYXJkLmJvdW5kcygpLFxuICAgICAgaG92ZXIgPVxuICAgICAgICBib3VuZHMgJiZcbiAgICAgICAgdXRpbC5nZXRLZXlBdERvbVBvcyhcbiAgICAgICAgICB1dGlsLmV2ZW50UG9zaXRpb24oZSkhLFxuICAgICAgICAgIHV0aWwuc2VudGVQb3Yocy5vcmllbnRhdGlvbiksXG4gICAgICAgICAgcy5kaW1lbnNpb25zLFxuICAgICAgICAgIGJvdW5kcyxcbiAgICAgICAgKTtcbiAgICBpZiAoaG92ZXIgIT09IHMuaG92ZXJlZCkgdXBkYXRlSG92ZXJlZFNxdWFyZXMocywgaG92ZXIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gcy5kcmFnZ2FibGUuY3VycmVudDtcbiAgaWYgKCFjdXIpIHJldHVybjtcbiAgLy8gY3JlYXRlIG5vIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnRcbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gIC8vIGNvbXBhcmluZyB3aXRoIHRoZSBvcmlnaW4gdGFyZ2V0IGlzIGFuIGVhc3kgd2F5IHRvIHRlc3QgdGhhdCB0aGUgZW5kIGV2ZW50XG4gIC8vIGhhcyB0aGUgc2FtZSB0b3VjaCBvcmlnaW5cbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBjdXIub3JpZ2luVGFyZ2V0ICE9PSBlLnRhcmdldCAmJiAhY3VyLmZyb21PdXRzaWRlKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBpZiAocy5ob3ZlcmVkICYmICFzLmhpZ2hsaWdodC5ob3ZlcmVkKSB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzLCB1bmRlZmluZWQpO1xuICAgIHJldHVybjtcbiAgfVxuICBib2FyZC51bnNldFByZW1vdmUocyk7XG4gIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uOyBzbyB1c2UgdGhlIGxhc3QgdG91Y2htb3ZlIHBvc2l0aW9uIGluc3RlYWRcbiAgY29uc3QgZXZlbnRQb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgfHwgY3VyLnBvcyxcbiAgICBib3VuZHMgPSBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzKCksXG4gICAgZGVzdCA9XG4gICAgICBib3VuZHMgJiYgdXRpbC5nZXRLZXlBdERvbVBvcyhldmVudFBvcywgdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSwgcy5kaW1lbnNpb25zLCBib3VuZHMpO1xuXG4gIGlmIChkZXN0ICYmIGN1ci5zdGFydGVkICYmIGN1ci5mcm9tQm9hcmQ/Lm9yaWcgIT09IGRlc3QpIHtcbiAgICBpZiAoY3VyLmZyb21PdXRzaWRlICYmICFib2FyZC5wcm9tb3Rpb25EaWFsb2dEcm9wKHMsIGN1ci5waWVjZSwgZGVzdCkpXG4gICAgICBib2FyZC51c2VyRHJvcChzLCBjdXIucGllY2UsIGRlc3QpO1xuICAgIGVsc2UgaWYgKGN1ci5mcm9tQm9hcmQgJiYgIWJvYXJkLnByb21vdGlvbkRpYWxvZ01vdmUocywgY3VyLmZyb21Cb2FyZC5vcmlnLCBkZXN0KSlcbiAgICAgIGJvYXJkLnVzZXJNb3ZlKHMsIGN1ci5mcm9tQm9hcmQub3JpZywgZGVzdCk7XG4gIH0gZWxzZSBpZiAocy5kcmFnZ2FibGUuZGVsZXRlT25Ecm9wT2ZmICYmICFkZXN0KSB7XG4gICAgaWYgKGN1ci5mcm9tQm9hcmQpIHMucGllY2VzLmRlbGV0ZShjdXIuZnJvbUJvYXJkLm9yaWcpO1xuICAgIGVsc2UgaWYgKGN1ci5mcm9tT3V0c2lkZSAmJiAhY3VyLnNwYXJlKSByZW1vdmVGcm9tSGFuZChzLCBjdXIucGllY2UpO1xuXG4gICAgaWYgKHMuZHJhZ2dhYmxlLmFkZFRvSGFuZE9uRHJvcE9mZikge1xuICAgICAgY29uc3QgaGFuZEJvdW5kcyA9IHMuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMoKSxcbiAgICAgICAgaGFuZEJvdW5kc1RvcCA9IGhhbmRCb3VuZHMuZ2V0KCd0b3AnKSxcbiAgICAgICAgaGFuZEJvdW5kc0JvdHRvbSA9IGhhbmRCb3VuZHMuZ2V0KCdib3R0b20nKTtcbiAgICAgIGlmIChoYW5kQm91bmRzVG9wICYmIHV0aWwuaXNJbnNpZGVSZWN0KGhhbmRCb3VuZHNUb3AsIGN1ci5wb3MpKVxuICAgICAgICBhZGRUb0hhbmQocywgeyBjb2xvcjogdXRpbC5vcHBvc2l0ZShzLm9yaWVudGF0aW9uKSwgcm9sZTogY3VyLnBpZWNlLnJvbGUgfSk7XG4gICAgICBlbHNlIGlmIChoYW5kQm91bmRzQm90dG9tICYmIHV0aWwuaXNJbnNpZGVSZWN0KGhhbmRCb3VuZHNCb3R0b20sIGN1ci5wb3MpKVxuICAgICAgICBhZGRUb0hhbmQocywgeyBjb2xvcjogcy5vcmllbnRhdGlvbiwgcm9sZTogY3VyLnBpZWNlLnJvbGUgfSk7XG5cbiAgICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIH1cbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgfVxuXG4gIGlmIChcbiAgICBjdXIuZnJvbUJvYXJkICYmXG4gICAgKGN1ci5mcm9tQm9hcmQub3JpZyA9PT0gY3VyLmZyb21Cb2FyZC5wcmV2aW91c2x5U2VsZWN0ZWQgfHwgY3VyLmZyb21Cb2FyZC5rZXlIYXNDaGFuZ2VkKSAmJlxuICAgIChjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGRlc3QgfHwgIWRlc3QpXG4gICkge1xuICAgIHVuc2VsZWN0KHMsIGN1ciwgZGVzdCk7XG4gIH0gZWxzZSBpZiAoXG4gICAgKCFkZXN0ICYmIGN1ci5mcm9tT3V0c2lkZT8ubGVmdE9yaWdpbikgfHxcbiAgICAoY3VyLmZyb21PdXRzaWRlPy5vcmlnaW5Cb3VuZHMgJiZcbiAgICAgIHV0aWwuaXNJbnNpZGVSZWN0KGN1ci5mcm9tT3V0c2lkZS5vcmlnaW5Cb3VuZHMsIGN1ci5wb3MpICYmXG4gICAgICBjdXIuZnJvbU91dHNpZGUucHJldmlvdXNseVNlbGVjdGVkUGllY2UgJiZcbiAgICAgIHV0aWwuc2FtZVBpZWNlKGN1ci5mcm9tT3V0c2lkZS5wcmV2aW91c2x5U2VsZWN0ZWRQaWVjZSwgY3VyLnBpZWNlKSlcbiAgKSB7XG4gICAgdW5zZWxlY3QocywgY3VyLCBkZXN0KTtcbiAgfSBlbHNlIGlmICghcy5zZWxlY3RhYmxlLmVuYWJsZWQgJiYgIXMucHJvbW90aW9uLmN1cnJlbnQpIHtcbiAgICB1bnNlbGVjdChzLCBjdXIsIGRlc3QpO1xuICB9XG5cbiAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgaWYgKCFzLmhpZ2hsaWdodC5ob3ZlcmVkICYmICFzLnByb21vdGlvbi5jdXJyZW50KSBzLmhvdmVyZWQgPSB1bmRlZmluZWQ7XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5mdW5jdGlvbiB1bnNlbGVjdChzOiBTdGF0ZSwgY3VyOiBEcmFnQ3VycmVudCwgZGVzdD86IHNnLktleSk6IHZvaWQge1xuICBpZiAoY3VyLmZyb21Cb2FyZCAmJiBjdXIuZnJvbUJvYXJkLm9yaWcgPT09IGRlc3QpXG4gICAgdXRpbC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLnVuc2VsZWN0LCBjdXIuZnJvbUJvYXJkLm9yaWcpO1xuICBlbHNlIGlmIChcbiAgICBjdXIuZnJvbU91dHNpZGU/Lm9yaWdpbkJvdW5kcyAmJlxuICAgIHV0aWwuaXNJbnNpZGVSZWN0KGN1ci5mcm9tT3V0c2lkZS5vcmlnaW5Cb3VuZHMsIGN1ci5wb3MpXG4gIClcbiAgICB1dGlsLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMucGllY2VVbnNlbGVjdCwgY3VyLnBpZWNlKTtcbiAgYm9hcmQudW5zZWxlY3Qocyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoczogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmICghcy5oaWdobGlnaHQuaG92ZXJlZCkgcy5ob3ZlcmVkID0gdW5kZWZpbmVkO1xuICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIHMuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbi8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5IG9yIGxlZnQgY2xpY2tcbmV4cG9ydCBmdW5jdGlvbiB1bndhbnRlZEV2ZW50KGU6IHNnLk1vdWNoRXZlbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAhZS5pc1RydXN0ZWQgfHxcbiAgICAoZS5idXR0b24gIT09IHVuZGVmaW5lZCAmJiBlLmJ1dHRvbiAhPT0gMCkgfHxcbiAgICAoISFlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpXG4gICk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkRGVzdFRvSG92ZXIoczogU3RhdGUsIGtleTogc2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgKCEhcy5zZWxlY3RlZCAmJiAoYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBrZXkpIHx8IGJvYXJkLmNhblByZW1vdmUocywgcy5zZWxlY3RlZCwga2V5KSkpIHx8XG4gICAgKCEhcy5zZWxlY3RlZFBpZWNlICYmXG4gICAgICAoYm9hcmQuY2FuRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGtleSkgfHwgYm9hcmQuY2FuUHJlZHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGtleSkpKVxuICApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVIb3ZlcmVkU3F1YXJlcyhzOiBTdGF0ZSwga2V5OiBzZy5LZXkgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgY29uc3Qgc3FhdXJlRWxzID0gcy5kb20uZWxlbWVudHMuYm9hcmQ/LnNxdWFyZXMuY2hpbGRyZW47XG4gIGlmICghc3FhdXJlRWxzIHx8IHMucHJvbW90aW9uLmN1cnJlbnQpIHJldHVybjtcblxuICBjb25zdCBwcmV2SG92ZXIgPSBzLmhvdmVyZWQ7XG4gIGlmIChzLmhpZ2hsaWdodC5ob3ZlcmVkIHx8IChrZXkgJiYgdmFsaWREZXN0VG9Ib3ZlcihzLCBrZXkpKSkgcy5ob3ZlcmVkID0ga2V5O1xuICBlbHNlIHMuaG92ZXJlZCA9IHVuZGVmaW5lZDtcblxuICBjb25zdCBhc1NlbnRlID0gdXRpbC5zZW50ZVBvdihzLm9yaWVudGF0aW9uKSxcbiAgICBjdXJJbmRleCA9IHMuaG92ZXJlZCAmJiB1dGlsLmRvbVNxdWFyZUluZGV4T2ZLZXkocy5ob3ZlcmVkLCBhc1NlbnRlLCBzLmRpbWVuc2lvbnMpLFxuICAgIGN1ckhvdmVyRWwgPSBjdXJJbmRleCAhPT0gdW5kZWZpbmVkICYmIHNxYXVyZUVsc1tjdXJJbmRleF07XG4gIGlmIChjdXJIb3ZlckVsKSBjdXJIb3ZlckVsLmNsYXNzTGlzdC5hZGQoJ2hvdmVyJyk7XG5cbiAgY29uc3QgcHJldkluZGV4ID0gcHJldkhvdmVyICYmIHV0aWwuZG9tU3F1YXJlSW5kZXhPZktleShwcmV2SG92ZXIsIGFzU2VudGUsIHMuZGltZW5zaW9ucyksXG4gICAgcHJldkhvdmVyRWwgPSBwcmV2SW5kZXggIT09IHVuZGVmaW5lZCAmJiBzcWF1cmVFbHNbcHJldkluZGV4XTtcbiAgaWYgKHByZXZIb3ZlckVsKSBwcmV2SG92ZXJFbC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgTm90YXRpb24gfSBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvb3Jkcyhub3RhdGlvbjogTm90YXRpb24pOiBzdHJpbmdbXSB7XG4gIHN3aXRjaCAobm90YXRpb24pIHtcbiAgICBjYXNlICdkaXpoaSc6XG4gICAgICByZXR1cm4gW1xuICAgICAgICAnJyxcbiAgICAgICAgJycsXG4gICAgICAgICcnLFxuICAgICAgICAnJyxcbiAgICAgICAgJ+S6pScsXG4gICAgICAgICfmiIwnLFxuICAgICAgICAn6YWJJyxcbiAgICAgICAgJ+eUsycsXG4gICAgICAgICfmnKonLFxuICAgICAgICAn5Y2IJyxcbiAgICAgICAgJ+W3sycsXG4gICAgICAgICfovrAnLFxuICAgICAgICAn5Y2vJyxcbiAgICAgICAgJ+WvhScsXG4gICAgICAgICfkuJEnLFxuICAgICAgICAn5a2QJyxcbiAgICAgIF07XG4gICAgY2FzZSAnamFwYW5lc2UnOlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgJ+WNgeWFrScsXG4gICAgICAgICfljYHkupQnLFxuICAgICAgICAn5Y2B5ZubJyxcbiAgICAgICAgJ+WNgeS4iScsXG4gICAgICAgICfljYHkuownLFxuICAgICAgICAn5Y2B5LiAJyxcbiAgICAgICAgJ+WNgScsXG4gICAgICAgICfkuZ0nLFxuICAgICAgICAn5YWrJyxcbiAgICAgICAgJ+S4gycsXG4gICAgICAgICflha0nLFxuICAgICAgICAn5LqUJyxcbiAgICAgICAgJ+WbmycsXG4gICAgICAgICfkuIknLFxuICAgICAgICAn5LqMJyxcbiAgICAgICAgJ+S4gCcsXG4gICAgICBdO1xuICAgIGNhc2UgJ2VuZ2luZSc6XG4gICAgICByZXR1cm4gWydwJywgJ28nLCAnbicsICdtJywgJ2wnLCAnaycsICdqJywgJ2knLCAnaCcsICdnJywgJ2YnLCAnZScsICdkJywgJ2MnLCAnYicsICdhJ107XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldHVybiBbJzEwJywgJ2YnLCAnZScsICdkJywgJ2MnLCAnYicsICdhJywgJzknLCAnOCcsICc3JywgJzYnLCAnNScsICc0JywgJzMnLCAnMicsICcxJ107XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBbXG4gICAgICAgICcxNicsXG4gICAgICAgICcxNScsXG4gICAgICAgICcxNCcsXG4gICAgICAgICcxMycsXG4gICAgICAgICcxMicsXG4gICAgICAgICcxMScsXG4gICAgICAgICcxMCcsXG4gICAgICAgICc5JyxcbiAgICAgICAgJzgnLFxuICAgICAgICAnNycsXG4gICAgICAgICc2JyxcbiAgICAgICAgJzUnLFxuICAgICAgICAnNCcsXG4gICAgICAgICczJyxcbiAgICAgICAgJzInLFxuICAgICAgICAnMScsXG4gICAgICBdO1xuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUge1xuICBEaW1lbnNpb25zLFxuICBTcXVhcmVOb2RlLFxuICBDb2xvcixcbiAgUGllY2VOb2RlLFxuICBSb2xlU3RyaW5nLFxuICBIYW5kRWxlbWVudHMsXG4gIEJvYXJkRWxlbWVudHMsXG59IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgY29sb3JzIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgY3JlYXRlRWwsIG9wcG9zaXRlLCBwaWVjZU5hbWVPZiwgcG9zMmtleSwgc2V0RGlzcGxheSB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVTVkdFbGVtZW50LCBzZXRBdHRyaWJ1dGVzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuaW1wb3J0IHsgY29vcmRzIH0gZnJvbSAnLi9jb29yZHMuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gd3JhcEJvYXJkKGJvYXJkV3JhcDogSFRNTEVsZW1lbnQsIHM6IFN0YXRlKTogQm9hcmRFbGVtZW50cyB7XG4gIC8vIC5zZy13cmFwIChlbGVtZW50IHBhc3NlZCB0byBTaG9naWdyb3VuZClcbiAgLy8gICAgIHNnLWhhbmQtd3JhcFxuICAvLyAgICAgc2ctYm9hcmRcbiAgLy8gICAgICAgc2ctc3F1YXJlc1xuICAvLyAgICAgICBzZy1waWVjZXNcbiAgLy8gICAgICAgcGllY2UgZHJhZ2dpbmdcbiAgLy8gICAgICAgc2ctcHJvbW90aW9uXG4gIC8vICAgICAgIHNnLXNxdWFyZS1vdmVyXG4gIC8vICAgICAgIHN2Zy5zZy1zaGFwZXNcbiAgLy8gICAgICAgICBkZWZzXG4gIC8vICAgICAgICAgZ1xuICAvLyAgICAgICBzdmcuc2ctY3VzdG9tLXN2Z3NcbiAgLy8gICAgICAgICBnXG4gIC8vICAgICBzZy1oYW5kLXdyYXBcbiAgLy8gICAgIHNnLWZyZWUtcGllY2VzXG4gIC8vICAgICAgIGNvb3Jkcy5yYW5rc1xuICAvLyAgICAgICBjb29yZHMuZmlsZXNcblxuICBjb25zdCBib2FyZCA9IGNyZWF0ZUVsKCdzZy1ib2FyZCcpO1xuXG4gIGNvbnN0IHNxdWFyZXMgPSByZW5kZXJTcXVhcmVzKHMuZGltZW5zaW9ucywgcy5vcmllbnRhdGlvbik7XG4gIGJvYXJkLmFwcGVuZENoaWxkKHNxdWFyZXMpO1xuXG4gIGNvbnN0IHBpZWNlcyA9IGNyZWF0ZUVsKCdzZy1waWVjZXMnKTtcbiAgYm9hcmQuYXBwZW5kQ2hpbGQocGllY2VzKTtcblxuICBsZXQgZHJhZ2dlZCwgcHJvbW90aW9uLCBzcXVhcmVPdmVyO1xuICBpZiAoIXMudmlld09ubHkpIHtcbiAgICBkcmFnZ2VkID0gY3JlYXRlRWwoJ3BpZWNlJykgYXMgUGllY2VOb2RlO1xuICAgIHNldERpc3BsYXkoZHJhZ2dlZCwgZmFsc2UpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGRyYWdnZWQpO1xuXG4gICAgcHJvbW90aW9uID0gY3JlYXRlRWwoJ3NnLXByb21vdGlvbicpO1xuICAgIHNldERpc3BsYXkocHJvbW90aW9uLCBmYWxzZSk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQocHJvbW90aW9uKTtcblxuICAgIHNxdWFyZU92ZXIgPSBjcmVhdGVFbCgnc2ctc3F1YXJlLW92ZXInKTtcbiAgICBzZXREaXNwbGF5KHNxdWFyZU92ZXIsIGZhbHNlKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChzcXVhcmVPdmVyKTtcbiAgfVxuXG4gIGxldCBzaGFwZXM7XG4gIGlmIChzLmRyYXdhYmxlLnZpc2libGUpIHtcbiAgICBjb25zdCBzdmcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZVNWR0VsZW1lbnQoJ3N2ZycpLCB7XG4gICAgICBjbGFzczogJ3NnLXNoYXBlcycsXG4gICAgICB2aWV3Qm94OiBgLSR7cy5zcXVhcmVSYXRpb1swXSAvIDJ9IC0ke3Muc3F1YXJlUmF0aW9bMV0gLyAyfSAke3MuZGltZW5zaW9ucy5maWxlcyAqIHMuc3F1YXJlUmF0aW9bMF19ICR7XG4gICAgICAgIHMuZGltZW5zaW9ucy5yYW5rcyAqIHMuc3F1YXJlUmF0aW9bMV1cbiAgICAgIH1gLFxuICAgIH0pO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkdFbGVtZW50KCdkZWZzJykpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkdFbGVtZW50KCdnJykpO1xuXG4gICAgY29uc3QgY3VzdG9tU3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkdFbGVtZW50KCdzdmcnKSwge1xuICAgICAgY2xhc3M6ICdzZy1jdXN0b20tc3ZncycsXG4gICAgICB2aWV3Qm94OiBgMCAwICR7cy5kaW1lbnNpb25zLmZpbGVzICogcy5zcXVhcmVSYXRpb1swXX0gJHtzLmRpbWVuc2lvbnMucmFua3MgKiBzLnNxdWFyZVJhdGlvWzFdfWAsXG4gICAgfSk7XG4gICAgY3VzdG9tU3ZnLmFwcGVuZENoaWxkKGNyZWF0ZVNWR0VsZW1lbnQoJ2cnKSk7XG5cbiAgICBjb25zdCBmcmVlUGllY2VzID0gY3JlYXRlRWwoJ3NnLWZyZWUtcGllY2VzJyk7XG5cbiAgICBib2FyZC5hcHBlbmRDaGlsZChzdmcpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKGN1c3RvbVN2Zyk7XG4gICAgYm9hcmQuYXBwZW5kQ2hpbGQoZnJlZVBpZWNlcyk7XG5cbiAgICBzaGFwZXMgPSB7XG4gICAgICBzdmcsXG4gICAgICBmcmVlUGllY2VzLFxuICAgICAgY3VzdG9tU3ZnLFxuICAgIH07XG4gIH1cblxuICBpZiAocy5jb29yZGluYXRlcy5lbmFibGVkKSB7XG4gICAgY29uc3Qgb3JpZW50Q2xhc3MgPSBzLm9yaWVudGF0aW9uID09PSAnZ290ZScgPyAnIGdvdGUnIDogJycsXG4gICAgICByYW5rcyA9IGNvb3JkcyhzLmNvb3JkaW5hdGVzLnJhbmtzKSxcbiAgICAgIGZpbGVzID0gY29vcmRzKHMuY29vcmRpbmF0ZXMuZmlsZXMpO1xuICAgIGJvYXJkLmFwcGVuZENoaWxkKHJlbmRlckNvb3JkcyhyYW5rcywgJ3JhbmtzJyArIG9yaWVudENsYXNzLCBzLmRpbWVuc2lvbnMucmFua3MpKTtcbiAgICBib2FyZC5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMoZmlsZXMsICdmaWxlcycgKyBvcmllbnRDbGFzcywgcy5kaW1lbnNpb25zLmZpbGVzKSk7XG4gIH1cblxuICBib2FyZFdyYXAuaW5uZXJIVE1MID0gJyc7XG5cbiAgY29uc3QgZGltQ2xzID0gYGQtJHtzLmRpbWVuc2lvbnMuZmlsZXN9eCR7cy5kaW1lbnNpb25zLnJhbmtzfWA7XG5cbiAgLy8gcmVtb3ZlIGFsbCBvdGhlciBkaW1lbnNpb24gY2xhc3Nlc1xuICBib2FyZFdyYXAuY2xhc3NMaXN0LmZvckVhY2goKGMpID0+IHtcbiAgICBpZiAoYy5zdWJzdHJpbmcoMCwgMikgPT09ICdkLScgJiYgYyAhPT0gZGltQ2xzKSBib2FyZFdyYXAuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgfSk7XG5cbiAgLy8gZW5zdXJlIHRoZSBzZy13cmFwIGNsYXNzIGFuZCBkaW1lbnNpb25zIGNsYXNzIGlzIHNldCBiZWZvcmVoYW5kIHRvIGF2b2lkIHJlY29tcHV0aW5nIHN0eWxlc1xuICBib2FyZFdyYXAuY2xhc3NMaXN0LmFkZCgnc2ctd3JhcCcsIGRpbUNscyk7XG5cbiAgZm9yIChjb25zdCBjIG9mIGNvbG9ycykgYm9hcmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ29yaWVudGF0aW9uLScgKyBjLCBzLm9yaWVudGF0aW9uID09PSBjKTtcbiAgYm9hcmRXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ21hbmlwdWxhYmxlJywgIXMudmlld09ubHkpO1xuXG4gIGJvYXJkV3JhcC5hcHBlbmRDaGlsZChib2FyZCk7XG5cbiAgbGV0IGhhbmRzOiBIYW5kRWxlbWVudHMgfCB1bmRlZmluZWQ7XG4gIGlmIChzLmhhbmRzLmlubGluZWQpIHtcbiAgICBjb25zdCBoYW5kV3JhcFRvcCA9IGNyZWF0ZUVsKCdzZy1oYW5kLXdyYXAnLCAnaW5saW5lZCcpLFxuICAgICAgaGFuZFdyYXBCb3R0b20gPSBjcmVhdGVFbCgnc2ctaGFuZC13cmFwJywgJ2lubGluZWQnKTtcbiAgICBib2FyZFdyYXAuaW5zZXJ0QmVmb3JlKGhhbmRXcmFwQm90dG9tLCBib2FyZC5uZXh0RWxlbWVudFNpYmxpbmcpO1xuICAgIGJvYXJkV3JhcC5pbnNlcnRCZWZvcmUoaGFuZFdyYXBUb3AsIGJvYXJkKTtcbiAgICBoYW5kcyA9IHtcbiAgICAgIHRvcDogaGFuZFdyYXBUb3AsXG4gICAgICBib3R0b206IGhhbmRXcmFwQm90dG9tLFxuICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJvYXJkLFxuICAgIHNxdWFyZXMsXG4gICAgcGllY2VzLFxuICAgIHByb21vdGlvbixcbiAgICBzcXVhcmVPdmVyLFxuICAgIGRyYWdnZWQsXG4gICAgc2hhcGVzLFxuICAgIGhhbmRzLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcEhhbmQoaGFuZFdyYXA6IEhUTUxFbGVtZW50LCBwb3M6ICd0b3AnIHwgJ2JvdHRvbScsIHM6IFN0YXRlKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBoYW5kID0gcmVuZGVySGFuZChwb3MgPT09ICd0b3AnID8gb3Bwb3NpdGUocy5vcmllbnRhdGlvbikgOiBzLm9yaWVudGF0aW9uLCBzLmhhbmRzLnJvbGVzKTtcbiAgaGFuZFdyYXAuaW5uZXJIVE1MID0gJyc7XG5cbiAgY29uc3Qgcm9sZUNudENscyA9IGByLSR7cy5oYW5kcy5yb2xlcy5sZW5ndGh9YDtcblxuICAvLyByZW1vdmUgYWxsIG90aGVyIHJvbGUgY291bnQgY2xhc3Nlc1xuICBoYW5kV3JhcC5jbGFzc0xpc3QuZm9yRWFjaCgoYykgPT4ge1xuICAgIGlmIChjLnN1YnN0cmluZygwLCAyKSA9PT0gJ3ItJyAmJiBjICE9PSByb2xlQ250Q2xzKSBoYW5kV3JhcC5jbGFzc0xpc3QucmVtb3ZlKGMpO1xuICB9KTtcblxuICAvLyBlbnN1cmUgdGhlIHNnLWhhbmQtd3JhcCBjbGFzcywgaGFuZCBwb3MgY2xhc3MgYW5kIHJvbGUgbnVtYmVyIGNsYXNzIGlzIHNldCBiZWZvcmVoYW5kIHRvIGF2b2lkIHJlY29tcHV0aW5nIHN0eWxlc1xuICBoYW5kV3JhcC5jbGFzc0xpc3QuYWRkKCdzZy1oYW5kLXdyYXAnLCBgaGFuZC0ke3Bvc31gLCByb2xlQ250Q2xzKTtcbiAgaGFuZFdyYXAuYXBwZW5kQ2hpbGQoaGFuZCk7XG5cbiAgZm9yIChjb25zdCBjIG9mIGNvbG9ycykgaGFuZFdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnb3JpZW50YXRpb24tJyArIGMsIHMub3JpZW50YXRpb24gPT09IGMpO1xuICBoYW5kV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICByZXR1cm4gaGFuZDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29vcmRzKGVsZW1zOiByZWFkb25seSBzdHJpbmdbXSwgY2xhc3NOYW1lOiBzdHJpbmcsIHRyaW06IG51bWJlcik6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgZWwgPSBjcmVhdGVFbCgnY29vcmRzJywgY2xhc3NOYW1lKTtcbiAgbGV0IGY6IEhUTUxFbGVtZW50O1xuICBmb3IgKGNvbnN0IGVsZW0gb2YgZWxlbXMuc2xpY2UoLXRyaW0pKSB7XG4gICAgZiA9IGNyZWF0ZUVsKCdjb29yZCcpO1xuICAgIGYudGV4dENvbnRlbnQgPSBlbGVtO1xuICAgIGVsLmFwcGVuZENoaWxkKGYpO1xuICB9XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyU3F1YXJlcyhkaW1zOiBEaW1lbnNpb25zLCBvcmllbnRhdGlvbjogQ29sb3IpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IHNxdWFyZXMgPSBjcmVhdGVFbCgnc2ctc3F1YXJlcycpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGltcy5yYW5rcyAqIGRpbXMuZmlsZXM7IGkrKykge1xuICAgIGNvbnN0IHNxID0gY3JlYXRlRWwoJ3NxJykgYXMgU3F1YXJlTm9kZTtcbiAgICBzcS5zZ0tleSA9XG4gICAgICBvcmllbnRhdGlvbiA9PT0gJ3NlbnRlJ1xuICAgICAgICA/IHBvczJrZXkoW2RpbXMuZmlsZXMgLSAxIC0gKGkgJSBkaW1zLmZpbGVzKSwgTWF0aC5mbG9vcihpIC8gZGltcy5maWxlcyldKVxuICAgICAgICA6IHBvczJrZXkoW2kgJSBkaW1zLmZpbGVzLCBkaW1zLnJhbmtzIC0gMSAtIE1hdGguZmxvb3IoaSAvIGRpbXMuZmlsZXMpXSk7XG4gICAgc3F1YXJlcy5hcHBlbmRDaGlsZChzcSk7XG4gIH1cblxuICByZXR1cm4gc3F1YXJlcztcbn1cblxuZnVuY3Rpb24gcmVuZGVySGFuZChjb2xvcjogQ29sb3IsIHJvbGVzOiBSb2xlU3RyaW5nW10pOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGhhbmQgPSBjcmVhdGVFbCgnc2ctaGFuZCcpO1xuICBmb3IgKGNvbnN0IHJvbGUgb2Ygcm9sZXMpIHtcbiAgICBjb25zdCBwaWVjZSA9IHsgcm9sZTogcm9sZSwgY29sb3I6IGNvbG9yIH0sXG4gICAgICB3cmFwRWwgPSBjcmVhdGVFbCgnc2ctaHAtd3JhcCcpLFxuICAgICAgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZU9mKHBpZWNlKSkgYXMgUGllY2VOb2RlO1xuICAgIHBpZWNlRWwuc2dDb2xvciA9IGNvbG9yO1xuICAgIHBpZWNlRWwuc2dSb2xlID0gcm9sZTtcbiAgICB3cmFwRWwuYXBwZW5kQ2hpbGQocGllY2VFbCk7XG4gICAgaGFuZC5hcHBlbmRDaGlsZCh3cmFwRWwpO1xuICB9XG4gIHJldHVybiBoYW5kO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyBkcmFnIGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgKiBhcyBkcmF3IGZyb20gJy4vZHJhdy5qcyc7XG5pbXBvcnQge1xuICBjYWxsVXNlckZ1bmN0aW9uLFxuICBldmVudFBvc2l0aW9uLFxuICBnZXRIYW5kUGllY2VBdERvbVBvcyxcbiAgaXNNaWRkbGVCdXR0b24sXG4gIGlzUGllY2VOb2RlLFxuICBpc1JpZ2h0QnV0dG9uLFxuICBzYW1lUGllY2UsXG59IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBhbmltIH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCB7IHVzZXJEcm9wLCB1c2VyTW92ZSwgY2FuY2VsUHJvbW90aW9uLCBzZWxlY3RTcXVhcmUgfSBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IHVzZXNCb3VuZHMgfSBmcm9tICcuL3NoYXBlcy5qcyc7XG5cbnR5cGUgTW91Y2hCaW5kID0gKGU6IHNnLk1vdWNoRXZlbnQpID0+IHZvaWQ7XG50eXBlIFN0YXRlTW91Y2hCaW5kID0gKGQ6IFN0YXRlLCBlOiBzZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xuXG5mdW5jdGlvbiBjbGVhckJvdW5kcyhzOiBTdGF0ZSk6IHZvaWQge1xuICBzLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG4gIHMuZG9tLmJvdW5kcy5oYW5kcy5ib3VuZHMuY2xlYXIoKTtcbiAgcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG59XG5cbmZ1bmN0aW9uIG9uUmVzaXplKHM6IFN0YXRlKTogKCkgPT4gdm9pZCB7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgY2xlYXJCb3VuZHMocyk7XG4gICAgaWYgKHVzZXNCb3VuZHMocy5kcmF3YWJsZS5zaGFwZXMuY29uY2F0KHMuZHJhd2FibGUuYXV0b1NoYXBlcykpKSBzLmRvbS5yZWRyYXdTaGFwZXMoKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRCb2FyZChzOiBTdGF0ZSwgYm9hcmRFbHM6IHNnLkJvYXJkRWxlbWVudHMpOiB2b2lkIHtcbiAgaWYgKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUocykpLm9ic2VydmUoYm9hcmRFbHMuYm9hcmQpO1xuXG4gIGlmIChzLnZpZXdPbmx5KSByZXR1cm47XG5cbiAgY29uc3QgcGllY2VzRWwgPSBib2FyZEVscy5waWVjZXMsXG4gICAgcHJvbW90aW9uRWwgPSBib2FyZEVscy5wcm9tb3Rpb247XG5cbiAgLy8gQ2Fubm90IGJlIHBhc3NpdmUsIGJlY2F1c2Ugd2UgcHJldmVudCB0b3VjaCBzY3JvbGxpbmcgYW5kIGRyYWdnaW5nIG9mIHNlbGVjdGVkIGVsZW1lbnRzLlxuICBjb25zdCBvblN0YXJ0ID0gc3RhcnREcmFnT3JEcmF3KHMpO1xuICBwaWVjZXNFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7XG4gICAgcGFzc2l2ZTogZmFsc2UsXG4gIH0pO1xuICBwaWVjZXNFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHtcbiAgICBwYXNzaXZlOiBmYWxzZSxcbiAgfSk7XG4gIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSB8fCBzLmRyYXdhYmxlLmVuYWJsZWQpXG4gICAgcGllY2VzRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcblxuICBpZiAocHJvbW90aW9uRWwpIHtcbiAgICBjb25zdCBwaWVjZVNlbGVjdGlvbiA9IChlOiBzZy5Nb3VjaEV2ZW50KSA9PiBwcm9tb3RlKHMsIGUpO1xuICAgIHByb21vdGlvbkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGllY2VTZWxlY3Rpb24gYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgaWYgKHMuZGlzYWJsZUNvbnRleHRNZW51KVxuICAgICAgcHJvbW90aW9uRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZEhhbmQoczogU3RhdGUsIGhhbmRFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaWYgKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUocykpLm9ic2VydmUoaGFuZEVsKTtcblxuICBpZiAocy52aWV3T25seSkgcmV0dXJuO1xuXG4gIGNvbnN0IG9uU3RhcnQgPSBzdGFydERyYWdGcm9tSGFuZChzKTtcbiAgaGFuZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lciwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcbiAgaGFuZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHtcbiAgICBwYXNzaXZlOiBmYWxzZSxcbiAgfSk7XG4gIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBpZiAocy5wcm9tb3Rpb24uY3VycmVudCkge1xuICAgICAgY2FuY2VsUHJvbW90aW9uKHMpO1xuICAgICAgcy5kb20ucmVkcmF3KCk7XG4gICAgfVxuICB9KTtcblxuICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUgfHwgcy5kcmF3YWJsZS5lbmFibGVkKVxuICAgIGhhbmRFbC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xufVxuXG4vLyByZXR1cm5zIHRoZSB1bmJpbmQgZnVuY3Rpb25cbmV4cG9ydCBmdW5jdGlvbiBiaW5kRG9jdW1lbnQoczogU3RhdGUpOiBzZy5VbmJpbmQge1xuICBjb25zdCB1bmJpbmRzOiBzZy5VbmJpbmRbXSA9IFtdO1xuXG4gIC8vIE9sZCB2ZXJzaW9ucyBvZiBFZGdlIGFuZCBTYWZhcmkgZG8gbm90IHN1cHBvcnQgUmVzaXplT2JzZXJ2ZXIuIFNlbmRcbiAgLy8gc2hvZ2lncm91bmQucmVzaXplIGlmIGEgdXNlciBhY3Rpb24gaGFzIGNoYW5nZWQgdGhlIGJvdW5kcyBvZiB0aGUgYm9hcmQuXG4gIGlmICghKCdSZXNpemVPYnNlcnZlcicgaW4gd2luZG93KSkge1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LmJvZHksICdzaG9naWdyb3VuZC5yZXNpemUnLCBvblJlc2l6ZShzKSkpO1xuICB9XG5cbiAgaWYgKCFzLnZpZXdPbmx5KSB7XG4gICAgY29uc3Qgb25tb3ZlID0gZHJhZ09yRHJhdyhzLCBkcmFnLm1vdmUsIGRyYXcubW92ZSksXG4gICAgICBvbmVuZCA9IGRyYWdPckRyYXcocywgZHJhZy5lbmQsIGRyYXcuZW5kKTtcblxuICAgIGZvciAoY29uc3QgZXYgb2YgWyd0b3VjaG1vdmUnLCAnbW91c2Vtb3ZlJ10pXG4gICAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9ubW92ZSBhcyBFdmVudExpc3RlbmVyKSk7XG4gICAgZm9yIChjb25zdCBldiBvZiBbJ3RvdWNoZW5kJywgJ21vdXNldXAnXSlcbiAgICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCBldiwgb25lbmQgYXMgRXZlbnRMaXN0ZW5lcikpO1xuXG4gICAgdW5iaW5kcy5wdXNoKFxuICAgICAgdW5iaW5kYWJsZShkb2N1bWVudCwgJ3Njcm9sbCcsICgpID0+IGNsZWFyQm91bmRzKHMpLCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfSksXG4gICAgKTtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZSh3aW5kb3csICdyZXNpemUnLCAoKSA9PiBjbGVhckJvdW5kcyhzKSwgeyBwYXNzaXZlOiB0cnVlIH0pKTtcbiAgfVxuXG4gIHJldHVybiAoKSA9PiB1bmJpbmRzLmZvckVhY2goKGYpID0+IGYoKSk7XG59XG5cbmZ1bmN0aW9uIHVuYmluZGFibGUoXG4gIGVsOiBFdmVudFRhcmdldCxcbiAgZXZlbnROYW1lOiBzdHJpbmcsXG4gIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyLFxuICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4pOiBzZy5VbmJpbmQge1xuICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG9wdGlvbnMpO1xuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnT3JEcmF3KHM6IFN0YXRlKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIChlKSA9PiB7XG4gICAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIGRyYWcuY2FuY2VsKHMpO1xuICAgIGVsc2UgaWYgKHMuZHJhd2FibGUuY3VycmVudCkgZHJhdy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAoZS5zaGlmdEtleSB8fCBpc1JpZ2h0QnV0dG9uKGUpIHx8IHMuZHJhd2FibGUuZm9yY2VkKSB7XG4gICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0KHMsIGUpO1xuICAgIH0gZWxzZSBpZiAoIXMudmlld09ubHkgJiYgIWRyYWcudW53YW50ZWRFdmVudChlKSkgZHJhZy5zdGFydChzLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZHJhZ09yRHJhdyhzOiBTdGF0ZSwgd2l0aERyYWc6IFN0YXRlTW91Y2hCaW5kLCB3aXRoRHJhdzogU3RhdGVNb3VjaEJpbmQpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSB3aXRoRHJhdyhzLCBlKTtcbiAgICB9IGVsc2UgaWYgKCFzLnZpZXdPbmx5KSB3aXRoRHJhZyhzLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnRnJvbUhhbmQoczogU3RhdGUpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBpZiAocy5wcm9tb3Rpb24uY3VycmVudCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKSxcbiAgICAgIHBpZWNlID0gcG9zICYmIGdldEhhbmRQaWVjZUF0RG9tUG9zKHBvcywgcy5oYW5kcy5yb2xlcywgcy5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzKCkpO1xuXG4gICAgaWYgKHBpZWNlKSB7XG4gICAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCkgZHJhZy5jYW5jZWwocyk7XG4gICAgICBlbHNlIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIGRyYXcuY2FuY2VsKHMpO1xuICAgICAgZWxzZSBpZiAoaXNNaWRkbGVCdXR0b24oZSkpIHtcbiAgICAgICAgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkge1xuICAgICAgICAgIGlmIChlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZHJhdy5zZXREcmF3UGllY2UocywgcGllY2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSB8fCBzLmRyYXdhYmxlLmZvcmNlZCkge1xuICAgICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0RnJvbUhhbmQocywgcGllY2UsIGUpO1xuICAgICAgfSBlbHNlIGlmICghcy52aWV3T25seSAmJiAhZHJhZy51bndhbnRlZEV2ZW50KGUpKSB7XG4gICAgICAgIGlmIChlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRyYWcuZHJhZ05ld1BpZWNlKHMsIHBpZWNlLCBlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb21vdGUoczogU3RhdGUsIGU6IHNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudCB8IG51bGwsXG4gICAgY3VyID0gcy5wcm9tb3Rpb24uY3VycmVudDtcbiAgaWYgKHRhcmdldCAmJiBpc1BpZWNlTm9kZSh0YXJnZXQpICYmIGN1cikge1xuICAgIGNvbnN0IHBpZWNlID0geyBjb2xvcjogdGFyZ2V0LnNnQ29sb3IsIHJvbGU6IHRhcmdldC5zZ1JvbGUgfSxcbiAgICAgIHByb20gPSAhc2FtZVBpZWNlKGN1ci5waWVjZSwgcGllY2UpO1xuICAgIGlmIChjdXIuZHJhZ2dlZCB8fCAocy50dXJuQ29sb3IgIT09IHMuYWN0aXZlQ29sb3IgJiYgcy5hY3RpdmVDb2xvciAhPT0gJ2JvdGgnKSkge1xuICAgICAgaWYgKHMuc2VsZWN0ZWQpIHVzZXJNb3ZlKHMsIHMuc2VsZWN0ZWQsIGN1ci5rZXksIHByb20pO1xuICAgICAgZWxzZSBpZiAocy5zZWxlY3RlZFBpZWNlKSB1c2VyRHJvcChzLCBzLnNlbGVjdGVkUGllY2UsIGN1ci5rZXksIHByb20pO1xuICAgIH0gZWxzZSBhbmltKChzKSA9PiBzZWxlY3RTcXVhcmUocywgY3VyLmtleSwgcHJvbSksIHMpO1xuXG4gICAgY2FsbFVzZXJGdW5jdGlvbihzLnByb21vdGlvbi5ldmVudHMuYWZ0ZXIsIHBpZWNlKTtcbiAgfSBlbHNlIGFuaW0oKHMpID0+IGNhbmNlbFByb21vdGlvbihzKSwgcyk7XG4gIHMucHJvbW90aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG5cbiAgcy5kb20ucmVkcmF3KCk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHR5cGUgeyBXcmFwRWxlbWVudHMsIFdyYXBFbGVtZW50c0Jvb2xlYW4gfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHdyYXBCb2FyZCwgd3JhcEhhbmQgfSBmcm9tICcuL3dyYXAuanMnO1xuaW1wb3J0ICogYXMgZXZlbnRzIGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IHJlbmRlckhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gJy4vcmVuZGVyLmpzJztcblxuZnVuY3Rpb24gYXR0YWNoQm9hcmQoc3RhdGU6IFN0YXRlLCBib2FyZFdyYXA6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGNvbnN0IGVsZW1lbnRzID0gd3JhcEJvYXJkKGJvYXJkV3JhcCwgc3RhdGUpO1xuXG4gIC8vIGluIGNhc2Ugb2YgaW5saW5lZCBoYW5kc1xuICBpZiAoZWxlbWVudHMuaGFuZHMpIGF0dGFjaEhhbmRzKHN0YXRlLCBlbGVtZW50cy5oYW5kcy50b3AsIGVsZW1lbnRzLmhhbmRzLmJvdHRvbSk7XG5cbiAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5ib2FyZCA9IGJvYXJkV3JhcDtcbiAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkID0gZWxlbWVudHM7XG4gIHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG5cbiAgZXZlbnRzLmJpbmRCb2FyZChzdGF0ZSwgZWxlbWVudHMpO1xuXG4gIHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoID0gJyc7XG4gIHN0YXRlLnByb21vdGlvbi5wcmV2UHJvbW90aW9uSGFzaCA9ICcnO1xuXG4gIHJlbmRlcihzdGF0ZSwgZWxlbWVudHMpO1xufVxuXG5mdW5jdGlvbiBhdHRhY2hIYW5kcyhzdGF0ZTogU3RhdGUsIGhhbmRUb3BXcmFwPzogSFRNTEVsZW1lbnQsIGhhbmRCb3R0b21XcmFwPzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgaWYgKCFzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMpIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcyA9IHt9O1xuICBpZiAoIXN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMpIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuaGFuZHMgPSB7fTtcblxuICBpZiAoaGFuZFRvcFdyYXApIHtcbiAgICBjb25zdCBoYW5kVG9wID0gd3JhcEhhbmQoaGFuZFRvcFdyYXAsICd0b3AnLCBzdGF0ZSk7XG4gICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy50b3AgPSBoYW5kVG9wV3JhcDtcbiAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMudG9wID0gaGFuZFRvcDtcbiAgICBldmVudHMuYmluZEhhbmQoc3RhdGUsIGhhbmRUb3ApO1xuICAgIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRUb3ApO1xuICB9XG4gIGlmIChoYW5kQm90dG9tV3JhcCkge1xuICAgIGNvbnN0IGhhbmRCb3R0b20gPSB3cmFwSGFuZChoYW5kQm90dG9tV3JhcCwgJ2JvdHRvbScsIHN0YXRlKTtcbiAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLmJvdHRvbSA9IGhhbmRCb3R0b21XcmFwO1xuICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy5ib3R0b20gPSBoYW5kQm90dG9tO1xuICAgIGV2ZW50cy5iaW5kSGFuZChzdGF0ZSwgaGFuZEJvdHRvbSk7XG4gICAgcmVuZGVySGFuZChzdGF0ZSwgaGFuZEJvdHRvbSk7XG4gIH1cblxuICBpZiAoaGFuZFRvcFdyYXAgfHwgaGFuZEJvdHRvbVdyYXApIHtcbiAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLmJvdW5kcy5jbGVhcigpO1xuICAgIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMucGllY2VCb3VuZHMuY2xlYXIoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVkcmF3QWxsKHdyYXBFbGVtZW50czogV3JhcEVsZW1lbnRzLCBzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHdyYXBFbGVtZW50cy5ib2FyZCkgYXR0YWNoQm9hcmQoc3RhdGUsIHdyYXBFbGVtZW50cy5ib2FyZCk7XG4gIGlmICh3cmFwRWxlbWVudHMuaGFuZHMgJiYgIXN0YXRlLmhhbmRzLmlubGluZWQpXG4gICAgYXR0YWNoSGFuZHMoc3RhdGUsIHdyYXBFbGVtZW50cy5oYW5kcy50b3AsIHdyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20pO1xuXG4gIC8vIHNoYXBlcyBtaWdodCBkZXBlbmQgYm90aCBvbiBib2FyZCBhbmQgaGFuZHMgLSByZWRyYXcgb25seSBhZnRlciBib3RoIGFyZSBkb25lXG4gIHN0YXRlLmRvbS5yZWRyYXdTaGFwZXMoKTtcblxuICBpZiAoc3RhdGUuZXZlbnRzLmluc2VydClcbiAgICBzdGF0ZS5ldmVudHMuaW5zZXJ0KHdyYXBFbGVtZW50cy5ib2FyZCAmJiBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQsIHtcbiAgICAgIHRvcDogd3JhcEVsZW1lbnRzLmhhbmRzPy50b3AgJiYgc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzPy50b3AsXG4gICAgICBib3R0b206IHdyYXBFbGVtZW50cy5oYW5kcz8uYm90dG9tICYmIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcz8uYm90dG9tLFxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0YWNoRWxlbWVudHMod2ViOiBXcmFwRWxlbWVudHNCb29sZWFuLCBzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHdlYi5ib2FyZCkge1xuICAgIHN0YXRlLmRvbS53cmFwRWxlbWVudHMuYm9hcmQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5ib3VuZHMuYm9hcmQuYm91bmRzLmNsZWFyKCk7XG4gIH1cbiAgaWYgKHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcyAmJiBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzKSB7XG4gICAgaWYgKHdlYi5oYW5kcz8udG9wKSB7XG4gICAgICBzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLmhhbmRzLnRvcCA9IHVuZGVmaW5lZDtcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcy50b3AgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICh3ZWIuaGFuZHM/LmJvdHRvbSkge1xuICAgICAgc3RhdGUuZG9tLndyYXBFbGVtZW50cy5oYW5kcy5ib3R0b20gPSB1bmRlZmluZWQ7XG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHMuYm90dG9tID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAod2ViLmhhbmRzPy50b3AgfHwgd2ViLmhhbmRzPy5ib3R0b20pIHtcbiAgICAgIHN0YXRlLmRvbS5ib3VuZHMuaGFuZHMuYm91bmRzLmNsZWFyKCk7XG4gICAgICBzdGF0ZS5kb20uYm91bmRzLmhhbmRzLnBpZWNlQm91bmRzLmNsZWFyKCk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgdHlwZSB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYXdTaGFwZSwgU3F1YXJlSGlnaGxpZ2h0IH0gZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB0eXBlICogYXMgc2cgZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCB7IGFkZFRvSGFuZCwgcmVtb3ZlRnJvbUhhbmQgfSBmcm9tICcuL2hhbmRzLmpzJztcbmltcG9ydCB7IGluZmVyRGltZW5zaW9ucywgYm9hcmRUb1NmZW4sIGhhbmRzVG9TZmVuIH0gZnJvbSAnLi9zZmVuLmpzJztcbmltcG9ydCB7IGFwcGx5QW5pbWF0aW9uLCBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBhbmltLCByZW5kZXIgfSBmcm9tICcuL2FuaW0uanMnO1xuaW1wb3J0IHsgY2FuY2VsIGFzIGRyYWdDYW5jZWwsIGRyYWdOZXdQaWVjZSB9IGZyb20gJy4vZHJhZy5qcyc7XG5pbXBvcnQgeyBkZXRhY2hFbGVtZW50cywgcmVkcmF3QWxsIH0gZnJvbSAnLi9kb20uanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwaSB7XG4gIC8vIGF0dGFjaCBlbGVtZW50cyB0byBjdXJyZW50IHNnIGluc3RhbmNlXG4gIGF0dGFjaCh3cmFwRWxlbWVudHM6IHNnLldyYXBFbGVtZW50cyk6IHZvaWQ7XG5cbiAgLy8gZGV0YWNoIGVsZW1lbnRzIGZyb20gY3VycmVudCBzZyBpbnN0YW5jZVxuICBkZXRhY2god3JhcEVsZW1lbnRzQm9vbGVhbjogc2cuV3JhcEVsZW1lbnRzQm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcmVjb25maWd1cmUgdGhlIGluc3RhbmNlLiBBY2NlcHRzIGFsbCBjb25maWcgb3B0aW9uc1xuICAvLyBib2FyZCB3aWxsIGJlIGFuaW1hdGVkIGFjY29yZGluZ2x5LCBpZiBhbmltYXRpb25zIGFyZSBlbmFibGVkXG4gIHNldChjb25maWc6IENvbmZpZywgc2tpcEFuaW1hdGlvbj86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHJlYWQgc2hvZ2lncm91bmQgc3RhdGU7IHdyaXRlIGF0IHlvdXIgb3duIHJpc2tzXG4gIHN0YXRlOiBTdGF0ZTtcblxuICAvLyBnZXQgdGhlIHBvc2l0aW9uIG9uIHRoZSBib2FyZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIGdldEJvYXJkU2ZlbigpOiBzZy5Cb2FyZFNmZW47XG5cbiAgLy8gZ2V0IHRoZSBwaWVjZXMgaW4gaGFuZCBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIGdldEhhbmRzU2ZlbigpOiBzZy5IYW5kc1NmZW47XG5cbiAgLy8gY2hhbmdlIHRoZSB2aWV3IGFuZ2xlXG4gIHRvZ2dsZU9yaWVudGF0aW9uKCk6IHZvaWQ7XG5cbiAgLy8gcGVyZm9ybSBhIG1vdmUgcHJvZ3JhbW1hdGljYWxseVxuICBtb3ZlKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcGVyZm9ybSBhIGRyb3AgcHJvZ3JhbW1hdGljYWxseSwgYnkgZGVmYXVsdCBwaWVjZSBpcyB0YWtlbiBmcm9tIGhhbmRcbiAgZHJvcChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tPzogYm9vbGVhbiwgc3BhcmU/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBhZGQgYW5kL29yIHJlbW92ZSBhcmJpdHJhcnkgcGllY2VzIG9uIHRoZSBib2FyZFxuICBzZXRQaWVjZXMocGllY2VzOiBzZy5QaWVjZXNEaWZmKTogdm9pZDtcblxuICAvLyBhZGQgcGllY2Uucm9sZSB0byBoYW5kIG9mIHBpZWNlLmNvbG9yXG4gIGFkZFRvSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50PzogbnVtYmVyKTogdm9pZDtcblxuICAvLyByZW1vdmUgcGllY2Uucm9sZSBmcm9tIGhhbmQgb2YgcGllY2UuY29sb3JcbiAgcmVtb3ZlRnJvbUhhbmQocGllY2U6IHNnLlBpZWNlLCBjb3VudD86IG51bWJlcik6IHZvaWQ7XG5cbiAgLy8gY2xpY2sgYSBzcXVhcmUgcHJvZ3JhbW1hdGljYWxseVxuICBzZWxlY3RTcXVhcmUoa2V5OiBzZy5LZXkgfCBudWxsLCBwcm9tPzogYm9vbGVhbiwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBzZWxlY3QgYSBwaWVjZSBmcm9tIGhhbmQgdG8gZHJvcCBwcm9ncmFtYXRpY2FsbHksIGJ5IGRlZmF1bHQgcGllY2UgaW4gaGFuZCBpcyBzZWxlY3RlZFxuICBzZWxlY3RQaWVjZShwaWVjZTogc2cuUGllY2UgfCBudWxsLCBzcGFyZT86IGJvb2xlYW4sIGZvcmNlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVtb3ZlLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZW1vdmUoKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55XG4gIGNhbmNlbFByZW1vdmUoKTogdm9pZDtcblxuICAvLyBwbGF5IHRoZSBjdXJyZW50IHByZWRyb3AsIGlmIGFueTsgcmV0dXJucyB0cnVlIGlmIHByZW1vdmUgd2FzIHBsYXllZFxuICBwbGF5UHJlZHJvcCgpOiBib29sZWFuO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnlcbiAgY2FuY2VsUHJlZHJvcCgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBtb3ZlIG9yIGRyb3AgYmVpbmcgbWFkZSwgcHJlbW92ZXMgYW5kIHByZWRyb3BzXG4gIGNhbmNlbE1vdmVPckRyb3AoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgY3VycmVudCBtb3ZlIG9yIGRyb3AgYW5kIHByZXZlbnQgZnVydGhlciBvbmVzXG4gIHN0b3AoKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgdXNlciBzaGFwZXNcbiAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgZHJhdyBhdXRvIHNoYXBlc1xuICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgaGlnaGxpZ2h0IHNxdWFyZXNcbiAgc2V0U3F1YXJlSGlnaGxpZ2h0cyhzcXVhcmVzOiBTcXVhcmVIaWdobGlnaHRbXSk6IHZvaWQ7XG5cbiAgLy8gZm9yIHBpZWNlIGRyb3BwaW5nIGFuZCBib2FyZCBlZGl0b3JzXG4gIGRyYWdOZXdQaWVjZShwaWVjZTogc2cuUGllY2UsIGV2ZW50OiBzZy5Nb3VjaEV2ZW50LCBzcGFyZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHVuYmluZHMgYWxsIGV2ZW50c1xuICAvLyAoaW1wb3J0YW50IGZvciBkb2N1bWVudC13aWRlIGV2ZW50cyBsaWtlIHNjcm9sbCBhbmQgbW91c2Vtb3ZlKVxuICBkZXN0cm95OiBzZy5VbmJpbmQ7XG59XG5cbi8vIHNlZSBBUEkgdHlwZXMgYW5kIGRvY3VtZW50YXRpb25zIGluIGFwaS5kLnRzXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlKTogQXBpIHtcbiAgcmV0dXJuIHtcbiAgICBhdHRhY2god3JhcEVsZW1lbnRzOiBzZy5XcmFwRWxlbWVudHMpOiB2b2lkIHtcbiAgICAgIHJlZHJhd0FsbCh3cmFwRWxlbWVudHMsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZGV0YWNoKHdyYXBFbGVtZW50c0Jvb2xlYW46IHNnLldyYXBFbGVtZW50c0Jvb2xlYW4pOiB2b2lkIHtcbiAgICAgIGRldGFjaEVsZW1lbnRzKHdyYXBFbGVtZW50c0Jvb2xlYW4sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0KGNvbmZpZzogQ29uZmlnLCBza2lwQW5pbWF0aW9uPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgZnVuY3Rpb24gZ2V0QnlQYXRoKHBhdGg6IHN0cmluZywgb2JqOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHBhdGguc3BsaXQoJy4nKTtcbiAgICAgICAgcmV0dXJuIHByb3BlcnRpZXMucmVkdWNlKChwcmV2LCBjdXJyKSA9PiBwcmV2ICYmIHByZXZbY3Vycl0sIG9iaik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZvcmNlUmVkcmF3UHJvcHM6IChgJHtrZXlvZiBDb25maWd9YCB8IGAke2tleW9mIENvbmZpZ30uJHtzdHJpbmd9YClbXSA9IFtcbiAgICAgICAgJ29yaWVudGF0aW9uJyxcbiAgICAgICAgJ3ZpZXdPbmx5JyxcbiAgICAgICAgJ2Nvb3JkaW5hdGVzLmVuYWJsZWQnLFxuICAgICAgICAnY29vcmRpbmF0ZXMubm90YXRpb24nLFxuICAgICAgICAnZHJhd2FibGUudmlzaWJsZScsXG4gICAgICAgICdoYW5kcy5pbmxpbmVkJyxcbiAgICAgIF07XG4gICAgICBjb25zdCBuZXdEaW1zID0gY29uZmlnLnNmZW4/LmJvYXJkICYmIGluZmVyRGltZW5zaW9ucyhjb25maWcuc2Zlbi5ib2FyZCk7XG4gICAgICBjb25zdCB0b1JlZHJhdyA9XG4gICAgICAgIGZvcmNlUmVkcmF3UHJvcHMuc29tZSgocCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNSZXMgPSBnZXRCeVBhdGgocCwgY29uZmlnKTtcbiAgICAgICAgICByZXR1cm4gY1JlcyAmJiBjUmVzICE9PSBnZXRCeVBhdGgocCwgc3RhdGUpO1xuICAgICAgICB9KSB8fFxuICAgICAgICAhIShcbiAgICAgICAgICBuZXdEaW1zICYmXG4gICAgICAgICAgKG5ld0RpbXMuZmlsZXMgIT09IHN0YXRlLmRpbWVuc2lvbnMuZmlsZXMgfHwgbmV3RGltcy5yYW5rcyAhPT0gc3RhdGUuZGltZW5zaW9ucy5yYW5rcylcbiAgICAgICAgKSB8fFxuICAgICAgICAhIWNvbmZpZy5oYW5kcz8ucm9sZXM/LmV2ZXJ5KChyLCBpKSA9PiByID09PSBzdGF0ZS5oYW5kcy5yb2xlc1tpXSk7XG5cbiAgICAgIGlmICh0b1JlZHJhdykge1xuICAgICAgICBib2FyZC5yZXNldChzdGF0ZSk7XG4gICAgICAgIGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnKTtcbiAgICAgICAgcmVkcmF3QWxsKHN0YXRlLmRvbS53cmFwRWxlbWVudHMsIHN0YXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFwcGx5QW5pbWF0aW9uKHN0YXRlLCBjb25maWcpO1xuICAgICAgICAoY29uZmlnLnNmZW4/LmJvYXJkICYmICFza2lwQW5pbWF0aW9uID8gYW5pbSA6IHJlbmRlcikoXG4gICAgICAgICAgKHN0YXRlKSA9PiBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyksXG4gICAgICAgICAgc3RhdGUsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0YXRlLFxuXG4gICAgZ2V0Qm9hcmRTZmVuOiAoKSA9PiBib2FyZFRvU2ZlbihzdGF0ZS5waWVjZXMsIHN0YXRlLmRpbWVuc2lvbnMsIHN0YXRlLmZvcnN5dGgudG9Gb3JzeXRoKSxcblxuICAgIGdldEhhbmRzU2ZlbjogKCkgPT5cbiAgICAgIGhhbmRzVG9TZmVuKHN0YXRlLmhhbmRzLmhhbmRNYXAsIHN0YXRlLmhhbmRzLnJvbGVzLCBzdGF0ZS5mb3JzeXRoLnRvRm9yc3l0aCksXG5cbiAgICB0b2dnbGVPcmllbnRhdGlvbigpOiB2b2lkIHtcbiAgICAgIGJvYXJkLnRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlKTtcbiAgICAgIHJlZHJhd0FsbChzdGF0ZS5kb20ud3JhcEVsZW1lbnRzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIG1vdmUob3JpZywgZGVzdCwgcHJvbSk6IHZvaWQge1xuICAgICAgYW5pbShcbiAgICAgICAgKHN0YXRlKSA9PlxuICAgICAgICAgIGJvYXJkLmJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZU1vdmVQcm9tb3Rpb24ob3JpZywgZGVzdCkpLFxuICAgICAgICBzdGF0ZSxcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGRyb3AocGllY2UsIGtleSwgcHJvbSwgc3BhcmUpOiB2b2lkIHtcbiAgICAgIGFuaW0oKHN0YXRlKSA9PiB7XG4gICAgICAgIHN0YXRlLmRyb3BwYWJsZS5zcGFyZSA9ICEhc3BhcmU7XG4gICAgICAgIGJvYXJkLmJhc2VEcm9wKHN0YXRlLCBwaWVjZSwga2V5LCBwcm9tIHx8IHN0YXRlLnByb21vdGlvbi5mb3JjZURyb3BQcm9tb3Rpb24ocGllY2UsIGtleSkpO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRQaWVjZXMocGllY2VzKTogdm9pZCB7XG4gICAgICBhbmltKChzdGF0ZSkgPT4gYm9hcmQuc2V0UGllY2VzKHN0YXRlLCBwaWVjZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGFkZFRvSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IGFkZFRvSGFuZChzdGF0ZSwgcGllY2UsIGNvdW50KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICByZW1vdmVGcm9tSGFuZChwaWVjZTogc2cuUGllY2UsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHJlbW92ZUZyb21IYW5kKHN0YXRlLCBwaWVjZSwgY291bnQpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNlbGVjdFNxdWFyZShrZXksIHByb20sIGZvcmNlKTogdm9pZCB7XG4gICAgICBpZiAoa2V5KSBhbmltKChzdGF0ZSkgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBrZXksIHByb20sIGZvcmNlKSwgc3RhdGUpO1xuICAgICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgYm9hcmQudW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNlbGVjdFBpZWNlKHBpZWNlLCBzcGFyZSwgZm9yY2UpOiB2b2lkIHtcbiAgICAgIGlmIChwaWVjZSkgcmVuZGVyKChzdGF0ZSkgPT4gYm9hcmQuc2VsZWN0UGllY2Uoc3RhdGUsIHBpZWNlLCBzcGFyZSwgZm9yY2UsIHRydWUpLCBzdGF0ZSk7XG4gICAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZFBpZWNlKSB7XG4gICAgICAgIGJvYXJkLnVuc2VsZWN0KHN0YXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBwbGF5UHJlbW92ZSgpOiBib29sZWFuIHtcbiAgICAgIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgaWYgKGFuaW0oYm9hcmQucGxheVByZW1vdmUsIHN0YXRlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSBwcmVtb3ZlIGNvdWxkbid0IGJlIHBsYXllZCwgcmVkcmF3IHRvIGNsZWFyIGl0IHVwXG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgcGxheVByZWRyb3AoKTogYm9vbGVhbiB7XG4gICAgICBpZiAoc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgaWYgKGFuaW0oYm9hcmQucGxheVByZWRyb3AsIHN0YXRlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSBwcmVkcm9wIGNvdWxkbid0IGJlIHBsYXllZCwgcmVkcmF3IHRvIGNsZWFyIGl0IHVwXG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlbW92ZSgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcihib2FyZC51bnNldFByZW1vdmUsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlZHJvcCgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcihib2FyZC51bnNldFByZWRyb3AsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsTW92ZU9yRHJvcCgpOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IHtcbiAgICAgICAgYm9hcmQuY2FuY2VsTW92ZU9yRHJvcChzdGF0ZSk7XG4gICAgICAgIGRyYWdDYW5jZWwoc3RhdGUpO1xuICAgICAgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzdG9wKCk6IHZvaWQge1xuICAgICAgcmVuZGVyKChzdGF0ZSkgPT4ge1xuICAgICAgICBib2FyZC5zdG9wKHN0YXRlKTtcbiAgICAgIH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZCB7XG4gICAgICByZW5kZXIoKHN0YXRlKSA9PiAoc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IHNoYXBlcyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IChzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBzaGFwZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldFNxdWFyZUhpZ2hsaWdodHMoc3F1YXJlczogU3F1YXJlSGlnaGxpZ2h0W10pOiB2b2lkIHtcbiAgICAgIHJlbmRlcigoc3RhdGUpID0+IChzdGF0ZS5kcmF3YWJsZS5zcXVhcmVzID0gc3F1YXJlcyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZHJhZ05ld1BpZWNlKHBpZWNlLCBldmVudCwgc3BhcmUpOiB2b2lkIHtcbiAgICAgIGRyYWdOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGV2ZW50LCBzcGFyZSk7XG4gICAgfSxcblxuICAgIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICBib2FyZC5zdG9wKHN0YXRlKTtcbiAgICAgIHN0YXRlLmRvbS51bmJpbmQoKTtcbiAgICAgIHN0YXRlLmRvbS5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIH0sXG4gIH07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBBbmltQ3VycmVudCB9IGZyb20gJy4vYW5pbS5qcyc7XG5pbXBvcnQgdHlwZSB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCB0eXBlIHsgRHJhd2FibGUgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBzZyBmcm9tICcuL3R5cGVzLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBIZWFkbGVzc1N0YXRlIHtcbiAgcGllY2VzOiBzZy5QaWVjZXM7XG4gIG9yaWVudGF0aW9uOiBzZy5Db2xvcjsgLy8gYm9hcmQgb3JpZW50YXRpb24uIHNlbnRlIHwgZ290ZVxuICBkaW1lbnNpb25zOiBzZy5EaW1lbnNpb25zOyAvLyBib2FyZCBkaW1lbnNpb25zIC0gbWF4IDE2eDE2XG4gIHR1cm5Db2xvcjogc2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gc2VudGUgfCBnb3RlXG4gIGFjdGl2ZUNvbG9yPzogc2cuQ29sb3IgfCAnYm90aCc7IC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUgb3IgZHJvcC4gc2VudGUgfCBnb3RlIHwgYm90aCB8IHVuZGVmaW5lZFxuICBjaGVja3M/OiBzZy5LZXlbXTsgLy8gc3F1YXJlcyBjdXJyZW50bHkgaW4gY2hlY2sgW1wiNWFcIl1cbiAgbGFzdERlc3RzPzogc2cuS2V5W107IC8vIHNxdWFyZXMgcGFydCBvZiB0aGUgbGFzdCBtb3ZlIG9yIGRyb3AgW1wiMmJcIjsgXCI4aFwiXVxuICBsYXN0UGllY2U/OiBzZy5QaWVjZTsgLy8gcGllY2UgcGFydCBvZiB0aGUgbGFzdCBkcm9wXG4gIHNlbGVjdGVkPzogc2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiMWFcIlxuICBzZWxlY3RlZFBpZWNlPzogc2cuUGllY2U7IC8vIHBpZWNlIGluIGhhbmQgY3VycmVudGx5IHNlbGVjdGVkXG4gIGhvdmVyZWQ/OiBzZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgYmVpbmcgaG92ZXJlZFxuICB2aWV3T25seTogYm9vbGVhbjsgLy8gZG9uJ3QgYmluZCBldmVudHM6IHRoZSB1c2VyIHdpbGwgbmV2ZXIgYmUgYWJsZSB0byBtb3ZlIHBpZWNlcyBhcm91bmRcbiAgc3F1YXJlUmF0aW86IHNnLk51bWJlclBhaXI7IC8vIHJhdGlvIG9mIHRoZSBib2FyZCBbd2lkdGgsIGhlaWdodF1cbiAgZGlzYWJsZUNvbnRleHRNZW51OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIHNob2dpIGJvYXJkXG4gIGJsb2NrVG91Y2hTY3JvbGw6IGJvb2xlYW47IC8vIGJsb2NrIHNjcm9sbGluZyB2aWEgdG91Y2ggZHJhZ2dpbmcgb24gdGhlIGJvYXJkLCBlLmcuIGZvciBjb29yZGluYXRlIHRyYWluaW5nXG4gIHNjYWxlRG93blBpZWNlczogYm9vbGVhbjtcbiAgY29vcmRpbmF0ZXM6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBpbmNsdWRlIGNvb3JkcyBhdHRyaWJ1dGVzXG4gICAgZmlsZXM6IHNnLk5vdGF0aW9uO1xuICAgIHJhbmtzOiBzZy5Ob3RhdGlvbjtcbiAgfTtcbiAgaGlnaGxpZ2h0OiB7XG4gICAgbGFzdERlc3RzOiBib29sZWFuOyAvLyBhZGQgbGFzdC1kZXN0IGNsYXNzIHRvIHNxdWFyZXMgYW5kIHBpZWNlc1xuICAgIGNoZWNrOiBib29sZWFuOyAvLyBhZGQgY2hlY2sgY2xhc3MgdG8gc3F1YXJlc1xuICAgIGNoZWNrUm9sZXM6IHNnLlJvbGVTdHJpbmdbXTsgLy8gcm9sZXMgdG8gYmUgaGlnaGxpZ2h0ZWQgd2hlbiBjaGVjayBpcyBib29sZWFuIGlzIHBhc3NlZCBmcm9tIGNvbmZpZ1xuICAgIGhvdmVyZWQ6IGJvb2xlYW47IC8vIGFkZCBob3ZlciBjbGFzcyB0byBob3ZlcmVkIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uOiB7IGVuYWJsZWQ6IGJvb2xlYW47IGhhbmRzOiBib29sZWFuOyBkdXJhdGlvbjogbnVtYmVyOyBjdXJyZW50PzogQW5pbUN1cnJlbnQgfTtcbiAgaGFuZHM6IHtcbiAgICBpbmxpbmVkOiBib29sZWFuOyAvLyBhdHRhY2hlcyBzZy1oYW5kcyBkaXJlY3RseSB0byBzZy13cmFwLCBpZ25vcmVzIEhUTUxFbGVtZW50cyBwYXNzZWQgdG8gU2hvZ2lncm91bmRcbiAgICBoYW5kTWFwOiBzZy5IYW5kcztcbiAgICByb2xlczogc2cuUm9sZVN0cmluZ1tdOyAvLyByb2xlcyB0byByZW5kZXIgaW4gc2ctaGFuZFxuICB9O1xuICBtb3ZhYmxlOiB7XG4gICAgZnJlZTogYm9vbGVhbjsgLy8gYWxsIG1vdmVzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGRlc3RzPzogc2cuTW92ZURlc3RzOyAvLyB2YWxpZCBtb3Zlcy4ge1wiN2dcIiBbXCI3ZlwiXSBcIjVpXCIgW1wiNGhcIiBcIjVoXCIgXCI2aFwiXX1cbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBkZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBldmVudHM6IHtcbiAgICAgIGFmdGVyPzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaGFzIGJlZW4gcGxheWVkXG4gICAgfTtcbiAgfTtcbiAgZHJvcHBhYmxlOiB7XG4gICAgZnJlZTogYm9vbGVhbjsgLy8gYWxsIGRyb3BzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGRlc3RzPzogc2cuRHJvcERlc3RzOyAvLyB2YWxpZCBkcm9wcy4ge1wic2VudGUgcGF3blwiIFtcIjNhXCIgXCI0YVwiXSBcInNlbnRlIGxhbmNlXCIgW1wiM2FcIiBcIjNjXCJdfVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIGRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIHNwYXJlOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIHJlbW92ZSBkcm9wcGVkIHBpZWNlIGZyb20gaGFuZCBhZnRlciBkcm9wIC0gYm9hcmQgZWRpdG9yXG4gICAgZXZlbnRzOiB7XG4gICAgICBhZnRlcj86IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5LCBwcm9tOiBib29sZWFuLCBtZXRhZGF0YTogc2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIGRyb3AgaGFzIGJlZW4gcGxheWVkXG4gICAgfTtcbiAgfTtcbiAgcHJlbW92YWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBkZXN0cz86IHNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgY3VycmVudD86IHsgb3JpZzogc2cuS2V5OyBkZXN0OiBzZy5LZXk7IHByb206IGJvb2xlYW4gfTtcbiAgICBnZW5lcmF0ZT86IChrZXk6IHNnLktleSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdO1xuICAgIGV2ZW50czoge1xuICAgICAgc2V0PzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5LCBwcm9tOiBib29sZWFuKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgIH07XG4gIH07XG4gIHByZWRyb3BwYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZWRyb3BzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBkZXN0cz86IHNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGRyb3Agc2VsZWN0aW9uXG4gICAgY3VycmVudD86IHsgcGllY2U6IHNnLlBpZWNlOyBrZXk6IHNnLktleTsgcHJvbTogYm9vbGVhbiB9O1xuICAgIGdlbmVyYXRlPzogKHBpZWNlOiBzZy5QaWVjZSwgcGllY2VzOiBzZy5QaWVjZXMpID0+IHNnLktleVtdO1xuICAgIGV2ZW50czoge1xuICAgICAgc2V0PzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfTtcbiAgfTtcbiAgZHJhZ2dhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgbW92ZXMgJiBwcmVtb3ZlcyB0byB1c2UgZHJhZyduIGRyb3BcbiAgICBkaXN0YW5jZTogbnVtYmVyOyAvLyBtaW5pbXVtIGRpc3RhbmNlIHRvIGluaXRpYXRlIGEgZHJhZzsgaW4gcGl4ZWxzXG4gICAgYXV0b0Rpc3RhbmNlOiBib29sZWFuOyAvLyBsZXRzIHNob2dpZ3JvdW5kIHNldCBkaXN0YW5jZSB0byB6ZXJvIHdoZW4gdXNlciBkcmFncyBwaWVjZXNcbiAgICBzaG93R2hvc3Q6IGJvb2xlYW47IC8vIHNob3cgZ2hvc3Qgb2YgcGllY2UgYmVpbmcgZHJhZ2dlZFxuICAgIHNob3dUb3VjaFNxdWFyZU92ZXJsYXk6IGJvb2xlYW47IC8vIHNob3cgc3F1YXJlIG92ZXJsYXkgb24gdGhlIHNxdWFyZSB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBob3ZlcmVkLCB0b3VjaCBvbmx5XG4gICAgZGVsZXRlT25Ecm9wT2ZmOiBib29sZWFuOyAvLyBkZWxldGUgYSBwaWVjZSB3aGVuIGl0IGlzIGRyb3BwZWQgb2ZmIHRoZSBib2FyZCAtIGJvYXJkIGVkaXRvclxuICAgIGFkZFRvSGFuZE9uRHJvcE9mZjogYm9vbGVhbjsgLy8gYWRkIGEgcGllY2UgdG8gaGFuZCB3aGVuIGl0IGlzIGRyb3BwZWQgb24gaXQsIHJlcXVpcmVzIGRlbGV0ZU9uRHJvcE9mZiAtIGJvYXJkIGVkaXRvclxuICAgIGN1cnJlbnQ/OiBEcmFnQ3VycmVudDtcbiAgfTtcbiAgc2VsZWN0YWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGRpc2FibGUgdG8gZW5mb3JjZSBkcmFnZ2luZyBvdmVyIGNsaWNrLWNsaWNrIG1vdmVcbiAgICBmb3JjZVNwYXJlczogYm9vbGVhbjsgLy8gYWxsb3cgZHJvcHBpbmcgc3BhcmUgcGllY2VzIGV2ZW4gd2l0aCBzZWxlY3RhYmxlIGRpc2FibGVkXG4gICAgZGVsZXRlT25Ub3VjaDogYm9vbGVhbjsgLy8gc2VsZWN0aW5nIGEgcGllY2Ugb24gdGhlIGJvYXJkIG9yIGluIGhhbmQgd2lsbCByZW1vdmUgaXQgLSBib2FyZCBlZGl0b3JcbiAgICBhZGRTcGFyZXNUb0hhbmQ6IGJvb2xlYW47IC8vIGFkZCBzZWxlY3RlZCBzcGFyZSBwaWVjZSB0byBoYW5kIC0gYm9hcmQgZWRpdG9yXG4gIH07XG4gIHByb21vdGlvbjoge1xuICAgIHByb21vdGVzVG86IChyb2xlOiBzZy5Sb2xlU3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHVucHJvbW90ZXNUbzogKHJvbGU6IHNnLlJvbGVTdHJpbmcpID0+IHNnLlJvbGVTdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgbW92ZVByb21vdGlvbkRpYWxvZzogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGZvcmNlTW92ZVByb21vdGlvbjogKG9yaWc6IHNnLktleSwgZGVzdDogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGRyb3BQcm9tb3Rpb25EaWFsb2c6IChwaWVjZTogc2cuUGllY2UsIGtleTogc2cuS2V5KSA9PiBib29sZWFuO1xuICAgIGZvcmNlRHJvcFByb21vdGlvbjogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXkpID0+IGJvb2xlYW47XG4gICAgY3VycmVudD86IHtcbiAgICAgIHBpZWNlOiBzZy5QaWVjZTtcbiAgICAgIHByb21vdGVkUGllY2U6IHNnLlBpZWNlO1xuICAgICAga2V5OiBzZy5LZXk7XG4gICAgICBkcmFnZ2VkOiBib29sZWFuOyAvLyBubyBhbmltYXRpb25zIHdpdGggZHJhZ1xuICAgIH07XG4gICAgZXZlbnRzOiB7XG4gICAgICBpbml0aWF0ZWQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBwcm9tb3Rpb24gZGlhbG9nIGlzIHN0YXJ0ZWRcbiAgICAgIGFmdGVyPzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHVzZXIgc2VsZWN0cyBhIHBpZWNlXG4gICAgICBjYW5jZWw/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdXNlciBjYW5jZWxzIHRoZSBzZWxlY3Rpb25cbiAgICB9O1xuICAgIHByZXZQcm9tb3Rpb25IYXNoOiBzdHJpbmc7XG4gIH07XG4gIGZvcnN5dGg6IHtcbiAgICB0b0ZvcnN5dGg/OiAocm9sZTogc2cuUm9sZVN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGZyb21Gb3JzeXRoPzogKHN0cjogc3RyaW5nKSA9PiBzZy5Sb2xlU3RyaW5nIHwgdW5kZWZpbmVkO1xuICB9O1xuICBldmVudHM6IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIG1vdmU/OiAob3JpZzogc2cuS2V5LCBkZXN0OiBzZy5LZXksIHByb206IGJvb2xlYW4sIGNhcHR1cmVkUGllY2U/OiBzZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wPzogKHBpZWNlOiBzZy5QaWVjZSwga2V5OiBzZy5LZXksIHByb206IGJvb2xlYW4pID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNxdWFyZSBpcyBzZWxlY3RlZFxuICAgIHVuc2VsZWN0PzogKGtleTogc2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNlbGVjdGVkIHNxdWFyZSBpcyBkaXJlY3RseSB1bnNlbGVjdGVkIC0gZHJvcHBlZCBiYWNrIG9yIGNsaWNrZWQgb24gdGhlIG9yaWdpbmFsIHNxdWFyZVxuICAgIHBpZWNlU2VsZWN0PzogKHBpZWNlOiBzZy5QaWVjZSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBwaWVjZSBpbiBoYW5kIGlzIHNlbGVjdGVkXG4gICAgcGllY2VVbnNlbGVjdD86IChwaWVjZTogc2cuUGllY2UpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc2VsZWN0ZWQgcGllY2UgaXMgZGlyZWN0bHkgdW5zZWxlY3RlZCAtIGRyb3BwZWQgYmFjayBvciBjbGlja2VkIG9uIHRoZSBzYW1lIHBpZWNlXG4gICAgaW5zZXJ0PzogKGJvYXJkRWxlbWVudHM/OiBzZy5Cb2FyZEVsZW1lbnRzLCBoYW5kRWxlbWVudHM/OiBzZy5IYW5kRWxlbWVudHMpID0+IHZvaWQ7IC8vIHdoZW4gdGhlIGJvYXJkIG9yIGhhbmRzIERPTSBoYXMgYmVlbiAocmUpaW5zZXJ0ZWRcbiAgfTtcbiAgZHJhd2FibGU6IERyYXdhYmxlO1xuICBwaWVjZUNvb2xkb3duPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuO1xuICAgIGNvb2xkb3duVGltZT86IG51bWJlcjsgLy8gY29vbGRvd24gaW4gbWlsbGlzZWNvbmRzXG4gIH07XG59XG5leHBvcnQgaW50ZXJmYWNlIFN0YXRlIGV4dGVuZHMgSGVhZGxlc3NTdGF0ZSB7XG4gIGRvbTogc2cuRG9tO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdHMoKTogSGVhZGxlc3NTdGF0ZSB7XG4gIHJldHVybiB7XG4gICAgcGllY2VzOiBuZXcgTWFwKCksXG4gICAgZGltZW5zaW9uczogeyBmaWxlczogOSwgcmFua3M6IDkgfSxcbiAgICBvcmllbnRhdGlvbjogJ3NlbnRlJyxcbiAgICB0dXJuQ29sb3I6ICdzZW50ZScsXG4gICAgYWN0aXZlQ29sb3I6ICdib3RoJyxcbiAgICB2aWV3T25seTogZmFsc2UsXG4gICAgc3F1YXJlUmF0aW86IFsxMSwgMTJdLFxuICAgIGRpc2FibGVDb250ZXh0TWVudTogdHJ1ZSxcbiAgICBibG9ja1RvdWNoU2Nyb2xsOiBmYWxzZSxcbiAgICBzY2FsZURvd25QaWVjZXM6IHRydWUsXG4gICAgY29vcmRpbmF0ZXM6IHsgZW5hYmxlZDogdHJ1ZSwgZmlsZXM6ICdudW1lcmljJywgcmFua3M6ICdudW1lcmljJyB9LFxuICAgIGhpZ2hsaWdodDogeyBsYXN0RGVzdHM6IHRydWUsIGNoZWNrOiB0cnVlLCBjaGVja1JvbGVzOiBbJ2tpbmcnXSwgaG92ZXJlZDogZmFsc2UgfSxcbiAgICBhbmltYXRpb246IHsgZW5hYmxlZDogdHJ1ZSwgaGFuZHM6IHRydWUsIGR1cmF0aW9uOiAyNTAgfSxcbiAgICBoYW5kczoge1xuICAgICAgaW5saW5lZDogZmFsc2UsXG4gICAgICBoYW5kTWFwOiBuZXcgTWFwPHNnLkNvbG9yLCBzZy5IYW5kPihbXG4gICAgICAgIFsnc2VudGUnLCBuZXcgTWFwKCldLFxuICAgICAgICBbJ2dvdGUnLCBuZXcgTWFwKCldLFxuICAgICAgXSksXG4gICAgICByb2xlczogWydyb29rJywgJ2Jpc2hvcCcsICdnb2xkJywgJ3NpbHZlcicsICdrbmlnaHQnLCAnbGFuY2UnLCAncGF3biddLFxuICAgIH0sXG4gICAgbW92YWJsZTogeyBmcmVlOiB0cnVlLCBzaG93RGVzdHM6IHRydWUsIGV2ZW50czoge30gfSxcbiAgICBkcm9wcGFibGU6IHsgZnJlZTogdHJ1ZSwgc2hvd0Rlc3RzOiB0cnVlLCBzcGFyZTogZmFsc2UsIGV2ZW50czoge30gfSxcbiAgICBwcmVtb3ZhYmxlOiB7IGVuYWJsZWQ6IHRydWUsIHNob3dEZXN0czogdHJ1ZSwgZXZlbnRzOiB7fSB9LFxuICAgIHByZWRyb3BwYWJsZTogeyBlbmFibGVkOiB0cnVlLCBzaG93RGVzdHM6IHRydWUsIGV2ZW50czoge30gfSxcbiAgICBkcmFnZ2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBkaXN0YW5jZTogMyxcbiAgICAgIGF1dG9EaXN0YW5jZTogdHJ1ZSxcbiAgICAgIHNob3dHaG9zdDogdHJ1ZSxcbiAgICAgIHNob3dUb3VjaFNxdWFyZU92ZXJsYXk6IHRydWUsXG4gICAgICBkZWxldGVPbkRyb3BPZmY6IGZhbHNlLFxuICAgICAgYWRkVG9IYW5kT25Ecm9wT2ZmOiBmYWxzZSxcbiAgICB9LFxuICAgIHNlbGVjdGFibGU6IHsgZW5hYmxlZDogdHJ1ZSwgZm9yY2VTcGFyZXM6IGZhbHNlLCBkZWxldGVPblRvdWNoOiBmYWxzZSwgYWRkU3BhcmVzVG9IYW5kOiBmYWxzZSB9LFxuICAgIHByb21vdGlvbjoge1xuICAgICAgbW92ZVByb21vdGlvbkRpYWxvZzogKCkgPT4gZmFsc2UsXG4gICAgICBmb3JjZU1vdmVQcm9tb3Rpb246ICgpID0+IGZhbHNlLFxuICAgICAgZHJvcFByb21vdGlvbkRpYWxvZzogKCkgPT4gZmFsc2UsXG4gICAgICBmb3JjZURyb3BQcm9tb3Rpb246ICgpID0+IGZhbHNlLFxuICAgICAgcHJvbW90ZXNUbzogKCkgPT4gdW5kZWZpbmVkLFxuICAgICAgdW5wcm9tb3Rlc1RvOiAoKSA9PiB1bmRlZmluZWQsXG4gICAgICBldmVudHM6IHt9LFxuICAgICAgcHJldlByb21vdGlvbkhhc2g6ICcnLFxuICAgIH0sXG4gICAgZm9yc3l0aDoge30sXG4gICAgZXZlbnRzOiB7fSxcbiAgICBkcmF3YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSwgLy8gY2FuIGRyYXdcbiAgICAgIHZpc2libGU6IHRydWUsIC8vIGNhbiB2aWV3XG4gICAgICBmb3JjZWQ6IGZhbHNlLCAvLyBjYW4gb25seSBkcmF3XG4gICAgICBlcmFzZU9uQ2xpY2s6IHRydWUsXG4gICAgICBzaGFwZXM6IFtdLFxuICAgICAgYXV0b1NoYXBlczogW10sXG4gICAgICBzcXVhcmVzOiBbXSxcbiAgICAgIHByZXZTdmdIYXNoOiAnJyxcbiAgICB9LFxuICAgIHBpZWNlQ29vbGRvd246IHtcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgIH0sXG4gIH07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAnLi9yZW5kZXIuanMnO1xuaW1wb3J0IHsgcmVuZGVySGFuZCB9IGZyb20gJy4vaGFuZHMuanMnO1xuaW1wb3J0IHsgcmVuZGVyU2hhcGVzIH0gZnJvbSAnLi9zaGFwZXMuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVkcmF3U2hhcGVzTm93KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkPy5zaGFwZXMpXG4gICAgcmVuZGVyU2hhcGVzKFxuICAgICAgc3RhdGUsXG4gICAgICBzdGF0ZS5kb20uZWxlbWVudHMuYm9hcmQuc2hhcGVzLnN2ZyxcbiAgICAgIHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZC5zaGFwZXMuY3VzdG9tU3ZnLFxuICAgICAgc3RhdGUuZG9tLmVsZW1lbnRzLmJvYXJkLnNoYXBlcy5mcmVlUGllY2VzLFxuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWRyYXdOb3coc3RhdGU6IFN0YXRlLCBza2lwU2hhcGVzPzogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBib2FyZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZDtcbiAgaWYgKGJvYXJkRWxzKSB7XG4gICAgcmVuZGVyKHN0YXRlLCBib2FyZEVscyk7XG4gICAgaWYgKCFza2lwU2hhcGVzKSByZWRyYXdTaGFwZXNOb3coc3RhdGUpO1xuICB9XG5cbiAgY29uc3QgaGFuZEVscyA9IHN0YXRlLmRvbS5lbGVtZW50cy5oYW5kcztcbiAgaWYgKGhhbmRFbHMpIHtcbiAgICBpZiAoaGFuZEVscy50b3ApIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRFbHMudG9wKTtcbiAgICBpZiAoaGFuZEVscy5ib3R0b20pIHJlbmRlckhhbmQoc3RhdGUsIGhhbmRFbHMuYm90dG9tKTtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgRE9NUmVjdE1hcCwgUGllY2VOYW1lLCBQaWVjZU5vZGUsIFdyYXBFbGVtZW50cyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHR5cGUgeyBBcGkgfSBmcm9tICcuL2FwaS5qcyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB7IHN0YXJ0IH0gZnJvbSAnLi9hcGkuanMnO1xuaW1wb3J0IHsgY29uZmlndXJlIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZGVmYXVsdHMgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IHJlZHJhd0FsbCB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGJpbmREb2N1bWVudCB9IGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IHJlZHJhd05vdywgcmVkcmF3U2hhcGVzTm93IH0gZnJvbSAnLi9yZWRyYXcuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gU2hvZ2lncm91bmQoY29uZmlnPzogQ29uZmlnLCB3cmFwRWxlbWVudHM/OiBXcmFwRWxlbWVudHMpOiBBcGkge1xuICBjb25zdCBzdGF0ZSA9IGRlZmF1bHRzKCkgYXMgU3RhdGU7XG4gIGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnIHx8IHt9KTtcblxuICBjb25zdCByZWRyYXdTdGF0ZU5vdyA9IChza2lwU2hhcGVzPzogYm9vbGVhbikgPT4ge1xuICAgIHJlZHJhd05vdyhzdGF0ZSwgc2tpcFNoYXBlcyk7XG4gIH07XG5cbiAgc3RhdGUuZG9tID0ge1xuICAgIHdyYXBFbGVtZW50czogd3JhcEVsZW1lbnRzIHx8IHt9LFxuICAgIGVsZW1lbnRzOiB7fSxcbiAgICBib3VuZHM6IHtcbiAgICAgIGJvYXJkOiB7XG4gICAgICAgIGJvdW5kczogdXRpbC5tZW1vKCgpID0+IHN0YXRlLmRvbS5lbGVtZW50cy5ib2FyZD8ucGllY2VzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKSxcbiAgICAgIH0sXG4gICAgICBoYW5kczoge1xuICAgICAgICBib3VuZHM6IHV0aWwubWVtbygoKSA9PiB7XG4gICAgICAgICAgY29uc3QgaGFuZHNSZWN0czogRE9NUmVjdE1hcDwndG9wJyB8ICdib3R0b20nPiA9IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGhhbmRFbHMgPSBzdGF0ZS5kb20uZWxlbWVudHMuaGFuZHM7XG4gICAgICAgICAgaWYgKGhhbmRFbHM/LnRvcCkgaGFuZHNSZWN0cy5zZXQoJ3RvcCcsIGhhbmRFbHMudG9wLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICAgICAgICBpZiAoaGFuZEVscz8uYm90dG9tKSBoYW5kc1JlY3RzLnNldCgnYm90dG9tJywgaGFuZEVscy5ib3R0b20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgICAgIHJldHVybiBoYW5kc1JlY3RzO1xuICAgICAgICB9KSxcbiAgICAgICAgcGllY2VCb3VuZHM6IHV0aWwubWVtbygoKSA9PiB7XG4gICAgICAgICAgY29uc3QgaGFuZFBpZWNlc1JlY3RzOiBET01SZWN0TWFwPFBpZWNlTmFtZT4gPSBuZXcgTWFwKCksXG4gICAgICAgICAgICBoYW5kRWxzID0gc3RhdGUuZG9tLmVsZW1lbnRzLmhhbmRzO1xuXG4gICAgICAgICAgaWYgKGhhbmRFbHM/LnRvcCkge1xuICAgICAgICAgICAgbGV0IHdyYXBFbCA9IGhhbmRFbHMudG9wLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgd2hpbGUgKHdyYXBFbCkge1xuICAgICAgICAgICAgICBjb25zdCBwaWVjZUVsID0gd3JhcEVsLmZpcnN0RWxlbWVudENoaWxkIGFzIFBpZWNlTm9kZSxcbiAgICAgICAgICAgICAgICBwaWVjZSA9IHsgcm9sZTogcGllY2VFbC5zZ1JvbGUsIGNvbG9yOiBwaWVjZUVsLnNnQ29sb3IgfTtcbiAgICAgICAgICAgICAgaGFuZFBpZWNlc1JlY3RzLnNldCh1dGlsLnBpZWNlTmFtZU9mKHBpZWNlKSwgcGllY2VFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgICAgICAgICAgIHdyYXBFbCA9IHdyYXBFbC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChoYW5kRWxzPy5ib3R0b20pIHtcbiAgICAgICAgICAgIGxldCB3cmFwRWwgPSBoYW5kRWxzLmJvdHRvbS5maXJzdEVsZW1lbnRDaGlsZCBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHdoaWxlICh3cmFwRWwpIHtcbiAgICAgICAgICAgICAgY29uc3QgcGllY2VFbCA9IHdyYXBFbC5maXJzdEVsZW1lbnRDaGlsZCBhcyBQaWVjZU5vZGUsXG4gICAgICAgICAgICAgICAgcGllY2UgPSB7IHJvbGU6IHBpZWNlRWwuc2dSb2xlLCBjb2xvcjogcGllY2VFbC5zZ0NvbG9yIH07XG4gICAgICAgICAgICAgIGhhbmRQaWVjZXNSZWN0cy5zZXQodXRpbC5waWVjZU5hbWVPZihwaWVjZSksIHBpZWNlRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgICAgICAgICAgICB3cmFwRWwgPSB3cmFwRWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaGFuZFBpZWNlc1JlY3RzO1xuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICByZWRyYXdOb3c6IHJlZHJhd1N0YXRlTm93LFxuICAgIHJlZHJhdzogZGVib3VuY2VSZWRyYXcocmVkcmF3U3RhdGVOb3cpLFxuICAgIHJlZHJhd1NoYXBlczogZGVib3VuY2VSZWRyYXcoKCkgPT4gcmVkcmF3U2hhcGVzTm93KHN0YXRlKSksXG4gICAgdW5iaW5kOiBiaW5kRG9jdW1lbnQoc3RhdGUpLFxuICAgIGRlc3Ryb3llZDogZmFsc2UsXG4gIH07XG5cbiAgaWYgKHdyYXBFbGVtZW50cykgcmVkcmF3QWxsKHdyYXBFbGVtZW50cywgc3RhdGUpO1xuXG4gIHJldHVybiBzdGFydChzdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIGRlYm91bmNlUmVkcmF3KGY6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCB7XG4gIGxldCByZWRyYXdpbmcgPSBmYWxzZTtcbiAgcmV0dXJuICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgIGlmIChyZWRyYXdpbmcpIHJldHVybjtcbiAgICByZWRyYXdpbmcgPSB0cnVlO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBmKC4uLmFyZ3MpO1xuICAgICAgcmVkcmF3aW5nID0gZmFsc2U7XG4gICAgfSk7XG4gIH07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bUNBQVMsUUFBUTtBQUNuQixrQkFBSSxTQUFTLFFBQVEsT0FBTztBQUM1QixxQkFBTyxRQUFRO0FBQ2Isc0JBQU0sVUFBVSxPQUFPLG1CQUNyQixRQUFRLEVBQUUsTUFBTSxRQUFRLFFBQVEsT0FBTyxRQUFRLFFBQVE7QUFDekQsZ0NBQWdCLElBQVMsWUFBWSxLQUFLLEdBQUcsUUFBUSxzQkFBc0IsQ0FBQztBQUM1RSx5QkFBUyxPQUFPO0FBQUEsY0FDbEI7QUFBQSxZQUNGO0FBQ0EsbUJBQU87QUFBQSxVQUNULENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLE1BQ0EsV0FBVztBQUFBLE1BQ1gsUUFBUSxlQUFlLGNBQWM7QUFBQSxNQUNyQyxjQUFjLGVBQWUsTUFBTSxnQkFBZ0IsS0FBSyxDQUFDO0FBQUEsTUFDekQsUUFBUSxhQUFhLEtBQUs7QUFBQSxNQUMxQixXQUFXO0FBQUEsSUFDYjtBQUVBLFFBQUksYUFBYyxXQUFVLGNBQWMsS0FBSztBQUUvQyxXQUFPRSxPQUFNLEtBQUs7QUFBQSxFQUNwQjtBQUVBLFdBQVMsZUFBZSxHQUF1RDtBQUM3RSxRQUFJLFlBQVk7QUFDaEIsV0FBTyxJQUFJLFNBQWdCO0FBQ3pCLFVBQUksVUFBVztBQUNmLGtCQUFZO0FBQ1osNEJBQXNCLE1BQU07QUFDMUIsVUFBRSxHQUFHLElBQUk7QUFDVCxvQkFBWTtBQUFBLE1BQ2QsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGOzs7QW5CakZBLE1BQU8sZ0JBQVE7IiwKICAibmFtZXMiOiBbImFuaW0iLCAiayIsICJtb3ZlIiwgInJhbmtzIiwgInJlbmRlciIsICJub3ciLCAiYnJ1c2hlcyIsICJlbCIsICJkZXN0IiwgInN0YXJ0IiwgImNhbmNlbCIsICJtb3ZlIiwgImVuZCIsICJ1bnNlbGVjdCIsICJyYW5rcyIsICJmaWxlcyIsICJyZW5kZXJIYW5kIiwgIm1vdmUiLCAiZW5kIiwgImNhbmNlbCIsICJzdGFydCIsICJzIiwgInN0YXJ0IiwgInJlbmRlciIsICJzdGF0ZSIsICJjYW5jZWwiLCAic3RhcnQiXQp9Cg==
