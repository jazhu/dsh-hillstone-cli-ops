window.__ModuleLoader__.load({ id: 'dsh-hillstone-cli-ops', factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/xterm/lib/xterm.js
var require_xterm = __commonJS({
  "node_modules/xterm/lib/xterm.js"(exports, module2) {
    !(function(e, t) {
      if ("object" == typeof exports && "object" == typeof module2) module2.exports = t();
      else if ("function" == typeof define && define.amd) define([], t);
      else {
        var i = t();
        for (var s in i) ("object" == typeof exports ? exports : e)[s] = i[s];
      }
    })(self, (() => (() => {
      "use strict";
      var e = { 4567: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.AccessibilityManager = void 0;
        const n = i2(9042), o = i2(6114), a = i2(9924), h2 = i2(844), c = i2(5596), l = i2(4725), d = i2(3656);
        let _ = t2.AccessibilityManager = class extends h2.Disposable {
          constructor(e3, t3) {
            super(), this._terminal = e3, this._renderService = t3, this._liveRegionLineCount = 0, this._charsToConsume = [], this._charsToAnnounce = "", this._accessibilityContainer = document.createElement("div"), this._accessibilityContainer.classList.add("xterm-accessibility"), this._rowContainer = document.createElement("div"), this._rowContainer.setAttribute("role", "list"), this._rowContainer.classList.add("xterm-accessibility-tree"), this._rowElements = [];
            for (let e4 = 0; e4 < this._terminal.rows; e4++) this._rowElements[e4] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[e4]);
            if (this._topBoundaryFocusListener = (e4) => this._handleBoundaryFocus(e4, 0), this._bottomBoundaryFocusListener = (e4) => this._handleBoundaryFocus(e4, 1), this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._refreshRowsDimensions(), this._accessibilityContainer.appendChild(this._rowContainer), this._liveRegion = document.createElement("div"), this._liveRegion.classList.add("live-region"), this._liveRegion.setAttribute("aria-live", "assertive"), this._accessibilityContainer.appendChild(this._liveRegion), this._liveRegionDebouncer = this.register(new a.TimeBasedDebouncer(this._renderRows.bind(this))), !this._terminal.element) throw new Error("Cannot enable accessibility before Terminal.open");
            this._terminal.element.insertAdjacentElement("afterbegin", this._accessibilityContainer), this.register(this._terminal.onResize(((e4) => this._handleResize(e4.rows)))), this.register(this._terminal.onRender(((e4) => this._refreshRows(e4.start, e4.end)))), this.register(this._terminal.onScroll((() => this._refreshRows()))), this.register(this._terminal.onA11yChar(((e4) => this._handleChar(e4)))), this.register(this._terminal.onLineFeed((() => this._handleChar("\n")))), this.register(this._terminal.onA11yTab(((e4) => this._handleTab(e4)))), this.register(this._terminal.onKey(((e4) => this._handleKey(e4.key)))), this.register(this._terminal.onBlur((() => this._clearLiveRegion()))), this.register(this._renderService.onDimensionsChange((() => this._refreshRowsDimensions()))), this._screenDprMonitor = new c.ScreenDprMonitor(window), this.register(this._screenDprMonitor), this._screenDprMonitor.setListener((() => this._refreshRowsDimensions())), this.register((0, d.addDisposableDomListener)(window, "resize", (() => this._refreshRowsDimensions()))), this._refreshRows(), this.register((0, h2.toDisposable)((() => {
              this._accessibilityContainer.remove(), this._rowElements.length = 0;
            })));
          }
          _handleTab(e3) {
            for (let t3 = 0; t3 < e3; t3++) this._handleChar(" ");
          }
          _handleChar(e3) {
            this._liveRegionLineCount < 21 && (this._charsToConsume.length > 0 ? this._charsToConsume.shift() !== e3 && (this._charsToAnnounce += e3) : this._charsToAnnounce += e3, "\n" === e3 && (this._liveRegionLineCount++, 21 === this._liveRegionLineCount && (this._liveRegion.textContent += n.tooMuchOutput)), o.isMac && this._liveRegion.textContent && this._liveRegion.textContent.length > 0 && !this._liveRegion.parentNode && setTimeout((() => {
              this._accessibilityContainer.appendChild(this._liveRegion);
            }), 0));
          }
          _clearLiveRegion() {
            this._liveRegion.textContent = "", this._liveRegionLineCount = 0, o.isMac && this._liveRegion.remove();
          }
          _handleKey(e3) {
            this._clearLiveRegion(), /\p{Control}/u.test(e3) || this._charsToConsume.push(e3);
          }
          _refreshRows(e3, t3) {
            this._liveRegionDebouncer.refresh(e3, t3, this._terminal.rows);
          }
          _renderRows(e3, t3) {
            const i3 = this._terminal.buffer, s3 = i3.lines.length.toString();
            for (let r2 = e3; r2 <= t3; r2++) {
              const e4 = i3.translateBufferLineToString(i3.ydisp + r2, true), t4 = (i3.ydisp + r2 + 1).toString(), n2 = this._rowElements[r2];
              n2 && (0 === e4.length ? n2.innerText = "\xA0" : n2.textContent = e4, n2.setAttribute("aria-posinset", t4), n2.setAttribute("aria-setsize", s3));
            }
            this._announceCharacters();
          }
          _announceCharacters() {
            0 !== this._charsToAnnounce.length && (this._liveRegion.textContent += this._charsToAnnounce, this._charsToAnnounce = "");
          }
          _handleBoundaryFocus(e3, t3) {
            const i3 = e3.target, s3 = this._rowElements[0 === t3 ? 1 : this._rowElements.length - 2];
            if (i3.getAttribute("aria-posinset") === (0 === t3 ? "1" : `${this._terminal.buffer.lines.length}`)) return;
            if (e3.relatedTarget !== s3) return;
            let r2, n2;
            if (0 === t3 ? (r2 = i3, n2 = this._rowElements.pop(), this._rowContainer.removeChild(n2)) : (r2 = this._rowElements.shift(), n2 = i3, this._rowContainer.removeChild(r2)), r2.removeEventListener("focus", this._topBoundaryFocusListener), n2.removeEventListener("focus", this._bottomBoundaryFocusListener), 0 === t3) {
              const e4 = this._createAccessibilityTreeNode();
              this._rowElements.unshift(e4), this._rowContainer.insertAdjacentElement("afterbegin", e4);
            } else {
              const e4 = this._createAccessibilityTreeNode();
              this._rowElements.push(e4), this._rowContainer.appendChild(e4);
            }
            this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._terminal.scrollLines(0 === t3 ? -1 : 1), this._rowElements[0 === t3 ? 1 : this._rowElements.length - 2].focus(), e3.preventDefault(), e3.stopImmediatePropagation();
          }
          _handleResize(e3) {
            this._rowElements[this._rowElements.length - 1].removeEventListener("focus", this._bottomBoundaryFocusListener);
            for (let e4 = this._rowContainer.children.length; e4 < this._terminal.rows; e4++) this._rowElements[e4] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[e4]);
            for (; this._rowElements.length > e3; ) this._rowContainer.removeChild(this._rowElements.pop());
            this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._refreshRowsDimensions();
          }
          _createAccessibilityTreeNode() {
            const e3 = document.createElement("div");
            return e3.setAttribute("role", "listitem"), e3.tabIndex = -1, this._refreshRowDimensions(e3), e3;
          }
          _refreshRowsDimensions() {
            if (this._renderService.dimensions.css.cell.height) {
              this._accessibilityContainer.style.width = `${this._renderService.dimensions.css.canvas.width}px`, this._rowElements.length !== this._terminal.rows && this._handleResize(this._terminal.rows);
              for (let e3 = 0; e3 < this._terminal.rows; e3++) this._refreshRowDimensions(this._rowElements[e3]);
            }
          }
          _refreshRowDimensions(e3) {
            e3.style.height = `${this._renderService.dimensions.css.cell.height}px`;
          }
        };
        t2.AccessibilityManager = _ = s2([r(1, l.IRenderService)], _);
      }, 3614: (e2, t2) => {
        function i2(e3) {
          return e3.replace(/\r?\n/g, "\r");
        }
        function s2(e3, t3) {
          return t3 ? "\x1B[200~" + e3 + "\x1B[201~" : e3;
        }
        function r(e3, t3, r2, n2) {
          e3 = s2(e3 = i2(e3), r2.decPrivateModes.bracketedPasteMode && true !== n2.rawOptions.ignoreBracketedPasteMode), r2.triggerDataEvent(e3, true), t3.value = "";
        }
        function n(e3, t3, i3) {
          const s3 = i3.getBoundingClientRect(), r2 = e3.clientX - s3.left - 10, n2 = e3.clientY - s3.top - 10;
          t3.style.width = "20px", t3.style.height = "20px", t3.style.left = `${r2}px`, t3.style.top = `${n2}px`, t3.style.zIndex = "1000", t3.focus();
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.rightClickHandler = t2.moveTextAreaUnderMouseCursor = t2.paste = t2.handlePasteEvent = t2.copyHandler = t2.bracketTextForPaste = t2.prepareTextForTerminal = void 0, t2.prepareTextForTerminal = i2, t2.bracketTextForPaste = s2, t2.copyHandler = function(e3, t3) {
          e3.clipboardData && e3.clipboardData.setData("text/plain", t3.selectionText), e3.preventDefault();
        }, t2.handlePasteEvent = function(e3, t3, i3, s3) {
          e3.stopPropagation(), e3.clipboardData && r(e3.clipboardData.getData("text/plain"), t3, i3, s3);
        }, t2.paste = r, t2.moveTextAreaUnderMouseCursor = n, t2.rightClickHandler = function(e3, t3, i3, s3, r2) {
          n(e3, t3, i3), r2 && s3.rightClickSelect(e3), t3.value = s3.selectionText, t3.select();
        };
      }, 7239: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ColorContrastCache = void 0;
        const s2 = i2(1505);
        t2.ColorContrastCache = class {
          constructor() {
            this._color = new s2.TwoKeyMap(), this._css = new s2.TwoKeyMap();
          }
          setCss(e3, t3, i3) {
            this._css.set(e3, t3, i3);
          }
          getCss(e3, t3) {
            return this._css.get(e3, t3);
          }
          setColor(e3, t3, i3) {
            this._color.set(e3, t3, i3);
          }
          getColor(e3, t3) {
            return this._color.get(e3, t3);
          }
          clear() {
            this._color.clear(), this._css.clear();
          }
        };
      }, 3656: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.addDisposableDomListener = void 0, t2.addDisposableDomListener = function(e3, t3, i2, s2) {
          e3.addEventListener(t3, i2, s2);
          let r = false;
          return { dispose: () => {
            r || (r = true, e3.removeEventListener(t3, i2, s2));
          } };
        };
      }, 6465: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Linkifier2 = void 0;
        const n = i2(3656), o = i2(8460), a = i2(844), h2 = i2(2585);
        let c = t2.Linkifier2 = class extends a.Disposable {
          get currentLink() {
            return this._currentLink;
          }
          constructor(e3) {
            super(), this._bufferService = e3, this._linkProviders = [], this._linkCacheDisposables = [], this._isMouseOut = true, this._wasResized = false, this._activeLine = -1, this._onShowLinkUnderline = this.register(new o.EventEmitter()), this.onShowLinkUnderline = this._onShowLinkUnderline.event, this._onHideLinkUnderline = this.register(new o.EventEmitter()), this.onHideLinkUnderline = this._onHideLinkUnderline.event, this.register((0, a.getDisposeArrayDisposable)(this._linkCacheDisposables)), this.register((0, a.toDisposable)((() => {
              this._lastMouseEvent = void 0;
            }))), this.register(this._bufferService.onResize((() => {
              this._clearCurrentLink(), this._wasResized = true;
            })));
          }
          registerLinkProvider(e3) {
            return this._linkProviders.push(e3), { dispose: () => {
              const t3 = this._linkProviders.indexOf(e3);
              -1 !== t3 && this._linkProviders.splice(t3, 1);
            } };
          }
          attachToDom(e3, t3, i3) {
            this._element = e3, this._mouseService = t3, this._renderService = i3, this.register((0, n.addDisposableDomListener)(this._element, "mouseleave", (() => {
              this._isMouseOut = true, this._clearCurrentLink();
            }))), this.register((0, n.addDisposableDomListener)(this._element, "mousemove", this._handleMouseMove.bind(this))), this.register((0, n.addDisposableDomListener)(this._element, "mousedown", this._handleMouseDown.bind(this))), this.register((0, n.addDisposableDomListener)(this._element, "mouseup", this._handleMouseUp.bind(this)));
          }
          _handleMouseMove(e3) {
            if (this._lastMouseEvent = e3, !this._element || !this._mouseService) return;
            const t3 = this._positionFromMouseEvent(e3, this._element, this._mouseService);
            if (!t3) return;
            this._isMouseOut = false;
            const i3 = e3.composedPath();
            for (let e4 = 0; e4 < i3.length; e4++) {
              const t4 = i3[e4];
              if (t4.classList.contains("xterm")) break;
              if (t4.classList.contains("xterm-hover")) return;
            }
            this._lastBufferCell && t3.x === this._lastBufferCell.x && t3.y === this._lastBufferCell.y || (this._handleHover(t3), this._lastBufferCell = t3);
          }
          _handleHover(e3) {
            if (this._activeLine !== e3.y || this._wasResized) return this._clearCurrentLink(), this._askForLink(e3, false), void (this._wasResized = false);
            this._currentLink && this._linkAtPosition(this._currentLink.link, e3) || (this._clearCurrentLink(), this._askForLink(e3, true));
          }
          _askForLink(e3, t3) {
            var i3, s3;
            this._activeProviderReplies && t3 || (null === (i3 = this._activeProviderReplies) || void 0 === i3 || i3.forEach(((e4) => {
              null == e4 || e4.forEach(((e5) => {
                e5.link.dispose && e5.link.dispose();
              }));
            })), this._activeProviderReplies = /* @__PURE__ */ new Map(), this._activeLine = e3.y);
            let r2 = false;
            for (const [i4, n2] of this._linkProviders.entries()) t3 ? (null === (s3 = this._activeProviderReplies) || void 0 === s3 ? void 0 : s3.get(i4)) && (r2 = this._checkLinkProviderResult(i4, e3, r2)) : n2.provideLinks(e3.y, ((t4) => {
              var s4, n3;
              if (this._isMouseOut) return;
              const o2 = null == t4 ? void 0 : t4.map(((e4) => ({ link: e4 })));
              null === (s4 = this._activeProviderReplies) || void 0 === s4 || s4.set(i4, o2), r2 = this._checkLinkProviderResult(i4, e3, r2), (null === (n3 = this._activeProviderReplies) || void 0 === n3 ? void 0 : n3.size) === this._linkProviders.length && this._removeIntersectingLinks(e3.y, this._activeProviderReplies);
            }));
          }
          _removeIntersectingLinks(e3, t3) {
            const i3 = /* @__PURE__ */ new Set();
            for (let s3 = 0; s3 < t3.size; s3++) {
              const r2 = t3.get(s3);
              if (r2) for (let t4 = 0; t4 < r2.length; t4++) {
                const s4 = r2[t4], n2 = s4.link.range.start.y < e3 ? 0 : s4.link.range.start.x, o2 = s4.link.range.end.y > e3 ? this._bufferService.cols : s4.link.range.end.x;
                for (let e4 = n2; e4 <= o2; e4++) {
                  if (i3.has(e4)) {
                    r2.splice(t4--, 1);
                    break;
                  }
                  i3.add(e4);
                }
              }
            }
          }
          _checkLinkProviderResult(e3, t3, i3) {
            var s3;
            if (!this._activeProviderReplies) return i3;
            const r2 = this._activeProviderReplies.get(e3);
            let n2 = false;
            for (let t4 = 0; t4 < e3; t4++) this._activeProviderReplies.has(t4) && !this._activeProviderReplies.get(t4) || (n2 = true);
            if (!n2 && r2) {
              const e4 = r2.find(((e5) => this._linkAtPosition(e5.link, t3)));
              e4 && (i3 = true, this._handleNewLink(e4));
            }
            if (this._activeProviderReplies.size === this._linkProviders.length && !i3) for (let e4 = 0; e4 < this._activeProviderReplies.size; e4++) {
              const r3 = null === (s3 = this._activeProviderReplies.get(e4)) || void 0 === s3 ? void 0 : s3.find(((e5) => this._linkAtPosition(e5.link, t3)));
              if (r3) {
                i3 = true, this._handleNewLink(r3);
                break;
              }
            }
            return i3;
          }
          _handleMouseDown() {
            this._mouseDownLink = this._currentLink;
          }
          _handleMouseUp(e3) {
            if (!this._element || !this._mouseService || !this._currentLink) return;
            const t3 = this._positionFromMouseEvent(e3, this._element, this._mouseService);
            t3 && this._mouseDownLink === this._currentLink && this._linkAtPosition(this._currentLink.link, t3) && this._currentLink.link.activate(e3, this._currentLink.link.text);
          }
          _clearCurrentLink(e3, t3) {
            this._element && this._currentLink && this._lastMouseEvent && (!e3 || !t3 || this._currentLink.link.range.start.y >= e3 && this._currentLink.link.range.end.y <= t3) && (this._linkLeave(this._element, this._currentLink.link, this._lastMouseEvent), this._currentLink = void 0, (0, a.disposeArray)(this._linkCacheDisposables));
          }
          _handleNewLink(e3) {
            if (!this._element || !this._lastMouseEvent || !this._mouseService) return;
            const t3 = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
            t3 && this._linkAtPosition(e3.link, t3) && (this._currentLink = e3, this._currentLink.state = { decorations: { underline: void 0 === e3.link.decorations || e3.link.decorations.underline, pointerCursor: void 0 === e3.link.decorations || e3.link.decorations.pointerCursor }, isHovered: true }, this._linkHover(this._element, e3.link, this._lastMouseEvent), e3.link.decorations = {}, Object.defineProperties(e3.link.decorations, { pointerCursor: { get: () => {
              var e4, t4;
              return null === (t4 = null === (e4 = this._currentLink) || void 0 === e4 ? void 0 : e4.state) || void 0 === t4 ? void 0 : t4.decorations.pointerCursor;
            }, set: (e4) => {
              var t4, i3;
              (null === (t4 = this._currentLink) || void 0 === t4 ? void 0 : t4.state) && this._currentLink.state.decorations.pointerCursor !== e4 && (this._currentLink.state.decorations.pointerCursor = e4, this._currentLink.state.isHovered && (null === (i3 = this._element) || void 0 === i3 || i3.classList.toggle("xterm-cursor-pointer", e4)));
            } }, underline: { get: () => {
              var e4, t4;
              return null === (t4 = null === (e4 = this._currentLink) || void 0 === e4 ? void 0 : e4.state) || void 0 === t4 ? void 0 : t4.decorations.underline;
            }, set: (t4) => {
              var i3, s3, r2;
              (null === (i3 = this._currentLink) || void 0 === i3 ? void 0 : i3.state) && (null === (r2 = null === (s3 = this._currentLink) || void 0 === s3 ? void 0 : s3.state) || void 0 === r2 ? void 0 : r2.decorations.underline) !== t4 && (this._currentLink.state.decorations.underline = t4, this._currentLink.state.isHovered && this._fireUnderlineEvent(e3.link, t4));
            } } }), this._renderService && this._linkCacheDisposables.push(this._renderService.onRenderedViewportChange(((e4) => {
              if (!this._currentLink) return;
              const t4 = 0 === e4.start ? 0 : e4.start + 1 + this._bufferService.buffer.ydisp, i3 = this._bufferService.buffer.ydisp + 1 + e4.end;
              if (this._currentLink.link.range.start.y >= t4 && this._currentLink.link.range.end.y <= i3 && (this._clearCurrentLink(t4, i3), this._lastMouseEvent && this._element)) {
                const e5 = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
                e5 && this._askForLink(e5, false);
              }
            }))));
          }
          _linkHover(e3, t3, i3) {
            var s3;
            (null === (s3 = this._currentLink) || void 0 === s3 ? void 0 : s3.state) && (this._currentLink.state.isHovered = true, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(t3, true), this._currentLink.state.decorations.pointerCursor && e3.classList.add("xterm-cursor-pointer")), t3.hover && t3.hover(i3, t3.text);
          }
          _fireUnderlineEvent(e3, t3) {
            const i3 = e3.range, s3 = this._bufferService.buffer.ydisp, r2 = this._createLinkUnderlineEvent(i3.start.x - 1, i3.start.y - s3 - 1, i3.end.x, i3.end.y - s3 - 1, void 0);
            (t3 ? this._onShowLinkUnderline : this._onHideLinkUnderline).fire(r2);
          }
          _linkLeave(e3, t3, i3) {
            var s3;
            (null === (s3 = this._currentLink) || void 0 === s3 ? void 0 : s3.state) && (this._currentLink.state.isHovered = false, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(t3, false), this._currentLink.state.decorations.pointerCursor && e3.classList.remove("xterm-cursor-pointer")), t3.leave && t3.leave(i3, t3.text);
          }
          _linkAtPosition(e3, t3) {
            const i3 = e3.range.start.y * this._bufferService.cols + e3.range.start.x, s3 = e3.range.end.y * this._bufferService.cols + e3.range.end.x, r2 = t3.y * this._bufferService.cols + t3.x;
            return i3 <= r2 && r2 <= s3;
          }
          _positionFromMouseEvent(e3, t3, i3) {
            const s3 = i3.getCoords(e3, t3, this._bufferService.cols, this._bufferService.rows);
            if (s3) return { x: s3[0], y: s3[1] + this._bufferService.buffer.ydisp };
          }
          _createLinkUnderlineEvent(e3, t3, i3, s3, r2) {
            return { x1: e3, y1: t3, x2: i3, y2: s3, cols: this._bufferService.cols, fg: r2 };
          }
        };
        t2.Linkifier2 = c = s2([r(0, h2.IBufferService)], c);
      }, 9042: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.tooMuchOutput = t2.promptLabel = void 0, t2.promptLabel = "Terminal input", t2.tooMuchOutput = "Too much output to announce, navigate to rows manually to read";
      }, 3730: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OscLinkProvider = void 0;
        const n = i2(511), o = i2(2585);
        let a = t2.OscLinkProvider = class {
          constructor(e3, t3, i3) {
            this._bufferService = e3, this._optionsService = t3, this._oscLinkService = i3;
          }
          provideLinks(e3, t3) {
            var i3;
            const s3 = this._bufferService.buffer.lines.get(e3 - 1);
            if (!s3) return void t3(void 0);
            const r2 = [], o2 = this._optionsService.rawOptions.linkHandler, a2 = new n.CellData(), c = s3.getTrimmedLength();
            let l = -1, d = -1, _ = false;
            for (let t4 = 0; t4 < c; t4++) if (-1 !== d || s3.hasContent(t4)) {
              if (s3.loadCell(t4, a2), a2.hasExtendedAttrs() && a2.extended.urlId) {
                if (-1 === d) {
                  d = t4, l = a2.extended.urlId;
                  continue;
                }
                _ = a2.extended.urlId !== l;
              } else -1 !== d && (_ = true);
              if (_ || -1 !== d && t4 === c - 1) {
                const s4 = null === (i3 = this._oscLinkService.getLinkData(l)) || void 0 === i3 ? void 0 : i3.uri;
                if (s4) {
                  const i4 = { start: { x: d + 1, y: e3 }, end: { x: t4 + (_ || t4 !== c - 1 ? 0 : 1), y: e3 } };
                  let n2 = false;
                  if (!(null == o2 ? void 0 : o2.allowNonHttpProtocols)) try {
                    const e4 = new URL(s4);
                    ["http:", "https:"].includes(e4.protocol) || (n2 = true);
                  } catch (e4) {
                    n2 = true;
                  }
                  n2 || r2.push({ text: s4, range: i4, activate: (e4, t5) => o2 ? o2.activate(e4, t5, i4) : h2(0, t5), hover: (e4, t5) => {
                    var s5;
                    return null === (s5 = null == o2 ? void 0 : o2.hover) || void 0 === s5 ? void 0 : s5.call(o2, e4, t5, i4);
                  }, leave: (e4, t5) => {
                    var s5;
                    return null === (s5 = null == o2 ? void 0 : o2.leave) || void 0 === s5 ? void 0 : s5.call(o2, e4, t5, i4);
                  } });
                }
                _ = false, a2.hasExtendedAttrs() && a2.extended.urlId ? (d = t4, l = a2.extended.urlId) : (d = -1, l = -1);
              }
            }
            t3(r2);
          }
        };
        function h2(e3, t3) {
          if (confirm(`Do you want to navigate to ${t3}?

WARNING: This link could potentially be dangerous`)) {
            const e4 = window.open();
            if (e4) {
              try {
                e4.opener = null;
              } catch (e5) {
              }
              e4.location.href = t3;
            } else console.warn("Opening link blocked as opener could not be cleared");
          }
        }
        t2.OscLinkProvider = a = s2([r(0, o.IBufferService), r(1, o.IOptionsService), r(2, o.IOscLinkService)], a);
      }, 6193: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.RenderDebouncer = void 0, t2.RenderDebouncer = class {
          constructor(e3, t3) {
            this._parentWindow = e3, this._renderCallback = t3, this._refreshCallbacks = [];
          }
          dispose() {
            this._animationFrame && (this._parentWindow.cancelAnimationFrame(this._animationFrame), this._animationFrame = void 0);
          }
          addRefreshCallback(e3) {
            return this._refreshCallbacks.push(e3), this._animationFrame || (this._animationFrame = this._parentWindow.requestAnimationFrame((() => this._innerRefresh()))), this._animationFrame;
          }
          refresh(e3, t3, i2) {
            this._rowCount = i2, e3 = void 0 !== e3 ? e3 : 0, t3 = void 0 !== t3 ? t3 : this._rowCount - 1, this._rowStart = void 0 !== this._rowStart ? Math.min(this._rowStart, e3) : e3, this._rowEnd = void 0 !== this._rowEnd ? Math.max(this._rowEnd, t3) : t3, this._animationFrame || (this._animationFrame = this._parentWindow.requestAnimationFrame((() => this._innerRefresh())));
          }
          _innerRefresh() {
            if (this._animationFrame = void 0, void 0 === this._rowStart || void 0 === this._rowEnd || void 0 === this._rowCount) return void this._runRefreshCallbacks();
            const e3 = Math.max(this._rowStart, 0), t3 = Math.min(this._rowEnd, this._rowCount - 1);
            this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(e3, t3), this._runRefreshCallbacks();
          }
          _runRefreshCallbacks() {
            for (const e3 of this._refreshCallbacks) e3(0);
            this._refreshCallbacks = [];
          }
        };
      }, 5596: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ScreenDprMonitor = void 0;
        const s2 = i2(844);
        class r extends s2.Disposable {
          constructor(e3) {
            super(), this._parentWindow = e3, this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this.register((0, s2.toDisposable)((() => {
              this.clearListener();
            })));
          }
          setListener(e3) {
            this._listener && this.clearListener(), this._listener = e3, this._outerListener = () => {
              this._listener && (this._listener(this._parentWindow.devicePixelRatio, this._currentDevicePixelRatio), this._updateDpr());
            }, this._updateDpr();
          }
          _updateDpr() {
            var e3;
            this._outerListener && (null === (e3 = this._resolutionMediaMatchList) || void 0 === e3 || e3.removeListener(this._outerListener), this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this._resolutionMediaMatchList = this._parentWindow.matchMedia(`screen and (resolution: ${this._parentWindow.devicePixelRatio}dppx)`), this._resolutionMediaMatchList.addListener(this._outerListener));
          }
          clearListener() {
            this._resolutionMediaMatchList && this._listener && this._outerListener && (this._resolutionMediaMatchList.removeListener(this._outerListener), this._resolutionMediaMatchList = void 0, this._listener = void 0, this._outerListener = void 0);
          }
        }
        t2.ScreenDprMonitor = r;
      }, 3236: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Terminal = void 0;
        const s2 = i2(3614), r = i2(3656), n = i2(6465), o = i2(9042), a = i2(3730), h2 = i2(1680), c = i2(3107), l = i2(5744), d = i2(2950), _ = i2(1296), u = i2(428), f = i2(4269), v = i2(5114), p = i2(8934), g = i2(3230), m = i2(9312), S = i2(4725), C = i2(6731), b = i2(8055), y = i2(8969), w = i2(8460), E = i2(844), k = i2(6114), L = i2(8437), D = i2(2584), R = i2(7399), x = i2(5941), A = i2(9074), B = i2(2585), T = i2(5435), M = i2(4567), O = "undefined" != typeof window ? window.document : null;
        class P extends y.CoreTerminal {
          get onFocus() {
            return this._onFocus.event;
          }
          get onBlur() {
            return this._onBlur.event;
          }
          get onA11yChar() {
            return this._onA11yCharEmitter.event;
          }
          get onA11yTab() {
            return this._onA11yTabEmitter.event;
          }
          get onWillOpen() {
            return this._onWillOpen.event;
          }
          constructor(e3 = {}) {
            super(e3), this.browser = k, this._keyDownHandled = false, this._keyDownSeen = false, this._keyPressHandled = false, this._unprocessedDeadKey = false, this._accessibilityManager = this.register(new E.MutableDisposable()), this._onCursorMove = this.register(new w.EventEmitter()), this.onCursorMove = this._onCursorMove.event, this._onKey = this.register(new w.EventEmitter()), this.onKey = this._onKey.event, this._onRender = this.register(new w.EventEmitter()), this.onRender = this._onRender.event, this._onSelectionChange = this.register(new w.EventEmitter()), this.onSelectionChange = this._onSelectionChange.event, this._onTitleChange = this.register(new w.EventEmitter()), this.onTitleChange = this._onTitleChange.event, this._onBell = this.register(new w.EventEmitter()), this.onBell = this._onBell.event, this._onFocus = this.register(new w.EventEmitter()), this._onBlur = this.register(new w.EventEmitter()), this._onA11yCharEmitter = this.register(new w.EventEmitter()), this._onA11yTabEmitter = this.register(new w.EventEmitter()), this._onWillOpen = this.register(new w.EventEmitter()), this._setup(), this.linkifier2 = this.register(this._instantiationService.createInstance(n.Linkifier2)), this.linkifier2.registerLinkProvider(this._instantiationService.createInstance(a.OscLinkProvider)), this._decorationService = this._instantiationService.createInstance(A.DecorationService), this._instantiationService.setService(B.IDecorationService, this._decorationService), this.register(this._inputHandler.onRequestBell((() => this._onBell.fire()))), this.register(this._inputHandler.onRequestRefreshRows(((e4, t3) => this.refresh(e4, t3)))), this.register(this._inputHandler.onRequestSendFocus((() => this._reportFocus()))), this.register(this._inputHandler.onRequestReset((() => this.reset()))), this.register(this._inputHandler.onRequestWindowsOptionsReport(((e4) => this._reportWindowsOptions(e4)))), this.register(this._inputHandler.onColor(((e4) => this._handleColorEvent(e4)))), this.register((0, w.forwardEvent)(this._inputHandler.onCursorMove, this._onCursorMove)), this.register((0, w.forwardEvent)(this._inputHandler.onTitleChange, this._onTitleChange)), this.register((0, w.forwardEvent)(this._inputHandler.onA11yChar, this._onA11yCharEmitter)), this.register((0, w.forwardEvent)(this._inputHandler.onA11yTab, this._onA11yTabEmitter)), this.register(this._bufferService.onResize(((e4) => this._afterResize(e4.cols, e4.rows)))), this.register((0, E.toDisposable)((() => {
              var e4, t3;
              this._customKeyEventHandler = void 0, null === (t3 = null === (e4 = this.element) || void 0 === e4 ? void 0 : e4.parentNode) || void 0 === t3 || t3.removeChild(this.element);
            })));
          }
          _handleColorEvent(e3) {
            if (this._themeService) for (const t3 of e3) {
              let e4, i3 = "";
              switch (t3.index) {
                case 256:
                  e4 = "foreground", i3 = "10";
                  break;
                case 257:
                  e4 = "background", i3 = "11";
                  break;
                case 258:
                  e4 = "cursor", i3 = "12";
                  break;
                default:
                  e4 = "ansi", i3 = "4;" + t3.index;
              }
              switch (t3.type) {
                case 0:
                  const s3 = b.color.toColorRGB("ansi" === e4 ? this._themeService.colors.ansi[t3.index] : this._themeService.colors[e4]);
                  this.coreService.triggerDataEvent(`${D.C0.ESC}]${i3};${(0, x.toRgbString)(s3)}${D.C1_ESCAPED.ST}`);
                  break;
                case 1:
                  if ("ansi" === e4) this._themeService.modifyColors(((e5) => e5.ansi[t3.index] = b.rgba.toColor(...t3.color)));
                  else {
                    const i4 = e4;
                    this._themeService.modifyColors(((e5) => e5[i4] = b.rgba.toColor(...t3.color)));
                  }
                  break;
                case 2:
                  this._themeService.restoreColor(t3.index);
              }
            }
          }
          _setup() {
            super._setup(), this._customKeyEventHandler = void 0;
          }
          get buffer() {
            return this.buffers.active;
          }
          focus() {
            this.textarea && this.textarea.focus({ preventScroll: true });
          }
          _handleScreenReaderModeOptionChange(e3) {
            e3 ? !this._accessibilityManager.value && this._renderService && (this._accessibilityManager.value = this._instantiationService.createInstance(M.AccessibilityManager, this)) : this._accessibilityManager.clear();
          }
          _handleTextAreaFocus(e3) {
            this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(D.C0.ESC + "[I"), this.updateCursorStyle(e3), this.element.classList.add("focus"), this._showCursor(), this._onFocus.fire();
          }
          blur() {
            var e3;
            return null === (e3 = this.textarea) || void 0 === e3 ? void 0 : e3.blur();
          }
          _handleTextAreaBlur() {
            this.textarea.value = "", this.refresh(this.buffer.y, this.buffer.y), this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(D.C0.ESC + "[O"), this.element.classList.remove("focus"), this._onBlur.fire();
          }
          _syncTextArea() {
            if (!this.textarea || !this.buffer.isCursorInViewport || this._compositionHelper.isComposing || !this._renderService) return;
            const e3 = this.buffer.ybase + this.buffer.y, t3 = this.buffer.lines.get(e3);
            if (!t3) return;
            const i3 = Math.min(this.buffer.x, this.cols - 1), s3 = this._renderService.dimensions.css.cell.height, r2 = t3.getWidth(i3), n2 = this._renderService.dimensions.css.cell.width * r2, o2 = this.buffer.y * this._renderService.dimensions.css.cell.height, a2 = i3 * this._renderService.dimensions.css.cell.width;
            this.textarea.style.left = a2 + "px", this.textarea.style.top = o2 + "px", this.textarea.style.width = n2 + "px", this.textarea.style.height = s3 + "px", this.textarea.style.lineHeight = s3 + "px", this.textarea.style.zIndex = "-5";
          }
          _initGlobal() {
            this._bindKeys(), this.register((0, r.addDisposableDomListener)(this.element, "copy", ((e4) => {
              this.hasSelection() && (0, s2.copyHandler)(e4, this._selectionService);
            })));
            const e3 = (e4) => (0, s2.handlePasteEvent)(e4, this.textarea, this.coreService, this.optionsService);
            this.register((0, r.addDisposableDomListener)(this.textarea, "paste", e3)), this.register((0, r.addDisposableDomListener)(this.element, "paste", e3)), k.isFirefox ? this.register((0, r.addDisposableDomListener)(this.element, "mousedown", ((e4) => {
              2 === e4.button && (0, s2.rightClickHandler)(e4, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
            }))) : this.register((0, r.addDisposableDomListener)(this.element, "contextmenu", ((e4) => {
              (0, s2.rightClickHandler)(e4, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
            }))), k.isLinux && this.register((0, r.addDisposableDomListener)(this.element, "auxclick", ((e4) => {
              1 === e4.button && (0, s2.moveTextAreaUnderMouseCursor)(e4, this.textarea, this.screenElement);
            })));
          }
          _bindKeys() {
            this.register((0, r.addDisposableDomListener)(this.textarea, "keyup", ((e3) => this._keyUp(e3)), true)), this.register((0, r.addDisposableDomListener)(this.textarea, "keydown", ((e3) => this._keyDown(e3)), true)), this.register((0, r.addDisposableDomListener)(this.textarea, "keypress", ((e3) => this._keyPress(e3)), true)), this.register((0, r.addDisposableDomListener)(this.textarea, "compositionstart", (() => this._compositionHelper.compositionstart()))), this.register((0, r.addDisposableDomListener)(this.textarea, "compositionupdate", ((e3) => this._compositionHelper.compositionupdate(e3)))), this.register((0, r.addDisposableDomListener)(this.textarea, "compositionend", (() => this._compositionHelper.compositionend()))), this.register((0, r.addDisposableDomListener)(this.textarea, "input", ((e3) => this._inputEvent(e3)), true)), this.register(this.onRender((() => this._compositionHelper.updateCompositionElements())));
          }
          open(e3) {
            var t3;
            if (!e3) throw new Error("Terminal requires a parent element.");
            e3.isConnected || this._logService.debug("Terminal.open was called on an element that was not attached to the DOM"), this._document = e3.ownerDocument, this.element = this._document.createElement("div"), this.element.dir = "ltr", this.element.classList.add("terminal"), this.element.classList.add("xterm"), e3.appendChild(this.element);
            const i3 = O.createDocumentFragment();
            this._viewportElement = O.createElement("div"), this._viewportElement.classList.add("xterm-viewport"), i3.appendChild(this._viewportElement), this._viewportScrollArea = O.createElement("div"), this._viewportScrollArea.classList.add("xterm-scroll-area"), this._viewportElement.appendChild(this._viewportScrollArea), this.screenElement = O.createElement("div"), this.screenElement.classList.add("xterm-screen"), this._helperContainer = O.createElement("div"), this._helperContainer.classList.add("xterm-helpers"), this.screenElement.appendChild(this._helperContainer), i3.appendChild(this.screenElement), this.textarea = O.createElement("textarea"), this.textarea.classList.add("xterm-helper-textarea"), this.textarea.setAttribute("aria-label", o.promptLabel), k.isChromeOS || this.textarea.setAttribute("aria-multiline", "false"), this.textarea.setAttribute("autocorrect", "off"), this.textarea.setAttribute("autocapitalize", "off"), this.textarea.setAttribute("spellcheck", "false"), this.textarea.tabIndex = 0, this._coreBrowserService = this._instantiationService.createInstance(v.CoreBrowserService, this.textarea, null !== (t3 = this._document.defaultView) && void 0 !== t3 ? t3 : window), this._instantiationService.setService(S.ICoreBrowserService, this._coreBrowserService), this.register((0, r.addDisposableDomListener)(this.textarea, "focus", ((e4) => this._handleTextAreaFocus(e4)))), this.register((0, r.addDisposableDomListener)(this.textarea, "blur", (() => this._handleTextAreaBlur()))), this._helperContainer.appendChild(this.textarea), this._charSizeService = this._instantiationService.createInstance(u.CharSizeService, this._document, this._helperContainer), this._instantiationService.setService(S.ICharSizeService, this._charSizeService), this._themeService = this._instantiationService.createInstance(C.ThemeService), this._instantiationService.setService(S.IThemeService, this._themeService), this._characterJoinerService = this._instantiationService.createInstance(f.CharacterJoinerService), this._instantiationService.setService(S.ICharacterJoinerService, this._characterJoinerService), this._renderService = this.register(this._instantiationService.createInstance(g.RenderService, this.rows, this.screenElement)), this._instantiationService.setService(S.IRenderService, this._renderService), this.register(this._renderService.onRenderedViewportChange(((e4) => this._onRender.fire(e4)))), this.onResize(((e4) => this._renderService.resize(e4.cols, e4.rows))), this._compositionView = O.createElement("div"), this._compositionView.classList.add("composition-view"), this._compositionHelper = this._instantiationService.createInstance(d.CompositionHelper, this.textarea, this._compositionView), this._helperContainer.appendChild(this._compositionView), this.element.appendChild(i3);
            try {
              this._onWillOpen.fire(this.element);
            } catch (e4) {
            }
            this._renderService.hasRenderer() || this._renderService.setRenderer(this._createRenderer()), this._mouseService = this._instantiationService.createInstance(p.MouseService), this._instantiationService.setService(S.IMouseService, this._mouseService), this.viewport = this._instantiationService.createInstance(h2.Viewport, this._viewportElement, this._viewportScrollArea), this.viewport.onRequestScrollLines(((e4) => this.scrollLines(e4.amount, e4.suppressScrollEvent, 1))), this.register(this._inputHandler.onRequestSyncScrollBar((() => this.viewport.syncScrollArea()))), this.register(this.viewport), this.register(this.onCursorMove((() => {
              this._renderService.handleCursorMove(), this._syncTextArea();
            }))), this.register(this.onResize((() => this._renderService.handleResize(this.cols, this.rows)))), this.register(this.onBlur((() => this._renderService.handleBlur()))), this.register(this.onFocus((() => this._renderService.handleFocus()))), this.register(this._renderService.onDimensionsChange((() => this.viewport.syncScrollArea()))), this._selectionService = this.register(this._instantiationService.createInstance(m.SelectionService, this.element, this.screenElement, this.linkifier2)), this._instantiationService.setService(S.ISelectionService, this._selectionService), this.register(this._selectionService.onRequestScrollLines(((e4) => this.scrollLines(e4.amount, e4.suppressScrollEvent)))), this.register(this._selectionService.onSelectionChange((() => this._onSelectionChange.fire()))), this.register(this._selectionService.onRequestRedraw(((e4) => this._renderService.handleSelectionChanged(e4.start, e4.end, e4.columnSelectMode)))), this.register(this._selectionService.onLinuxMouseSelection(((e4) => {
              this.textarea.value = e4, this.textarea.focus(), this.textarea.select();
            }))), this.register(this._onScroll.event(((e4) => {
              this.viewport.syncScrollArea(), this._selectionService.refresh();
            }))), this.register((0, r.addDisposableDomListener)(this._viewportElement, "scroll", (() => this._selectionService.refresh()))), this.linkifier2.attachToDom(this.screenElement, this._mouseService, this._renderService), this.register(this._instantiationService.createInstance(c.BufferDecorationRenderer, this.screenElement)), this.register((0, r.addDisposableDomListener)(this.element, "mousedown", ((e4) => this._selectionService.handleMouseDown(e4)))), this.coreMouseService.areMouseEventsActive ? (this._selectionService.disable(), this.element.classList.add("enable-mouse-events")) : this._selectionService.enable(), this.options.screenReaderMode && (this._accessibilityManager.value = this._instantiationService.createInstance(M.AccessibilityManager, this)), this.register(this.optionsService.onSpecificOptionChange("screenReaderMode", ((e4) => this._handleScreenReaderModeOptionChange(e4)))), this.options.overviewRulerWidth && (this._overviewRulerRenderer = this.register(this._instantiationService.createInstance(l.OverviewRulerRenderer, this._viewportElement, this.screenElement))), this.optionsService.onSpecificOptionChange("overviewRulerWidth", ((e4) => {
              !this._overviewRulerRenderer && e4 && this._viewportElement && this.screenElement && (this._overviewRulerRenderer = this.register(this._instantiationService.createInstance(l.OverviewRulerRenderer, this._viewportElement, this.screenElement)));
            })), this._charSizeService.measure(), this.refresh(0, this.rows - 1), this._initGlobal(), this.bindMouse();
          }
          _createRenderer() {
            return this._instantiationService.createInstance(_.DomRenderer, this.element, this.screenElement, this._viewportElement, this.linkifier2);
          }
          bindMouse() {
            const e3 = this, t3 = this.element;
            function i3(t4) {
              const i4 = e3._mouseService.getMouseReportCoords(t4, e3.screenElement);
              if (!i4) return false;
              let s4, r2;
              switch (t4.overrideType || t4.type) {
                case "mousemove":
                  r2 = 32, void 0 === t4.buttons ? (s4 = 3, void 0 !== t4.button && (s4 = t4.button < 3 ? t4.button : 3)) : s4 = 1 & t4.buttons ? 0 : 4 & t4.buttons ? 1 : 2 & t4.buttons ? 2 : 3;
                  break;
                case "mouseup":
                  r2 = 0, s4 = t4.button < 3 ? t4.button : 3;
                  break;
                case "mousedown":
                  r2 = 1, s4 = t4.button < 3 ? t4.button : 3;
                  break;
                case "wheel":
                  if (0 === e3.viewport.getLinesScrolled(t4)) return false;
                  r2 = t4.deltaY < 0 ? 0 : 1, s4 = 4;
                  break;
                default:
                  return false;
              }
              return !(void 0 === r2 || void 0 === s4 || s4 > 4) && e3.coreMouseService.triggerMouseEvent({ col: i4.col, row: i4.row, x: i4.x, y: i4.y, button: s4, action: r2, ctrl: t4.ctrlKey, alt: t4.altKey, shift: t4.shiftKey });
            }
            const s3 = { mouseup: null, wheel: null, mousedrag: null, mousemove: null }, n2 = { mouseup: (e4) => (i3(e4), e4.buttons || (this._document.removeEventListener("mouseup", s3.mouseup), s3.mousedrag && this._document.removeEventListener("mousemove", s3.mousedrag)), this.cancel(e4)), wheel: (e4) => (i3(e4), this.cancel(e4, true)), mousedrag: (e4) => {
              e4.buttons && i3(e4);
            }, mousemove: (e4) => {
              e4.buttons || i3(e4);
            } };
            this.register(this.coreMouseService.onProtocolChange(((e4) => {
              e4 ? ("debug" === this.optionsService.rawOptions.logLevel && this._logService.debug("Binding to mouse events:", this.coreMouseService.explainEvents(e4)), this.element.classList.add("enable-mouse-events"), this._selectionService.disable()) : (this._logService.debug("Unbinding from mouse events."), this.element.classList.remove("enable-mouse-events"), this._selectionService.enable()), 8 & e4 ? s3.mousemove || (t3.addEventListener("mousemove", n2.mousemove), s3.mousemove = n2.mousemove) : (t3.removeEventListener("mousemove", s3.mousemove), s3.mousemove = null), 16 & e4 ? s3.wheel || (t3.addEventListener("wheel", n2.wheel, { passive: false }), s3.wheel = n2.wheel) : (t3.removeEventListener("wheel", s3.wheel), s3.wheel = null), 2 & e4 ? s3.mouseup || (t3.addEventListener("mouseup", n2.mouseup), s3.mouseup = n2.mouseup) : (this._document.removeEventListener("mouseup", s3.mouseup), t3.removeEventListener("mouseup", s3.mouseup), s3.mouseup = null), 4 & e4 ? s3.mousedrag || (s3.mousedrag = n2.mousedrag) : (this._document.removeEventListener("mousemove", s3.mousedrag), s3.mousedrag = null);
            }))), this.coreMouseService.activeProtocol = this.coreMouseService.activeProtocol, this.register((0, r.addDisposableDomListener)(t3, "mousedown", ((e4) => {
              if (e4.preventDefault(), this.focus(), this.coreMouseService.areMouseEventsActive && !this._selectionService.shouldForceSelection(e4)) return i3(e4), s3.mouseup && this._document.addEventListener("mouseup", s3.mouseup), s3.mousedrag && this._document.addEventListener("mousemove", s3.mousedrag), this.cancel(e4);
            }))), this.register((0, r.addDisposableDomListener)(t3, "wheel", ((e4) => {
              if (!s3.wheel) {
                if (!this.buffer.hasScrollback) {
                  const t4 = this.viewport.getLinesScrolled(e4);
                  if (0 === t4) return;
                  const i4 = D.C0.ESC + (this.coreService.decPrivateModes.applicationCursorKeys ? "O" : "[") + (e4.deltaY < 0 ? "A" : "B");
                  let s4 = "";
                  for (let e5 = 0; e5 < Math.abs(t4); e5++) s4 += i4;
                  return this.coreService.triggerDataEvent(s4, true), this.cancel(e4, true);
                }
                return this.viewport.handleWheel(e4) ? this.cancel(e4) : void 0;
              }
            }), { passive: false })), this.register((0, r.addDisposableDomListener)(t3, "touchstart", ((e4) => {
              if (!this.coreMouseService.areMouseEventsActive) return this.viewport.handleTouchStart(e4), this.cancel(e4);
            }), { passive: true })), this.register((0, r.addDisposableDomListener)(t3, "touchmove", ((e4) => {
              if (!this.coreMouseService.areMouseEventsActive) return this.viewport.handleTouchMove(e4) ? void 0 : this.cancel(e4);
            }), { passive: false }));
          }
          refresh(e3, t3) {
            var i3;
            null === (i3 = this._renderService) || void 0 === i3 || i3.refreshRows(e3, t3);
          }
          updateCursorStyle(e3) {
            var t3;
            (null === (t3 = this._selectionService) || void 0 === t3 ? void 0 : t3.shouldColumnSelect(e3)) ? this.element.classList.add("column-select") : this.element.classList.remove("column-select");
          }
          _showCursor() {
            this.coreService.isCursorInitialized || (this.coreService.isCursorInitialized = true, this.refresh(this.buffer.y, this.buffer.y));
          }
          scrollLines(e3, t3, i3 = 0) {
            var s3;
            1 === i3 ? (super.scrollLines(e3, t3, i3), this.refresh(0, this.rows - 1)) : null === (s3 = this.viewport) || void 0 === s3 || s3.scrollLines(e3);
          }
          paste(e3) {
            (0, s2.paste)(e3, this.textarea, this.coreService, this.optionsService);
          }
          attachCustomKeyEventHandler(e3) {
            this._customKeyEventHandler = e3;
          }
          registerLinkProvider(e3) {
            return this.linkifier2.registerLinkProvider(e3);
          }
          registerCharacterJoiner(e3) {
            if (!this._characterJoinerService) throw new Error("Terminal must be opened first");
            const t3 = this._characterJoinerService.register(e3);
            return this.refresh(0, this.rows - 1), t3;
          }
          deregisterCharacterJoiner(e3) {
            if (!this._characterJoinerService) throw new Error("Terminal must be opened first");
            this._characterJoinerService.deregister(e3) && this.refresh(0, this.rows - 1);
          }
          get markers() {
            return this.buffer.markers;
          }
          registerMarker(e3) {
            return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + e3);
          }
          registerDecoration(e3) {
            return this._decorationService.registerDecoration(e3);
          }
          hasSelection() {
            return !!this._selectionService && this._selectionService.hasSelection;
          }
          select(e3, t3, i3) {
            this._selectionService.setSelection(e3, t3, i3);
          }
          getSelection() {
            return this._selectionService ? this._selectionService.selectionText : "";
          }
          getSelectionPosition() {
            if (this._selectionService && this._selectionService.hasSelection) return { start: { x: this._selectionService.selectionStart[0], y: this._selectionService.selectionStart[1] }, end: { x: this._selectionService.selectionEnd[0], y: this._selectionService.selectionEnd[1] } };
          }
          clearSelection() {
            var e3;
            null === (e3 = this._selectionService) || void 0 === e3 || e3.clearSelection();
          }
          selectAll() {
            var e3;
            null === (e3 = this._selectionService) || void 0 === e3 || e3.selectAll();
          }
          selectLines(e3, t3) {
            var i3;
            null === (i3 = this._selectionService) || void 0 === i3 || i3.selectLines(e3, t3);
          }
          _keyDown(e3) {
            if (this._keyDownHandled = false, this._keyDownSeen = true, this._customKeyEventHandler && false === this._customKeyEventHandler(e3)) return false;
            const t3 = this.browser.isMac && this.options.macOptionIsMeta && e3.altKey;
            if (!t3 && !this._compositionHelper.keydown(e3)) return this.options.scrollOnUserInput && this.buffer.ybase !== this.buffer.ydisp && this.scrollToBottom(), false;
            t3 || "Dead" !== e3.key && "AltGraph" !== e3.key || (this._unprocessedDeadKey = true);
            const i3 = (0, R.evaluateKeyboardEvent)(e3, this.coreService.decPrivateModes.applicationCursorKeys, this.browser.isMac, this.options.macOptionIsMeta);
            if (this.updateCursorStyle(e3), 3 === i3.type || 2 === i3.type) {
              const t4 = this.rows - 1;
              return this.scrollLines(2 === i3.type ? -t4 : t4), this.cancel(e3, true);
            }
            return 1 === i3.type && this.selectAll(), !!this._isThirdLevelShift(this.browser, e3) || (i3.cancel && this.cancel(e3, true), !i3.key || !!(e3.key && !e3.ctrlKey && !e3.altKey && !e3.metaKey && 1 === e3.key.length && e3.key.charCodeAt(0) >= 65 && e3.key.charCodeAt(0) <= 90) || (this._unprocessedDeadKey ? (this._unprocessedDeadKey = false, true) : (i3.key !== D.C0.ETX && i3.key !== D.C0.CR || (this.textarea.value = ""), this._onKey.fire({ key: i3.key, domEvent: e3 }), this._showCursor(), this.coreService.triggerDataEvent(i3.key, true), !this.optionsService.rawOptions.screenReaderMode || e3.altKey || e3.ctrlKey ? this.cancel(e3, true) : void (this._keyDownHandled = true))));
          }
          _isThirdLevelShift(e3, t3) {
            const i3 = e3.isMac && !this.options.macOptionIsMeta && t3.altKey && !t3.ctrlKey && !t3.metaKey || e3.isWindows && t3.altKey && t3.ctrlKey && !t3.metaKey || e3.isWindows && t3.getModifierState("AltGraph");
            return "keypress" === t3.type ? i3 : i3 && (!t3.keyCode || t3.keyCode > 47);
          }
          _keyUp(e3) {
            this._keyDownSeen = false, this._customKeyEventHandler && false === this._customKeyEventHandler(e3) || ((function(e4) {
              return 16 === e4.keyCode || 17 === e4.keyCode || 18 === e4.keyCode;
            })(e3) || this.focus(), this.updateCursorStyle(e3), this._keyPressHandled = false);
          }
          _keyPress(e3) {
            let t3;
            if (this._keyPressHandled = false, this._keyDownHandled) return false;
            if (this._customKeyEventHandler && false === this._customKeyEventHandler(e3)) return false;
            if (this.cancel(e3), e3.charCode) t3 = e3.charCode;
            else if (null === e3.which || void 0 === e3.which) t3 = e3.keyCode;
            else {
              if (0 === e3.which || 0 === e3.charCode) return false;
              t3 = e3.which;
            }
            return !(!t3 || (e3.altKey || e3.ctrlKey || e3.metaKey) && !this._isThirdLevelShift(this.browser, e3) || (t3 = String.fromCharCode(t3), this._onKey.fire({ key: t3, domEvent: e3 }), this._showCursor(), this.coreService.triggerDataEvent(t3, true), this._keyPressHandled = true, this._unprocessedDeadKey = false, 0));
          }
          _inputEvent(e3) {
            if (e3.data && "insertText" === e3.inputType && (!e3.composed || !this._keyDownSeen) && !this.optionsService.rawOptions.screenReaderMode) {
              if (this._keyPressHandled) return false;
              this._unprocessedDeadKey = false;
              const t3 = e3.data;
              return this.coreService.triggerDataEvent(t3, true), this.cancel(e3), true;
            }
            return false;
          }
          resize(e3, t3) {
            e3 !== this.cols || t3 !== this.rows ? super.resize(e3, t3) : this._charSizeService && !this._charSizeService.hasValidSize && this._charSizeService.measure();
          }
          _afterResize(e3, t3) {
            var i3, s3;
            null === (i3 = this._charSizeService) || void 0 === i3 || i3.measure(), null === (s3 = this.viewport) || void 0 === s3 || s3.syncScrollArea(true);
          }
          clear() {
            var e3;
            if (0 !== this.buffer.ybase || 0 !== this.buffer.y) {
              this.buffer.clearAllMarkers(), this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y)), this.buffer.lines.length = 1, this.buffer.ydisp = 0, this.buffer.ybase = 0, this.buffer.y = 0;
              for (let e4 = 1; e4 < this.rows; e4++) this.buffer.lines.push(this.buffer.getBlankLine(L.DEFAULT_ATTR_DATA));
              this._onScroll.fire({ position: this.buffer.ydisp, source: 0 }), null === (e3 = this.viewport) || void 0 === e3 || e3.reset(), this.refresh(0, this.rows - 1);
            }
          }
          reset() {
            var e3, t3;
            this.options.rows = this.rows, this.options.cols = this.cols;
            const i3 = this._customKeyEventHandler;
            this._setup(), super.reset(), null === (e3 = this._selectionService) || void 0 === e3 || e3.reset(), this._decorationService.reset(), null === (t3 = this.viewport) || void 0 === t3 || t3.reset(), this._customKeyEventHandler = i3, this.refresh(0, this.rows - 1);
          }
          clearTextureAtlas() {
            var e3;
            null === (e3 = this._renderService) || void 0 === e3 || e3.clearTextureAtlas();
          }
          _reportFocus() {
            var e3;
            (null === (e3 = this.element) || void 0 === e3 ? void 0 : e3.classList.contains("focus")) ? this.coreService.triggerDataEvent(D.C0.ESC + "[I") : this.coreService.triggerDataEvent(D.C0.ESC + "[O");
          }
          _reportWindowsOptions(e3) {
            if (this._renderService) switch (e3) {
              case T.WindowsOptionsReportType.GET_WIN_SIZE_PIXELS:
                const e4 = this._renderService.dimensions.css.canvas.width.toFixed(0), t3 = this._renderService.dimensions.css.canvas.height.toFixed(0);
                this.coreService.triggerDataEvent(`${D.C0.ESC}[4;${t3};${e4}t`);
                break;
              case T.WindowsOptionsReportType.GET_CELL_SIZE_PIXELS:
                const i3 = this._renderService.dimensions.css.cell.width.toFixed(0), s3 = this._renderService.dimensions.css.cell.height.toFixed(0);
                this.coreService.triggerDataEvent(`${D.C0.ESC}[6;${s3};${i3}t`);
            }
          }
          cancel(e3, t3) {
            if (this.options.cancelEvents || t3) return e3.preventDefault(), e3.stopPropagation(), false;
          }
        }
        t2.Terminal = P;
      }, 9924: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.TimeBasedDebouncer = void 0, t2.TimeBasedDebouncer = class {
          constructor(e3, t3 = 1e3) {
            this._renderCallback = e3, this._debounceThresholdMS = t3, this._lastRefreshMs = 0, this._additionalRefreshRequested = false;
          }
          dispose() {
            this._refreshTimeoutID && clearTimeout(this._refreshTimeoutID);
          }
          refresh(e3, t3, i2) {
            this._rowCount = i2, e3 = void 0 !== e3 ? e3 : 0, t3 = void 0 !== t3 ? t3 : this._rowCount - 1, this._rowStart = void 0 !== this._rowStart ? Math.min(this._rowStart, e3) : e3, this._rowEnd = void 0 !== this._rowEnd ? Math.max(this._rowEnd, t3) : t3;
            const s2 = Date.now();
            if (s2 - this._lastRefreshMs >= this._debounceThresholdMS) this._lastRefreshMs = s2, this._innerRefresh();
            else if (!this._additionalRefreshRequested) {
              const e4 = s2 - this._lastRefreshMs, t4 = this._debounceThresholdMS - e4;
              this._additionalRefreshRequested = true, this._refreshTimeoutID = window.setTimeout((() => {
                this._lastRefreshMs = Date.now(), this._innerRefresh(), this._additionalRefreshRequested = false, this._refreshTimeoutID = void 0;
              }), t4);
            }
          }
          _innerRefresh() {
            if (void 0 === this._rowStart || void 0 === this._rowEnd || void 0 === this._rowCount) return;
            const e3 = Math.max(this._rowStart, 0), t3 = Math.min(this._rowEnd, this._rowCount - 1);
            this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(e3, t3);
          }
        };
      }, 1680: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Viewport = void 0;
        const n = i2(3656), o = i2(4725), a = i2(8460), h2 = i2(844), c = i2(2585);
        let l = t2.Viewport = class extends h2.Disposable {
          constructor(e3, t3, i3, s3, r2, o2, h3, c2) {
            super(), this._viewportElement = e3, this._scrollArea = t3, this._bufferService = i3, this._optionsService = s3, this._charSizeService = r2, this._renderService = o2, this._coreBrowserService = h3, this.scrollBarWidth = 0, this._currentRowHeight = 0, this._currentDeviceCellHeight = 0, this._lastRecordedBufferLength = 0, this._lastRecordedViewportHeight = 0, this._lastRecordedBufferHeight = 0, this._lastTouchY = 0, this._lastScrollTop = 0, this._wheelPartialScroll = 0, this._refreshAnimationFrame = null, this._ignoreNextScrollEvent = false, this._smoothScrollState = { startTime: 0, origin: -1, target: -1 }, this._onRequestScrollLines = this.register(new a.EventEmitter()), this.onRequestScrollLines = this._onRequestScrollLines.event, this.scrollBarWidth = this._viewportElement.offsetWidth - this._scrollArea.offsetWidth || 15, this.register((0, n.addDisposableDomListener)(this._viewportElement, "scroll", this._handleScroll.bind(this))), this._activeBuffer = this._bufferService.buffer, this.register(this._bufferService.buffers.onBufferActivate(((e4) => this._activeBuffer = e4.activeBuffer))), this._renderDimensions = this._renderService.dimensions, this.register(this._renderService.onDimensionsChange(((e4) => this._renderDimensions = e4))), this._handleThemeChange(c2.colors), this.register(c2.onChangeColors(((e4) => this._handleThemeChange(e4)))), this.register(this._optionsService.onSpecificOptionChange("scrollback", (() => this.syncScrollArea()))), setTimeout((() => this.syncScrollArea()));
          }
          _handleThemeChange(e3) {
            this._viewportElement.style.backgroundColor = e3.background.css;
          }
          reset() {
            this._currentRowHeight = 0, this._currentDeviceCellHeight = 0, this._lastRecordedBufferLength = 0, this._lastRecordedViewportHeight = 0, this._lastRecordedBufferHeight = 0, this._lastTouchY = 0, this._lastScrollTop = 0, this._coreBrowserService.window.requestAnimationFrame((() => this.syncScrollArea()));
          }
          _refresh(e3) {
            if (e3) return this._innerRefresh(), void (null !== this._refreshAnimationFrame && this._coreBrowserService.window.cancelAnimationFrame(this._refreshAnimationFrame));
            null === this._refreshAnimationFrame && (this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame((() => this._innerRefresh())));
          }
          _innerRefresh() {
            if (this._charSizeService.height > 0) {
              this._currentRowHeight = this._renderService.dimensions.device.cell.height / this._coreBrowserService.dpr, this._currentDeviceCellHeight = this._renderService.dimensions.device.cell.height, this._lastRecordedViewportHeight = this._viewportElement.offsetHeight;
              const e4 = Math.round(this._currentRowHeight * this._lastRecordedBufferLength) + (this._lastRecordedViewportHeight - this._renderService.dimensions.css.canvas.height);
              this._lastRecordedBufferHeight !== e4 && (this._lastRecordedBufferHeight = e4, this._scrollArea.style.height = this._lastRecordedBufferHeight + "px");
            }
            const e3 = this._bufferService.buffer.ydisp * this._currentRowHeight;
            this._viewportElement.scrollTop !== e3 && (this._ignoreNextScrollEvent = true, this._viewportElement.scrollTop = e3), this._refreshAnimationFrame = null;
          }
          syncScrollArea(e3 = false) {
            if (this._lastRecordedBufferLength !== this._bufferService.buffer.lines.length) return this._lastRecordedBufferLength = this._bufferService.buffer.lines.length, void this._refresh(e3);
            this._lastRecordedViewportHeight === this._renderService.dimensions.css.canvas.height && this._lastScrollTop === this._activeBuffer.ydisp * this._currentRowHeight && this._renderDimensions.device.cell.height === this._currentDeviceCellHeight || this._refresh(e3);
          }
          _handleScroll(e3) {
            if (this._lastScrollTop = this._viewportElement.scrollTop, !this._viewportElement.offsetParent) return;
            if (this._ignoreNextScrollEvent) return this._ignoreNextScrollEvent = false, void this._onRequestScrollLines.fire({ amount: 0, suppressScrollEvent: true });
            const t3 = Math.round(this._lastScrollTop / this._currentRowHeight) - this._bufferService.buffer.ydisp;
            this._onRequestScrollLines.fire({ amount: t3, suppressScrollEvent: true });
          }
          _smoothScroll() {
            if (this._isDisposed || -1 === this._smoothScrollState.origin || -1 === this._smoothScrollState.target) return;
            const e3 = this._smoothScrollPercent();
            this._viewportElement.scrollTop = this._smoothScrollState.origin + Math.round(e3 * (this._smoothScrollState.target - this._smoothScrollState.origin)), e3 < 1 ? this._coreBrowserService.window.requestAnimationFrame((() => this._smoothScroll())) : this._clearSmoothScrollState();
          }
          _smoothScrollPercent() {
            return this._optionsService.rawOptions.smoothScrollDuration && this._smoothScrollState.startTime ? Math.max(Math.min((Date.now() - this._smoothScrollState.startTime) / this._optionsService.rawOptions.smoothScrollDuration, 1), 0) : 1;
          }
          _clearSmoothScrollState() {
            this._smoothScrollState.startTime = 0, this._smoothScrollState.origin = -1, this._smoothScrollState.target = -1;
          }
          _bubbleScroll(e3, t3) {
            const i3 = this._viewportElement.scrollTop + this._lastRecordedViewportHeight;
            return !(t3 < 0 && 0 !== this._viewportElement.scrollTop || t3 > 0 && i3 < this._lastRecordedBufferHeight) || (e3.cancelable && e3.preventDefault(), false);
          }
          handleWheel(e3) {
            const t3 = this._getPixelsScrolled(e3);
            return 0 !== t3 && (this._optionsService.rawOptions.smoothScrollDuration ? (this._smoothScrollState.startTime = Date.now(), this._smoothScrollPercent() < 1 ? (this._smoothScrollState.origin = this._viewportElement.scrollTop, -1 === this._smoothScrollState.target ? this._smoothScrollState.target = this._viewportElement.scrollTop + t3 : this._smoothScrollState.target += t3, this._smoothScrollState.target = Math.max(Math.min(this._smoothScrollState.target, this._viewportElement.scrollHeight), 0), this._smoothScroll()) : this._clearSmoothScrollState()) : this._viewportElement.scrollTop += t3, this._bubbleScroll(e3, t3));
          }
          scrollLines(e3) {
            if (0 !== e3) if (this._optionsService.rawOptions.smoothScrollDuration) {
              const t3 = e3 * this._currentRowHeight;
              this._smoothScrollState.startTime = Date.now(), this._smoothScrollPercent() < 1 ? (this._smoothScrollState.origin = this._viewportElement.scrollTop, this._smoothScrollState.target = this._smoothScrollState.origin + t3, this._smoothScrollState.target = Math.max(Math.min(this._smoothScrollState.target, this._viewportElement.scrollHeight), 0), this._smoothScroll()) : this._clearSmoothScrollState();
            } else this._onRequestScrollLines.fire({ amount: e3, suppressScrollEvent: false });
          }
          _getPixelsScrolled(e3) {
            if (0 === e3.deltaY || e3.shiftKey) return 0;
            let t3 = this._applyScrollModifier(e3.deltaY, e3);
            return e3.deltaMode === WheelEvent.DOM_DELTA_LINE ? t3 *= this._currentRowHeight : e3.deltaMode === WheelEvent.DOM_DELTA_PAGE && (t3 *= this._currentRowHeight * this._bufferService.rows), t3;
          }
          getBufferElements(e3, t3) {
            var i3;
            let s3, r2 = "";
            const n2 = [], o2 = null != t3 ? t3 : this._bufferService.buffer.lines.length, a2 = this._bufferService.buffer.lines;
            for (let t4 = e3; t4 < o2; t4++) {
              const e4 = a2.get(t4);
              if (!e4) continue;
              const o3 = null === (i3 = a2.get(t4 + 1)) || void 0 === i3 ? void 0 : i3.isWrapped;
              if (r2 += e4.translateToString(!o3), !o3 || t4 === a2.length - 1) {
                const e5 = document.createElement("div");
                e5.textContent = r2, n2.push(e5), r2.length > 0 && (s3 = e5), r2 = "";
              }
            }
            return { bufferElements: n2, cursorElement: s3 };
          }
          getLinesScrolled(e3) {
            if (0 === e3.deltaY || e3.shiftKey) return 0;
            let t3 = this._applyScrollModifier(e3.deltaY, e3);
            return e3.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? (t3 /= this._currentRowHeight + 0, this._wheelPartialScroll += t3, t3 = Math.floor(Math.abs(this._wheelPartialScroll)) * (this._wheelPartialScroll > 0 ? 1 : -1), this._wheelPartialScroll %= 1) : e3.deltaMode === WheelEvent.DOM_DELTA_PAGE && (t3 *= this._bufferService.rows), t3;
          }
          _applyScrollModifier(e3, t3) {
            const i3 = this._optionsService.rawOptions.fastScrollModifier;
            return "alt" === i3 && t3.altKey || "ctrl" === i3 && t3.ctrlKey || "shift" === i3 && t3.shiftKey ? e3 * this._optionsService.rawOptions.fastScrollSensitivity * this._optionsService.rawOptions.scrollSensitivity : e3 * this._optionsService.rawOptions.scrollSensitivity;
          }
          handleTouchStart(e3) {
            this._lastTouchY = e3.touches[0].pageY;
          }
          handleTouchMove(e3) {
            const t3 = this._lastTouchY - e3.touches[0].pageY;
            return this._lastTouchY = e3.touches[0].pageY, 0 !== t3 && (this._viewportElement.scrollTop += t3, this._bubbleScroll(e3, t3));
          }
        };
        t2.Viewport = l = s2([r(2, c.IBufferService), r(3, c.IOptionsService), r(4, o.ICharSizeService), r(5, o.IRenderService), r(6, o.ICoreBrowserService), r(7, o.IThemeService)], l);
      }, 3107: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferDecorationRenderer = void 0;
        const n = i2(3656), o = i2(4725), a = i2(844), h2 = i2(2585);
        let c = t2.BufferDecorationRenderer = class extends a.Disposable {
          constructor(e3, t3, i3, s3) {
            super(), this._screenElement = e3, this._bufferService = t3, this._decorationService = i3, this._renderService = s3, this._decorationElements = /* @__PURE__ */ new Map(), this._altBufferIsActive = false, this._dimensionsChanged = false, this._container = document.createElement("div"), this._container.classList.add("xterm-decoration-container"), this._screenElement.appendChild(this._container), this.register(this._renderService.onRenderedViewportChange((() => this._doRefreshDecorations()))), this.register(this._renderService.onDimensionsChange((() => {
              this._dimensionsChanged = true, this._queueRefresh();
            }))), this.register((0, n.addDisposableDomListener)(window, "resize", (() => this._queueRefresh()))), this.register(this._bufferService.buffers.onBufferActivate((() => {
              this._altBufferIsActive = this._bufferService.buffer === this._bufferService.buffers.alt;
            }))), this.register(this._decorationService.onDecorationRegistered((() => this._queueRefresh()))), this.register(this._decorationService.onDecorationRemoved(((e4) => this._removeDecoration(e4)))), this.register((0, a.toDisposable)((() => {
              this._container.remove(), this._decorationElements.clear();
            })));
          }
          _queueRefresh() {
            void 0 === this._animationFrame && (this._animationFrame = this._renderService.addRefreshCallback((() => {
              this._doRefreshDecorations(), this._animationFrame = void 0;
            })));
          }
          _doRefreshDecorations() {
            for (const e3 of this._decorationService.decorations) this._renderDecoration(e3);
            this._dimensionsChanged = false;
          }
          _renderDecoration(e3) {
            this._refreshStyle(e3), this._dimensionsChanged && this._refreshXPosition(e3);
          }
          _createElement(e3) {
            var t3, i3;
            const s3 = document.createElement("div");
            s3.classList.add("xterm-decoration"), s3.classList.toggle("xterm-decoration-top-layer", "top" === (null === (t3 = null == e3 ? void 0 : e3.options) || void 0 === t3 ? void 0 : t3.layer)), s3.style.width = `${Math.round((e3.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`, s3.style.height = (e3.options.height || 1) * this._renderService.dimensions.css.cell.height + "px", s3.style.top = (e3.marker.line - this._bufferService.buffers.active.ydisp) * this._renderService.dimensions.css.cell.height + "px", s3.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`;
            const r2 = null !== (i3 = e3.options.x) && void 0 !== i3 ? i3 : 0;
            return r2 && r2 > this._bufferService.cols && (s3.style.display = "none"), this._refreshXPosition(e3, s3), s3;
          }
          _refreshStyle(e3) {
            const t3 = e3.marker.line - this._bufferService.buffers.active.ydisp;
            if (t3 < 0 || t3 >= this._bufferService.rows) e3.element && (e3.element.style.display = "none", e3.onRenderEmitter.fire(e3.element));
            else {
              let i3 = this._decorationElements.get(e3);
              i3 || (i3 = this._createElement(e3), e3.element = i3, this._decorationElements.set(e3, i3), this._container.appendChild(i3), e3.onDispose((() => {
                this._decorationElements.delete(e3), i3.remove();
              }))), i3.style.top = t3 * this._renderService.dimensions.css.cell.height + "px", i3.style.display = this._altBufferIsActive ? "none" : "block", e3.onRenderEmitter.fire(i3);
            }
          }
          _refreshXPosition(e3, t3 = e3.element) {
            var i3;
            if (!t3) return;
            const s3 = null !== (i3 = e3.options.x) && void 0 !== i3 ? i3 : 0;
            "right" === (e3.options.anchor || "left") ? t3.style.right = s3 ? s3 * this._renderService.dimensions.css.cell.width + "px" : "" : t3.style.left = s3 ? s3 * this._renderService.dimensions.css.cell.width + "px" : "";
          }
          _removeDecoration(e3) {
            var t3;
            null === (t3 = this._decorationElements.get(e3)) || void 0 === t3 || t3.remove(), this._decorationElements.delete(e3), e3.dispose();
          }
        };
        t2.BufferDecorationRenderer = c = s2([r(1, h2.IBufferService), r(2, h2.IDecorationService), r(3, o.IRenderService)], c);
      }, 5871: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ColorZoneStore = void 0, t2.ColorZoneStore = class {
          constructor() {
            this._zones = [], this._zonePool = [], this._zonePoolIndex = 0, this._linePadding = { full: 0, left: 0, center: 0, right: 0 };
          }
          get zones() {
            return this._zonePool.length = Math.min(this._zonePool.length, this._zones.length), this._zones;
          }
          clear() {
            this._zones.length = 0, this._zonePoolIndex = 0;
          }
          addDecoration(e3) {
            if (e3.options.overviewRulerOptions) {
              for (const t3 of this._zones) if (t3.color === e3.options.overviewRulerOptions.color && t3.position === e3.options.overviewRulerOptions.position) {
                if (this._lineIntersectsZone(t3, e3.marker.line)) return;
                if (this._lineAdjacentToZone(t3, e3.marker.line, e3.options.overviewRulerOptions.position)) return void this._addLineToZone(t3, e3.marker.line);
              }
              if (this._zonePoolIndex < this._zonePool.length) return this._zonePool[this._zonePoolIndex].color = e3.options.overviewRulerOptions.color, this._zonePool[this._zonePoolIndex].position = e3.options.overviewRulerOptions.position, this._zonePool[this._zonePoolIndex].startBufferLine = e3.marker.line, this._zonePool[this._zonePoolIndex].endBufferLine = e3.marker.line, void this._zones.push(this._zonePool[this._zonePoolIndex++]);
              this._zones.push({ color: e3.options.overviewRulerOptions.color, position: e3.options.overviewRulerOptions.position, startBufferLine: e3.marker.line, endBufferLine: e3.marker.line }), this._zonePool.push(this._zones[this._zones.length - 1]), this._zonePoolIndex++;
            }
          }
          setPadding(e3) {
            this._linePadding = e3;
          }
          _lineIntersectsZone(e3, t3) {
            return t3 >= e3.startBufferLine && t3 <= e3.endBufferLine;
          }
          _lineAdjacentToZone(e3, t3, i2) {
            return t3 >= e3.startBufferLine - this._linePadding[i2 || "full"] && t3 <= e3.endBufferLine + this._linePadding[i2 || "full"];
          }
          _addLineToZone(e3, t3) {
            e3.startBufferLine = Math.min(e3.startBufferLine, t3), e3.endBufferLine = Math.max(e3.endBufferLine, t3);
          }
        };
      }, 5744: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OverviewRulerRenderer = void 0;
        const n = i2(5871), o = i2(3656), a = i2(4725), h2 = i2(844), c = i2(2585), l = { full: 0, left: 0, center: 0, right: 0 }, d = { full: 0, left: 0, center: 0, right: 0 }, _ = { full: 0, left: 0, center: 0, right: 0 };
        let u = t2.OverviewRulerRenderer = class extends h2.Disposable {
          get _width() {
            return this._optionsService.options.overviewRulerWidth || 0;
          }
          constructor(e3, t3, i3, s3, r2, o2, a2) {
            var c2;
            super(), this._viewportElement = e3, this._screenElement = t3, this._bufferService = i3, this._decorationService = s3, this._renderService = r2, this._optionsService = o2, this._coreBrowseService = a2, this._colorZoneStore = new n.ColorZoneStore(), this._shouldUpdateDimensions = true, this._shouldUpdateAnchor = true, this._lastKnownBufferLength = 0, this._canvas = document.createElement("canvas"), this._canvas.classList.add("xterm-decoration-overview-ruler"), this._refreshCanvasDimensions(), null === (c2 = this._viewportElement.parentElement) || void 0 === c2 || c2.insertBefore(this._canvas, this._viewportElement);
            const l2 = this._canvas.getContext("2d");
            if (!l2) throw new Error("Ctx cannot be null");
            this._ctx = l2, this._registerDecorationListeners(), this._registerBufferChangeListeners(), this._registerDimensionChangeListeners(), this.register((0, h2.toDisposable)((() => {
              var e4;
              null === (e4 = this._canvas) || void 0 === e4 || e4.remove();
            })));
          }
          _registerDecorationListeners() {
            this.register(this._decorationService.onDecorationRegistered((() => this._queueRefresh(void 0, true)))), this.register(this._decorationService.onDecorationRemoved((() => this._queueRefresh(void 0, true))));
          }
          _registerBufferChangeListeners() {
            this.register(this._renderService.onRenderedViewportChange((() => this._queueRefresh()))), this.register(this._bufferService.buffers.onBufferActivate((() => {
              this._canvas.style.display = this._bufferService.buffer === this._bufferService.buffers.alt ? "none" : "block";
            }))), this.register(this._bufferService.onScroll((() => {
              this._lastKnownBufferLength !== this._bufferService.buffers.normal.lines.length && (this._refreshDrawHeightConstants(), this._refreshColorZonePadding());
            })));
          }
          _registerDimensionChangeListeners() {
            this.register(this._renderService.onRender((() => {
              this._containerHeight && this._containerHeight === this._screenElement.clientHeight || (this._queueRefresh(true), this._containerHeight = this._screenElement.clientHeight);
            }))), this.register(this._optionsService.onSpecificOptionChange("overviewRulerWidth", (() => this._queueRefresh(true)))), this.register((0, o.addDisposableDomListener)(this._coreBrowseService.window, "resize", (() => this._queueRefresh(true)))), this._queueRefresh(true);
          }
          _refreshDrawConstants() {
            const e3 = Math.floor(this._canvas.width / 3), t3 = Math.ceil(this._canvas.width / 3);
            d.full = this._canvas.width, d.left = e3, d.center = t3, d.right = e3, this._refreshDrawHeightConstants(), _.full = 0, _.left = 0, _.center = d.left, _.right = d.left + d.center;
          }
          _refreshDrawHeightConstants() {
            l.full = Math.round(2 * this._coreBrowseService.dpr);
            const e3 = this._canvas.height / this._bufferService.buffer.lines.length, t3 = Math.round(Math.max(Math.min(e3, 12), 6) * this._coreBrowseService.dpr);
            l.left = t3, l.center = t3, l.right = t3;
          }
          _refreshColorZonePadding() {
            this._colorZoneStore.setPadding({ full: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * l.full), left: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * l.left), center: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * l.center), right: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * l.right) }), this._lastKnownBufferLength = this._bufferService.buffers.normal.lines.length;
          }
          _refreshCanvasDimensions() {
            this._canvas.style.width = `${this._width}px`, this._canvas.width = Math.round(this._width * this._coreBrowseService.dpr), this._canvas.style.height = `${this._screenElement.clientHeight}px`, this._canvas.height = Math.round(this._screenElement.clientHeight * this._coreBrowseService.dpr), this._refreshDrawConstants(), this._refreshColorZonePadding();
          }
          _refreshDecorations() {
            this._shouldUpdateDimensions && this._refreshCanvasDimensions(), this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height), this._colorZoneStore.clear();
            for (const e4 of this._decorationService.decorations) this._colorZoneStore.addDecoration(e4);
            this._ctx.lineWidth = 1;
            const e3 = this._colorZoneStore.zones;
            for (const t3 of e3) "full" !== t3.position && this._renderColorZone(t3);
            for (const t3 of e3) "full" === t3.position && this._renderColorZone(t3);
            this._shouldUpdateDimensions = false, this._shouldUpdateAnchor = false;
          }
          _renderColorZone(e3) {
            this._ctx.fillStyle = e3.color, this._ctx.fillRect(_[e3.position || "full"], Math.round((this._canvas.height - 1) * (e3.startBufferLine / this._bufferService.buffers.active.lines.length) - l[e3.position || "full"] / 2), d[e3.position || "full"], Math.round((this._canvas.height - 1) * ((e3.endBufferLine - e3.startBufferLine) / this._bufferService.buffers.active.lines.length) + l[e3.position || "full"]));
          }
          _queueRefresh(e3, t3) {
            this._shouldUpdateDimensions = e3 || this._shouldUpdateDimensions, this._shouldUpdateAnchor = t3 || this._shouldUpdateAnchor, void 0 === this._animationFrame && (this._animationFrame = this._coreBrowseService.window.requestAnimationFrame((() => {
              this._refreshDecorations(), this._animationFrame = void 0;
            })));
          }
        };
        t2.OverviewRulerRenderer = u = s2([r(2, c.IBufferService), r(3, c.IDecorationService), r(4, a.IRenderService), r(5, c.IOptionsService), r(6, a.ICoreBrowserService)], u);
      }, 2950: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CompositionHelper = void 0;
        const n = i2(4725), o = i2(2585), a = i2(2584);
        let h2 = t2.CompositionHelper = class {
          get isComposing() {
            return this._isComposing;
          }
          constructor(e3, t3, i3, s3, r2, n2) {
            this._textarea = e3, this._compositionView = t3, this._bufferService = i3, this._optionsService = s3, this._coreService = r2, this._renderService = n2, this._isComposing = false, this._isSendingComposition = false, this._compositionPosition = { start: 0, end: 0 }, this._dataAlreadySent = "";
          }
          compositionstart() {
            this._isComposing = true, this._compositionPosition.start = this._textarea.value.length, this._compositionView.textContent = "", this._dataAlreadySent = "", this._compositionView.classList.add("active");
          }
          compositionupdate(e3) {
            this._compositionView.textContent = e3.data, this.updateCompositionElements(), setTimeout((() => {
              this._compositionPosition.end = this._textarea.value.length;
            }), 0);
          }
          compositionend() {
            this._finalizeComposition(true);
          }
          keydown(e3) {
            if (this._isComposing || this._isSendingComposition) {
              if (229 === e3.keyCode) return false;
              if (16 === e3.keyCode || 17 === e3.keyCode || 18 === e3.keyCode) return false;
              this._finalizeComposition(false);
            }
            return 229 !== e3.keyCode || (this._handleAnyTextareaChanges(), false);
          }
          _finalizeComposition(e3) {
            if (this._compositionView.classList.remove("active"), this._isComposing = false, e3) {
              const e4 = { start: this._compositionPosition.start, end: this._compositionPosition.end };
              this._isSendingComposition = true, setTimeout((() => {
                if (this._isSendingComposition) {
                  let t3;
                  this._isSendingComposition = false, e4.start += this._dataAlreadySent.length, t3 = this._isComposing ? this._textarea.value.substring(e4.start, e4.end) : this._textarea.value.substring(e4.start), t3.length > 0 && this._coreService.triggerDataEvent(t3, true);
                }
              }), 0);
            } else {
              this._isSendingComposition = false;
              const e4 = this._textarea.value.substring(this._compositionPosition.start, this._compositionPosition.end);
              this._coreService.triggerDataEvent(e4, true);
            }
          }
          _handleAnyTextareaChanges() {
            const e3 = this._textarea.value;
            setTimeout((() => {
              if (!this._isComposing) {
                const t3 = this._textarea.value, i3 = t3.replace(e3, "");
                this._dataAlreadySent = i3, t3.length > e3.length ? this._coreService.triggerDataEvent(i3, true) : t3.length < e3.length ? this._coreService.triggerDataEvent(`${a.C0.DEL}`, true) : t3.length === e3.length && t3 !== e3 && this._coreService.triggerDataEvent(t3, true);
              }
            }), 0);
          }
          updateCompositionElements(e3) {
            if (this._isComposing) {
              if (this._bufferService.buffer.isCursorInViewport) {
                const e4 = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1), t3 = this._renderService.dimensions.css.cell.height, i3 = this._bufferService.buffer.y * this._renderService.dimensions.css.cell.height, s3 = e4 * this._renderService.dimensions.css.cell.width;
                this._compositionView.style.left = s3 + "px", this._compositionView.style.top = i3 + "px", this._compositionView.style.height = t3 + "px", this._compositionView.style.lineHeight = t3 + "px", this._compositionView.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._compositionView.style.fontSize = this._optionsService.rawOptions.fontSize + "px";
                const r2 = this._compositionView.getBoundingClientRect();
                this._textarea.style.left = s3 + "px", this._textarea.style.top = i3 + "px", this._textarea.style.width = Math.max(r2.width, 1) + "px", this._textarea.style.height = Math.max(r2.height, 1) + "px", this._textarea.style.lineHeight = r2.height + "px";
              }
              e3 || setTimeout((() => this.updateCompositionElements(true)), 0);
            }
          }
        };
        t2.CompositionHelper = h2 = s2([r(2, o.IBufferService), r(3, o.IOptionsService), r(4, o.ICoreService), r(5, n.IRenderService)], h2);
      }, 9806: (e2, t2) => {
        function i2(e3, t3, i3) {
          const s2 = i3.getBoundingClientRect(), r = e3.getComputedStyle(i3), n = parseInt(r.getPropertyValue("padding-left")), o = parseInt(r.getPropertyValue("padding-top"));
          return [t3.clientX - s2.left - n, t3.clientY - s2.top - o];
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.getCoords = t2.getCoordsRelativeToElement = void 0, t2.getCoordsRelativeToElement = i2, t2.getCoords = function(e3, t3, s2, r, n, o, a, h2, c) {
          if (!o) return;
          const l = i2(e3, t3, s2);
          return l ? (l[0] = Math.ceil((l[0] + (c ? a / 2 : 0)) / a), l[1] = Math.ceil(l[1] / h2), l[0] = Math.min(Math.max(l[0], 1), r + (c ? 1 : 0)), l[1] = Math.min(Math.max(l[1], 1), n), l) : void 0;
        };
      }, 9504: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.moveToCellSequence = void 0;
        const s2 = i2(2584);
        function r(e3, t3, i3, s3) {
          const r2 = e3 - n(e3, i3), a2 = t3 - n(t3, i3), l = Math.abs(r2 - a2) - (function(e4, t4, i4) {
            let s4 = 0;
            const r3 = e4 - n(e4, i4), a3 = t4 - n(t4, i4);
            for (let n2 = 0; n2 < Math.abs(r3 - a3); n2++) {
              const a4 = "A" === o(e4, t4) ? -1 : 1, h3 = i4.buffer.lines.get(r3 + a4 * n2);
              (null == h3 ? void 0 : h3.isWrapped) && s4++;
            }
            return s4;
          })(e3, t3, i3);
          return c(l, h2(o(e3, t3), s3));
        }
        function n(e3, t3) {
          let i3 = 0, s3 = t3.buffer.lines.get(e3), r2 = null == s3 ? void 0 : s3.isWrapped;
          for (; r2 && e3 >= 0 && e3 < t3.rows; ) i3++, s3 = t3.buffer.lines.get(--e3), r2 = null == s3 ? void 0 : s3.isWrapped;
          return i3;
        }
        function o(e3, t3) {
          return e3 > t3 ? "A" : "B";
        }
        function a(e3, t3, i3, s3, r2, n2) {
          let o2 = e3, a2 = t3, h3 = "";
          for (; o2 !== i3 || a2 !== s3; ) o2 += r2 ? 1 : -1, r2 && o2 > n2.cols - 1 ? (h3 += n2.buffer.translateBufferLineToString(a2, false, e3, o2), o2 = 0, e3 = 0, a2++) : !r2 && o2 < 0 && (h3 += n2.buffer.translateBufferLineToString(a2, false, 0, e3 + 1), o2 = n2.cols - 1, e3 = o2, a2--);
          return h3 + n2.buffer.translateBufferLineToString(a2, false, e3, o2);
        }
        function h2(e3, t3) {
          const i3 = t3 ? "O" : "[";
          return s2.C0.ESC + i3 + e3;
        }
        function c(e3, t3) {
          e3 = Math.floor(e3);
          let i3 = "";
          for (let s3 = 0; s3 < e3; s3++) i3 += t3;
          return i3;
        }
        t2.moveToCellSequence = function(e3, t3, i3, s3) {
          const o2 = i3.buffer.x, l = i3.buffer.y;
          if (!i3.buffer.hasScrollback) return (function(e4, t4, i4, s4, o3, l2) {
            return 0 === r(t4, s4, o3, l2).length ? "" : c(a(e4, t4, e4, t4 - n(t4, o3), false, o3).length, h2("D", l2));
          })(o2, l, 0, t3, i3, s3) + r(l, t3, i3, s3) + (function(e4, t4, i4, s4, o3, l2) {
            let d2;
            d2 = r(t4, s4, o3, l2).length > 0 ? s4 - n(s4, o3) : t4;
            const _2 = s4, u = (function(e5, t5, i5, s5, o4, a2) {
              let h3;
              return h3 = r(i5, s5, o4, a2).length > 0 ? s5 - n(s5, o4) : t5, e5 < i5 && h3 <= s5 || e5 >= i5 && h3 < s5 ? "C" : "D";
            })(e4, t4, i4, s4, o3, l2);
            return c(a(e4, d2, i4, _2, "C" === u, o3).length, h2(u, l2));
          })(o2, l, e3, t3, i3, s3);
          let d;
          if (l === t3) return d = o2 > e3 ? "D" : "C", c(Math.abs(o2 - e3), h2(d, s3));
          d = l > t3 ? "D" : "C";
          const _ = Math.abs(l - t3);
          return c((function(e4, t4) {
            return t4.cols - e4;
          })(l > t3 ? e3 : o2, i3) + (_ - 1) * i3.cols + 1 + ((l > t3 ? o2 : e3) - 1), h2(d, s3));
        };
      }, 1296: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DomRenderer = void 0;
        const n = i2(3787), o = i2(2550), a = i2(2223), h2 = i2(6171), c = i2(4725), l = i2(8055), d = i2(8460), _ = i2(844), u = i2(2585), f = "xterm-dom-renderer-owner-", v = "xterm-rows", p = "xterm-fg-", g = "xterm-bg-", m = "xterm-focus", S = "xterm-selection";
        let C = 1, b = t2.DomRenderer = class extends _.Disposable {
          constructor(e3, t3, i3, s3, r2, a2, c2, l2, u2, p2) {
            super(), this._element = e3, this._screenElement = t3, this._viewportElement = i3, this._linkifier2 = s3, this._charSizeService = a2, this._optionsService = c2, this._bufferService = l2, this._coreBrowserService = u2, this._themeService = p2, this._terminalClass = C++, this._rowElements = [], this.onRequestRedraw = this.register(new d.EventEmitter()).event, this._rowContainer = document.createElement("div"), this._rowContainer.classList.add(v), this._rowContainer.style.lineHeight = "normal", this._rowContainer.setAttribute("aria-hidden", "true"), this._refreshRowElements(this._bufferService.cols, this._bufferService.rows), this._selectionContainer = document.createElement("div"), this._selectionContainer.classList.add(S), this._selectionContainer.setAttribute("aria-hidden", "true"), this.dimensions = (0, h2.createRenderDimensions)(), this._updateDimensions(), this.register(this._optionsService.onOptionChange((() => this._handleOptionsChanged()))), this.register(this._themeService.onChangeColors(((e4) => this._injectCss(e4)))), this._injectCss(this._themeService.colors), this._rowFactory = r2.createInstance(n.DomRendererRowFactory, document), this._element.classList.add(f + this._terminalClass), this._screenElement.appendChild(this._rowContainer), this._screenElement.appendChild(this._selectionContainer), this.register(this._linkifier2.onShowLinkUnderline(((e4) => this._handleLinkHover(e4)))), this.register(this._linkifier2.onHideLinkUnderline(((e4) => this._handleLinkLeave(e4)))), this.register((0, _.toDisposable)((() => {
              this._element.classList.remove(f + this._terminalClass), this._rowContainer.remove(), this._selectionContainer.remove(), this._widthCache.dispose(), this._themeStyleElement.remove(), this._dimensionsStyleElement.remove();
            }))), this._widthCache = new o.WidthCache(document), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
          }
          _updateDimensions() {
            const e3 = this._coreBrowserService.dpr;
            this.dimensions.device.char.width = this._charSizeService.width * e3, this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * e3), this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing), this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight), this.dimensions.device.char.left = 0, this.dimensions.device.char.top = 0, this.dimensions.device.canvas.width = this.dimensions.device.cell.width * this._bufferService.cols, this.dimensions.device.canvas.height = this.dimensions.device.cell.height * this._bufferService.rows, this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / e3), this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / e3), this.dimensions.css.cell.width = this.dimensions.css.canvas.width / this._bufferService.cols, this.dimensions.css.cell.height = this.dimensions.css.canvas.height / this._bufferService.rows;
            for (const e4 of this._rowElements) e4.style.width = `${this.dimensions.css.canvas.width}px`, e4.style.height = `${this.dimensions.css.cell.height}px`, e4.style.lineHeight = `${this.dimensions.css.cell.height}px`, e4.style.overflow = "hidden";
            this._dimensionsStyleElement || (this._dimensionsStyleElement = document.createElement("style"), this._screenElement.appendChild(this._dimensionsStyleElement));
            const t3 = `${this._terminalSelector} .${v} span { display: inline-block; height: 100%; vertical-align: top;}`;
            this._dimensionsStyleElement.textContent = t3, this._selectionContainer.style.height = this._viewportElement.style.height, this._screenElement.style.width = `${this.dimensions.css.canvas.width}px`, this._screenElement.style.height = `${this.dimensions.css.canvas.height}px`;
          }
          _injectCss(e3) {
            this._themeStyleElement || (this._themeStyleElement = document.createElement("style"), this._screenElement.appendChild(this._themeStyleElement));
            let t3 = `${this._terminalSelector} .${v} { color: ${e3.foreground.css}; font-family: ${this._optionsService.rawOptions.fontFamily}; font-size: ${this._optionsService.rawOptions.fontSize}px; font-kerning: none; white-space: pre}`;
            t3 += `${this._terminalSelector} .${v} .xterm-dim { color: ${l.color.multiplyOpacity(e3.foreground, 0.5).css};}`, t3 += `${this._terminalSelector} span:not(.xterm-bold) { font-weight: ${this._optionsService.rawOptions.fontWeight};}${this._terminalSelector} span.xterm-bold { font-weight: ${this._optionsService.rawOptions.fontWeightBold};}${this._terminalSelector} span.xterm-italic { font-style: italic;}`, t3 += "@keyframes blink_box_shadow_" + this._terminalClass + " { 50% {  border-bottom-style: hidden; }}", t3 += "@keyframes blink_block_" + this._terminalClass + ` { 0% {  background-color: ${e3.cursor.css};  color: ${e3.cursorAccent.css}; } 50% {  background-color: inherit;  color: ${e3.cursor.css}; }}`, t3 += `${this._terminalSelector} .${v}.${m} .xterm-cursor.xterm-cursor-blink:not(.xterm-cursor-block) { animation: blink_box_shadow_` + this._terminalClass + ` 1s step-end infinite;}${this._terminalSelector} .${v}.${m} .xterm-cursor.xterm-cursor-blink.xterm-cursor-block { animation: blink_block_` + this._terminalClass + ` 1s step-end infinite;}${this._terminalSelector} .${v} .xterm-cursor.xterm-cursor-block { background-color: ${e3.cursor.css}; color: ${e3.cursorAccent.css};}${this._terminalSelector} .${v} .xterm-cursor.xterm-cursor-outline { outline: 1px solid ${e3.cursor.css}; outline-offset: -1px;}${this._terminalSelector} .${v} .xterm-cursor.xterm-cursor-bar { box-shadow: ${this._optionsService.rawOptions.cursorWidth}px 0 0 ${e3.cursor.css} inset;}${this._terminalSelector} .${v} .xterm-cursor.xterm-cursor-underline { border-bottom: 1px ${e3.cursor.css}; border-bottom-style: solid; height: calc(100% - 1px);}`, t3 += `${this._terminalSelector} .${S} { position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none;}${this._terminalSelector}.focus .${S} div { position: absolute; background-color: ${e3.selectionBackgroundOpaque.css};}${this._terminalSelector} .${S} div { position: absolute; background-color: ${e3.selectionInactiveBackgroundOpaque.css};}`;
            for (const [i3, s3] of e3.ansi.entries()) t3 += `${this._terminalSelector} .${p}${i3} { color: ${s3.css}; }${this._terminalSelector} .${p}${i3}.xterm-dim { color: ${l.color.multiplyOpacity(s3, 0.5).css}; }${this._terminalSelector} .${g}${i3} { background-color: ${s3.css}; }`;
            t3 += `${this._terminalSelector} .${p}${a.INVERTED_DEFAULT_COLOR} { color: ${l.color.opaque(e3.background).css}; }${this._terminalSelector} .${p}${a.INVERTED_DEFAULT_COLOR}.xterm-dim { color: ${l.color.multiplyOpacity(l.color.opaque(e3.background), 0.5).css}; }${this._terminalSelector} .${g}${a.INVERTED_DEFAULT_COLOR} { background-color: ${e3.foreground.css}; }`, this._themeStyleElement.textContent = t3;
          }
          _setDefaultSpacing() {
            const e3 = this.dimensions.css.cell.width - this._widthCache.get("W", false, false);
            this._rowContainer.style.letterSpacing = `${e3}px`, this._rowFactory.defaultSpacing = e3;
          }
          handleDevicePixelRatioChange() {
            this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
          }
          _refreshRowElements(e3, t3) {
            for (let e4 = this._rowElements.length; e4 <= t3; e4++) {
              const e5 = document.createElement("div");
              this._rowContainer.appendChild(e5), this._rowElements.push(e5);
            }
            for (; this._rowElements.length > t3; ) this._rowContainer.removeChild(this._rowElements.pop());
          }
          handleResize(e3, t3) {
            this._refreshRowElements(e3, t3), this._updateDimensions();
          }
          handleCharSizeChanged() {
            this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
          }
          handleBlur() {
            this._rowContainer.classList.remove(m);
          }
          handleFocus() {
            this._rowContainer.classList.add(m), this.renderRows(this._bufferService.buffer.y, this._bufferService.buffer.y);
          }
          handleSelectionChanged(e3, t3, i3) {
            if (this._selectionContainer.replaceChildren(), this._rowFactory.handleSelectionChanged(e3, t3, i3), this.renderRows(0, this._bufferService.rows - 1), !e3 || !t3) return;
            const s3 = e3[1] - this._bufferService.buffer.ydisp, r2 = t3[1] - this._bufferService.buffer.ydisp, n2 = Math.max(s3, 0), o2 = Math.min(r2, this._bufferService.rows - 1);
            if (n2 >= this._bufferService.rows || o2 < 0) return;
            const a2 = document.createDocumentFragment();
            if (i3) {
              const i4 = e3[0] > t3[0];
              a2.appendChild(this._createSelectionElement(n2, i4 ? t3[0] : e3[0], i4 ? e3[0] : t3[0], o2 - n2 + 1));
            } else {
              const i4 = s3 === n2 ? e3[0] : 0, h3 = n2 === r2 ? t3[0] : this._bufferService.cols;
              a2.appendChild(this._createSelectionElement(n2, i4, h3));
              const c2 = o2 - n2 - 1;
              if (a2.appendChild(this._createSelectionElement(n2 + 1, 0, this._bufferService.cols, c2)), n2 !== o2) {
                const e4 = r2 === o2 ? t3[0] : this._bufferService.cols;
                a2.appendChild(this._createSelectionElement(o2, 0, e4));
              }
            }
            this._selectionContainer.appendChild(a2);
          }
          _createSelectionElement(e3, t3, i3, s3 = 1) {
            const r2 = document.createElement("div");
            return r2.style.height = s3 * this.dimensions.css.cell.height + "px", r2.style.top = e3 * this.dimensions.css.cell.height + "px", r2.style.left = t3 * this.dimensions.css.cell.width + "px", r2.style.width = this.dimensions.css.cell.width * (i3 - t3) + "px", r2;
          }
          handleCursorMove() {
          }
          _handleOptionsChanged() {
            this._updateDimensions(), this._injectCss(this._themeService.colors), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
          }
          clear() {
            for (const e3 of this._rowElements) e3.replaceChildren();
          }
          renderRows(e3, t3) {
            const i3 = this._bufferService.buffer, s3 = i3.ybase + i3.y, r2 = Math.min(i3.x, this._bufferService.cols - 1), n2 = this._optionsService.rawOptions.cursorBlink, o2 = this._optionsService.rawOptions.cursorStyle, a2 = this._optionsService.rawOptions.cursorInactiveStyle;
            for (let h3 = e3; h3 <= t3; h3++) {
              const e4 = h3 + i3.ydisp, t4 = this._rowElements[h3], c2 = i3.lines.get(e4);
              if (!t4 || !c2) break;
              t4.replaceChildren(...this._rowFactory.createRow(c2, e4, e4 === s3, o2, a2, r2, n2, this.dimensions.css.cell.width, this._widthCache, -1, -1));
            }
          }
          get _terminalSelector() {
            return `.${f}${this._terminalClass}`;
          }
          _handleLinkHover(e3) {
            this._setCellUnderline(e3.x1, e3.x2, e3.y1, e3.y2, e3.cols, true);
          }
          _handleLinkLeave(e3) {
            this._setCellUnderline(e3.x1, e3.x2, e3.y1, e3.y2, e3.cols, false);
          }
          _setCellUnderline(e3, t3, i3, s3, r2, n2) {
            i3 < 0 && (e3 = 0), s3 < 0 && (t3 = 0);
            const o2 = this._bufferService.rows - 1;
            i3 = Math.max(Math.min(i3, o2), 0), s3 = Math.max(Math.min(s3, o2), 0), r2 = Math.min(r2, this._bufferService.cols);
            const a2 = this._bufferService.buffer, h3 = a2.ybase + a2.y, c2 = Math.min(a2.x, r2 - 1), l2 = this._optionsService.rawOptions.cursorBlink, d2 = this._optionsService.rawOptions.cursorStyle, _2 = this._optionsService.rawOptions.cursorInactiveStyle;
            for (let o3 = i3; o3 <= s3; ++o3) {
              const u2 = o3 + a2.ydisp, f2 = this._rowElements[o3], v2 = a2.lines.get(u2);
              if (!f2 || !v2) break;
              f2.replaceChildren(...this._rowFactory.createRow(v2, u2, u2 === h3, d2, _2, c2, l2, this.dimensions.css.cell.width, this._widthCache, n2 ? o3 === i3 ? e3 : 0 : -1, n2 ? (o3 === s3 ? t3 : r2) - 1 : -1));
            }
          }
        };
        t2.DomRenderer = b = s2([r(4, u.IInstantiationService), r(5, c.ICharSizeService), r(6, u.IOptionsService), r(7, u.IBufferService), r(8, c.ICoreBrowserService), r(9, c.IThemeService)], b);
      }, 3787: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DomRendererRowFactory = void 0;
        const n = i2(2223), o = i2(643), a = i2(511), h2 = i2(2585), c = i2(8055), l = i2(4725), d = i2(4269), _ = i2(6171), u = i2(3734);
        let f = t2.DomRendererRowFactory = class {
          constructor(e3, t3, i3, s3, r2, n2, o2) {
            this._document = e3, this._characterJoinerService = t3, this._optionsService = i3, this._coreBrowserService = s3, this._coreService = r2, this._decorationService = n2, this._themeService = o2, this._workCell = new a.CellData(), this._columnSelectMode = false, this.defaultSpacing = 0;
          }
          handleSelectionChanged(e3, t3, i3) {
            this._selectionStart = e3, this._selectionEnd = t3, this._columnSelectMode = i3;
          }
          createRow(e3, t3, i3, s3, r2, a2, h3, l2, _2, f2, p) {
            const g = [], m = this._characterJoinerService.getJoinedCharacters(t3), S = this._themeService.colors;
            let C, b = e3.getNoBgTrimmedLength();
            i3 && b < a2 + 1 && (b = a2 + 1);
            let y = 0, w = "", E = 0, k = 0, L = 0, D = false, R = 0, x = false, A = 0;
            const B = [], T = -1 !== f2 && -1 !== p;
            for (let M = 0; M < b; M++) {
              e3.loadCell(M, this._workCell);
              let b2 = this._workCell.getWidth();
              if (0 === b2) continue;
              let O = false, P = M, I = this._workCell;
              if (m.length > 0 && M === m[0][0]) {
                O = true;
                const t4 = m.shift();
                I = new d.JoinedCellData(this._workCell, e3.translateToString(true, t4[0], t4[1]), t4[1] - t4[0]), P = t4[1] - 1, b2 = I.getWidth();
              }
              const H = this._isCellInSelection(M, t3), F = i3 && M === a2, W = T && M >= f2 && M <= p;
              let U = false;
              this._decorationService.forEachDecorationAtCell(M, t3, void 0, ((e4) => {
                U = true;
              }));
              let N = I.getChars() || o.WHITESPACE_CELL_CHAR;
              if (" " === N && (I.isUnderline() || I.isOverline()) && (N = "\xA0"), A = b2 * l2 - _2.get(N, I.isBold(), I.isItalic()), C) {
                if (y && (H && x || !H && !x && I.bg === E) && (H && x && S.selectionForeground || I.fg === k) && I.extended.ext === L && W === D && A === R && !F && !O && !U) {
                  w += N, y++;
                  continue;
                }
                y && (C.textContent = w), C = this._document.createElement("span"), y = 0, w = "";
              } else C = this._document.createElement("span");
              if (E = I.bg, k = I.fg, L = I.extended.ext, D = W, R = A, x = H, O && a2 >= M && a2 <= P && (a2 = M), !this._coreService.isCursorHidden && F) {
                if (B.push("xterm-cursor"), this._coreBrowserService.isFocused) h3 && B.push("xterm-cursor-blink"), B.push("bar" === s3 ? "xterm-cursor-bar" : "underline" === s3 ? "xterm-cursor-underline" : "xterm-cursor-block");
                else if (r2) switch (r2) {
                  case "outline":
                    B.push("xterm-cursor-outline");
                    break;
                  case "block":
                    B.push("xterm-cursor-block");
                    break;
                  case "bar":
                    B.push("xterm-cursor-bar");
                    break;
                  case "underline":
                    B.push("xterm-cursor-underline");
                }
              }
              if (I.isBold() && B.push("xterm-bold"), I.isItalic() && B.push("xterm-italic"), I.isDim() && B.push("xterm-dim"), w = I.isInvisible() ? o.WHITESPACE_CELL_CHAR : I.getChars() || o.WHITESPACE_CELL_CHAR, I.isUnderline() && (B.push(`xterm-underline-${I.extended.underlineStyle}`), " " === w && (w = "\xA0"), !I.isUnderlineColorDefault())) if (I.isUnderlineColorRGB()) C.style.textDecorationColor = `rgb(${u.AttributeData.toColorRGB(I.getUnderlineColor()).join(",")})`;
              else {
                let e4 = I.getUnderlineColor();
                this._optionsService.rawOptions.drawBoldTextInBrightColors && I.isBold() && e4 < 8 && (e4 += 8), C.style.textDecorationColor = S.ansi[e4].css;
              }
              I.isOverline() && (B.push("xterm-overline"), " " === w && (w = "\xA0")), I.isStrikethrough() && B.push("xterm-strikethrough"), W && (C.style.textDecoration = "underline");
              let $ = I.getFgColor(), j = I.getFgColorMode(), z = I.getBgColor(), K = I.getBgColorMode();
              const q = !!I.isInverse();
              if (q) {
                const e4 = $;
                $ = z, z = e4;
                const t4 = j;
                j = K, K = t4;
              }
              let V, G, X, J = false;
              switch (this._decorationService.forEachDecorationAtCell(M, t3, void 0, ((e4) => {
                "top" !== e4.options.layer && J || (e4.backgroundColorRGB && (K = 50331648, z = e4.backgroundColorRGB.rgba >> 8 & 16777215, V = e4.backgroundColorRGB), e4.foregroundColorRGB && (j = 50331648, $ = e4.foregroundColorRGB.rgba >> 8 & 16777215, G = e4.foregroundColorRGB), J = "top" === e4.options.layer);
              })), !J && H && (V = this._coreBrowserService.isFocused ? S.selectionBackgroundOpaque : S.selectionInactiveBackgroundOpaque, z = V.rgba >> 8 & 16777215, K = 50331648, J = true, S.selectionForeground && (j = 50331648, $ = S.selectionForeground.rgba >> 8 & 16777215, G = S.selectionForeground)), J && B.push("xterm-decoration-top"), K) {
                case 16777216:
                case 33554432:
                  X = S.ansi[z], B.push(`xterm-bg-${z}`);
                  break;
                case 50331648:
                  X = c.rgba.toColor(z >> 16, z >> 8 & 255, 255 & z), this._addStyle(C, `background-color:#${v((z >>> 0).toString(16), "0", 6)}`);
                  break;
                default:
                  q ? (X = S.foreground, B.push(`xterm-bg-${n.INVERTED_DEFAULT_COLOR}`)) : X = S.background;
              }
              switch (V || I.isDim() && (V = c.color.multiplyOpacity(X, 0.5)), j) {
                case 16777216:
                case 33554432:
                  I.isBold() && $ < 8 && this._optionsService.rawOptions.drawBoldTextInBrightColors && ($ += 8), this._applyMinimumContrast(C, X, S.ansi[$], I, V, void 0) || B.push(`xterm-fg-${$}`);
                  break;
                case 50331648:
                  const e4 = c.rgba.toColor($ >> 16 & 255, $ >> 8 & 255, 255 & $);
                  this._applyMinimumContrast(C, X, e4, I, V, G) || this._addStyle(C, `color:#${v($.toString(16), "0", 6)}`);
                  break;
                default:
                  this._applyMinimumContrast(C, X, S.foreground, I, V, void 0) || q && B.push(`xterm-fg-${n.INVERTED_DEFAULT_COLOR}`);
              }
              B.length && (C.className = B.join(" "), B.length = 0), F || O || U ? C.textContent = w : y++, A !== this.defaultSpacing && (C.style.letterSpacing = `${A}px`), g.push(C), M = P;
            }
            return C && y && (C.textContent = w), g;
          }
          _applyMinimumContrast(e3, t3, i3, s3, r2, n2) {
            if (1 === this._optionsService.rawOptions.minimumContrastRatio || (0, _.excludeFromContrastRatioDemands)(s3.getCode())) return false;
            const o2 = this._getContrastCache(s3);
            let a2;
            if (r2 || n2 || (a2 = o2.getColor(t3.rgba, i3.rgba)), void 0 === a2) {
              const e4 = this._optionsService.rawOptions.minimumContrastRatio / (s3.isDim() ? 2 : 1);
              a2 = c.color.ensureContrastRatio(r2 || t3, n2 || i3, e4), o2.setColor((r2 || t3).rgba, (n2 || i3).rgba, null != a2 ? a2 : null);
            }
            return !!a2 && (this._addStyle(e3, `color:${a2.css}`), true);
          }
          _getContrastCache(e3) {
            return e3.isDim() ? this._themeService.colors.halfContrastCache : this._themeService.colors.contrastCache;
          }
          _addStyle(e3, t3) {
            e3.setAttribute("style", `${e3.getAttribute("style") || ""}${t3};`);
          }
          _isCellInSelection(e3, t3) {
            const i3 = this._selectionStart, s3 = this._selectionEnd;
            return !(!i3 || !s3) && (this._columnSelectMode ? i3[0] <= s3[0] ? e3 >= i3[0] && t3 >= i3[1] && e3 < s3[0] && t3 <= s3[1] : e3 < i3[0] && t3 >= i3[1] && e3 >= s3[0] && t3 <= s3[1] : t3 > i3[1] && t3 < s3[1] || i3[1] === s3[1] && t3 === i3[1] && e3 >= i3[0] && e3 < s3[0] || i3[1] < s3[1] && t3 === s3[1] && e3 < s3[0] || i3[1] < s3[1] && t3 === i3[1] && e3 >= i3[0]);
          }
        };
        function v(e3, t3, i3) {
          for (; e3.length < i3; ) e3 = t3 + e3;
          return e3;
        }
        t2.DomRendererRowFactory = f = s2([r(1, l.ICharacterJoinerService), r(2, h2.IOptionsService), r(3, l.ICoreBrowserService), r(4, h2.ICoreService), r(5, h2.IDecorationService), r(6, l.IThemeService)], f);
      }, 2550: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.WidthCache = void 0, t2.WidthCache = class {
          constructor(e3) {
            this._flat = new Float32Array(256), this._font = "", this._fontSize = 0, this._weight = "normal", this._weightBold = "bold", this._measureElements = [], this._container = e3.createElement("div"), this._container.style.position = "absolute", this._container.style.top = "-50000px", this._container.style.width = "50000px", this._container.style.whiteSpace = "pre", this._container.style.fontKerning = "none";
            const t3 = e3.createElement("span"), i2 = e3.createElement("span");
            i2.style.fontWeight = "bold";
            const s2 = e3.createElement("span");
            s2.style.fontStyle = "italic";
            const r = e3.createElement("span");
            r.style.fontWeight = "bold", r.style.fontStyle = "italic", this._measureElements = [t3, i2, s2, r], this._container.appendChild(t3), this._container.appendChild(i2), this._container.appendChild(s2), this._container.appendChild(r), e3.body.appendChild(this._container), this.clear();
          }
          dispose() {
            this._container.remove(), this._measureElements.length = 0, this._holey = void 0;
          }
          clear() {
            this._flat.fill(-9999), this._holey = /* @__PURE__ */ new Map();
          }
          setFont(e3, t3, i2, s2) {
            e3 === this._font && t3 === this._fontSize && i2 === this._weight && s2 === this._weightBold || (this._font = e3, this._fontSize = t3, this._weight = i2, this._weightBold = s2, this._container.style.fontFamily = this._font, this._container.style.fontSize = `${this._fontSize}px`, this._measureElements[0].style.fontWeight = `${i2}`, this._measureElements[1].style.fontWeight = `${s2}`, this._measureElements[2].style.fontWeight = `${i2}`, this._measureElements[3].style.fontWeight = `${s2}`, this.clear());
          }
          get(e3, t3, i2) {
            let s2 = 0;
            if (!t3 && !i2 && 1 === e3.length && (s2 = e3.charCodeAt(0)) < 256) return -9999 !== this._flat[s2] ? this._flat[s2] : this._flat[s2] = this._measure(e3, 0);
            let r = e3;
            t3 && (r += "B"), i2 && (r += "I");
            let n = this._holey.get(r);
            if (void 0 === n) {
              let s3 = 0;
              t3 && (s3 |= 1), i2 && (s3 |= 2), n = this._measure(e3, s3), this._holey.set(r, n);
            }
            return n;
          }
          _measure(e3, t3) {
            const i2 = this._measureElements[t3];
            return i2.textContent = e3.repeat(32), i2.offsetWidth / 32;
          }
        };
      }, 2223: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.TEXT_BASELINE = t2.DIM_OPACITY = t2.INVERTED_DEFAULT_COLOR = void 0;
        const s2 = i2(6114);
        t2.INVERTED_DEFAULT_COLOR = 257, t2.DIM_OPACITY = 0.5, t2.TEXT_BASELINE = s2.isFirefox || s2.isLegacyEdge ? "bottom" : "ideographic";
      }, 6171: (e2, t2) => {
        function i2(e3) {
          return 57508 <= e3 && e3 <= 57558;
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.createRenderDimensions = t2.excludeFromContrastRatioDemands = t2.isRestrictedPowerlineGlyph = t2.isPowerlineGlyph = t2.throwIfFalsy = void 0, t2.throwIfFalsy = function(e3) {
          if (!e3) throw new Error("value must not be falsy");
          return e3;
        }, t2.isPowerlineGlyph = i2, t2.isRestrictedPowerlineGlyph = function(e3) {
          return 57520 <= e3 && e3 <= 57527;
        }, t2.excludeFromContrastRatioDemands = function(e3) {
          return i2(e3) || (function(e4) {
            return 9472 <= e4 && e4 <= 9631;
          })(e3);
        }, t2.createRenderDimensions = function() {
          return { css: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 } }, device: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 }, char: { width: 0, height: 0, left: 0, top: 0 } } };
        };
      }, 456: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.SelectionModel = void 0, t2.SelectionModel = class {
          constructor(e3) {
            this._bufferService = e3, this.isSelectAllActive = false, this.selectionStartLength = 0;
          }
          clearSelection() {
            this.selectionStart = void 0, this.selectionEnd = void 0, this.isSelectAllActive = false, this.selectionStartLength = 0;
          }
          get finalSelectionStart() {
            return this.isSelectAllActive ? [0, 0] : this.selectionEnd && this.selectionStart && this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
          }
          get finalSelectionEnd() {
            if (this.isSelectAllActive) return [this._bufferService.cols, this._bufferService.buffer.ybase + this._bufferService.rows - 1];
            if (this.selectionStart) {
              if (!this.selectionEnd || this.areSelectionValuesReversed()) {
                const e3 = this.selectionStart[0] + this.selectionStartLength;
                return e3 > this._bufferService.cols ? e3 % this._bufferService.cols == 0 ? [this._bufferService.cols, this.selectionStart[1] + Math.floor(e3 / this._bufferService.cols) - 1] : [e3 % this._bufferService.cols, this.selectionStart[1] + Math.floor(e3 / this._bufferService.cols)] : [e3, this.selectionStart[1]];
              }
              if (this.selectionStartLength && this.selectionEnd[1] === this.selectionStart[1]) {
                const e3 = this.selectionStart[0] + this.selectionStartLength;
                return e3 > this._bufferService.cols ? [e3 % this._bufferService.cols, this.selectionStart[1] + Math.floor(e3 / this._bufferService.cols)] : [Math.max(e3, this.selectionEnd[0]), this.selectionEnd[1]];
              }
              return this.selectionEnd;
            }
          }
          areSelectionValuesReversed() {
            const e3 = this.selectionStart, t3 = this.selectionEnd;
            return !(!e3 || !t3) && (e3[1] > t3[1] || e3[1] === t3[1] && e3[0] > t3[0]);
          }
          handleTrim(e3) {
            return this.selectionStart && (this.selectionStart[1] -= e3), this.selectionEnd && (this.selectionEnd[1] -= e3), this.selectionEnd && this.selectionEnd[1] < 0 ? (this.clearSelection(), true) : (this.selectionStart && this.selectionStart[1] < 0 && (this.selectionStart[1] = 0), false);
          }
        };
      }, 428: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CharSizeService = void 0;
        const n = i2(2585), o = i2(8460), a = i2(844);
        let h2 = t2.CharSizeService = class extends a.Disposable {
          get hasValidSize() {
            return this.width > 0 && this.height > 0;
          }
          constructor(e3, t3, i3) {
            super(), this._optionsService = i3, this.width = 0, this.height = 0, this._onCharSizeChange = this.register(new o.EventEmitter()), this.onCharSizeChange = this._onCharSizeChange.event, this._measureStrategy = new c(e3, t3, this._optionsService), this.register(this._optionsService.onMultipleOptionChange(["fontFamily", "fontSize"], (() => this.measure())));
          }
          measure() {
            const e3 = this._measureStrategy.measure();
            e3.width === this.width && e3.height === this.height || (this.width = e3.width, this.height = e3.height, this._onCharSizeChange.fire());
          }
        };
        t2.CharSizeService = h2 = s2([r(2, n.IOptionsService)], h2);
        class c {
          constructor(e3, t3, i3) {
            this._document = e3, this._parentElement = t3, this._optionsService = i3, this._result = { width: 0, height: 0 }, this._measureElement = this._document.createElement("span"), this._measureElement.classList.add("xterm-char-measure-element"), this._measureElement.textContent = "W".repeat(32), this._measureElement.setAttribute("aria-hidden", "true"), this._measureElement.style.whiteSpace = "pre", this._measureElement.style.fontKerning = "none", this._parentElement.appendChild(this._measureElement);
          }
          measure() {
            this._measureElement.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._measureElement.style.fontSize = `${this._optionsService.rawOptions.fontSize}px`;
            const e3 = { height: Number(this._measureElement.offsetHeight), width: Number(this._measureElement.offsetWidth) };
            return 0 !== e3.width && 0 !== e3.height && (this._result.width = e3.width / 32, this._result.height = Math.ceil(e3.height)), this._result;
          }
        }
      }, 4269: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CharacterJoinerService = t2.JoinedCellData = void 0;
        const n = i2(3734), o = i2(643), a = i2(511), h2 = i2(2585);
        class c extends n.AttributeData {
          constructor(e3, t3, i3) {
            super(), this.content = 0, this.combinedData = "", this.fg = e3.fg, this.bg = e3.bg, this.combinedData = t3, this._width = i3;
          }
          isCombined() {
            return 2097152;
          }
          getWidth() {
            return this._width;
          }
          getChars() {
            return this.combinedData;
          }
          getCode() {
            return 2097151;
          }
          setFromCharData(e3) {
            throw new Error("not implemented");
          }
          getAsCharData() {
            return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
          }
        }
        t2.JoinedCellData = c;
        let l = t2.CharacterJoinerService = class e3 {
          constructor(e4) {
            this._bufferService = e4, this._characterJoiners = [], this._nextCharacterJoinerId = 0, this._workCell = new a.CellData();
          }
          register(e4) {
            const t3 = { id: this._nextCharacterJoinerId++, handler: e4 };
            return this._characterJoiners.push(t3), t3.id;
          }
          deregister(e4) {
            for (let t3 = 0; t3 < this._characterJoiners.length; t3++) if (this._characterJoiners[t3].id === e4) return this._characterJoiners.splice(t3, 1), true;
            return false;
          }
          getJoinedCharacters(e4) {
            if (0 === this._characterJoiners.length) return [];
            const t3 = this._bufferService.buffer.lines.get(e4);
            if (!t3 || 0 === t3.length) return [];
            const i3 = [], s3 = t3.translateToString(true);
            let r2 = 0, n2 = 0, a2 = 0, h3 = t3.getFg(0), c2 = t3.getBg(0);
            for (let e5 = 0; e5 < t3.getTrimmedLength(); e5++) if (t3.loadCell(e5, this._workCell), 0 !== this._workCell.getWidth()) {
              if (this._workCell.fg !== h3 || this._workCell.bg !== c2) {
                if (e5 - r2 > 1) {
                  const e6 = this._getJoinedRanges(s3, a2, n2, t3, r2);
                  for (let t4 = 0; t4 < e6.length; t4++) i3.push(e6[t4]);
                }
                r2 = e5, a2 = n2, h3 = this._workCell.fg, c2 = this._workCell.bg;
              }
              n2 += this._workCell.getChars().length || o.WHITESPACE_CELL_CHAR.length;
            }
            if (this._bufferService.cols - r2 > 1) {
              const e5 = this._getJoinedRanges(s3, a2, n2, t3, r2);
              for (let t4 = 0; t4 < e5.length; t4++) i3.push(e5[t4]);
            }
            return i3;
          }
          _getJoinedRanges(t3, i3, s3, r2, n2) {
            const o2 = t3.substring(i3, s3);
            let a2 = [];
            try {
              a2 = this._characterJoiners[0].handler(o2);
            } catch (e4) {
              console.error(e4);
            }
            for (let t4 = 1; t4 < this._characterJoiners.length; t4++) try {
              const i4 = this._characterJoiners[t4].handler(o2);
              for (let t5 = 0; t5 < i4.length; t5++) e3._mergeRanges(a2, i4[t5]);
            } catch (e4) {
              console.error(e4);
            }
            return this._stringRangesToCellRanges(a2, r2, n2), a2;
          }
          _stringRangesToCellRanges(e4, t3, i3) {
            let s3 = 0, r2 = false, n2 = 0, a2 = e4[s3];
            if (a2) {
              for (let h3 = i3; h3 < this._bufferService.cols; h3++) {
                const i4 = t3.getWidth(h3), c2 = t3.getString(h3).length || o.WHITESPACE_CELL_CHAR.length;
                if (0 !== i4) {
                  if (!r2 && a2[0] <= n2 && (a2[0] = h3, r2 = true), a2[1] <= n2) {
                    if (a2[1] = h3, a2 = e4[++s3], !a2) break;
                    a2[0] <= n2 ? (a2[0] = h3, r2 = true) : r2 = false;
                  }
                  n2 += c2;
                }
              }
              a2 && (a2[1] = this._bufferService.cols);
            }
          }
          static _mergeRanges(e4, t3) {
            let i3 = false;
            for (let s3 = 0; s3 < e4.length; s3++) {
              const r2 = e4[s3];
              if (i3) {
                if (t3[1] <= r2[0]) return e4[s3 - 1][1] = t3[1], e4;
                if (t3[1] <= r2[1]) return e4[s3 - 1][1] = Math.max(t3[1], r2[1]), e4.splice(s3, 1), e4;
                e4.splice(s3, 1), s3--;
              } else {
                if (t3[1] <= r2[0]) return e4.splice(s3, 0, t3), e4;
                if (t3[1] <= r2[1]) return r2[0] = Math.min(t3[0], r2[0]), e4;
                t3[0] < r2[1] && (r2[0] = Math.min(t3[0], r2[0]), i3 = true);
              }
            }
            return i3 ? e4[e4.length - 1][1] = t3[1] : e4.push(t3), e4;
          }
        };
        t2.CharacterJoinerService = l = s2([r(0, h2.IBufferService)], l);
      }, 5114: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CoreBrowserService = void 0, t2.CoreBrowserService = class {
          constructor(e3, t3) {
            this._textarea = e3, this.window = t3, this._isFocused = false, this._cachedIsFocused = void 0, this._textarea.addEventListener("focus", (() => this._isFocused = true)), this._textarea.addEventListener("blur", (() => this._isFocused = false));
          }
          get dpr() {
            return this.window.devicePixelRatio;
          }
          get isFocused() {
            return void 0 === this._cachedIsFocused && (this._cachedIsFocused = this._isFocused && this._textarea.ownerDocument.hasFocus(), queueMicrotask((() => this._cachedIsFocused = void 0))), this._cachedIsFocused;
          }
        };
      }, 8934: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.MouseService = void 0;
        const n = i2(4725), o = i2(9806);
        let a = t2.MouseService = class {
          constructor(e3, t3) {
            this._renderService = e3, this._charSizeService = t3;
          }
          getCoords(e3, t3, i3, s3, r2) {
            return (0, o.getCoords)(window, e3, t3, i3, s3, this._charSizeService.hasValidSize, this._renderService.dimensions.css.cell.width, this._renderService.dimensions.css.cell.height, r2);
          }
          getMouseReportCoords(e3, t3) {
            const i3 = (0, o.getCoordsRelativeToElement)(window, e3, t3);
            if (this._charSizeService.hasValidSize) return i3[0] = Math.min(Math.max(i3[0], 0), this._renderService.dimensions.css.canvas.width - 1), i3[1] = Math.min(Math.max(i3[1], 0), this._renderService.dimensions.css.canvas.height - 1), { col: Math.floor(i3[0] / this._renderService.dimensions.css.cell.width), row: Math.floor(i3[1] / this._renderService.dimensions.css.cell.height), x: Math.floor(i3[0]), y: Math.floor(i3[1]) };
          }
        };
        t2.MouseService = a = s2([r(0, n.IRenderService), r(1, n.ICharSizeService)], a);
      }, 3230: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.RenderService = void 0;
        const n = i2(3656), o = i2(6193), a = i2(5596), h2 = i2(4725), c = i2(8460), l = i2(844), d = i2(7226), _ = i2(2585);
        let u = t2.RenderService = class extends l.Disposable {
          get dimensions() {
            return this._renderer.value.dimensions;
          }
          constructor(e3, t3, i3, s3, r2, h3, _2, u2) {
            if (super(), this._rowCount = e3, this._charSizeService = s3, this._renderer = this.register(new l.MutableDisposable()), this._pausedResizeTask = new d.DebouncedIdleTask(), this._isPaused = false, this._needsFullRefresh = false, this._isNextRenderRedrawOnly = true, this._needsSelectionRefresh = false, this._canvasWidth = 0, this._canvasHeight = 0, this._selectionState = { start: void 0, end: void 0, columnSelectMode: false }, this._onDimensionsChange = this.register(new c.EventEmitter()), this.onDimensionsChange = this._onDimensionsChange.event, this._onRenderedViewportChange = this.register(new c.EventEmitter()), this.onRenderedViewportChange = this._onRenderedViewportChange.event, this._onRender = this.register(new c.EventEmitter()), this.onRender = this._onRender.event, this._onRefreshRequest = this.register(new c.EventEmitter()), this.onRefreshRequest = this._onRefreshRequest.event, this._renderDebouncer = new o.RenderDebouncer(_2.window, ((e4, t4) => this._renderRows(e4, t4))), this.register(this._renderDebouncer), this._screenDprMonitor = new a.ScreenDprMonitor(_2.window), this._screenDprMonitor.setListener((() => this.handleDevicePixelRatioChange())), this.register(this._screenDprMonitor), this.register(h3.onResize((() => this._fullRefresh()))), this.register(h3.buffers.onBufferActivate((() => {
              var e4;
              return null === (e4 = this._renderer.value) || void 0 === e4 ? void 0 : e4.clear();
            }))), this.register(i3.onOptionChange((() => this._handleOptionsChanged()))), this.register(this._charSizeService.onCharSizeChange((() => this.handleCharSizeChanged()))), this.register(r2.onDecorationRegistered((() => this._fullRefresh()))), this.register(r2.onDecorationRemoved((() => this._fullRefresh()))), this.register(i3.onMultipleOptionChange(["customGlyphs", "drawBoldTextInBrightColors", "letterSpacing", "lineHeight", "fontFamily", "fontSize", "fontWeight", "fontWeightBold", "minimumContrastRatio"], (() => {
              this.clear(), this.handleResize(h3.cols, h3.rows), this._fullRefresh();
            }))), this.register(i3.onMultipleOptionChange(["cursorBlink", "cursorStyle"], (() => this.refreshRows(h3.buffer.y, h3.buffer.y, true)))), this.register((0, n.addDisposableDomListener)(_2.window, "resize", (() => this.handleDevicePixelRatioChange()))), this.register(u2.onChangeColors((() => this._fullRefresh()))), "IntersectionObserver" in _2.window) {
              const e4 = new _2.window.IntersectionObserver(((e5) => this._handleIntersectionChange(e5[e5.length - 1])), { threshold: 0 });
              e4.observe(t3), this.register({ dispose: () => e4.disconnect() });
            }
          }
          _handleIntersectionChange(e3) {
            this._isPaused = void 0 === e3.isIntersecting ? 0 === e3.intersectionRatio : !e3.isIntersecting, this._isPaused || this._charSizeService.hasValidSize || this._charSizeService.measure(), !this._isPaused && this._needsFullRefresh && (this._pausedResizeTask.flush(), this.refreshRows(0, this._rowCount - 1), this._needsFullRefresh = false);
          }
          refreshRows(e3, t3, i3 = false) {
            this._isPaused ? this._needsFullRefresh = true : (i3 || (this._isNextRenderRedrawOnly = false), this._renderDebouncer.refresh(e3, t3, this._rowCount));
          }
          _renderRows(e3, t3) {
            this._renderer.value && (e3 = Math.min(e3, this._rowCount - 1), t3 = Math.min(t3, this._rowCount - 1), this._renderer.value.renderRows(e3, t3), this._needsSelectionRefresh && (this._renderer.value.handleSelectionChanged(this._selectionState.start, this._selectionState.end, this._selectionState.columnSelectMode), this._needsSelectionRefresh = false), this._isNextRenderRedrawOnly || this._onRenderedViewportChange.fire({ start: e3, end: t3 }), this._onRender.fire({ start: e3, end: t3 }), this._isNextRenderRedrawOnly = true);
          }
          resize(e3, t3) {
            this._rowCount = t3, this._fireOnCanvasResize();
          }
          _handleOptionsChanged() {
            this._renderer.value && (this.refreshRows(0, this._rowCount - 1), this._fireOnCanvasResize());
          }
          _fireOnCanvasResize() {
            this._renderer.value && (this._renderer.value.dimensions.css.canvas.width === this._canvasWidth && this._renderer.value.dimensions.css.canvas.height === this._canvasHeight || this._onDimensionsChange.fire(this._renderer.value.dimensions));
          }
          hasRenderer() {
            return !!this._renderer.value;
          }
          setRenderer(e3) {
            this._renderer.value = e3, this._renderer.value.onRequestRedraw(((e4) => this.refreshRows(e4.start, e4.end, true))), this._needsSelectionRefresh = true, this._fullRefresh();
          }
          addRefreshCallback(e3) {
            return this._renderDebouncer.addRefreshCallback(e3);
          }
          _fullRefresh() {
            this._isPaused ? this._needsFullRefresh = true : this.refreshRows(0, this._rowCount - 1);
          }
          clearTextureAtlas() {
            var e3, t3;
            this._renderer.value && (null === (t3 = (e3 = this._renderer.value).clearTextureAtlas) || void 0 === t3 || t3.call(e3), this._fullRefresh());
          }
          handleDevicePixelRatioChange() {
            this._charSizeService.measure(), this._renderer.value && (this._renderer.value.handleDevicePixelRatioChange(), this.refreshRows(0, this._rowCount - 1));
          }
          handleResize(e3, t3) {
            this._renderer.value && (this._isPaused ? this._pausedResizeTask.set((() => this._renderer.value.handleResize(e3, t3))) : this._renderer.value.handleResize(e3, t3), this._fullRefresh());
          }
          handleCharSizeChanged() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.handleCharSizeChanged();
          }
          handleBlur() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.handleBlur();
          }
          handleFocus() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.handleFocus();
          }
          handleSelectionChanged(e3, t3, i3) {
            var s3;
            this._selectionState.start = e3, this._selectionState.end = t3, this._selectionState.columnSelectMode = i3, null === (s3 = this._renderer.value) || void 0 === s3 || s3.handleSelectionChanged(e3, t3, i3);
          }
          handleCursorMove() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.handleCursorMove();
          }
          clear() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.clear();
          }
        };
        t2.RenderService = u = s2([r(2, _.IOptionsService), r(3, h2.ICharSizeService), r(4, _.IDecorationService), r(5, _.IBufferService), r(6, h2.ICoreBrowserService), r(7, h2.IThemeService)], u);
      }, 9312: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.SelectionService = void 0;
        const n = i2(9806), o = i2(9504), a = i2(456), h2 = i2(4725), c = i2(8460), l = i2(844), d = i2(6114), _ = i2(4841), u = i2(511), f = i2(2585), v = String.fromCharCode(160), p = new RegExp(v, "g");
        let g = t2.SelectionService = class extends l.Disposable {
          constructor(e3, t3, i3, s3, r2, n2, o2, h3, d2) {
            super(), this._element = e3, this._screenElement = t3, this._linkifier = i3, this._bufferService = s3, this._coreService = r2, this._mouseService = n2, this._optionsService = o2, this._renderService = h3, this._coreBrowserService = d2, this._dragScrollAmount = 0, this._enabled = true, this._workCell = new u.CellData(), this._mouseDownTimeStamp = 0, this._oldHasSelection = false, this._oldSelectionStart = void 0, this._oldSelectionEnd = void 0, this._onLinuxMouseSelection = this.register(new c.EventEmitter()), this.onLinuxMouseSelection = this._onLinuxMouseSelection.event, this._onRedrawRequest = this.register(new c.EventEmitter()), this.onRequestRedraw = this._onRedrawRequest.event, this._onSelectionChange = this.register(new c.EventEmitter()), this.onSelectionChange = this._onSelectionChange.event, this._onRequestScrollLines = this.register(new c.EventEmitter()), this.onRequestScrollLines = this._onRequestScrollLines.event, this._mouseMoveListener = (e4) => this._handleMouseMove(e4), this._mouseUpListener = (e4) => this._handleMouseUp(e4), this._coreService.onUserInput((() => {
              this.hasSelection && this.clearSelection();
            })), this._trimListener = this._bufferService.buffer.lines.onTrim(((e4) => this._handleTrim(e4))), this.register(this._bufferService.buffers.onBufferActivate(((e4) => this._handleBufferActivate(e4)))), this.enable(), this._model = new a.SelectionModel(this._bufferService), this._activeSelectionMode = 0, this.register((0, l.toDisposable)((() => {
              this._removeMouseDownListeners();
            })));
          }
          reset() {
            this.clearSelection();
          }
          disable() {
            this.clearSelection(), this._enabled = false;
          }
          enable() {
            this._enabled = true;
          }
          get selectionStart() {
            return this._model.finalSelectionStart;
          }
          get selectionEnd() {
            return this._model.finalSelectionEnd;
          }
          get hasSelection() {
            const e3 = this._model.finalSelectionStart, t3 = this._model.finalSelectionEnd;
            return !(!e3 || !t3 || e3[0] === t3[0] && e3[1] === t3[1]);
          }
          get selectionText() {
            const e3 = this._model.finalSelectionStart, t3 = this._model.finalSelectionEnd;
            if (!e3 || !t3) return "";
            const i3 = this._bufferService.buffer, s3 = [];
            if (3 === this._activeSelectionMode) {
              if (e3[0] === t3[0]) return "";
              const r2 = e3[0] < t3[0] ? e3[0] : t3[0], n2 = e3[0] < t3[0] ? t3[0] : e3[0];
              for (let o2 = e3[1]; o2 <= t3[1]; o2++) {
                const e4 = i3.translateBufferLineToString(o2, true, r2, n2);
                s3.push(e4);
              }
            } else {
              const r2 = e3[1] === t3[1] ? t3[0] : void 0;
              s3.push(i3.translateBufferLineToString(e3[1], true, e3[0], r2));
              for (let r3 = e3[1] + 1; r3 <= t3[1] - 1; r3++) {
                const e4 = i3.lines.get(r3), t4 = i3.translateBufferLineToString(r3, true);
                (null == e4 ? void 0 : e4.isWrapped) ? s3[s3.length - 1] += t4 : s3.push(t4);
              }
              if (e3[1] !== t3[1]) {
                const e4 = i3.lines.get(t3[1]), r3 = i3.translateBufferLineToString(t3[1], true, 0, t3[0]);
                e4 && e4.isWrapped ? s3[s3.length - 1] += r3 : s3.push(r3);
              }
            }
            return s3.map(((e4) => e4.replace(p, " "))).join(d.isWindows ? "\r\n" : "\n");
          }
          clearSelection() {
            this._model.clearSelection(), this._removeMouseDownListeners(), this.refresh(), this._onSelectionChange.fire();
          }
          refresh(e3) {
            this._refreshAnimationFrame || (this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame((() => this._refresh()))), d.isLinux && e3 && this.selectionText.length && this._onLinuxMouseSelection.fire(this.selectionText);
          }
          _refresh() {
            this._refreshAnimationFrame = void 0, this._onRedrawRequest.fire({ start: this._model.finalSelectionStart, end: this._model.finalSelectionEnd, columnSelectMode: 3 === this._activeSelectionMode });
          }
          _isClickInSelection(e3) {
            const t3 = this._getMouseBufferCoords(e3), i3 = this._model.finalSelectionStart, s3 = this._model.finalSelectionEnd;
            return !!(i3 && s3 && t3) && this._areCoordsInSelection(t3, i3, s3);
          }
          isCellInSelection(e3, t3) {
            const i3 = this._model.finalSelectionStart, s3 = this._model.finalSelectionEnd;
            return !(!i3 || !s3) && this._areCoordsInSelection([e3, t3], i3, s3);
          }
          _areCoordsInSelection(e3, t3, i3) {
            return e3[1] > t3[1] && e3[1] < i3[1] || t3[1] === i3[1] && e3[1] === t3[1] && e3[0] >= t3[0] && e3[0] < i3[0] || t3[1] < i3[1] && e3[1] === i3[1] && e3[0] < i3[0] || t3[1] < i3[1] && e3[1] === t3[1] && e3[0] >= t3[0];
          }
          _selectWordAtCursor(e3, t3) {
            var i3, s3;
            const r2 = null === (s3 = null === (i3 = this._linkifier.currentLink) || void 0 === i3 ? void 0 : i3.link) || void 0 === s3 ? void 0 : s3.range;
            if (r2) return this._model.selectionStart = [r2.start.x - 1, r2.start.y - 1], this._model.selectionStartLength = (0, _.getRangeLength)(r2, this._bufferService.cols), this._model.selectionEnd = void 0, true;
            const n2 = this._getMouseBufferCoords(e3);
            return !!n2 && (this._selectWordAt(n2, t3), this._model.selectionEnd = void 0, true);
          }
          selectAll() {
            this._model.isSelectAllActive = true, this.refresh(), this._onSelectionChange.fire();
          }
          selectLines(e3, t3) {
            this._model.clearSelection(), e3 = Math.max(e3, 0), t3 = Math.min(t3, this._bufferService.buffer.lines.length - 1), this._model.selectionStart = [0, e3], this._model.selectionEnd = [this._bufferService.cols, t3], this.refresh(), this._onSelectionChange.fire();
          }
          _handleTrim(e3) {
            this._model.handleTrim(e3) && this.refresh();
          }
          _getMouseBufferCoords(e3) {
            const t3 = this._mouseService.getCoords(e3, this._screenElement, this._bufferService.cols, this._bufferService.rows, true);
            if (t3) return t3[0]--, t3[1]--, t3[1] += this._bufferService.buffer.ydisp, t3;
          }
          _getMouseEventScrollAmount(e3) {
            let t3 = (0, n.getCoordsRelativeToElement)(this._coreBrowserService.window, e3, this._screenElement)[1];
            const i3 = this._renderService.dimensions.css.canvas.height;
            return t3 >= 0 && t3 <= i3 ? 0 : (t3 > i3 && (t3 -= i3), t3 = Math.min(Math.max(t3, -50), 50), t3 /= 50, t3 / Math.abs(t3) + Math.round(14 * t3));
          }
          shouldForceSelection(e3) {
            return d.isMac ? e3.altKey && this._optionsService.rawOptions.macOptionClickForcesSelection : e3.shiftKey;
          }
          handleMouseDown(e3) {
            if (this._mouseDownTimeStamp = e3.timeStamp, (2 !== e3.button || !this.hasSelection) && 0 === e3.button) {
              if (!this._enabled) {
                if (!this.shouldForceSelection(e3)) return;
                e3.stopPropagation();
              }
              e3.preventDefault(), this._dragScrollAmount = 0, this._enabled && e3.shiftKey ? this._handleIncrementalClick(e3) : 1 === e3.detail ? this._handleSingleClick(e3) : 2 === e3.detail ? this._handleDoubleClick(e3) : 3 === e3.detail && this._handleTripleClick(e3), this._addMouseDownListeners(), this.refresh(true);
            }
          }
          _addMouseDownListeners() {
            this._screenElement.ownerDocument && (this._screenElement.ownerDocument.addEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.addEventListener("mouseup", this._mouseUpListener)), this._dragScrollIntervalTimer = this._coreBrowserService.window.setInterval((() => this._dragScroll()), 50);
          }
          _removeMouseDownListeners() {
            this._screenElement.ownerDocument && (this._screenElement.ownerDocument.removeEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.removeEventListener("mouseup", this._mouseUpListener)), this._coreBrowserService.window.clearInterval(this._dragScrollIntervalTimer), this._dragScrollIntervalTimer = void 0;
          }
          _handleIncrementalClick(e3) {
            this._model.selectionStart && (this._model.selectionEnd = this._getMouseBufferCoords(e3));
          }
          _handleSingleClick(e3) {
            if (this._model.selectionStartLength = 0, this._model.isSelectAllActive = false, this._activeSelectionMode = this.shouldColumnSelect(e3) ? 3 : 0, this._model.selectionStart = this._getMouseBufferCoords(e3), !this._model.selectionStart) return;
            this._model.selectionEnd = void 0;
            const t3 = this._bufferService.buffer.lines.get(this._model.selectionStart[1]);
            t3 && t3.length !== this._model.selectionStart[0] && 0 === t3.hasWidth(this._model.selectionStart[0]) && this._model.selectionStart[0]++;
          }
          _handleDoubleClick(e3) {
            this._selectWordAtCursor(e3, true) && (this._activeSelectionMode = 1);
          }
          _handleTripleClick(e3) {
            const t3 = this._getMouseBufferCoords(e3);
            t3 && (this._activeSelectionMode = 2, this._selectLineAt(t3[1]));
          }
          shouldColumnSelect(e3) {
            return e3.altKey && !(d.isMac && this._optionsService.rawOptions.macOptionClickForcesSelection);
          }
          _handleMouseMove(e3) {
            if (e3.stopImmediatePropagation(), !this._model.selectionStart) return;
            const t3 = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
            if (this._model.selectionEnd = this._getMouseBufferCoords(e3), !this._model.selectionEnd) return void this.refresh(true);
            2 === this._activeSelectionMode ? this._model.selectionEnd[1] < this._model.selectionStart[1] ? this._model.selectionEnd[0] = 0 : this._model.selectionEnd[0] = this._bufferService.cols : 1 === this._activeSelectionMode && this._selectToWordAt(this._model.selectionEnd), this._dragScrollAmount = this._getMouseEventScrollAmount(e3), 3 !== this._activeSelectionMode && (this._dragScrollAmount > 0 ? this._model.selectionEnd[0] = this._bufferService.cols : this._dragScrollAmount < 0 && (this._model.selectionEnd[0] = 0));
            const i3 = this._bufferService.buffer;
            if (this._model.selectionEnd[1] < i3.lines.length) {
              const e4 = i3.lines.get(this._model.selectionEnd[1]);
              e4 && 0 === e4.hasWidth(this._model.selectionEnd[0]) && this._model.selectionEnd[0]++;
            }
            t3 && t3[0] === this._model.selectionEnd[0] && t3[1] === this._model.selectionEnd[1] || this.refresh(true);
          }
          _dragScroll() {
            if (this._model.selectionEnd && this._model.selectionStart && this._dragScrollAmount) {
              this._onRequestScrollLines.fire({ amount: this._dragScrollAmount, suppressScrollEvent: false });
              const e3 = this._bufferService.buffer;
              this._dragScrollAmount > 0 ? (3 !== this._activeSelectionMode && (this._model.selectionEnd[0] = this._bufferService.cols), this._model.selectionEnd[1] = Math.min(e3.ydisp + this._bufferService.rows, e3.lines.length - 1)) : (3 !== this._activeSelectionMode && (this._model.selectionEnd[0] = 0), this._model.selectionEnd[1] = e3.ydisp), this.refresh();
            }
          }
          _handleMouseUp(e3) {
            const t3 = e3.timeStamp - this._mouseDownTimeStamp;
            if (this._removeMouseDownListeners(), this.selectionText.length <= 1 && t3 < 500 && e3.altKey && this._optionsService.rawOptions.altClickMovesCursor) {
              if (this._bufferService.buffer.ybase === this._bufferService.buffer.ydisp) {
                const t4 = this._mouseService.getCoords(e3, this._element, this._bufferService.cols, this._bufferService.rows, false);
                if (t4 && void 0 !== t4[0] && void 0 !== t4[1]) {
                  const e4 = (0, o.moveToCellSequence)(t4[0] - 1, t4[1] - 1, this._bufferService, this._coreService.decPrivateModes.applicationCursorKeys);
                  this._coreService.triggerDataEvent(e4, true);
                }
              }
            } else this._fireEventIfSelectionChanged();
          }
          _fireEventIfSelectionChanged() {
            const e3 = this._model.finalSelectionStart, t3 = this._model.finalSelectionEnd, i3 = !(!e3 || !t3 || e3[0] === t3[0] && e3[1] === t3[1]);
            i3 ? e3 && t3 && (this._oldSelectionStart && this._oldSelectionEnd && e3[0] === this._oldSelectionStart[0] && e3[1] === this._oldSelectionStart[1] && t3[0] === this._oldSelectionEnd[0] && t3[1] === this._oldSelectionEnd[1] || this._fireOnSelectionChange(e3, t3, i3)) : this._oldHasSelection && this._fireOnSelectionChange(e3, t3, i3);
          }
          _fireOnSelectionChange(e3, t3, i3) {
            this._oldSelectionStart = e3, this._oldSelectionEnd = t3, this._oldHasSelection = i3, this._onSelectionChange.fire();
          }
          _handleBufferActivate(e3) {
            this.clearSelection(), this._trimListener.dispose(), this._trimListener = e3.activeBuffer.lines.onTrim(((e4) => this._handleTrim(e4)));
          }
          _convertViewportColToCharacterIndex(e3, t3) {
            let i3 = t3;
            for (let s3 = 0; t3 >= s3; s3++) {
              const r2 = e3.loadCell(s3, this._workCell).getChars().length;
              0 === this._workCell.getWidth() ? i3-- : r2 > 1 && t3 !== s3 && (i3 += r2 - 1);
            }
            return i3;
          }
          setSelection(e3, t3, i3) {
            this._model.clearSelection(), this._removeMouseDownListeners(), this._model.selectionStart = [e3, t3], this._model.selectionStartLength = i3, this.refresh(), this._fireEventIfSelectionChanged();
          }
          rightClickSelect(e3) {
            this._isClickInSelection(e3) || (this._selectWordAtCursor(e3, false) && this.refresh(true), this._fireEventIfSelectionChanged());
          }
          _getWordAt(e3, t3, i3 = true, s3 = true) {
            if (e3[0] >= this._bufferService.cols) return;
            const r2 = this._bufferService.buffer, n2 = r2.lines.get(e3[1]);
            if (!n2) return;
            const o2 = r2.translateBufferLineToString(e3[1], false);
            let a2 = this._convertViewportColToCharacterIndex(n2, e3[0]), h3 = a2;
            const c2 = e3[0] - a2;
            let l2 = 0, d2 = 0, _2 = 0, u2 = 0;
            if (" " === o2.charAt(a2)) {
              for (; a2 > 0 && " " === o2.charAt(a2 - 1); ) a2--;
              for (; h3 < o2.length && " " === o2.charAt(h3 + 1); ) h3++;
            } else {
              let t4 = e3[0], i4 = e3[0];
              0 === n2.getWidth(t4) && (l2++, t4--), 2 === n2.getWidth(i4) && (d2++, i4++);
              const s4 = n2.getString(i4).length;
              for (s4 > 1 && (u2 += s4 - 1, h3 += s4 - 1); t4 > 0 && a2 > 0 && !this._isCharWordSeparator(n2.loadCell(t4 - 1, this._workCell)); ) {
                n2.loadCell(t4 - 1, this._workCell);
                const e4 = this._workCell.getChars().length;
                0 === this._workCell.getWidth() ? (l2++, t4--) : e4 > 1 && (_2 += e4 - 1, a2 -= e4 - 1), a2--, t4--;
              }
              for (; i4 < n2.length && h3 + 1 < o2.length && !this._isCharWordSeparator(n2.loadCell(i4 + 1, this._workCell)); ) {
                n2.loadCell(i4 + 1, this._workCell);
                const e4 = this._workCell.getChars().length;
                2 === this._workCell.getWidth() ? (d2++, i4++) : e4 > 1 && (u2 += e4 - 1, h3 += e4 - 1), h3++, i4++;
              }
            }
            h3++;
            let f2 = a2 + c2 - l2 + _2, v2 = Math.min(this._bufferService.cols, h3 - a2 + l2 + d2 - _2 - u2);
            if (t3 || "" !== o2.slice(a2, h3).trim()) {
              if (i3 && 0 === f2 && 32 !== n2.getCodePoint(0)) {
                const t4 = r2.lines.get(e3[1] - 1);
                if (t4 && n2.isWrapped && 32 !== t4.getCodePoint(this._bufferService.cols - 1)) {
                  const t5 = this._getWordAt([this._bufferService.cols - 1, e3[1] - 1], false, true, false);
                  if (t5) {
                    const e4 = this._bufferService.cols - t5.start;
                    f2 -= e4, v2 += e4;
                  }
                }
              }
              if (s3 && f2 + v2 === this._bufferService.cols && 32 !== n2.getCodePoint(this._bufferService.cols - 1)) {
                const t4 = r2.lines.get(e3[1] + 1);
                if ((null == t4 ? void 0 : t4.isWrapped) && 32 !== t4.getCodePoint(0)) {
                  const t5 = this._getWordAt([0, e3[1] + 1], false, false, true);
                  t5 && (v2 += t5.length);
                }
              }
              return { start: f2, length: v2 };
            }
          }
          _selectWordAt(e3, t3) {
            const i3 = this._getWordAt(e3, t3);
            if (i3) {
              for (; i3.start < 0; ) i3.start += this._bufferService.cols, e3[1]--;
              this._model.selectionStart = [i3.start, e3[1]], this._model.selectionStartLength = i3.length;
            }
          }
          _selectToWordAt(e3) {
            const t3 = this._getWordAt(e3, true);
            if (t3) {
              let i3 = e3[1];
              for (; t3.start < 0; ) t3.start += this._bufferService.cols, i3--;
              if (!this._model.areSelectionValuesReversed()) for (; t3.start + t3.length > this._bufferService.cols; ) t3.length -= this._bufferService.cols, i3++;
              this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? t3.start : t3.start + t3.length, i3];
            }
          }
          _isCharWordSeparator(e3) {
            return 0 !== e3.getWidth() && this._optionsService.rawOptions.wordSeparator.indexOf(e3.getChars()) >= 0;
          }
          _selectLineAt(e3) {
            const t3 = this._bufferService.buffer.getWrappedRangeForLine(e3), i3 = { start: { x: 0, y: t3.first }, end: { x: this._bufferService.cols - 1, y: t3.last } };
            this._model.selectionStart = [0, t3.first], this._model.selectionEnd = void 0, this._model.selectionStartLength = (0, _.getRangeLength)(i3, this._bufferService.cols);
          }
        };
        t2.SelectionService = g = s2([r(3, f.IBufferService), r(4, f.ICoreService), r(5, h2.IMouseService), r(6, f.IOptionsService), r(7, h2.IRenderService), r(8, h2.ICoreBrowserService)], g);
      }, 4725: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.IThemeService = t2.ICharacterJoinerService = t2.ISelectionService = t2.IRenderService = t2.IMouseService = t2.ICoreBrowserService = t2.ICharSizeService = void 0;
        const s2 = i2(8343);
        t2.ICharSizeService = (0, s2.createDecorator)("CharSizeService"), t2.ICoreBrowserService = (0, s2.createDecorator)("CoreBrowserService"), t2.IMouseService = (0, s2.createDecorator)("MouseService"), t2.IRenderService = (0, s2.createDecorator)("RenderService"), t2.ISelectionService = (0, s2.createDecorator)("SelectionService"), t2.ICharacterJoinerService = (0, s2.createDecorator)("CharacterJoinerService"), t2.IThemeService = (0, s2.createDecorator)("ThemeService");
      }, 6731: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ThemeService = t2.DEFAULT_ANSI_COLORS = void 0;
        const n = i2(7239), o = i2(8055), a = i2(8460), h2 = i2(844), c = i2(2585), l = o.css.toColor("#ffffff"), d = o.css.toColor("#000000"), _ = o.css.toColor("#ffffff"), u = o.css.toColor("#000000"), f = { css: "rgba(255, 255, 255, 0.3)", rgba: 4294967117 };
        t2.DEFAULT_ANSI_COLORS = Object.freeze((() => {
          const e3 = [o.css.toColor("#2e3436"), o.css.toColor("#cc0000"), o.css.toColor("#4e9a06"), o.css.toColor("#c4a000"), o.css.toColor("#3465a4"), o.css.toColor("#75507b"), o.css.toColor("#06989a"), o.css.toColor("#d3d7cf"), o.css.toColor("#555753"), o.css.toColor("#ef2929"), o.css.toColor("#8ae234"), o.css.toColor("#fce94f"), o.css.toColor("#729fcf"), o.css.toColor("#ad7fa8"), o.css.toColor("#34e2e2"), o.css.toColor("#eeeeec")], t3 = [0, 95, 135, 175, 215, 255];
          for (let i3 = 0; i3 < 216; i3++) {
            const s3 = t3[i3 / 36 % 6 | 0], r2 = t3[i3 / 6 % 6 | 0], n2 = t3[i3 % 6];
            e3.push({ css: o.channels.toCss(s3, r2, n2), rgba: o.channels.toRgba(s3, r2, n2) });
          }
          for (let t4 = 0; t4 < 24; t4++) {
            const i3 = 8 + 10 * t4;
            e3.push({ css: o.channels.toCss(i3, i3, i3), rgba: o.channels.toRgba(i3, i3, i3) });
          }
          return e3;
        })());
        let v = t2.ThemeService = class extends h2.Disposable {
          get colors() {
            return this._colors;
          }
          constructor(e3) {
            super(), this._optionsService = e3, this._contrastCache = new n.ColorContrastCache(), this._halfContrastCache = new n.ColorContrastCache(), this._onChangeColors = this.register(new a.EventEmitter()), this.onChangeColors = this._onChangeColors.event, this._colors = { foreground: l, background: d, cursor: _, cursorAccent: u, selectionForeground: void 0, selectionBackgroundTransparent: f, selectionBackgroundOpaque: o.color.blend(d, f), selectionInactiveBackgroundTransparent: f, selectionInactiveBackgroundOpaque: o.color.blend(d, f), ansi: t2.DEFAULT_ANSI_COLORS.slice(), contrastCache: this._contrastCache, halfContrastCache: this._halfContrastCache }, this._updateRestoreColors(), this._setTheme(this._optionsService.rawOptions.theme), this.register(this._optionsService.onSpecificOptionChange("minimumContrastRatio", (() => this._contrastCache.clear()))), this.register(this._optionsService.onSpecificOptionChange("theme", (() => this._setTheme(this._optionsService.rawOptions.theme))));
          }
          _setTheme(e3 = {}) {
            const i3 = this._colors;
            if (i3.foreground = p(e3.foreground, l), i3.background = p(e3.background, d), i3.cursor = p(e3.cursor, _), i3.cursorAccent = p(e3.cursorAccent, u), i3.selectionBackgroundTransparent = p(e3.selectionBackground, f), i3.selectionBackgroundOpaque = o.color.blend(i3.background, i3.selectionBackgroundTransparent), i3.selectionInactiveBackgroundTransparent = p(e3.selectionInactiveBackground, i3.selectionBackgroundTransparent), i3.selectionInactiveBackgroundOpaque = o.color.blend(i3.background, i3.selectionInactiveBackgroundTransparent), i3.selectionForeground = e3.selectionForeground ? p(e3.selectionForeground, o.NULL_COLOR) : void 0, i3.selectionForeground === o.NULL_COLOR && (i3.selectionForeground = void 0), o.color.isOpaque(i3.selectionBackgroundTransparent)) {
              const e4 = 0.3;
              i3.selectionBackgroundTransparent = o.color.opacity(i3.selectionBackgroundTransparent, e4);
            }
            if (o.color.isOpaque(i3.selectionInactiveBackgroundTransparent)) {
              const e4 = 0.3;
              i3.selectionInactiveBackgroundTransparent = o.color.opacity(i3.selectionInactiveBackgroundTransparent, e4);
            }
            if (i3.ansi = t2.DEFAULT_ANSI_COLORS.slice(), i3.ansi[0] = p(e3.black, t2.DEFAULT_ANSI_COLORS[0]), i3.ansi[1] = p(e3.red, t2.DEFAULT_ANSI_COLORS[1]), i3.ansi[2] = p(e3.green, t2.DEFAULT_ANSI_COLORS[2]), i3.ansi[3] = p(e3.yellow, t2.DEFAULT_ANSI_COLORS[3]), i3.ansi[4] = p(e3.blue, t2.DEFAULT_ANSI_COLORS[4]), i3.ansi[5] = p(e3.magenta, t2.DEFAULT_ANSI_COLORS[5]), i3.ansi[6] = p(e3.cyan, t2.DEFAULT_ANSI_COLORS[6]), i3.ansi[7] = p(e3.white, t2.DEFAULT_ANSI_COLORS[7]), i3.ansi[8] = p(e3.brightBlack, t2.DEFAULT_ANSI_COLORS[8]), i3.ansi[9] = p(e3.brightRed, t2.DEFAULT_ANSI_COLORS[9]), i3.ansi[10] = p(e3.brightGreen, t2.DEFAULT_ANSI_COLORS[10]), i3.ansi[11] = p(e3.brightYellow, t2.DEFAULT_ANSI_COLORS[11]), i3.ansi[12] = p(e3.brightBlue, t2.DEFAULT_ANSI_COLORS[12]), i3.ansi[13] = p(e3.brightMagenta, t2.DEFAULT_ANSI_COLORS[13]), i3.ansi[14] = p(e3.brightCyan, t2.DEFAULT_ANSI_COLORS[14]), i3.ansi[15] = p(e3.brightWhite, t2.DEFAULT_ANSI_COLORS[15]), e3.extendedAnsi) {
              const s3 = Math.min(i3.ansi.length - 16, e3.extendedAnsi.length);
              for (let r2 = 0; r2 < s3; r2++) i3.ansi[r2 + 16] = p(e3.extendedAnsi[r2], t2.DEFAULT_ANSI_COLORS[r2 + 16]);
            }
            this._contrastCache.clear(), this._halfContrastCache.clear(), this._updateRestoreColors(), this._onChangeColors.fire(this.colors);
          }
          restoreColor(e3) {
            this._restoreColor(e3), this._onChangeColors.fire(this.colors);
          }
          _restoreColor(e3) {
            if (void 0 !== e3) switch (e3) {
              case 256:
                this._colors.foreground = this._restoreColors.foreground;
                break;
              case 257:
                this._colors.background = this._restoreColors.background;
                break;
              case 258:
                this._colors.cursor = this._restoreColors.cursor;
                break;
              default:
                this._colors.ansi[e3] = this._restoreColors.ansi[e3];
            }
            else for (let e4 = 0; e4 < this._restoreColors.ansi.length; ++e4) this._colors.ansi[e4] = this._restoreColors.ansi[e4];
          }
          modifyColors(e3) {
            e3(this._colors), this._onChangeColors.fire(this.colors);
          }
          _updateRestoreColors() {
            this._restoreColors = { foreground: this._colors.foreground, background: this._colors.background, cursor: this._colors.cursor, ansi: this._colors.ansi.slice() };
          }
        };
        function p(e3, t3) {
          if (void 0 !== e3) try {
            return o.css.toColor(e3);
          } catch (e4) {
          }
          return t3;
        }
        t2.ThemeService = v = s2([r(0, c.IOptionsService)], v);
      }, 6349: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CircularList = void 0;
        const s2 = i2(8460), r = i2(844);
        class n extends r.Disposable {
          constructor(e3) {
            super(), this._maxLength = e3, this.onDeleteEmitter = this.register(new s2.EventEmitter()), this.onDelete = this.onDeleteEmitter.event, this.onInsertEmitter = this.register(new s2.EventEmitter()), this.onInsert = this.onInsertEmitter.event, this.onTrimEmitter = this.register(new s2.EventEmitter()), this.onTrim = this.onTrimEmitter.event, this._array = new Array(this._maxLength), this._startIndex = 0, this._length = 0;
          }
          get maxLength() {
            return this._maxLength;
          }
          set maxLength(e3) {
            if (this._maxLength === e3) return;
            const t3 = new Array(e3);
            for (let i3 = 0; i3 < Math.min(e3, this.length); i3++) t3[i3] = this._array[this._getCyclicIndex(i3)];
            this._array = t3, this._maxLength = e3, this._startIndex = 0;
          }
          get length() {
            return this._length;
          }
          set length(e3) {
            if (e3 > this._length) for (let t3 = this._length; t3 < e3; t3++) this._array[t3] = void 0;
            this._length = e3;
          }
          get(e3) {
            return this._array[this._getCyclicIndex(e3)];
          }
          set(e3, t3) {
            this._array[this._getCyclicIndex(e3)] = t3;
          }
          push(e3) {
            this._array[this._getCyclicIndex(this._length)] = e3, this._length === this._maxLength ? (this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1)) : this._length++;
          }
          recycle() {
            if (this._length !== this._maxLength) throw new Error("Can only recycle when the buffer is full");
            return this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1), this._array[this._getCyclicIndex(this._length - 1)];
          }
          get isFull() {
            return this._length === this._maxLength;
          }
          pop() {
            return this._array[this._getCyclicIndex(this._length-- - 1)];
          }
          splice(e3, t3, ...i3) {
            if (t3) {
              for (let i4 = e3; i4 < this._length - t3; i4++) this._array[this._getCyclicIndex(i4)] = this._array[this._getCyclicIndex(i4 + t3)];
              this._length -= t3, this.onDeleteEmitter.fire({ index: e3, amount: t3 });
            }
            for (let t4 = this._length - 1; t4 >= e3; t4--) this._array[this._getCyclicIndex(t4 + i3.length)] = this._array[this._getCyclicIndex(t4)];
            for (let t4 = 0; t4 < i3.length; t4++) this._array[this._getCyclicIndex(e3 + t4)] = i3[t4];
            if (i3.length && this.onInsertEmitter.fire({ index: e3, amount: i3.length }), this._length + i3.length > this._maxLength) {
              const e4 = this._length + i3.length - this._maxLength;
              this._startIndex += e4, this._length = this._maxLength, this.onTrimEmitter.fire(e4);
            } else this._length += i3.length;
          }
          trimStart(e3) {
            e3 > this._length && (e3 = this._length), this._startIndex += e3, this._length -= e3, this.onTrimEmitter.fire(e3);
          }
          shiftElements(e3, t3, i3) {
            if (!(t3 <= 0)) {
              if (e3 < 0 || e3 >= this._length) throw new Error("start argument out of range");
              if (e3 + i3 < 0) throw new Error("Cannot shift elements in list beyond index 0");
              if (i3 > 0) {
                for (let s4 = t3 - 1; s4 >= 0; s4--) this.set(e3 + s4 + i3, this.get(e3 + s4));
                const s3 = e3 + t3 + i3 - this._length;
                if (s3 > 0) for (this._length += s3; this._length > this._maxLength; ) this._length--, this._startIndex++, this.onTrimEmitter.fire(1);
              } else for (let s3 = 0; s3 < t3; s3++) this.set(e3 + s3 + i3, this.get(e3 + s3));
            }
          }
          _getCyclicIndex(e3) {
            return (this._startIndex + e3) % this._maxLength;
          }
        }
        t2.CircularList = n;
      }, 1439: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.clone = void 0, t2.clone = function e3(t3, i2 = 5) {
          if ("object" != typeof t3) return t3;
          const s2 = Array.isArray(t3) ? [] : {};
          for (const r in t3) s2[r] = i2 <= 1 ? t3[r] : t3[r] && e3(t3[r], i2 - 1);
          return s2;
        };
      }, 8055: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.contrastRatio = t2.toPaddedHex = t2.rgba = t2.rgb = t2.css = t2.color = t2.channels = t2.NULL_COLOR = void 0;
        const s2 = i2(6114);
        let r = 0, n = 0, o = 0, a = 0;
        var h2, c, l, d, _;
        function u(e3) {
          const t3 = e3.toString(16);
          return t3.length < 2 ? "0" + t3 : t3;
        }
        function f(e3, t3) {
          return e3 < t3 ? (t3 + 0.05) / (e3 + 0.05) : (e3 + 0.05) / (t3 + 0.05);
        }
        t2.NULL_COLOR = { css: "#00000000", rgba: 0 }, (function(e3) {
          e3.toCss = function(e4, t3, i3, s3) {
            return void 0 !== s3 ? `#${u(e4)}${u(t3)}${u(i3)}${u(s3)}` : `#${u(e4)}${u(t3)}${u(i3)}`;
          }, e3.toRgba = function(e4, t3, i3, s3 = 255) {
            return (e4 << 24 | t3 << 16 | i3 << 8 | s3) >>> 0;
          };
        })(h2 || (t2.channels = h2 = {})), (function(e3) {
          function t3(e4, t4) {
            return a = Math.round(255 * t4), [r, n, o] = _.toChannels(e4.rgba), { css: h2.toCss(r, n, o, a), rgba: h2.toRgba(r, n, o, a) };
          }
          e3.blend = function(e4, t4) {
            if (a = (255 & t4.rgba) / 255, 1 === a) return { css: t4.css, rgba: t4.rgba };
            const i3 = t4.rgba >> 24 & 255, s3 = t4.rgba >> 16 & 255, c2 = t4.rgba >> 8 & 255, l2 = e4.rgba >> 24 & 255, d2 = e4.rgba >> 16 & 255, _2 = e4.rgba >> 8 & 255;
            return r = l2 + Math.round((i3 - l2) * a), n = d2 + Math.round((s3 - d2) * a), o = _2 + Math.round((c2 - _2) * a), { css: h2.toCss(r, n, o), rgba: h2.toRgba(r, n, o) };
          }, e3.isOpaque = function(e4) {
            return 255 == (255 & e4.rgba);
          }, e3.ensureContrastRatio = function(e4, t4, i3) {
            const s3 = _.ensureContrastRatio(e4.rgba, t4.rgba, i3);
            if (s3) return _.toColor(s3 >> 24 & 255, s3 >> 16 & 255, s3 >> 8 & 255);
          }, e3.opaque = function(e4) {
            const t4 = (255 | e4.rgba) >>> 0;
            return [r, n, o] = _.toChannels(t4), { css: h2.toCss(r, n, o), rgba: t4 };
          }, e3.opacity = t3, e3.multiplyOpacity = function(e4, i3) {
            return a = 255 & e4.rgba, t3(e4, a * i3 / 255);
          }, e3.toColorRGB = function(e4) {
            return [e4.rgba >> 24 & 255, e4.rgba >> 16 & 255, e4.rgba >> 8 & 255];
          };
        })(c || (t2.color = c = {})), (function(e3) {
          let t3, i3;
          if (!s2.isNode) {
            const e4 = document.createElement("canvas");
            e4.width = 1, e4.height = 1;
            const s3 = e4.getContext("2d", { willReadFrequently: true });
            s3 && (t3 = s3, t3.globalCompositeOperation = "copy", i3 = t3.createLinearGradient(0, 0, 1, 1));
          }
          e3.toColor = function(e4) {
            if (e4.match(/#[\da-f]{3,8}/i)) switch (e4.length) {
              case 4:
                return r = parseInt(e4.slice(1, 2).repeat(2), 16), n = parseInt(e4.slice(2, 3).repeat(2), 16), o = parseInt(e4.slice(3, 4).repeat(2), 16), _.toColor(r, n, o);
              case 5:
                return r = parseInt(e4.slice(1, 2).repeat(2), 16), n = parseInt(e4.slice(2, 3).repeat(2), 16), o = parseInt(e4.slice(3, 4).repeat(2), 16), a = parseInt(e4.slice(4, 5).repeat(2), 16), _.toColor(r, n, o, a);
              case 7:
                return { css: e4, rgba: (parseInt(e4.slice(1), 16) << 8 | 255) >>> 0 };
              case 9:
                return { css: e4, rgba: parseInt(e4.slice(1), 16) >>> 0 };
            }
            const s3 = e4.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(0|1|\d?\.(\d+))\s*)?\)/);
            if (s3) return r = parseInt(s3[1]), n = parseInt(s3[2]), o = parseInt(s3[3]), a = Math.round(255 * (void 0 === s3[5] ? 1 : parseFloat(s3[5]))), _.toColor(r, n, o, a);
            if (!t3 || !i3) throw new Error("css.toColor: Unsupported css format");
            if (t3.fillStyle = i3, t3.fillStyle = e4, "string" != typeof t3.fillStyle) throw new Error("css.toColor: Unsupported css format");
            if (t3.fillRect(0, 0, 1, 1), [r, n, o, a] = t3.getImageData(0, 0, 1, 1).data, 255 !== a) throw new Error("css.toColor: Unsupported css format");
            return { rgba: h2.toRgba(r, n, o, a), css: e4 };
          };
        })(l || (t2.css = l = {})), (function(e3) {
          function t3(e4, t4, i3) {
            const s3 = e4 / 255, r2 = t4 / 255, n2 = i3 / 255;
            return 0.2126 * (s3 <= 0.03928 ? s3 / 12.92 : Math.pow((s3 + 0.055) / 1.055, 2.4)) + 0.7152 * (r2 <= 0.03928 ? r2 / 12.92 : Math.pow((r2 + 0.055) / 1.055, 2.4)) + 0.0722 * (n2 <= 0.03928 ? n2 / 12.92 : Math.pow((n2 + 0.055) / 1.055, 2.4));
          }
          e3.relativeLuminance = function(e4) {
            return t3(e4 >> 16 & 255, e4 >> 8 & 255, 255 & e4);
          }, e3.relativeLuminance2 = t3;
        })(d || (t2.rgb = d = {})), (function(e3) {
          function t3(e4, t4, i4) {
            const s3 = e4 >> 24 & 255, r2 = e4 >> 16 & 255, n2 = e4 >> 8 & 255;
            let o2 = t4 >> 24 & 255, a2 = t4 >> 16 & 255, h3 = t4 >> 8 & 255, c2 = f(d.relativeLuminance2(o2, a2, h3), d.relativeLuminance2(s3, r2, n2));
            for (; c2 < i4 && (o2 > 0 || a2 > 0 || h3 > 0); ) o2 -= Math.max(0, Math.ceil(0.1 * o2)), a2 -= Math.max(0, Math.ceil(0.1 * a2)), h3 -= Math.max(0, Math.ceil(0.1 * h3)), c2 = f(d.relativeLuminance2(o2, a2, h3), d.relativeLuminance2(s3, r2, n2));
            return (o2 << 24 | a2 << 16 | h3 << 8 | 255) >>> 0;
          }
          function i3(e4, t4, i4) {
            const s3 = e4 >> 24 & 255, r2 = e4 >> 16 & 255, n2 = e4 >> 8 & 255;
            let o2 = t4 >> 24 & 255, a2 = t4 >> 16 & 255, h3 = t4 >> 8 & 255, c2 = f(d.relativeLuminance2(o2, a2, h3), d.relativeLuminance2(s3, r2, n2));
            for (; c2 < i4 && (o2 < 255 || a2 < 255 || h3 < 255); ) o2 = Math.min(255, o2 + Math.ceil(0.1 * (255 - o2))), a2 = Math.min(255, a2 + Math.ceil(0.1 * (255 - a2))), h3 = Math.min(255, h3 + Math.ceil(0.1 * (255 - h3))), c2 = f(d.relativeLuminance2(o2, a2, h3), d.relativeLuminance2(s3, r2, n2));
            return (o2 << 24 | a2 << 16 | h3 << 8 | 255) >>> 0;
          }
          e3.ensureContrastRatio = function(e4, s3, r2) {
            const n2 = d.relativeLuminance(e4 >> 8), o2 = d.relativeLuminance(s3 >> 8);
            if (f(n2, o2) < r2) {
              if (o2 < n2) {
                const o3 = t3(e4, s3, r2), a3 = f(n2, d.relativeLuminance(o3 >> 8));
                if (a3 < r2) {
                  const t4 = i3(e4, s3, r2);
                  return a3 > f(n2, d.relativeLuminance(t4 >> 8)) ? o3 : t4;
                }
                return o3;
              }
              const a2 = i3(e4, s3, r2), h3 = f(n2, d.relativeLuminance(a2 >> 8));
              if (h3 < r2) {
                const i4 = t3(e4, s3, r2);
                return h3 > f(n2, d.relativeLuminance(i4 >> 8)) ? a2 : i4;
              }
              return a2;
            }
          }, e3.reduceLuminance = t3, e3.increaseLuminance = i3, e3.toChannels = function(e4) {
            return [e4 >> 24 & 255, e4 >> 16 & 255, e4 >> 8 & 255, 255 & e4];
          }, e3.toColor = function(e4, t4, i4, s3) {
            return { css: h2.toCss(e4, t4, i4, s3), rgba: h2.toRgba(e4, t4, i4, s3) };
          };
        })(_ || (t2.rgba = _ = {})), t2.toPaddedHex = u, t2.contrastRatio = f;
      }, 8969: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CoreTerminal = void 0;
        const s2 = i2(844), r = i2(2585), n = i2(4348), o = i2(7866), a = i2(744), h2 = i2(7302), c = i2(6975), l = i2(8460), d = i2(1753), _ = i2(1480), u = i2(7994), f = i2(9282), v = i2(5435), p = i2(5981), g = i2(2660);
        let m = false;
        class S extends s2.Disposable {
          get onScroll() {
            return this._onScrollApi || (this._onScrollApi = this.register(new l.EventEmitter()), this._onScroll.event(((e3) => {
              var t3;
              null === (t3 = this._onScrollApi) || void 0 === t3 || t3.fire(e3.position);
            }))), this._onScrollApi.event;
          }
          get cols() {
            return this._bufferService.cols;
          }
          get rows() {
            return this._bufferService.rows;
          }
          get buffers() {
            return this._bufferService.buffers;
          }
          get options() {
            return this.optionsService.options;
          }
          set options(e3) {
            for (const t3 in e3) this.optionsService.options[t3] = e3[t3];
          }
          constructor(e3) {
            super(), this._windowsWrappingHeuristics = this.register(new s2.MutableDisposable()), this._onBinary = this.register(new l.EventEmitter()), this.onBinary = this._onBinary.event, this._onData = this.register(new l.EventEmitter()), this.onData = this._onData.event, this._onLineFeed = this.register(new l.EventEmitter()), this.onLineFeed = this._onLineFeed.event, this._onResize = this.register(new l.EventEmitter()), this.onResize = this._onResize.event, this._onWriteParsed = this.register(new l.EventEmitter()), this.onWriteParsed = this._onWriteParsed.event, this._onScroll = this.register(new l.EventEmitter()), this._instantiationService = new n.InstantiationService(), this.optionsService = this.register(new h2.OptionsService(e3)), this._instantiationService.setService(r.IOptionsService, this.optionsService), this._bufferService = this.register(this._instantiationService.createInstance(a.BufferService)), this._instantiationService.setService(r.IBufferService, this._bufferService), this._logService = this.register(this._instantiationService.createInstance(o.LogService)), this._instantiationService.setService(r.ILogService, this._logService), this.coreService = this.register(this._instantiationService.createInstance(c.CoreService)), this._instantiationService.setService(r.ICoreService, this.coreService), this.coreMouseService = this.register(this._instantiationService.createInstance(d.CoreMouseService)), this._instantiationService.setService(r.ICoreMouseService, this.coreMouseService), this.unicodeService = this.register(this._instantiationService.createInstance(_.UnicodeService)), this._instantiationService.setService(r.IUnicodeService, this.unicodeService), this._charsetService = this._instantiationService.createInstance(u.CharsetService), this._instantiationService.setService(r.ICharsetService, this._charsetService), this._oscLinkService = this._instantiationService.createInstance(g.OscLinkService), this._instantiationService.setService(r.IOscLinkService, this._oscLinkService), this._inputHandler = this.register(new v.InputHandler(this._bufferService, this._charsetService, this.coreService, this._logService, this.optionsService, this._oscLinkService, this.coreMouseService, this.unicodeService)), this.register((0, l.forwardEvent)(this._inputHandler.onLineFeed, this._onLineFeed)), this.register(this._inputHandler), this.register((0, l.forwardEvent)(this._bufferService.onResize, this._onResize)), this.register((0, l.forwardEvent)(this.coreService.onData, this._onData)), this.register((0, l.forwardEvent)(this.coreService.onBinary, this._onBinary)), this.register(this.coreService.onRequestScrollToBottom((() => this.scrollToBottom()))), this.register(this.coreService.onUserInput((() => this._writeBuffer.handleUserInput()))), this.register(this.optionsService.onMultipleOptionChange(["windowsMode", "windowsPty"], (() => this._handleWindowsPtyOptionChange()))), this.register(this._bufferService.onScroll(((e4) => {
              this._onScroll.fire({ position: this._bufferService.buffer.ydisp, source: 0 }), this._inputHandler.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
            }))), this.register(this._inputHandler.onScroll(((e4) => {
              this._onScroll.fire({ position: this._bufferService.buffer.ydisp, source: 0 }), this._inputHandler.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
            }))), this._writeBuffer = this.register(new p.WriteBuffer(((e4, t3) => this._inputHandler.parse(e4, t3)))), this.register((0, l.forwardEvent)(this._writeBuffer.onWriteParsed, this._onWriteParsed));
          }
          write(e3, t3) {
            this._writeBuffer.write(e3, t3);
          }
          writeSync(e3, t3) {
            this._logService.logLevel <= r.LogLevelEnum.WARN && !m && (this._logService.warn("writeSync is unreliable and will be removed soon."), m = true), this._writeBuffer.writeSync(e3, t3);
          }
          resize(e3, t3) {
            isNaN(e3) || isNaN(t3) || (e3 = Math.max(e3, a.MINIMUM_COLS), t3 = Math.max(t3, a.MINIMUM_ROWS), this._bufferService.resize(e3, t3));
          }
          scroll(e3, t3 = false) {
            this._bufferService.scroll(e3, t3);
          }
          scrollLines(e3, t3, i3) {
            this._bufferService.scrollLines(e3, t3, i3);
          }
          scrollPages(e3) {
            this.scrollLines(e3 * (this.rows - 1));
          }
          scrollToTop() {
            this.scrollLines(-this._bufferService.buffer.ydisp);
          }
          scrollToBottom() {
            this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
          }
          scrollToLine(e3) {
            const t3 = e3 - this._bufferService.buffer.ydisp;
            0 !== t3 && this.scrollLines(t3);
          }
          registerEscHandler(e3, t3) {
            return this._inputHandler.registerEscHandler(e3, t3);
          }
          registerDcsHandler(e3, t3) {
            return this._inputHandler.registerDcsHandler(e3, t3);
          }
          registerCsiHandler(e3, t3) {
            return this._inputHandler.registerCsiHandler(e3, t3);
          }
          registerOscHandler(e3, t3) {
            return this._inputHandler.registerOscHandler(e3, t3);
          }
          _setup() {
            this._handleWindowsPtyOptionChange();
          }
          reset() {
            this._inputHandler.reset(), this._bufferService.reset(), this._charsetService.reset(), this.coreService.reset(), this.coreMouseService.reset();
          }
          _handleWindowsPtyOptionChange() {
            let e3 = false;
            const t3 = this.optionsService.rawOptions.windowsPty;
            t3 && void 0 !== t3.buildNumber && void 0 !== t3.buildNumber ? e3 = !!("conpty" === t3.backend && t3.buildNumber < 21376) : this.optionsService.rawOptions.windowsMode && (e3 = true), e3 ? this._enableWindowsWrappingHeuristics() : this._windowsWrappingHeuristics.clear();
          }
          _enableWindowsWrappingHeuristics() {
            if (!this._windowsWrappingHeuristics.value) {
              const e3 = [];
              e3.push(this.onLineFeed(f.updateWindowsModeWrappedState.bind(null, this._bufferService))), e3.push(this.registerCsiHandler({ final: "H" }, (() => ((0, f.updateWindowsModeWrappedState)(this._bufferService), false)))), this._windowsWrappingHeuristics.value = (0, s2.toDisposable)((() => {
                for (const t3 of e3) t3.dispose();
              }));
            }
          }
        }
        t2.CoreTerminal = S;
      }, 8460: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.forwardEvent = t2.EventEmitter = void 0, t2.EventEmitter = class {
          constructor() {
            this._listeners = [], this._disposed = false;
          }
          get event() {
            return this._event || (this._event = (e3) => (this._listeners.push(e3), { dispose: () => {
              if (!this._disposed) {
                for (let t3 = 0; t3 < this._listeners.length; t3++) if (this._listeners[t3] === e3) return void this._listeners.splice(t3, 1);
              }
            } })), this._event;
          }
          fire(e3, t3) {
            const i2 = [];
            for (let e4 = 0; e4 < this._listeners.length; e4++) i2.push(this._listeners[e4]);
            for (let s2 = 0; s2 < i2.length; s2++) i2[s2].call(void 0, e3, t3);
          }
          dispose() {
            this.clearListeners(), this._disposed = true;
          }
          clearListeners() {
            this._listeners && (this._listeners.length = 0);
          }
        }, t2.forwardEvent = function(e3, t3) {
          return e3(((e4) => t3.fire(e4)));
        };
      }, 5435: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.InputHandler = t2.WindowsOptionsReportType = void 0;
        const n = i2(2584), o = i2(7116), a = i2(2015), h2 = i2(844), c = i2(482), l = i2(8437), d = i2(8460), _ = i2(643), u = i2(511), f = i2(3734), v = i2(2585), p = i2(6242), g = i2(6351), m = i2(5941), S = { "(": 0, ")": 1, "*": 2, "+": 3, "-": 1, ".": 2 }, C = 131072;
        function b(e3, t3) {
          if (e3 > 24) return t3.setWinLines || false;
          switch (e3) {
            case 1:
              return !!t3.restoreWin;
            case 2:
              return !!t3.minimizeWin;
            case 3:
              return !!t3.setWinPosition;
            case 4:
              return !!t3.setWinSizePixels;
            case 5:
              return !!t3.raiseWin;
            case 6:
              return !!t3.lowerWin;
            case 7:
              return !!t3.refreshWin;
            case 8:
              return !!t3.setWinSizeChars;
            case 9:
              return !!t3.maximizeWin;
            case 10:
              return !!t3.fullscreenWin;
            case 11:
              return !!t3.getWinState;
            case 13:
              return !!t3.getWinPosition;
            case 14:
              return !!t3.getWinSizePixels;
            case 15:
              return !!t3.getScreenSizePixels;
            case 16:
              return !!t3.getCellSizePixels;
            case 18:
              return !!t3.getWinSizeChars;
            case 19:
              return !!t3.getScreenSizeChars;
            case 20:
              return !!t3.getIconTitle;
            case 21:
              return !!t3.getWinTitle;
            case 22:
              return !!t3.pushTitle;
            case 23:
              return !!t3.popTitle;
            case 24:
              return !!t3.setWinLines;
          }
          return false;
        }
        var y;
        !(function(e3) {
          e3[e3.GET_WIN_SIZE_PIXELS = 0] = "GET_WIN_SIZE_PIXELS", e3[e3.GET_CELL_SIZE_PIXELS = 1] = "GET_CELL_SIZE_PIXELS";
        })(y || (t2.WindowsOptionsReportType = y = {}));
        let w = 0;
        class E extends h2.Disposable {
          getAttrData() {
            return this._curAttrData;
          }
          constructor(e3, t3, i3, s3, r2, h3, _2, f2, v2 = new a.EscapeSequenceParser()) {
            super(), this._bufferService = e3, this._charsetService = t3, this._coreService = i3, this._logService = s3, this._optionsService = r2, this._oscLinkService = h3, this._coreMouseService = _2, this._unicodeService = f2, this._parser = v2, this._parseBuffer = new Uint32Array(4096), this._stringDecoder = new c.StringToUtf32(), this._utf8Decoder = new c.Utf8ToUtf32(), this._workCell = new u.CellData(), this._windowTitle = "", this._iconName = "", this._windowTitleStack = [], this._iconNameStack = [], this._curAttrData = l.DEFAULT_ATTR_DATA.clone(), this._eraseAttrDataInternal = l.DEFAULT_ATTR_DATA.clone(), this._onRequestBell = this.register(new d.EventEmitter()), this.onRequestBell = this._onRequestBell.event, this._onRequestRefreshRows = this.register(new d.EventEmitter()), this.onRequestRefreshRows = this._onRequestRefreshRows.event, this._onRequestReset = this.register(new d.EventEmitter()), this.onRequestReset = this._onRequestReset.event, this._onRequestSendFocus = this.register(new d.EventEmitter()), this.onRequestSendFocus = this._onRequestSendFocus.event, this._onRequestSyncScrollBar = this.register(new d.EventEmitter()), this.onRequestSyncScrollBar = this._onRequestSyncScrollBar.event, this._onRequestWindowsOptionsReport = this.register(new d.EventEmitter()), this.onRequestWindowsOptionsReport = this._onRequestWindowsOptionsReport.event, this._onA11yChar = this.register(new d.EventEmitter()), this.onA11yChar = this._onA11yChar.event, this._onA11yTab = this.register(new d.EventEmitter()), this.onA11yTab = this._onA11yTab.event, this._onCursorMove = this.register(new d.EventEmitter()), this.onCursorMove = this._onCursorMove.event, this._onLineFeed = this.register(new d.EventEmitter()), this.onLineFeed = this._onLineFeed.event, this._onScroll = this.register(new d.EventEmitter()), this.onScroll = this._onScroll.event, this._onTitleChange = this.register(new d.EventEmitter()), this.onTitleChange = this._onTitleChange.event, this._onColor = this.register(new d.EventEmitter()), this.onColor = this._onColor.event, this._parseStack = { paused: false, cursorStartX: 0, cursorStartY: 0, decodedLength: 0, position: 0 }, this._specialColors = [256, 257, 258], this.register(this._parser), this._dirtyRowTracker = new k(this._bufferService), this._activeBuffer = this._bufferService.buffer, this.register(this._bufferService.buffers.onBufferActivate(((e4) => this._activeBuffer = e4.activeBuffer))), this._parser.setCsiHandlerFallback(((e4, t4) => {
              this._logService.debug("Unknown CSI code: ", { identifier: this._parser.identToString(e4), params: t4.toArray() });
            })), this._parser.setEscHandlerFallback(((e4) => {
              this._logService.debug("Unknown ESC code: ", { identifier: this._parser.identToString(e4) });
            })), this._parser.setExecuteHandlerFallback(((e4) => {
              this._logService.debug("Unknown EXECUTE code: ", { code: e4 });
            })), this._parser.setOscHandlerFallback(((e4, t4, i4) => {
              this._logService.debug("Unknown OSC code: ", { identifier: e4, action: t4, data: i4 });
            })), this._parser.setDcsHandlerFallback(((e4, t4, i4) => {
              "HOOK" === t4 && (i4 = i4.toArray()), this._logService.debug("Unknown DCS code: ", { identifier: this._parser.identToString(e4), action: t4, payload: i4 });
            })), this._parser.setPrintHandler(((e4, t4, i4) => this.print(e4, t4, i4))), this._parser.registerCsiHandler({ final: "@" }, ((e4) => this.insertChars(e4))), this._parser.registerCsiHandler({ intermediates: " ", final: "@" }, ((e4) => this.scrollLeft(e4))), this._parser.registerCsiHandler({ final: "A" }, ((e4) => this.cursorUp(e4))), this._parser.registerCsiHandler({ intermediates: " ", final: "A" }, ((e4) => this.scrollRight(e4))), this._parser.registerCsiHandler({ final: "B" }, ((e4) => this.cursorDown(e4))), this._parser.registerCsiHandler({ final: "C" }, ((e4) => this.cursorForward(e4))), this._parser.registerCsiHandler({ final: "D" }, ((e4) => this.cursorBackward(e4))), this._parser.registerCsiHandler({ final: "E" }, ((e4) => this.cursorNextLine(e4))), this._parser.registerCsiHandler({ final: "F" }, ((e4) => this.cursorPrecedingLine(e4))), this._parser.registerCsiHandler({ final: "G" }, ((e4) => this.cursorCharAbsolute(e4))), this._parser.registerCsiHandler({ final: "H" }, ((e4) => this.cursorPosition(e4))), this._parser.registerCsiHandler({ final: "I" }, ((e4) => this.cursorForwardTab(e4))), this._parser.registerCsiHandler({ final: "J" }, ((e4) => this.eraseInDisplay(e4, false))), this._parser.registerCsiHandler({ prefix: "?", final: "J" }, ((e4) => this.eraseInDisplay(e4, true))), this._parser.registerCsiHandler({ final: "K" }, ((e4) => this.eraseInLine(e4, false))), this._parser.registerCsiHandler({ prefix: "?", final: "K" }, ((e4) => this.eraseInLine(e4, true))), this._parser.registerCsiHandler({ final: "L" }, ((e4) => this.insertLines(e4))), this._parser.registerCsiHandler({ final: "M" }, ((e4) => this.deleteLines(e4))), this._parser.registerCsiHandler({ final: "P" }, ((e4) => this.deleteChars(e4))), this._parser.registerCsiHandler({ final: "S" }, ((e4) => this.scrollUp(e4))), this._parser.registerCsiHandler({ final: "T" }, ((e4) => this.scrollDown(e4))), this._parser.registerCsiHandler({ final: "X" }, ((e4) => this.eraseChars(e4))), this._parser.registerCsiHandler({ final: "Z" }, ((e4) => this.cursorBackwardTab(e4))), this._parser.registerCsiHandler({ final: "`" }, ((e4) => this.charPosAbsolute(e4))), this._parser.registerCsiHandler({ final: "a" }, ((e4) => this.hPositionRelative(e4))), this._parser.registerCsiHandler({ final: "b" }, ((e4) => this.repeatPrecedingCharacter(e4))), this._parser.registerCsiHandler({ final: "c" }, ((e4) => this.sendDeviceAttributesPrimary(e4))), this._parser.registerCsiHandler({ prefix: ">", final: "c" }, ((e4) => this.sendDeviceAttributesSecondary(e4))), this._parser.registerCsiHandler({ final: "d" }, ((e4) => this.linePosAbsolute(e4))), this._parser.registerCsiHandler({ final: "e" }, ((e4) => this.vPositionRelative(e4))), this._parser.registerCsiHandler({ final: "f" }, ((e4) => this.hVPosition(e4))), this._parser.registerCsiHandler({ final: "g" }, ((e4) => this.tabClear(e4))), this._parser.registerCsiHandler({ final: "h" }, ((e4) => this.setMode(e4))), this._parser.registerCsiHandler({ prefix: "?", final: "h" }, ((e4) => this.setModePrivate(e4))), this._parser.registerCsiHandler({ final: "l" }, ((e4) => this.resetMode(e4))), this._parser.registerCsiHandler({ prefix: "?", final: "l" }, ((e4) => this.resetModePrivate(e4))), this._parser.registerCsiHandler({ final: "m" }, ((e4) => this.charAttributes(e4))), this._parser.registerCsiHandler({ final: "n" }, ((e4) => this.deviceStatus(e4))), this._parser.registerCsiHandler({ prefix: "?", final: "n" }, ((e4) => this.deviceStatusPrivate(e4))), this._parser.registerCsiHandler({ intermediates: "!", final: "p" }, ((e4) => this.softReset(e4))), this._parser.registerCsiHandler({ intermediates: " ", final: "q" }, ((e4) => this.setCursorStyle(e4))), this._parser.registerCsiHandler({ final: "r" }, ((e4) => this.setScrollRegion(e4))), this._parser.registerCsiHandler({ final: "s" }, ((e4) => this.saveCursor(e4))), this._parser.registerCsiHandler({ final: "t" }, ((e4) => this.windowOptions(e4))), this._parser.registerCsiHandler({ final: "u" }, ((e4) => this.restoreCursor(e4))), this._parser.registerCsiHandler({ intermediates: "'", final: "}" }, ((e4) => this.insertColumns(e4))), this._parser.registerCsiHandler({ intermediates: "'", final: "~" }, ((e4) => this.deleteColumns(e4))), this._parser.registerCsiHandler({ intermediates: '"', final: "q" }, ((e4) => this.selectProtected(e4))), this._parser.registerCsiHandler({ intermediates: "$", final: "p" }, ((e4) => this.requestMode(e4, true))), this._parser.registerCsiHandler({ prefix: "?", intermediates: "$", final: "p" }, ((e4) => this.requestMode(e4, false))), this._parser.setExecuteHandler(n.C0.BEL, (() => this.bell())), this._parser.setExecuteHandler(n.C0.LF, (() => this.lineFeed())), this._parser.setExecuteHandler(n.C0.VT, (() => this.lineFeed())), this._parser.setExecuteHandler(n.C0.FF, (() => this.lineFeed())), this._parser.setExecuteHandler(n.C0.CR, (() => this.carriageReturn())), this._parser.setExecuteHandler(n.C0.BS, (() => this.backspace())), this._parser.setExecuteHandler(n.C0.HT, (() => this.tab())), this._parser.setExecuteHandler(n.C0.SO, (() => this.shiftOut())), this._parser.setExecuteHandler(n.C0.SI, (() => this.shiftIn())), this._parser.setExecuteHandler(n.C1.IND, (() => this.index())), this._parser.setExecuteHandler(n.C1.NEL, (() => this.nextLine())), this._parser.setExecuteHandler(n.C1.HTS, (() => this.tabSet())), this._parser.registerOscHandler(0, new p.OscHandler(((e4) => (this.setTitle(e4), this.setIconName(e4), true)))), this._parser.registerOscHandler(1, new p.OscHandler(((e4) => this.setIconName(e4)))), this._parser.registerOscHandler(2, new p.OscHandler(((e4) => this.setTitle(e4)))), this._parser.registerOscHandler(4, new p.OscHandler(((e4) => this.setOrReportIndexedColor(e4)))), this._parser.registerOscHandler(8, new p.OscHandler(((e4) => this.setHyperlink(e4)))), this._parser.registerOscHandler(10, new p.OscHandler(((e4) => this.setOrReportFgColor(e4)))), this._parser.registerOscHandler(11, new p.OscHandler(((e4) => this.setOrReportBgColor(e4)))), this._parser.registerOscHandler(12, new p.OscHandler(((e4) => this.setOrReportCursorColor(e4)))), this._parser.registerOscHandler(104, new p.OscHandler(((e4) => this.restoreIndexedColor(e4)))), this._parser.registerOscHandler(110, new p.OscHandler(((e4) => this.restoreFgColor(e4)))), this._parser.registerOscHandler(111, new p.OscHandler(((e4) => this.restoreBgColor(e4)))), this._parser.registerOscHandler(112, new p.OscHandler(((e4) => this.restoreCursorColor(e4)))), this._parser.registerEscHandler({ final: "7" }, (() => this.saveCursor())), this._parser.registerEscHandler({ final: "8" }, (() => this.restoreCursor())), this._parser.registerEscHandler({ final: "D" }, (() => this.index())), this._parser.registerEscHandler({ final: "E" }, (() => this.nextLine())), this._parser.registerEscHandler({ final: "H" }, (() => this.tabSet())), this._parser.registerEscHandler({ final: "M" }, (() => this.reverseIndex())), this._parser.registerEscHandler({ final: "=" }, (() => this.keypadApplicationMode())), this._parser.registerEscHandler({ final: ">" }, (() => this.keypadNumericMode())), this._parser.registerEscHandler({ final: "c" }, (() => this.fullReset())), this._parser.registerEscHandler({ final: "n" }, (() => this.setgLevel(2))), this._parser.registerEscHandler({ final: "o" }, (() => this.setgLevel(3))), this._parser.registerEscHandler({ final: "|" }, (() => this.setgLevel(3))), this._parser.registerEscHandler({ final: "}" }, (() => this.setgLevel(2))), this._parser.registerEscHandler({ final: "~" }, (() => this.setgLevel(1))), this._parser.registerEscHandler({ intermediates: "%", final: "@" }, (() => this.selectDefaultCharset())), this._parser.registerEscHandler({ intermediates: "%", final: "G" }, (() => this.selectDefaultCharset()));
            for (const e4 in o.CHARSETS) this._parser.registerEscHandler({ intermediates: "(", final: e4 }, (() => this.selectCharset("(" + e4))), this._parser.registerEscHandler({ intermediates: ")", final: e4 }, (() => this.selectCharset(")" + e4))), this._parser.registerEscHandler({ intermediates: "*", final: e4 }, (() => this.selectCharset("*" + e4))), this._parser.registerEscHandler({ intermediates: "+", final: e4 }, (() => this.selectCharset("+" + e4))), this._parser.registerEscHandler({ intermediates: "-", final: e4 }, (() => this.selectCharset("-" + e4))), this._parser.registerEscHandler({ intermediates: ".", final: e4 }, (() => this.selectCharset("." + e4))), this._parser.registerEscHandler({ intermediates: "/", final: e4 }, (() => this.selectCharset("/" + e4)));
            this._parser.registerEscHandler({ intermediates: "#", final: "8" }, (() => this.screenAlignmentPattern())), this._parser.setErrorHandler(((e4) => (this._logService.error("Parsing error: ", e4), e4))), this._parser.registerDcsHandler({ intermediates: "$", final: "q" }, new g.DcsHandler(((e4, t4) => this.requestStatusString(e4, t4))));
          }
          _preserveStack(e3, t3, i3, s3) {
            this._parseStack.paused = true, this._parseStack.cursorStartX = e3, this._parseStack.cursorStartY = t3, this._parseStack.decodedLength = i3, this._parseStack.position = s3;
          }
          _logSlowResolvingAsync(e3) {
            this._logService.logLevel <= v.LogLevelEnum.WARN && Promise.race([e3, new Promise(((e4, t3) => setTimeout((() => t3("#SLOW_TIMEOUT")), 5e3)))]).catch(((e4) => {
              if ("#SLOW_TIMEOUT" !== e4) throw e4;
              console.warn("async parser handler taking longer than 5000 ms");
            }));
          }
          _getCurrentLinkId() {
            return this._curAttrData.extended.urlId;
          }
          parse(e3, t3) {
            let i3, s3 = this._activeBuffer.x, r2 = this._activeBuffer.y, n2 = 0;
            const o2 = this._parseStack.paused;
            if (o2) {
              if (i3 = this._parser.parse(this._parseBuffer, this._parseStack.decodedLength, t3)) return this._logSlowResolvingAsync(i3), i3;
              s3 = this._parseStack.cursorStartX, r2 = this._parseStack.cursorStartY, this._parseStack.paused = false, e3.length > C && (n2 = this._parseStack.position + C);
            }
            if (this._logService.logLevel <= v.LogLevelEnum.DEBUG && this._logService.debug("parsing data" + ("string" == typeof e3 ? ` "${e3}"` : ` "${Array.prototype.map.call(e3, ((e4) => String.fromCharCode(e4))).join("")}"`), "string" == typeof e3 ? e3.split("").map(((e4) => e4.charCodeAt(0))) : e3), this._parseBuffer.length < e3.length && this._parseBuffer.length < C && (this._parseBuffer = new Uint32Array(Math.min(e3.length, C))), o2 || this._dirtyRowTracker.clearRange(), e3.length > C) for (let t4 = n2; t4 < e3.length; t4 += C) {
              const n3 = t4 + C < e3.length ? t4 + C : e3.length, o3 = "string" == typeof e3 ? this._stringDecoder.decode(e3.substring(t4, n3), this._parseBuffer) : this._utf8Decoder.decode(e3.subarray(t4, n3), this._parseBuffer);
              if (i3 = this._parser.parse(this._parseBuffer, o3)) return this._preserveStack(s3, r2, o3, t4), this._logSlowResolvingAsync(i3), i3;
            }
            else if (!o2) {
              const t4 = "string" == typeof e3 ? this._stringDecoder.decode(e3, this._parseBuffer) : this._utf8Decoder.decode(e3, this._parseBuffer);
              if (i3 = this._parser.parse(this._parseBuffer, t4)) return this._preserveStack(s3, r2, t4, 0), this._logSlowResolvingAsync(i3), i3;
            }
            this._activeBuffer.x === s3 && this._activeBuffer.y === r2 || this._onCursorMove.fire(), this._onRequestRefreshRows.fire(this._dirtyRowTracker.start, this._dirtyRowTracker.end);
          }
          print(e3, t3, i3) {
            let s3, r2;
            const n2 = this._charsetService.charset, o2 = this._optionsService.rawOptions.screenReaderMode, a2 = this._bufferService.cols, h3 = this._coreService.decPrivateModes.wraparound, l2 = this._coreService.modes.insertMode, d2 = this._curAttrData;
            let u2 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._activeBuffer.x && i3 - t3 > 0 && 2 === u2.getWidth(this._activeBuffer.x - 1) && u2.setCellFromCodePoint(this._activeBuffer.x - 1, 0, 1, d2.fg, d2.bg, d2.extended);
            for (let f2 = t3; f2 < i3; ++f2) {
              if (s3 = e3[f2], r2 = this._unicodeService.wcwidth(s3), s3 < 127 && n2) {
                const e4 = n2[String.fromCharCode(s3)];
                e4 && (s3 = e4.charCodeAt(0));
              }
              if (o2 && this._onA11yChar.fire((0, c.stringFromCodePoint)(s3)), this._getCurrentLinkId() && this._oscLinkService.addLineToLink(this._getCurrentLinkId(), this._activeBuffer.ybase + this._activeBuffer.y), r2 || !this._activeBuffer.x) {
                if (this._activeBuffer.x + r2 - 1 >= a2) {
                  if (h3) {
                    for (; this._activeBuffer.x < a2; ) u2.setCellFromCodePoint(this._activeBuffer.x++, 0, 1, d2.fg, d2.bg, d2.extended);
                    this._activeBuffer.x = 0, this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData(), true)) : (this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = true), u2 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
                  } else if (this._activeBuffer.x = a2 - 1, 2 === r2) continue;
                }
                if (l2 && (u2.insertCells(this._activeBuffer.x, r2, this._activeBuffer.getNullCell(d2), d2), 2 === u2.getWidth(a2 - 1) && u2.setCellFromCodePoint(a2 - 1, _.NULL_CELL_CODE, _.NULL_CELL_WIDTH, d2.fg, d2.bg, d2.extended)), u2.setCellFromCodePoint(this._activeBuffer.x++, s3, r2, d2.fg, d2.bg, d2.extended), r2 > 0) for (; --r2; ) u2.setCellFromCodePoint(this._activeBuffer.x++, 0, 0, d2.fg, d2.bg, d2.extended);
              } else u2.getWidth(this._activeBuffer.x - 1) ? u2.addCodepointToCell(this._activeBuffer.x - 1, s3) : u2.addCodepointToCell(this._activeBuffer.x - 2, s3);
            }
            i3 - t3 > 0 && (u2.loadCell(this._activeBuffer.x - 1, this._workCell), 2 === this._workCell.getWidth() || this._workCell.getCode() > 65535 ? this._parser.precedingCodepoint = 0 : this._workCell.isCombined() ? this._parser.precedingCodepoint = this._workCell.getChars().charCodeAt(0) : this._parser.precedingCodepoint = this._workCell.content), this._activeBuffer.x < a2 && i3 - t3 > 0 && 0 === u2.getWidth(this._activeBuffer.x) && !u2.hasContent(this._activeBuffer.x) && u2.setCellFromCodePoint(this._activeBuffer.x, 0, 1, d2.fg, d2.bg, d2.extended), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
          }
          registerCsiHandler(e3, t3) {
            return "t" !== e3.final || e3.prefix || e3.intermediates ? this._parser.registerCsiHandler(e3, t3) : this._parser.registerCsiHandler(e3, ((e4) => !b(e4.params[0], this._optionsService.rawOptions.windowOptions) || t3(e4)));
          }
          registerDcsHandler(e3, t3) {
            return this._parser.registerDcsHandler(e3, new g.DcsHandler(t3));
          }
          registerEscHandler(e3, t3) {
            return this._parser.registerEscHandler(e3, t3);
          }
          registerOscHandler(e3, t3) {
            return this._parser.registerOscHandler(e3, new p.OscHandler(t3));
          }
          bell() {
            return this._onRequestBell.fire(), true;
          }
          lineFeed() {
            return this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._optionsService.rawOptions.convertEol && (this._activeBuffer.x = 0), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows ? this._activeBuffer.y = this._bufferService.rows - 1 : this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false, this._activeBuffer.x >= this._bufferService.cols && this._activeBuffer.x--, this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._onLineFeed.fire(), true;
          }
          carriageReturn() {
            return this._activeBuffer.x = 0, true;
          }
          backspace() {
            var e3;
            if (!this._coreService.decPrivateModes.reverseWraparound) return this._restrictCursor(), this._activeBuffer.x > 0 && this._activeBuffer.x--, true;
            if (this._restrictCursor(this._bufferService.cols), this._activeBuffer.x > 0) this._activeBuffer.x--;
            else if (0 === this._activeBuffer.x && this._activeBuffer.y > this._activeBuffer.scrollTop && this._activeBuffer.y <= this._activeBuffer.scrollBottom && (null === (e3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y)) || void 0 === e3 ? void 0 : e3.isWrapped)) {
              this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false, this._activeBuffer.y--, this._activeBuffer.x = this._bufferService.cols - 1;
              const e4 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
              e4.hasWidth(this._activeBuffer.x) && !e4.hasContent(this._activeBuffer.x) && this._activeBuffer.x--;
            }
            return this._restrictCursor(), true;
          }
          tab() {
            if (this._activeBuffer.x >= this._bufferService.cols) return true;
            const e3 = this._activeBuffer.x;
            return this._activeBuffer.x = this._activeBuffer.nextStop(), this._optionsService.rawOptions.screenReaderMode && this._onA11yTab.fire(this._activeBuffer.x - e3), true;
          }
          shiftOut() {
            return this._charsetService.setgLevel(1), true;
          }
          shiftIn() {
            return this._charsetService.setgLevel(0), true;
          }
          _restrictCursor(e3 = this._bufferService.cols - 1) {
            this._activeBuffer.x = Math.min(e3, Math.max(0, this._activeBuffer.x)), this._activeBuffer.y = this._coreService.decPrivateModes.origin ? Math.min(this._activeBuffer.scrollBottom, Math.max(this._activeBuffer.scrollTop, this._activeBuffer.y)) : Math.min(this._bufferService.rows - 1, Math.max(0, this._activeBuffer.y)), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
          }
          _setCursor(e3, t3) {
            this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._coreService.decPrivateModes.origin ? (this._activeBuffer.x = e3, this._activeBuffer.y = this._activeBuffer.scrollTop + t3) : (this._activeBuffer.x = e3, this._activeBuffer.y = t3), this._restrictCursor(), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
          }
          _moveCursor(e3, t3) {
            this._restrictCursor(), this._setCursor(this._activeBuffer.x + e3, this._activeBuffer.y + t3);
          }
          cursorUp(e3) {
            const t3 = this._activeBuffer.y - this._activeBuffer.scrollTop;
            return t3 >= 0 ? this._moveCursor(0, -Math.min(t3, e3.params[0] || 1)) : this._moveCursor(0, -(e3.params[0] || 1)), true;
          }
          cursorDown(e3) {
            const t3 = this._activeBuffer.scrollBottom - this._activeBuffer.y;
            return t3 >= 0 ? this._moveCursor(0, Math.min(t3, e3.params[0] || 1)) : this._moveCursor(0, e3.params[0] || 1), true;
          }
          cursorForward(e3) {
            return this._moveCursor(e3.params[0] || 1, 0), true;
          }
          cursorBackward(e3) {
            return this._moveCursor(-(e3.params[0] || 1), 0), true;
          }
          cursorNextLine(e3) {
            return this.cursorDown(e3), this._activeBuffer.x = 0, true;
          }
          cursorPrecedingLine(e3) {
            return this.cursorUp(e3), this._activeBuffer.x = 0, true;
          }
          cursorCharAbsolute(e3) {
            return this._setCursor((e3.params[0] || 1) - 1, this._activeBuffer.y), true;
          }
          cursorPosition(e3) {
            return this._setCursor(e3.length >= 2 ? (e3.params[1] || 1) - 1 : 0, (e3.params[0] || 1) - 1), true;
          }
          charPosAbsolute(e3) {
            return this._setCursor((e3.params[0] || 1) - 1, this._activeBuffer.y), true;
          }
          hPositionRelative(e3) {
            return this._moveCursor(e3.params[0] || 1, 0), true;
          }
          linePosAbsolute(e3) {
            return this._setCursor(this._activeBuffer.x, (e3.params[0] || 1) - 1), true;
          }
          vPositionRelative(e3) {
            return this._moveCursor(0, e3.params[0] || 1), true;
          }
          hVPosition(e3) {
            return this.cursorPosition(e3), true;
          }
          tabClear(e3) {
            const t3 = e3.params[0];
            return 0 === t3 ? delete this._activeBuffer.tabs[this._activeBuffer.x] : 3 === t3 && (this._activeBuffer.tabs = {}), true;
          }
          cursorForwardTab(e3) {
            if (this._activeBuffer.x >= this._bufferService.cols) return true;
            let t3 = e3.params[0] || 1;
            for (; t3--; ) this._activeBuffer.x = this._activeBuffer.nextStop();
            return true;
          }
          cursorBackwardTab(e3) {
            if (this._activeBuffer.x >= this._bufferService.cols) return true;
            let t3 = e3.params[0] || 1;
            for (; t3--; ) this._activeBuffer.x = this._activeBuffer.prevStop();
            return true;
          }
          selectProtected(e3) {
            const t3 = e3.params[0];
            return 1 === t3 && (this._curAttrData.bg |= 536870912), 2 !== t3 && 0 !== t3 || (this._curAttrData.bg &= -536870913), true;
          }
          _eraseInBufferLine(e3, t3, i3, s3 = false, r2 = false) {
            const n2 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e3);
            n2.replaceCells(t3, i3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData(), r2), s3 && (n2.isWrapped = false);
          }
          _resetBufferLine(e3, t3 = false) {
            const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e3);
            i3 && (i3.fill(this._activeBuffer.getNullCell(this._eraseAttrData()), t3), this._bufferService.buffer.clearMarkers(this._activeBuffer.ybase + e3), i3.isWrapped = false);
          }
          eraseInDisplay(e3, t3 = false) {
            let i3;
            switch (this._restrictCursor(this._bufferService.cols), e3.params[0]) {
              case 0:
                for (i3 = this._activeBuffer.y, this._dirtyRowTracker.markDirty(i3), this._eraseInBufferLine(i3++, this._activeBuffer.x, this._bufferService.cols, 0 === this._activeBuffer.x, t3); i3 < this._bufferService.rows; i3++) this._resetBufferLine(i3, t3);
                this._dirtyRowTracker.markDirty(i3);
                break;
              case 1:
                for (i3 = this._activeBuffer.y, this._dirtyRowTracker.markDirty(i3), this._eraseInBufferLine(i3, 0, this._activeBuffer.x + 1, true, t3), this._activeBuffer.x + 1 >= this._bufferService.cols && (this._activeBuffer.lines.get(i3 + 1).isWrapped = false); i3--; ) this._resetBufferLine(i3, t3);
                this._dirtyRowTracker.markDirty(0);
                break;
              case 2:
                for (i3 = this._bufferService.rows, this._dirtyRowTracker.markDirty(i3 - 1); i3--; ) this._resetBufferLine(i3, t3);
                this._dirtyRowTracker.markDirty(0);
                break;
              case 3:
                const e4 = this._activeBuffer.lines.length - this._bufferService.rows;
                e4 > 0 && (this._activeBuffer.lines.trimStart(e4), this._activeBuffer.ybase = Math.max(this._activeBuffer.ybase - e4, 0), this._activeBuffer.ydisp = Math.max(this._activeBuffer.ydisp - e4, 0), this._onScroll.fire(0));
            }
            return true;
          }
          eraseInLine(e3, t3 = false) {
            switch (this._restrictCursor(this._bufferService.cols), e3.params[0]) {
              case 0:
                this._eraseInBufferLine(this._activeBuffer.y, this._activeBuffer.x, this._bufferService.cols, 0 === this._activeBuffer.x, t3);
                break;
              case 1:
                this._eraseInBufferLine(this._activeBuffer.y, 0, this._activeBuffer.x + 1, false, t3);
                break;
              case 2:
                this._eraseInBufferLine(this._activeBuffer.y, 0, this._bufferService.cols, true, t3);
            }
            return this._dirtyRowTracker.markDirty(this._activeBuffer.y), true;
          }
          insertLines(e3) {
            this._restrictCursor();
            let t3 = e3.params[0] || 1;
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const i3 = this._activeBuffer.ybase + this._activeBuffer.y, s3 = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, r2 = this._bufferService.rows - 1 + this._activeBuffer.ybase - s3 + 1;
            for (; t3--; ) this._activeBuffer.lines.splice(r2 - 1, 1), this._activeBuffer.lines.splice(i3, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, true;
          }
          deleteLines(e3) {
            this._restrictCursor();
            let t3 = e3.params[0] || 1;
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const i3 = this._activeBuffer.ybase + this._activeBuffer.y;
            let s3;
            for (s3 = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, s3 = this._bufferService.rows - 1 + this._activeBuffer.ybase - s3; t3--; ) this._activeBuffer.lines.splice(i3, 1), this._activeBuffer.lines.splice(s3, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, true;
          }
          insertChars(e3) {
            this._restrictCursor();
            const t3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            return t3 && (t3.insertCells(this._activeBuffer.x, e3.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
          }
          deleteChars(e3) {
            this._restrictCursor();
            const t3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            return t3 && (t3.deleteCells(this._activeBuffer.x, e3.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
          }
          scrollUp(e3) {
            let t3 = e3.params[0] || 1;
            for (; t3--; ) this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          scrollDown(e3) {
            let t3 = e3.params[0] || 1;
            for (; t3--; ) this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 0, this._activeBuffer.getBlankLine(l.DEFAULT_ATTR_DATA));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          scrollLeft(e3) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const t3 = e3.params[0] || 1;
            for (let e4 = this._activeBuffer.scrollTop; e4 <= this._activeBuffer.scrollBottom; ++e4) {
              const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
              i3.deleteCells(0, t3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), i3.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          scrollRight(e3) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const t3 = e3.params[0] || 1;
            for (let e4 = this._activeBuffer.scrollTop; e4 <= this._activeBuffer.scrollBottom; ++e4) {
              const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
              i3.insertCells(0, t3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), i3.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          insertColumns(e3) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const t3 = e3.params[0] || 1;
            for (let e4 = this._activeBuffer.scrollTop; e4 <= this._activeBuffer.scrollBottom; ++e4) {
              const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
              i3.insertCells(this._activeBuffer.x, t3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), i3.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          deleteColumns(e3) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const t3 = e3.params[0] || 1;
            for (let e4 = this._activeBuffer.scrollTop; e4 <= this._activeBuffer.scrollBottom; ++e4) {
              const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
              i3.deleteCells(this._activeBuffer.x, t3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), i3.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          eraseChars(e3) {
            this._restrictCursor();
            const t3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            return t3 && (t3.replaceCells(this._activeBuffer.x, this._activeBuffer.x + (e3.params[0] || 1), this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
          }
          repeatPrecedingCharacter(e3) {
            if (!this._parser.precedingCodepoint) return true;
            const t3 = e3.params[0] || 1, i3 = new Uint32Array(t3);
            for (let e4 = 0; e4 < t3; ++e4) i3[e4] = this._parser.precedingCodepoint;
            return this.print(i3, 0, i3.length), true;
          }
          sendDeviceAttributesPrimary(e3) {
            return e3.params[0] > 0 || (this._is("xterm") || this._is("rxvt-unicode") || this._is("screen") ? this._coreService.triggerDataEvent(n.C0.ESC + "[?1;2c") : this._is("linux") && this._coreService.triggerDataEvent(n.C0.ESC + "[?6c")), true;
          }
          sendDeviceAttributesSecondary(e3) {
            return e3.params[0] > 0 || (this._is("xterm") ? this._coreService.triggerDataEvent(n.C0.ESC + "[>0;276;0c") : this._is("rxvt-unicode") ? this._coreService.triggerDataEvent(n.C0.ESC + "[>85;95;0c") : this._is("linux") ? this._coreService.triggerDataEvent(e3.params[0] + "c") : this._is("screen") && this._coreService.triggerDataEvent(n.C0.ESC + "[>83;40003;0c")), true;
          }
          _is(e3) {
            return 0 === (this._optionsService.rawOptions.termName + "").indexOf(e3);
          }
          setMode(e3) {
            for (let t3 = 0; t3 < e3.length; t3++) switch (e3.params[t3]) {
              case 4:
                this._coreService.modes.insertMode = true;
                break;
              case 20:
                this._optionsService.options.convertEol = true;
            }
            return true;
          }
          setModePrivate(e3) {
            for (let t3 = 0; t3 < e3.length; t3++) switch (e3.params[t3]) {
              case 1:
                this._coreService.decPrivateModes.applicationCursorKeys = true;
                break;
              case 2:
                this._charsetService.setgCharset(0, o.DEFAULT_CHARSET), this._charsetService.setgCharset(1, o.DEFAULT_CHARSET), this._charsetService.setgCharset(2, o.DEFAULT_CHARSET), this._charsetService.setgCharset(3, o.DEFAULT_CHARSET);
                break;
              case 3:
                this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(132, this._bufferService.rows), this._onRequestReset.fire());
                break;
              case 6:
                this._coreService.decPrivateModes.origin = true, this._setCursor(0, 0);
                break;
              case 7:
                this._coreService.decPrivateModes.wraparound = true;
                break;
              case 12:
                this._optionsService.options.cursorBlink = true;
                break;
              case 45:
                this._coreService.decPrivateModes.reverseWraparound = true;
                break;
              case 66:
                this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = true, this._onRequestSyncScrollBar.fire();
                break;
              case 9:
                this._coreMouseService.activeProtocol = "X10";
                break;
              case 1e3:
                this._coreMouseService.activeProtocol = "VT200";
                break;
              case 1002:
                this._coreMouseService.activeProtocol = "DRAG";
                break;
              case 1003:
                this._coreMouseService.activeProtocol = "ANY";
                break;
              case 1004:
                this._coreService.decPrivateModes.sendFocus = true, this._onRequestSendFocus.fire();
                break;
              case 1005:
                this._logService.debug("DECSET 1005 not supported (see #2507)");
                break;
              case 1006:
                this._coreMouseService.activeEncoding = "SGR";
                break;
              case 1015:
                this._logService.debug("DECSET 1015 not supported (see #2507)");
                break;
              case 1016:
                this._coreMouseService.activeEncoding = "SGR_PIXELS";
                break;
              case 25:
                this._coreService.isCursorHidden = false;
                break;
              case 1048:
                this.saveCursor();
                break;
              case 1049:
                this.saveCursor();
              case 47:
              case 1047:
                this._bufferService.buffers.activateAltBuffer(this._eraseAttrData()), this._coreService.isCursorInitialized = true, this._onRequestRefreshRows.fire(0, this._bufferService.rows - 1), this._onRequestSyncScrollBar.fire();
                break;
              case 2004:
                this._coreService.decPrivateModes.bracketedPasteMode = true;
            }
            return true;
          }
          resetMode(e3) {
            for (let t3 = 0; t3 < e3.length; t3++) switch (e3.params[t3]) {
              case 4:
                this._coreService.modes.insertMode = false;
                break;
              case 20:
                this._optionsService.options.convertEol = false;
            }
            return true;
          }
          resetModePrivate(e3) {
            for (let t3 = 0; t3 < e3.length; t3++) switch (e3.params[t3]) {
              case 1:
                this._coreService.decPrivateModes.applicationCursorKeys = false;
                break;
              case 3:
                this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(80, this._bufferService.rows), this._onRequestReset.fire());
                break;
              case 6:
                this._coreService.decPrivateModes.origin = false, this._setCursor(0, 0);
                break;
              case 7:
                this._coreService.decPrivateModes.wraparound = false;
                break;
              case 12:
                this._optionsService.options.cursorBlink = false;
                break;
              case 45:
                this._coreService.decPrivateModes.reverseWraparound = false;
                break;
              case 66:
                this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = false, this._onRequestSyncScrollBar.fire();
                break;
              case 9:
              case 1e3:
              case 1002:
              case 1003:
                this._coreMouseService.activeProtocol = "NONE";
                break;
              case 1004:
                this._coreService.decPrivateModes.sendFocus = false;
                break;
              case 1005:
                this._logService.debug("DECRST 1005 not supported (see #2507)");
                break;
              case 1006:
              case 1016:
                this._coreMouseService.activeEncoding = "DEFAULT";
                break;
              case 1015:
                this._logService.debug("DECRST 1015 not supported (see #2507)");
                break;
              case 25:
                this._coreService.isCursorHidden = true;
                break;
              case 1048:
                this.restoreCursor();
                break;
              case 1049:
              case 47:
              case 1047:
                this._bufferService.buffers.activateNormalBuffer(), 1049 === e3.params[t3] && this.restoreCursor(), this._coreService.isCursorInitialized = true, this._onRequestRefreshRows.fire(0, this._bufferService.rows - 1), this._onRequestSyncScrollBar.fire();
                break;
              case 2004:
                this._coreService.decPrivateModes.bracketedPasteMode = false;
            }
            return true;
          }
          requestMode(e3, t3) {
            const i3 = this._coreService.decPrivateModes, { activeProtocol: s3, activeEncoding: r2 } = this._coreMouseService, o2 = this._coreService, { buffers: a2, cols: h3 } = this._bufferService, { active: c2, alt: l2 } = a2, d2 = this._optionsService.rawOptions, _2 = (e4) => e4 ? 1 : 2, u2 = e3.params[0];
            return f2 = u2, v2 = t3 ? 2 === u2 ? 4 : 4 === u2 ? _2(o2.modes.insertMode) : 12 === u2 ? 3 : 20 === u2 ? _2(d2.convertEol) : 0 : 1 === u2 ? _2(i3.applicationCursorKeys) : 3 === u2 ? d2.windowOptions.setWinLines ? 80 === h3 ? 2 : 132 === h3 ? 1 : 0 : 0 : 6 === u2 ? _2(i3.origin) : 7 === u2 ? _2(i3.wraparound) : 8 === u2 ? 3 : 9 === u2 ? _2("X10" === s3) : 12 === u2 ? _2(d2.cursorBlink) : 25 === u2 ? _2(!o2.isCursorHidden) : 45 === u2 ? _2(i3.reverseWraparound) : 66 === u2 ? _2(i3.applicationKeypad) : 67 === u2 ? 4 : 1e3 === u2 ? _2("VT200" === s3) : 1002 === u2 ? _2("DRAG" === s3) : 1003 === u2 ? _2("ANY" === s3) : 1004 === u2 ? _2(i3.sendFocus) : 1005 === u2 ? 4 : 1006 === u2 ? _2("SGR" === r2) : 1015 === u2 ? 4 : 1016 === u2 ? _2("SGR_PIXELS" === r2) : 1048 === u2 ? 1 : 47 === u2 || 1047 === u2 || 1049 === u2 ? _2(c2 === l2) : 2004 === u2 ? _2(i3.bracketedPasteMode) : 0, o2.triggerDataEvent(`${n.C0.ESC}[${t3 ? "" : "?"}${f2};${v2}$y`), true;
            var f2, v2;
          }
          _updateAttrColor(e3, t3, i3, s3, r2) {
            return 2 === t3 ? (e3 |= 50331648, e3 &= -16777216, e3 |= f.AttributeData.fromColorRGB([i3, s3, r2])) : 5 === t3 && (e3 &= -50331904, e3 |= 33554432 | 255 & i3), e3;
          }
          _extractColor(e3, t3, i3) {
            const s3 = [0, 0, -1, 0, 0, 0];
            let r2 = 0, n2 = 0;
            do {
              if (s3[n2 + r2] = e3.params[t3 + n2], e3.hasSubParams(t3 + n2)) {
                const i4 = e3.getSubParams(t3 + n2);
                let o2 = 0;
                do {
                  5 === s3[1] && (r2 = 1), s3[n2 + o2 + 1 + r2] = i4[o2];
                } while (++o2 < i4.length && o2 + n2 + 1 + r2 < s3.length);
                break;
              }
              if (5 === s3[1] && n2 + r2 >= 2 || 2 === s3[1] && n2 + r2 >= 5) break;
              s3[1] && (r2 = 1);
            } while (++n2 + t3 < e3.length && n2 + r2 < s3.length);
            for (let e4 = 2; e4 < s3.length; ++e4) -1 === s3[e4] && (s3[e4] = 0);
            switch (s3[0]) {
              case 38:
                i3.fg = this._updateAttrColor(i3.fg, s3[1], s3[3], s3[4], s3[5]);
                break;
              case 48:
                i3.bg = this._updateAttrColor(i3.bg, s3[1], s3[3], s3[4], s3[5]);
                break;
              case 58:
                i3.extended = i3.extended.clone(), i3.extended.underlineColor = this._updateAttrColor(i3.extended.underlineColor, s3[1], s3[3], s3[4], s3[5]);
            }
            return n2;
          }
          _processUnderline(e3, t3) {
            t3.extended = t3.extended.clone(), (!~e3 || e3 > 5) && (e3 = 1), t3.extended.underlineStyle = e3, t3.fg |= 268435456, 0 === e3 && (t3.fg &= -268435457), t3.updateExtended();
          }
          _processSGR0(e3) {
            e3.fg = l.DEFAULT_ATTR_DATA.fg, e3.bg = l.DEFAULT_ATTR_DATA.bg, e3.extended = e3.extended.clone(), e3.extended.underlineStyle = 0, e3.extended.underlineColor &= -67108864, e3.updateExtended();
          }
          charAttributes(e3) {
            if (1 === e3.length && 0 === e3.params[0]) return this._processSGR0(this._curAttrData), true;
            const t3 = e3.length;
            let i3;
            const s3 = this._curAttrData;
            for (let r2 = 0; r2 < t3; r2++) i3 = e3.params[r2], i3 >= 30 && i3 <= 37 ? (s3.fg &= -50331904, s3.fg |= 16777216 | i3 - 30) : i3 >= 40 && i3 <= 47 ? (s3.bg &= -50331904, s3.bg |= 16777216 | i3 - 40) : i3 >= 90 && i3 <= 97 ? (s3.fg &= -50331904, s3.fg |= 16777224 | i3 - 90) : i3 >= 100 && i3 <= 107 ? (s3.bg &= -50331904, s3.bg |= 16777224 | i3 - 100) : 0 === i3 ? this._processSGR0(s3) : 1 === i3 ? s3.fg |= 134217728 : 3 === i3 ? s3.bg |= 67108864 : 4 === i3 ? (s3.fg |= 268435456, this._processUnderline(e3.hasSubParams(r2) ? e3.getSubParams(r2)[0] : 1, s3)) : 5 === i3 ? s3.fg |= 536870912 : 7 === i3 ? s3.fg |= 67108864 : 8 === i3 ? s3.fg |= 1073741824 : 9 === i3 ? s3.fg |= 2147483648 : 2 === i3 ? s3.bg |= 134217728 : 21 === i3 ? this._processUnderline(2, s3) : 22 === i3 ? (s3.fg &= -134217729, s3.bg &= -134217729) : 23 === i3 ? s3.bg &= -67108865 : 24 === i3 ? (s3.fg &= -268435457, this._processUnderline(0, s3)) : 25 === i3 ? s3.fg &= -536870913 : 27 === i3 ? s3.fg &= -67108865 : 28 === i3 ? s3.fg &= -1073741825 : 29 === i3 ? s3.fg &= 2147483647 : 39 === i3 ? (s3.fg &= -67108864, s3.fg |= 16777215 & l.DEFAULT_ATTR_DATA.fg) : 49 === i3 ? (s3.bg &= -67108864, s3.bg |= 16777215 & l.DEFAULT_ATTR_DATA.bg) : 38 === i3 || 48 === i3 || 58 === i3 ? r2 += this._extractColor(e3, r2, s3) : 53 === i3 ? s3.bg |= 1073741824 : 55 === i3 ? s3.bg &= -1073741825 : 59 === i3 ? (s3.extended = s3.extended.clone(), s3.extended.underlineColor = -1, s3.updateExtended()) : 100 === i3 ? (s3.fg &= -67108864, s3.fg |= 16777215 & l.DEFAULT_ATTR_DATA.fg, s3.bg &= -67108864, s3.bg |= 16777215 & l.DEFAULT_ATTR_DATA.bg) : this._logService.debug("Unknown SGR attribute: %d.", i3);
            return true;
          }
          deviceStatus(e3) {
            switch (e3.params[0]) {
              case 5:
                this._coreService.triggerDataEvent(`${n.C0.ESC}[0n`);
                break;
              case 6:
                const e4 = this._activeBuffer.y + 1, t3 = this._activeBuffer.x + 1;
                this._coreService.triggerDataEvent(`${n.C0.ESC}[${e4};${t3}R`);
            }
            return true;
          }
          deviceStatusPrivate(e3) {
            if (6 === e3.params[0]) {
              const e4 = this._activeBuffer.y + 1, t3 = this._activeBuffer.x + 1;
              this._coreService.triggerDataEvent(`${n.C0.ESC}[?${e4};${t3}R`);
            }
            return true;
          }
          softReset(e3) {
            return this._coreService.isCursorHidden = false, this._onRequestSyncScrollBar.fire(), this._activeBuffer.scrollTop = 0, this._activeBuffer.scrollBottom = this._bufferService.rows - 1, this._curAttrData = l.DEFAULT_ATTR_DATA.clone(), this._coreService.reset(), this._charsetService.reset(), this._activeBuffer.savedX = 0, this._activeBuffer.savedY = this._activeBuffer.ybase, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, this._coreService.decPrivateModes.origin = false, true;
          }
          setCursorStyle(e3) {
            const t3 = e3.params[0] || 1;
            switch (t3) {
              case 1:
              case 2:
                this._optionsService.options.cursorStyle = "block";
                break;
              case 3:
              case 4:
                this._optionsService.options.cursorStyle = "underline";
                break;
              case 5:
              case 6:
                this._optionsService.options.cursorStyle = "bar";
            }
            const i3 = t3 % 2 == 1;
            return this._optionsService.options.cursorBlink = i3, true;
          }
          setScrollRegion(e3) {
            const t3 = e3.params[0] || 1;
            let i3;
            return (e3.length < 2 || (i3 = e3.params[1]) > this._bufferService.rows || 0 === i3) && (i3 = this._bufferService.rows), i3 > t3 && (this._activeBuffer.scrollTop = t3 - 1, this._activeBuffer.scrollBottom = i3 - 1, this._setCursor(0, 0)), true;
          }
          windowOptions(e3) {
            if (!b(e3.params[0], this._optionsService.rawOptions.windowOptions)) return true;
            const t3 = e3.length > 1 ? e3.params[1] : 0;
            switch (e3.params[0]) {
              case 14:
                2 !== t3 && this._onRequestWindowsOptionsReport.fire(y.GET_WIN_SIZE_PIXELS);
                break;
              case 16:
                this._onRequestWindowsOptionsReport.fire(y.GET_CELL_SIZE_PIXELS);
                break;
              case 18:
                this._bufferService && this._coreService.triggerDataEvent(`${n.C0.ESC}[8;${this._bufferService.rows};${this._bufferService.cols}t`);
                break;
              case 22:
                0 !== t3 && 2 !== t3 || (this._windowTitleStack.push(this._windowTitle), this._windowTitleStack.length > 10 && this._windowTitleStack.shift()), 0 !== t3 && 1 !== t3 || (this._iconNameStack.push(this._iconName), this._iconNameStack.length > 10 && this._iconNameStack.shift());
                break;
              case 23:
                0 !== t3 && 2 !== t3 || this._windowTitleStack.length && this.setTitle(this._windowTitleStack.pop()), 0 !== t3 && 1 !== t3 || this._iconNameStack.length && this.setIconName(this._iconNameStack.pop());
            }
            return true;
          }
          saveCursor(e3) {
            return this._activeBuffer.savedX = this._activeBuffer.x, this._activeBuffer.savedY = this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, true;
          }
          restoreCursor(e3) {
            return this._activeBuffer.x = this._activeBuffer.savedX || 0, this._activeBuffer.y = Math.max(this._activeBuffer.savedY - this._activeBuffer.ybase, 0), this._curAttrData.fg = this._activeBuffer.savedCurAttrData.fg, this._curAttrData.bg = this._activeBuffer.savedCurAttrData.bg, this._charsetService.charset = this._savedCharset, this._activeBuffer.savedCharset && (this._charsetService.charset = this._activeBuffer.savedCharset), this._restrictCursor(), true;
          }
          setTitle(e3) {
            return this._windowTitle = e3, this._onTitleChange.fire(e3), true;
          }
          setIconName(e3) {
            return this._iconName = e3, true;
          }
          setOrReportIndexedColor(e3) {
            const t3 = [], i3 = e3.split(";");
            for (; i3.length > 1; ) {
              const e4 = i3.shift(), s3 = i3.shift();
              if (/^\d+$/.exec(e4)) {
                const i4 = parseInt(e4);
                if (L(i4)) if ("?" === s3) t3.push({ type: 0, index: i4 });
                else {
                  const e5 = (0, m.parseColor)(s3);
                  e5 && t3.push({ type: 1, index: i4, color: e5 });
                }
              }
            }
            return t3.length && this._onColor.fire(t3), true;
          }
          setHyperlink(e3) {
            const t3 = e3.split(";");
            return !(t3.length < 2) && (t3[1] ? this._createHyperlink(t3[0], t3[1]) : !t3[0] && this._finishHyperlink());
          }
          _createHyperlink(e3, t3) {
            this._getCurrentLinkId() && this._finishHyperlink();
            const i3 = e3.split(":");
            let s3;
            const r2 = i3.findIndex(((e4) => e4.startsWith("id=")));
            return -1 !== r2 && (s3 = i3[r2].slice(3) || void 0), this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = this._oscLinkService.registerLink({ id: s3, uri: t3 }), this._curAttrData.updateExtended(), true;
          }
          _finishHyperlink() {
            return this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = 0, this._curAttrData.updateExtended(), true;
          }
          _setOrReportSpecialColor(e3, t3) {
            const i3 = e3.split(";");
            for (let e4 = 0; e4 < i3.length && !(t3 >= this._specialColors.length); ++e4, ++t3) if ("?" === i3[e4]) this._onColor.fire([{ type: 0, index: this._specialColors[t3] }]);
            else {
              const s3 = (0, m.parseColor)(i3[e4]);
              s3 && this._onColor.fire([{ type: 1, index: this._specialColors[t3], color: s3 }]);
            }
            return true;
          }
          setOrReportFgColor(e3) {
            return this._setOrReportSpecialColor(e3, 0);
          }
          setOrReportBgColor(e3) {
            return this._setOrReportSpecialColor(e3, 1);
          }
          setOrReportCursorColor(e3) {
            return this._setOrReportSpecialColor(e3, 2);
          }
          restoreIndexedColor(e3) {
            if (!e3) return this._onColor.fire([{ type: 2 }]), true;
            const t3 = [], i3 = e3.split(";");
            for (let e4 = 0; e4 < i3.length; ++e4) if (/^\d+$/.exec(i3[e4])) {
              const s3 = parseInt(i3[e4]);
              L(s3) && t3.push({ type: 2, index: s3 });
            }
            return t3.length && this._onColor.fire(t3), true;
          }
          restoreFgColor(e3) {
            return this._onColor.fire([{ type: 2, index: 256 }]), true;
          }
          restoreBgColor(e3) {
            return this._onColor.fire([{ type: 2, index: 257 }]), true;
          }
          restoreCursorColor(e3) {
            return this._onColor.fire([{ type: 2, index: 258 }]), true;
          }
          nextLine() {
            return this._activeBuffer.x = 0, this.index(), true;
          }
          keypadApplicationMode() {
            return this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = true, this._onRequestSyncScrollBar.fire(), true;
          }
          keypadNumericMode() {
            return this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = false, this._onRequestSyncScrollBar.fire(), true;
          }
          selectDefaultCharset() {
            return this._charsetService.setgLevel(0), this._charsetService.setgCharset(0, o.DEFAULT_CHARSET), true;
          }
          selectCharset(e3) {
            return 2 !== e3.length ? (this.selectDefaultCharset(), true) : ("/" === e3[0] || this._charsetService.setgCharset(S[e3[0]], o.CHARSETS[e3[1]] || o.DEFAULT_CHARSET), true);
          }
          index() {
            return this._restrictCursor(), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._restrictCursor(), true;
          }
          tabSet() {
            return this._activeBuffer.tabs[this._activeBuffer.x] = true, true;
          }
          reverseIndex() {
            if (this._restrictCursor(), this._activeBuffer.y === this._activeBuffer.scrollTop) {
              const e3 = this._activeBuffer.scrollBottom - this._activeBuffer.scrollTop;
              this._activeBuffer.lines.shiftElements(this._activeBuffer.ybase + this._activeBuffer.y, e3, 1), this._activeBuffer.lines.set(this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.getBlankLine(this._eraseAttrData())), this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
            } else this._activeBuffer.y--, this._restrictCursor();
            return true;
          }
          fullReset() {
            return this._parser.reset(), this._onRequestReset.fire(), true;
          }
          reset() {
            this._curAttrData = l.DEFAULT_ATTR_DATA.clone(), this._eraseAttrDataInternal = l.DEFAULT_ATTR_DATA.clone();
          }
          _eraseAttrData() {
            return this._eraseAttrDataInternal.bg &= -67108864, this._eraseAttrDataInternal.bg |= 67108863 & this._curAttrData.bg, this._eraseAttrDataInternal;
          }
          setgLevel(e3) {
            return this._charsetService.setgLevel(e3), true;
          }
          screenAlignmentPattern() {
            const e3 = new u.CellData();
            e3.content = 1 << 22 | "E".charCodeAt(0), e3.fg = this._curAttrData.fg, e3.bg = this._curAttrData.bg, this._setCursor(0, 0);
            for (let t3 = 0; t3 < this._bufferService.rows; ++t3) {
              const i3 = this._activeBuffer.ybase + this._activeBuffer.y + t3, s3 = this._activeBuffer.lines.get(i3);
              s3 && (s3.fill(e3), s3.isWrapped = false);
            }
            return this._dirtyRowTracker.markAllDirty(), this._setCursor(0, 0), true;
          }
          requestStatusString(e3, t3) {
            const i3 = this._bufferService.buffer, s3 = this._optionsService.rawOptions;
            return ((e4) => (this._coreService.triggerDataEvent(`${n.C0.ESC}${e4}${n.C0.ESC}\\`), true))('"q' === e3 ? `P1$r${this._curAttrData.isProtected() ? 1 : 0}"q` : '"p' === e3 ? 'P1$r61;1"p' : "r" === e3 ? `P1$r${i3.scrollTop + 1};${i3.scrollBottom + 1}r` : "m" === e3 ? "P1$r0m" : " q" === e3 ? `P1$r${{ block: 2, underline: 4, bar: 6 }[s3.cursorStyle] - (s3.cursorBlink ? 1 : 0)} q` : "P0$r");
          }
          markRangeDirty(e3, t3) {
            this._dirtyRowTracker.markRangeDirty(e3, t3);
          }
        }
        t2.InputHandler = E;
        let k = class {
          constructor(e3) {
            this._bufferService = e3, this.clearRange();
          }
          clearRange() {
            this.start = this._bufferService.buffer.y, this.end = this._bufferService.buffer.y;
          }
          markDirty(e3) {
            e3 < this.start ? this.start = e3 : e3 > this.end && (this.end = e3);
          }
          markRangeDirty(e3, t3) {
            e3 > t3 && (w = e3, e3 = t3, t3 = w), e3 < this.start && (this.start = e3), t3 > this.end && (this.end = t3);
          }
          markAllDirty() {
            this.markRangeDirty(0, this._bufferService.rows - 1);
          }
        };
        function L(e3) {
          return 0 <= e3 && e3 < 256;
        }
        k = s2([r(0, v.IBufferService)], k);
      }, 844: (e2, t2) => {
        function i2(e3) {
          for (const t3 of e3) t3.dispose();
          e3.length = 0;
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.getDisposeArrayDisposable = t2.disposeArray = t2.toDisposable = t2.MutableDisposable = t2.Disposable = void 0, t2.Disposable = class {
          constructor() {
            this._disposables = [], this._isDisposed = false;
          }
          dispose() {
            this._isDisposed = true;
            for (const e3 of this._disposables) e3.dispose();
            this._disposables.length = 0;
          }
          register(e3) {
            return this._disposables.push(e3), e3;
          }
          unregister(e3) {
            const t3 = this._disposables.indexOf(e3);
            -1 !== t3 && this._disposables.splice(t3, 1);
          }
        }, t2.MutableDisposable = class {
          constructor() {
            this._isDisposed = false;
          }
          get value() {
            return this._isDisposed ? void 0 : this._value;
          }
          set value(e3) {
            var t3;
            this._isDisposed || e3 === this._value || (null === (t3 = this._value) || void 0 === t3 || t3.dispose(), this._value = e3);
          }
          clear() {
            this.value = void 0;
          }
          dispose() {
            var e3;
            this._isDisposed = true, null === (e3 = this._value) || void 0 === e3 || e3.dispose(), this._value = void 0;
          }
        }, t2.toDisposable = function(e3) {
          return { dispose: e3 };
        }, t2.disposeArray = i2, t2.getDisposeArrayDisposable = function(e3) {
          return { dispose: () => i2(e3) };
        };
      }, 1505: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.FourKeyMap = t2.TwoKeyMap = void 0;
        class i2 {
          constructor() {
            this._data = {};
          }
          set(e3, t3, i3) {
            this._data[e3] || (this._data[e3] = {}), this._data[e3][t3] = i3;
          }
          get(e3, t3) {
            return this._data[e3] ? this._data[e3][t3] : void 0;
          }
          clear() {
            this._data = {};
          }
        }
        t2.TwoKeyMap = i2, t2.FourKeyMap = class {
          constructor() {
            this._data = new i2();
          }
          set(e3, t3, s2, r, n) {
            this._data.get(e3, t3) || this._data.set(e3, t3, new i2()), this._data.get(e3, t3).set(s2, r, n);
          }
          get(e3, t3, i3, s2) {
            var r;
            return null === (r = this._data.get(e3, t3)) || void 0 === r ? void 0 : r.get(i3, s2);
          }
          clear() {
            this._data.clear();
          }
        };
      }, 6114: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.isChromeOS = t2.isLinux = t2.isWindows = t2.isIphone = t2.isIpad = t2.isMac = t2.getSafariVersion = t2.isSafari = t2.isLegacyEdge = t2.isFirefox = t2.isNode = void 0, t2.isNode = "undefined" == typeof navigator;
        const i2 = t2.isNode ? "node" : navigator.userAgent, s2 = t2.isNode ? "node" : navigator.platform;
        t2.isFirefox = i2.includes("Firefox"), t2.isLegacyEdge = i2.includes("Edge"), t2.isSafari = /^((?!chrome|android).)*safari/i.test(i2), t2.getSafariVersion = function() {
          if (!t2.isSafari) return 0;
          const e3 = i2.match(/Version\/(\d+)/);
          return null === e3 || e3.length < 2 ? 0 : parseInt(e3[1]);
        }, t2.isMac = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"].includes(s2), t2.isIpad = "iPad" === s2, t2.isIphone = "iPhone" === s2, t2.isWindows = ["Windows", "Win16", "Win32", "WinCE"].includes(s2), t2.isLinux = s2.indexOf("Linux") >= 0, t2.isChromeOS = /\bCrOS\b/.test(i2);
      }, 6106: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.SortedList = void 0;
        let i2 = 0;
        t2.SortedList = class {
          constructor(e3) {
            this._getKey = e3, this._array = [];
          }
          clear() {
            this._array.length = 0;
          }
          insert(e3) {
            0 !== this._array.length ? (i2 = this._search(this._getKey(e3)), this._array.splice(i2, 0, e3)) : this._array.push(e3);
          }
          delete(e3) {
            if (0 === this._array.length) return false;
            const t3 = this._getKey(e3);
            if (void 0 === t3) return false;
            if (i2 = this._search(t3), -1 === i2) return false;
            if (this._getKey(this._array[i2]) !== t3) return false;
            do {
              if (this._array[i2] === e3) return this._array.splice(i2, 1), true;
            } while (++i2 < this._array.length && this._getKey(this._array[i2]) === t3);
            return false;
          }
          *getKeyIterator(e3) {
            if (0 !== this._array.length && (i2 = this._search(e3), !(i2 < 0 || i2 >= this._array.length) && this._getKey(this._array[i2]) === e3)) do {
              yield this._array[i2];
            } while (++i2 < this._array.length && this._getKey(this._array[i2]) === e3);
          }
          forEachByKey(e3, t3) {
            if (0 !== this._array.length && (i2 = this._search(e3), !(i2 < 0 || i2 >= this._array.length) && this._getKey(this._array[i2]) === e3)) do {
              t3(this._array[i2]);
            } while (++i2 < this._array.length && this._getKey(this._array[i2]) === e3);
          }
          values() {
            return [...this._array].values();
          }
          _search(e3) {
            let t3 = 0, i3 = this._array.length - 1;
            for (; i3 >= t3; ) {
              let s2 = t3 + i3 >> 1;
              const r = this._getKey(this._array[s2]);
              if (r > e3) i3 = s2 - 1;
              else {
                if (!(r < e3)) {
                  for (; s2 > 0 && this._getKey(this._array[s2 - 1]) === e3; ) s2--;
                  return s2;
                }
                t3 = s2 + 1;
              }
            }
            return t3;
          }
        };
      }, 7226: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DebouncedIdleTask = t2.IdleTaskQueue = t2.PriorityTaskQueue = void 0;
        const s2 = i2(6114);
        class r {
          constructor() {
            this._tasks = [], this._i = 0;
          }
          enqueue(e3) {
            this._tasks.push(e3), this._start();
          }
          flush() {
            for (; this._i < this._tasks.length; ) this._tasks[this._i]() || this._i++;
            this.clear();
          }
          clear() {
            this._idleCallback && (this._cancelCallback(this._idleCallback), this._idleCallback = void 0), this._i = 0, this._tasks.length = 0;
          }
          _start() {
            this._idleCallback || (this._idleCallback = this._requestCallback(this._process.bind(this)));
          }
          _process(e3) {
            this._idleCallback = void 0;
            let t3 = 0, i3 = 0, s3 = e3.timeRemaining(), r2 = 0;
            for (; this._i < this._tasks.length; ) {
              if (t3 = Date.now(), this._tasks[this._i]() || this._i++, t3 = Math.max(1, Date.now() - t3), i3 = Math.max(t3, i3), r2 = e3.timeRemaining(), 1.5 * i3 > r2) return s3 - t3 < -20 && console.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(s3 - t3))}ms`), void this._start();
              s3 = r2;
            }
            this.clear();
          }
        }
        class n extends r {
          _requestCallback(e3) {
            return setTimeout((() => e3(this._createDeadline(16))));
          }
          _cancelCallback(e3) {
            clearTimeout(e3);
          }
          _createDeadline(e3) {
            const t3 = Date.now() + e3;
            return { timeRemaining: () => Math.max(0, t3 - Date.now()) };
          }
        }
        t2.PriorityTaskQueue = n, t2.IdleTaskQueue = !s2.isNode && "requestIdleCallback" in window ? class extends r {
          _requestCallback(e3) {
            return requestIdleCallback(e3);
          }
          _cancelCallback(e3) {
            cancelIdleCallback(e3);
          }
        } : n, t2.DebouncedIdleTask = class {
          constructor() {
            this._queue = new t2.IdleTaskQueue();
          }
          set(e3) {
            this._queue.clear(), this._queue.enqueue(e3);
          }
          flush() {
            this._queue.flush();
          }
        };
      }, 9282: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.updateWindowsModeWrappedState = void 0;
        const s2 = i2(643);
        t2.updateWindowsModeWrappedState = function(e3) {
          const t3 = e3.buffer.lines.get(e3.buffer.ybase + e3.buffer.y - 1), i3 = null == t3 ? void 0 : t3.get(e3.cols - 1), r = e3.buffer.lines.get(e3.buffer.ybase + e3.buffer.y);
          r && i3 && (r.isWrapped = i3[s2.CHAR_DATA_CODE_INDEX] !== s2.NULL_CELL_CODE && i3[s2.CHAR_DATA_CODE_INDEX] !== s2.WHITESPACE_CELL_CODE);
        };
      }, 3734: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ExtendedAttrs = t2.AttributeData = void 0;
        class i2 {
          constructor() {
            this.fg = 0, this.bg = 0, this.extended = new s2();
          }
          static toColorRGB(e3) {
            return [e3 >>> 16 & 255, e3 >>> 8 & 255, 255 & e3];
          }
          static fromColorRGB(e3) {
            return (255 & e3[0]) << 16 | (255 & e3[1]) << 8 | 255 & e3[2];
          }
          clone() {
            const e3 = new i2();
            return e3.fg = this.fg, e3.bg = this.bg, e3.extended = this.extended.clone(), e3;
          }
          isInverse() {
            return 67108864 & this.fg;
          }
          isBold() {
            return 134217728 & this.fg;
          }
          isUnderline() {
            return this.hasExtendedAttrs() && 0 !== this.extended.underlineStyle ? 1 : 268435456 & this.fg;
          }
          isBlink() {
            return 536870912 & this.fg;
          }
          isInvisible() {
            return 1073741824 & this.fg;
          }
          isItalic() {
            return 67108864 & this.bg;
          }
          isDim() {
            return 134217728 & this.bg;
          }
          isStrikethrough() {
            return 2147483648 & this.fg;
          }
          isProtected() {
            return 536870912 & this.bg;
          }
          isOverline() {
            return 1073741824 & this.bg;
          }
          getFgColorMode() {
            return 50331648 & this.fg;
          }
          getBgColorMode() {
            return 50331648 & this.bg;
          }
          isFgRGB() {
            return 50331648 == (50331648 & this.fg);
          }
          isBgRGB() {
            return 50331648 == (50331648 & this.bg);
          }
          isFgPalette() {
            return 16777216 == (50331648 & this.fg) || 33554432 == (50331648 & this.fg);
          }
          isBgPalette() {
            return 16777216 == (50331648 & this.bg) || 33554432 == (50331648 & this.bg);
          }
          isFgDefault() {
            return 0 == (50331648 & this.fg);
          }
          isBgDefault() {
            return 0 == (50331648 & this.bg);
          }
          isAttributeDefault() {
            return 0 === this.fg && 0 === this.bg;
          }
          getFgColor() {
            switch (50331648 & this.fg) {
              case 16777216:
              case 33554432:
                return 255 & this.fg;
              case 50331648:
                return 16777215 & this.fg;
              default:
                return -1;
            }
          }
          getBgColor() {
            switch (50331648 & this.bg) {
              case 16777216:
              case 33554432:
                return 255 & this.bg;
              case 50331648:
                return 16777215 & this.bg;
              default:
                return -1;
            }
          }
          hasExtendedAttrs() {
            return 268435456 & this.bg;
          }
          updateExtended() {
            this.extended.isEmpty() ? this.bg &= -268435457 : this.bg |= 268435456;
          }
          getUnderlineColor() {
            if (268435456 & this.bg && ~this.extended.underlineColor) switch (50331648 & this.extended.underlineColor) {
              case 16777216:
              case 33554432:
                return 255 & this.extended.underlineColor;
              case 50331648:
                return 16777215 & this.extended.underlineColor;
              default:
                return this.getFgColor();
            }
            return this.getFgColor();
          }
          getUnderlineColorMode() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 50331648 & this.extended.underlineColor : this.getFgColorMode();
          }
          isUnderlineColorRGB() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 50331648 == (50331648 & this.extended.underlineColor) : this.isFgRGB();
          }
          isUnderlineColorPalette() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 16777216 == (50331648 & this.extended.underlineColor) || 33554432 == (50331648 & this.extended.underlineColor) : this.isFgPalette();
          }
          isUnderlineColorDefault() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 0 == (50331648 & this.extended.underlineColor) : this.isFgDefault();
          }
          getUnderlineStyle() {
            return 268435456 & this.fg ? 268435456 & this.bg ? this.extended.underlineStyle : 1 : 0;
          }
        }
        t2.AttributeData = i2;
        class s2 {
          get ext() {
            return this._urlId ? -469762049 & this._ext | this.underlineStyle << 26 : this._ext;
          }
          set ext(e3) {
            this._ext = e3;
          }
          get underlineStyle() {
            return this._urlId ? 5 : (469762048 & this._ext) >> 26;
          }
          set underlineStyle(e3) {
            this._ext &= -469762049, this._ext |= e3 << 26 & 469762048;
          }
          get underlineColor() {
            return 67108863 & this._ext;
          }
          set underlineColor(e3) {
            this._ext &= -67108864, this._ext |= 67108863 & e3;
          }
          get urlId() {
            return this._urlId;
          }
          set urlId(e3) {
            this._urlId = e3;
          }
          constructor(e3 = 0, t3 = 0) {
            this._ext = 0, this._urlId = 0, this._ext = e3, this._urlId = t3;
          }
          clone() {
            return new s2(this._ext, this._urlId);
          }
          isEmpty() {
            return 0 === this.underlineStyle && 0 === this._urlId;
          }
        }
        t2.ExtendedAttrs = s2;
      }, 9092: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Buffer = t2.MAX_BUFFER_SIZE = void 0;
        const s2 = i2(6349), r = i2(7226), n = i2(3734), o = i2(8437), a = i2(4634), h2 = i2(511), c = i2(643), l = i2(4863), d = i2(7116);
        t2.MAX_BUFFER_SIZE = 4294967295, t2.Buffer = class {
          constructor(e3, t3, i3) {
            this._hasScrollback = e3, this._optionsService = t3, this._bufferService = i3, this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.tabs = {}, this.savedY = 0, this.savedX = 0, this.savedCurAttrData = o.DEFAULT_ATTR_DATA.clone(), this.savedCharset = d.DEFAULT_CHARSET, this.markers = [], this._nullCell = h2.CellData.fromCharData([0, c.NULL_CELL_CHAR, c.NULL_CELL_WIDTH, c.NULL_CELL_CODE]), this._whitespaceCell = h2.CellData.fromCharData([0, c.WHITESPACE_CELL_CHAR, c.WHITESPACE_CELL_WIDTH, c.WHITESPACE_CELL_CODE]), this._isClearing = false, this._memoryCleanupQueue = new r.IdleTaskQueue(), this._memoryCleanupPosition = 0, this._cols = this._bufferService.cols, this._rows = this._bufferService.rows, this.lines = new s2.CircularList(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
          }
          getNullCell(e3) {
            return e3 ? (this._nullCell.fg = e3.fg, this._nullCell.bg = e3.bg, this._nullCell.extended = e3.extended) : (this._nullCell.fg = 0, this._nullCell.bg = 0, this._nullCell.extended = new n.ExtendedAttrs()), this._nullCell;
          }
          getWhitespaceCell(e3) {
            return e3 ? (this._whitespaceCell.fg = e3.fg, this._whitespaceCell.bg = e3.bg, this._whitespaceCell.extended = e3.extended) : (this._whitespaceCell.fg = 0, this._whitespaceCell.bg = 0, this._whitespaceCell.extended = new n.ExtendedAttrs()), this._whitespaceCell;
          }
          getBlankLine(e3, t3) {
            return new o.BufferLine(this._bufferService.cols, this.getNullCell(e3), t3);
          }
          get hasScrollback() {
            return this._hasScrollback && this.lines.maxLength > this._rows;
          }
          get isCursorInViewport() {
            const e3 = this.ybase + this.y - this.ydisp;
            return e3 >= 0 && e3 < this._rows;
          }
          _getCorrectBufferLength(e3) {
            if (!this._hasScrollback) return e3;
            const i3 = e3 + this._optionsService.rawOptions.scrollback;
            return i3 > t2.MAX_BUFFER_SIZE ? t2.MAX_BUFFER_SIZE : i3;
          }
          fillViewportRows(e3) {
            if (0 === this.lines.length) {
              void 0 === e3 && (e3 = o.DEFAULT_ATTR_DATA);
              let t3 = this._rows;
              for (; t3--; ) this.lines.push(this.getBlankLine(e3));
            }
          }
          clear() {
            this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.lines = new s2.CircularList(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
          }
          resize(e3, t3) {
            const i3 = this.getNullCell(o.DEFAULT_ATTR_DATA);
            let s3 = 0;
            const r2 = this._getCorrectBufferLength(t3);
            if (r2 > this.lines.maxLength && (this.lines.maxLength = r2), this.lines.length > 0) {
              if (this._cols < e3) for (let t4 = 0; t4 < this.lines.length; t4++) s3 += +this.lines.get(t4).resize(e3, i3);
              let n2 = 0;
              if (this._rows < t3) for (let s4 = this._rows; s4 < t3; s4++) this.lines.length < t3 + this.ybase && (this._optionsService.rawOptions.windowsMode || void 0 !== this._optionsService.rawOptions.windowsPty.backend || void 0 !== this._optionsService.rawOptions.windowsPty.buildNumber ? this.lines.push(new o.BufferLine(e3, i3)) : this.ybase > 0 && this.lines.length <= this.ybase + this.y + n2 + 1 ? (this.ybase--, n2++, this.ydisp > 0 && this.ydisp--) : this.lines.push(new o.BufferLine(e3, i3)));
              else for (let e4 = this._rows; e4 > t3; e4--) this.lines.length > t3 + this.ybase && (this.lines.length > this.ybase + this.y + 1 ? this.lines.pop() : (this.ybase++, this.ydisp++));
              if (r2 < this.lines.maxLength) {
                const e4 = this.lines.length - r2;
                e4 > 0 && (this.lines.trimStart(e4), this.ybase = Math.max(this.ybase - e4, 0), this.ydisp = Math.max(this.ydisp - e4, 0), this.savedY = Math.max(this.savedY - e4, 0)), this.lines.maxLength = r2;
              }
              this.x = Math.min(this.x, e3 - 1), this.y = Math.min(this.y, t3 - 1), n2 && (this.y += n2), this.savedX = Math.min(this.savedX, e3 - 1), this.scrollTop = 0;
            }
            if (this.scrollBottom = t3 - 1, this._isReflowEnabled && (this._reflow(e3, t3), this._cols > e3)) for (let t4 = 0; t4 < this.lines.length; t4++) s3 += +this.lines.get(t4).resize(e3, i3);
            this._cols = e3, this._rows = t3, this._memoryCleanupQueue.clear(), s3 > 0.1 * this.lines.length && (this._memoryCleanupPosition = 0, this._memoryCleanupQueue.enqueue((() => this._batchedMemoryCleanup())));
          }
          _batchedMemoryCleanup() {
            let e3 = true;
            this._memoryCleanupPosition >= this.lines.length && (this._memoryCleanupPosition = 0, e3 = false);
            let t3 = 0;
            for (; this._memoryCleanupPosition < this.lines.length; ) if (t3 += this.lines.get(this._memoryCleanupPosition++).cleanupMemory(), t3 > 100) return true;
            return e3;
          }
          get _isReflowEnabled() {
            const e3 = this._optionsService.rawOptions.windowsPty;
            return e3 && e3.buildNumber ? this._hasScrollback && "conpty" === e3.backend && e3.buildNumber >= 21376 : this._hasScrollback && !this._optionsService.rawOptions.windowsMode;
          }
          _reflow(e3, t3) {
            this._cols !== e3 && (e3 > this._cols ? this._reflowLarger(e3, t3) : this._reflowSmaller(e3, t3));
          }
          _reflowLarger(e3, t3) {
            const i3 = (0, a.reflowLargerGetLinesToRemove)(this.lines, this._cols, e3, this.ybase + this.y, this.getNullCell(o.DEFAULT_ATTR_DATA));
            if (i3.length > 0) {
              const s3 = (0, a.reflowLargerCreateNewLayout)(this.lines, i3);
              (0, a.reflowLargerApplyNewLayout)(this.lines, s3.layout), this._reflowLargerAdjustViewport(e3, t3, s3.countRemoved);
            }
          }
          _reflowLargerAdjustViewport(e3, t3, i3) {
            const s3 = this.getNullCell(o.DEFAULT_ATTR_DATA);
            let r2 = i3;
            for (; r2-- > 0; ) 0 === this.ybase ? (this.y > 0 && this.y--, this.lines.length < t3 && this.lines.push(new o.BufferLine(e3, s3))) : (this.ydisp === this.ybase && this.ydisp--, this.ybase--);
            this.savedY = Math.max(this.savedY - i3, 0);
          }
          _reflowSmaller(e3, t3) {
            const i3 = this.getNullCell(o.DEFAULT_ATTR_DATA), s3 = [];
            let r2 = 0;
            for (let n2 = this.lines.length - 1; n2 >= 0; n2--) {
              let h3 = this.lines.get(n2);
              if (!h3 || !h3.isWrapped && h3.getTrimmedLength() <= e3) continue;
              const c2 = [h3];
              for (; h3.isWrapped && n2 > 0; ) h3 = this.lines.get(--n2), c2.unshift(h3);
              const l2 = this.ybase + this.y;
              if (l2 >= n2 && l2 < n2 + c2.length) continue;
              const d2 = c2[c2.length - 1].getTrimmedLength(), _ = (0, a.reflowSmallerGetNewLineLengths)(c2, this._cols, e3), u = _.length - c2.length;
              let f;
              f = 0 === this.ybase && this.y !== this.lines.length - 1 ? Math.max(0, this.y - this.lines.maxLength + u) : Math.max(0, this.lines.length - this.lines.maxLength + u);
              const v = [];
              for (let e4 = 0; e4 < u; e4++) {
                const e5 = this.getBlankLine(o.DEFAULT_ATTR_DATA, true);
                v.push(e5);
              }
              v.length > 0 && (s3.push({ start: n2 + c2.length + r2, newLines: v }), r2 += v.length), c2.push(...v);
              let p = _.length - 1, g = _[p];
              0 === g && (p--, g = _[p]);
              let m = c2.length - u - 1, S = d2;
              for (; m >= 0; ) {
                const e4 = Math.min(S, g);
                if (void 0 === c2[p]) break;
                if (c2[p].copyCellsFrom(c2[m], S - e4, g - e4, e4, true), g -= e4, 0 === g && (p--, g = _[p]), S -= e4, 0 === S) {
                  m--;
                  const e5 = Math.max(m, 0);
                  S = (0, a.getWrappedLineTrimmedLength)(c2, e5, this._cols);
                }
              }
              for (let t4 = 0; t4 < c2.length; t4++) _[t4] < e3 && c2[t4].setCell(_[t4], i3);
              let C = u - f;
              for (; C-- > 0; ) 0 === this.ybase ? this.y < t3 - 1 ? (this.y++, this.lines.pop()) : (this.ybase++, this.ydisp++) : this.ybase < Math.min(this.lines.maxLength, this.lines.length + r2) - t3 && (this.ybase === this.ydisp && this.ydisp++, this.ybase++);
              this.savedY = Math.min(this.savedY + u, this.ybase + t3 - 1);
            }
            if (s3.length > 0) {
              const e4 = [], t4 = [];
              for (let e5 = 0; e5 < this.lines.length; e5++) t4.push(this.lines.get(e5));
              const i4 = this.lines.length;
              let n2 = i4 - 1, o2 = 0, a2 = s3[o2];
              this.lines.length = Math.min(this.lines.maxLength, this.lines.length + r2);
              let h3 = 0;
              for (let c3 = Math.min(this.lines.maxLength - 1, i4 + r2 - 1); c3 >= 0; c3--) if (a2 && a2.start > n2 + h3) {
                for (let e5 = a2.newLines.length - 1; e5 >= 0; e5--) this.lines.set(c3--, a2.newLines[e5]);
                c3++, e4.push({ index: n2 + 1, amount: a2.newLines.length }), h3 += a2.newLines.length, a2 = s3[++o2];
              } else this.lines.set(c3, t4[n2--]);
              let c2 = 0;
              for (let t5 = e4.length - 1; t5 >= 0; t5--) e4[t5].index += c2, this.lines.onInsertEmitter.fire(e4[t5]), c2 += e4[t5].amount;
              const l2 = Math.max(0, i4 + r2 - this.lines.maxLength);
              l2 > 0 && this.lines.onTrimEmitter.fire(l2);
            }
          }
          translateBufferLineToString(e3, t3, i3 = 0, s3) {
            const r2 = this.lines.get(e3);
            return r2 ? r2.translateToString(t3, i3, s3) : "";
          }
          getWrappedRangeForLine(e3) {
            let t3 = e3, i3 = e3;
            for (; t3 > 0 && this.lines.get(t3).isWrapped; ) t3--;
            for (; i3 + 1 < this.lines.length && this.lines.get(i3 + 1).isWrapped; ) i3++;
            return { first: t3, last: i3 };
          }
          setupTabStops(e3) {
            for (null != e3 ? this.tabs[e3] || (e3 = this.prevStop(e3)) : (this.tabs = {}, e3 = 0); e3 < this._cols; e3 += this._optionsService.rawOptions.tabStopWidth) this.tabs[e3] = true;
          }
          prevStop(e3) {
            for (null == e3 && (e3 = this.x); !this.tabs[--e3] && e3 > 0; ) ;
            return e3 >= this._cols ? this._cols - 1 : e3 < 0 ? 0 : e3;
          }
          nextStop(e3) {
            for (null == e3 && (e3 = this.x); !this.tabs[++e3] && e3 < this._cols; ) ;
            return e3 >= this._cols ? this._cols - 1 : e3 < 0 ? 0 : e3;
          }
          clearMarkers(e3) {
            this._isClearing = true;
            for (let t3 = 0; t3 < this.markers.length; t3++) this.markers[t3].line === e3 && (this.markers[t3].dispose(), this.markers.splice(t3--, 1));
            this._isClearing = false;
          }
          clearAllMarkers() {
            this._isClearing = true;
            for (let e3 = 0; e3 < this.markers.length; e3++) this.markers[e3].dispose(), this.markers.splice(e3--, 1);
            this._isClearing = false;
          }
          addMarker(e3) {
            const t3 = new l.Marker(e3);
            return this.markers.push(t3), t3.register(this.lines.onTrim(((e4) => {
              t3.line -= e4, t3.line < 0 && t3.dispose();
            }))), t3.register(this.lines.onInsert(((e4) => {
              t3.line >= e4.index && (t3.line += e4.amount);
            }))), t3.register(this.lines.onDelete(((e4) => {
              t3.line >= e4.index && t3.line < e4.index + e4.amount && t3.dispose(), t3.line > e4.index && (t3.line -= e4.amount);
            }))), t3.register(t3.onDispose((() => this._removeMarker(t3)))), t3;
          }
          _removeMarker(e3) {
            this._isClearing || this.markers.splice(this.markers.indexOf(e3), 1);
          }
        };
      }, 8437: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferLine = t2.DEFAULT_ATTR_DATA = void 0;
        const s2 = i2(3734), r = i2(511), n = i2(643), o = i2(482);
        t2.DEFAULT_ATTR_DATA = Object.freeze(new s2.AttributeData());
        let a = 0;
        class h2 {
          constructor(e3, t3, i3 = false) {
            this.isWrapped = i3, this._combined = {}, this._extendedAttrs = {}, this._data = new Uint32Array(3 * e3);
            const s3 = t3 || r.CellData.fromCharData([0, n.NULL_CELL_CHAR, n.NULL_CELL_WIDTH, n.NULL_CELL_CODE]);
            for (let t4 = 0; t4 < e3; ++t4) this.setCell(t4, s3);
            this.length = e3;
          }
          get(e3) {
            const t3 = this._data[3 * e3 + 0], i3 = 2097151 & t3;
            return [this._data[3 * e3 + 1], 2097152 & t3 ? this._combined[e3] : i3 ? (0, o.stringFromCodePoint)(i3) : "", t3 >> 22, 2097152 & t3 ? this._combined[e3].charCodeAt(this._combined[e3].length - 1) : i3];
          }
          set(e3, t3) {
            this._data[3 * e3 + 1] = t3[n.CHAR_DATA_ATTR_INDEX], t3[n.CHAR_DATA_CHAR_INDEX].length > 1 ? (this._combined[e3] = t3[1], this._data[3 * e3 + 0] = 2097152 | e3 | t3[n.CHAR_DATA_WIDTH_INDEX] << 22) : this._data[3 * e3 + 0] = t3[n.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | t3[n.CHAR_DATA_WIDTH_INDEX] << 22;
          }
          getWidth(e3) {
            return this._data[3 * e3 + 0] >> 22;
          }
          hasWidth(e3) {
            return 12582912 & this._data[3 * e3 + 0];
          }
          getFg(e3) {
            return this._data[3 * e3 + 1];
          }
          getBg(e3) {
            return this._data[3 * e3 + 2];
          }
          hasContent(e3) {
            return 4194303 & this._data[3 * e3 + 0];
          }
          getCodePoint(e3) {
            const t3 = this._data[3 * e3 + 0];
            return 2097152 & t3 ? this._combined[e3].charCodeAt(this._combined[e3].length - 1) : 2097151 & t3;
          }
          isCombined(e3) {
            return 2097152 & this._data[3 * e3 + 0];
          }
          getString(e3) {
            const t3 = this._data[3 * e3 + 0];
            return 2097152 & t3 ? this._combined[e3] : 2097151 & t3 ? (0, o.stringFromCodePoint)(2097151 & t3) : "";
          }
          isProtected(e3) {
            return 536870912 & this._data[3 * e3 + 2];
          }
          loadCell(e3, t3) {
            return a = 3 * e3, t3.content = this._data[a + 0], t3.fg = this._data[a + 1], t3.bg = this._data[a + 2], 2097152 & t3.content && (t3.combinedData = this._combined[e3]), 268435456 & t3.bg && (t3.extended = this._extendedAttrs[e3]), t3;
          }
          setCell(e3, t3) {
            2097152 & t3.content && (this._combined[e3] = t3.combinedData), 268435456 & t3.bg && (this._extendedAttrs[e3] = t3.extended), this._data[3 * e3 + 0] = t3.content, this._data[3 * e3 + 1] = t3.fg, this._data[3 * e3 + 2] = t3.bg;
          }
          setCellFromCodePoint(e3, t3, i3, s3, r2, n2) {
            268435456 & r2 && (this._extendedAttrs[e3] = n2), this._data[3 * e3 + 0] = t3 | i3 << 22, this._data[3 * e3 + 1] = s3, this._data[3 * e3 + 2] = r2;
          }
          addCodepointToCell(e3, t3) {
            let i3 = this._data[3 * e3 + 0];
            2097152 & i3 ? this._combined[e3] += (0, o.stringFromCodePoint)(t3) : (2097151 & i3 ? (this._combined[e3] = (0, o.stringFromCodePoint)(2097151 & i3) + (0, o.stringFromCodePoint)(t3), i3 &= -2097152, i3 |= 2097152) : i3 = t3 | 1 << 22, this._data[3 * e3 + 0] = i3);
          }
          insertCells(e3, t3, i3, n2) {
            if ((e3 %= this.length) && 2 === this.getWidth(e3 - 1) && this.setCellFromCodePoint(e3 - 1, 0, 1, (null == n2 ? void 0 : n2.fg) || 0, (null == n2 ? void 0 : n2.bg) || 0, (null == n2 ? void 0 : n2.extended) || new s2.ExtendedAttrs()), t3 < this.length - e3) {
              const s3 = new r.CellData();
              for (let i4 = this.length - e3 - t3 - 1; i4 >= 0; --i4) this.setCell(e3 + t3 + i4, this.loadCell(e3 + i4, s3));
              for (let s4 = 0; s4 < t3; ++s4) this.setCell(e3 + s4, i3);
            } else for (let t4 = e3; t4 < this.length; ++t4) this.setCell(t4, i3);
            2 === this.getWidth(this.length - 1) && this.setCellFromCodePoint(this.length - 1, 0, 1, (null == n2 ? void 0 : n2.fg) || 0, (null == n2 ? void 0 : n2.bg) || 0, (null == n2 ? void 0 : n2.extended) || new s2.ExtendedAttrs());
          }
          deleteCells(e3, t3, i3, n2) {
            if (e3 %= this.length, t3 < this.length - e3) {
              const s3 = new r.CellData();
              for (let i4 = 0; i4 < this.length - e3 - t3; ++i4) this.setCell(e3 + i4, this.loadCell(e3 + t3 + i4, s3));
              for (let e4 = this.length - t3; e4 < this.length; ++e4) this.setCell(e4, i3);
            } else for (let t4 = e3; t4 < this.length; ++t4) this.setCell(t4, i3);
            e3 && 2 === this.getWidth(e3 - 1) && this.setCellFromCodePoint(e3 - 1, 0, 1, (null == n2 ? void 0 : n2.fg) || 0, (null == n2 ? void 0 : n2.bg) || 0, (null == n2 ? void 0 : n2.extended) || new s2.ExtendedAttrs()), 0 !== this.getWidth(e3) || this.hasContent(e3) || this.setCellFromCodePoint(e3, 0, 1, (null == n2 ? void 0 : n2.fg) || 0, (null == n2 ? void 0 : n2.bg) || 0, (null == n2 ? void 0 : n2.extended) || new s2.ExtendedAttrs());
          }
          replaceCells(e3, t3, i3, r2, n2 = false) {
            if (n2) for (e3 && 2 === this.getWidth(e3 - 1) && !this.isProtected(e3 - 1) && this.setCellFromCodePoint(e3 - 1, 0, 1, (null == r2 ? void 0 : r2.fg) || 0, (null == r2 ? void 0 : r2.bg) || 0, (null == r2 ? void 0 : r2.extended) || new s2.ExtendedAttrs()), t3 < this.length && 2 === this.getWidth(t3 - 1) && !this.isProtected(t3) && this.setCellFromCodePoint(t3, 0, 1, (null == r2 ? void 0 : r2.fg) || 0, (null == r2 ? void 0 : r2.bg) || 0, (null == r2 ? void 0 : r2.extended) || new s2.ExtendedAttrs()); e3 < t3 && e3 < this.length; ) this.isProtected(e3) || this.setCell(e3, i3), e3++;
            else for (e3 && 2 === this.getWidth(e3 - 1) && this.setCellFromCodePoint(e3 - 1, 0, 1, (null == r2 ? void 0 : r2.fg) || 0, (null == r2 ? void 0 : r2.bg) || 0, (null == r2 ? void 0 : r2.extended) || new s2.ExtendedAttrs()), t3 < this.length && 2 === this.getWidth(t3 - 1) && this.setCellFromCodePoint(t3, 0, 1, (null == r2 ? void 0 : r2.fg) || 0, (null == r2 ? void 0 : r2.bg) || 0, (null == r2 ? void 0 : r2.extended) || new s2.ExtendedAttrs()); e3 < t3 && e3 < this.length; ) this.setCell(e3++, i3);
          }
          resize(e3, t3) {
            if (e3 === this.length) return 4 * this._data.length * 2 < this._data.buffer.byteLength;
            const i3 = 3 * e3;
            if (e3 > this.length) {
              if (this._data.buffer.byteLength >= 4 * i3) this._data = new Uint32Array(this._data.buffer, 0, i3);
              else {
                const e4 = new Uint32Array(i3);
                e4.set(this._data), this._data = e4;
              }
              for (let i4 = this.length; i4 < e3; ++i4) this.setCell(i4, t3);
            } else {
              this._data = this._data.subarray(0, i3);
              const t4 = Object.keys(this._combined);
              for (let i4 = 0; i4 < t4.length; i4++) {
                const s4 = parseInt(t4[i4], 10);
                s4 >= e3 && delete this._combined[s4];
              }
              const s3 = Object.keys(this._extendedAttrs);
              for (let t5 = 0; t5 < s3.length; t5++) {
                const i4 = parseInt(s3[t5], 10);
                i4 >= e3 && delete this._extendedAttrs[i4];
              }
            }
            return this.length = e3, 4 * i3 * 2 < this._data.buffer.byteLength;
          }
          cleanupMemory() {
            if (4 * this._data.length * 2 < this._data.buffer.byteLength) {
              const e3 = new Uint32Array(this._data.length);
              return e3.set(this._data), this._data = e3, 1;
            }
            return 0;
          }
          fill(e3, t3 = false) {
            if (t3) for (let t4 = 0; t4 < this.length; ++t4) this.isProtected(t4) || this.setCell(t4, e3);
            else {
              this._combined = {}, this._extendedAttrs = {};
              for (let t4 = 0; t4 < this.length; ++t4) this.setCell(t4, e3);
            }
          }
          copyFrom(e3) {
            this.length !== e3.length ? this._data = new Uint32Array(e3._data) : this._data.set(e3._data), this.length = e3.length, this._combined = {};
            for (const t3 in e3._combined) this._combined[t3] = e3._combined[t3];
            this._extendedAttrs = {};
            for (const t3 in e3._extendedAttrs) this._extendedAttrs[t3] = e3._extendedAttrs[t3];
            this.isWrapped = e3.isWrapped;
          }
          clone() {
            const e3 = new h2(0);
            e3._data = new Uint32Array(this._data), e3.length = this.length;
            for (const t3 in this._combined) e3._combined[t3] = this._combined[t3];
            for (const t3 in this._extendedAttrs) e3._extendedAttrs[t3] = this._extendedAttrs[t3];
            return e3.isWrapped = this.isWrapped, e3;
          }
          getTrimmedLength() {
            for (let e3 = this.length - 1; e3 >= 0; --e3) if (4194303 & this._data[3 * e3 + 0]) return e3 + (this._data[3 * e3 + 0] >> 22);
            return 0;
          }
          getNoBgTrimmedLength() {
            for (let e3 = this.length - 1; e3 >= 0; --e3) if (4194303 & this._data[3 * e3 + 0] || 50331648 & this._data[3 * e3 + 2]) return e3 + (this._data[3 * e3 + 0] >> 22);
            return 0;
          }
          copyCellsFrom(e3, t3, i3, s3, r2) {
            const n2 = e3._data;
            if (r2) for (let r3 = s3 - 1; r3 >= 0; r3--) {
              for (let e4 = 0; e4 < 3; e4++) this._data[3 * (i3 + r3) + e4] = n2[3 * (t3 + r3) + e4];
              268435456 & n2[3 * (t3 + r3) + 2] && (this._extendedAttrs[i3 + r3] = e3._extendedAttrs[t3 + r3]);
            }
            else for (let r3 = 0; r3 < s3; r3++) {
              for (let e4 = 0; e4 < 3; e4++) this._data[3 * (i3 + r3) + e4] = n2[3 * (t3 + r3) + e4];
              268435456 & n2[3 * (t3 + r3) + 2] && (this._extendedAttrs[i3 + r3] = e3._extendedAttrs[t3 + r3]);
            }
            const o2 = Object.keys(e3._combined);
            for (let s4 = 0; s4 < o2.length; s4++) {
              const r3 = parseInt(o2[s4], 10);
              r3 >= t3 && (this._combined[r3 - t3 + i3] = e3._combined[r3]);
            }
          }
          translateToString(e3 = false, t3 = 0, i3 = this.length) {
            e3 && (i3 = Math.min(i3, this.getTrimmedLength()));
            let s3 = "";
            for (; t3 < i3; ) {
              const e4 = this._data[3 * t3 + 0], i4 = 2097151 & e4;
              s3 += 2097152 & e4 ? this._combined[t3] : i4 ? (0, o.stringFromCodePoint)(i4) : n.WHITESPACE_CELL_CHAR, t3 += e4 >> 22 || 1;
            }
            return s3;
          }
        }
        t2.BufferLine = h2;
      }, 4841: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.getRangeLength = void 0, t2.getRangeLength = function(e3, t3) {
          if (e3.start.y > e3.end.y) throw new Error(`Buffer range end (${e3.end.x}, ${e3.end.y}) cannot be before start (${e3.start.x}, ${e3.start.y})`);
          return t3 * (e3.end.y - e3.start.y) + (e3.end.x - e3.start.x + 1);
        };
      }, 4634: (e2, t2) => {
        function i2(e3, t3, i3) {
          if (t3 === e3.length - 1) return e3[t3].getTrimmedLength();
          const s2 = !e3[t3].hasContent(i3 - 1) && 1 === e3[t3].getWidth(i3 - 1), r = 2 === e3[t3 + 1].getWidth(0);
          return s2 && r ? i3 - 1 : i3;
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.getWrappedLineTrimmedLength = t2.reflowSmallerGetNewLineLengths = t2.reflowLargerApplyNewLayout = t2.reflowLargerCreateNewLayout = t2.reflowLargerGetLinesToRemove = void 0, t2.reflowLargerGetLinesToRemove = function(e3, t3, s2, r, n) {
          const o = [];
          for (let a = 0; a < e3.length - 1; a++) {
            let h2 = a, c = e3.get(++h2);
            if (!c.isWrapped) continue;
            const l = [e3.get(a)];
            for (; h2 < e3.length && c.isWrapped; ) l.push(c), c = e3.get(++h2);
            if (r >= a && r < h2) {
              a += l.length - 1;
              continue;
            }
            let d = 0, _ = i2(l, d, t3), u = 1, f = 0;
            for (; u < l.length; ) {
              const e4 = i2(l, u, t3), r2 = e4 - f, o2 = s2 - _, a2 = Math.min(r2, o2);
              l[d].copyCellsFrom(l[u], f, _, a2, false), _ += a2, _ === s2 && (d++, _ = 0), f += a2, f === e4 && (u++, f = 0), 0 === _ && 0 !== d && 2 === l[d - 1].getWidth(s2 - 1) && (l[d].copyCellsFrom(l[d - 1], s2 - 1, _++, 1, false), l[d - 1].setCell(s2 - 1, n));
            }
            l[d].replaceCells(_, s2, n);
            let v = 0;
            for (let e4 = l.length - 1; e4 > 0 && (e4 > d || 0 === l[e4].getTrimmedLength()); e4--) v++;
            v > 0 && (o.push(a + l.length - v), o.push(v)), a += l.length - 1;
          }
          return o;
        }, t2.reflowLargerCreateNewLayout = function(e3, t3) {
          const i3 = [];
          let s2 = 0, r = t3[s2], n = 0;
          for (let o = 0; o < e3.length; o++) if (r === o) {
            const i4 = t3[++s2];
            e3.onDeleteEmitter.fire({ index: o - n, amount: i4 }), o += i4 - 1, n += i4, r = t3[++s2];
          } else i3.push(o);
          return { layout: i3, countRemoved: n };
        }, t2.reflowLargerApplyNewLayout = function(e3, t3) {
          const i3 = [];
          for (let s2 = 0; s2 < t3.length; s2++) i3.push(e3.get(t3[s2]));
          for (let t4 = 0; t4 < i3.length; t4++) e3.set(t4, i3[t4]);
          e3.length = t3.length;
        }, t2.reflowSmallerGetNewLineLengths = function(e3, t3, s2) {
          const r = [], n = e3.map(((s3, r2) => i2(e3, r2, t3))).reduce(((e4, t4) => e4 + t4));
          let o = 0, a = 0, h2 = 0;
          for (; h2 < n; ) {
            if (n - h2 < s2) {
              r.push(n - h2);
              break;
            }
            o += s2;
            const c = i2(e3, a, t3);
            o > c && (o -= c, a++);
            const l = 2 === e3[a].getWidth(o - 1);
            l && o--;
            const d = l ? s2 - 1 : s2;
            r.push(d), h2 += d;
          }
          return r;
        }, t2.getWrappedLineTrimmedLength = i2;
      }, 5295: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferSet = void 0;
        const s2 = i2(8460), r = i2(844), n = i2(9092);
        class o extends r.Disposable {
          constructor(e3, t3) {
            super(), this._optionsService = e3, this._bufferService = t3, this._onBufferActivate = this.register(new s2.EventEmitter()), this.onBufferActivate = this._onBufferActivate.event, this.reset(), this.register(this._optionsService.onSpecificOptionChange("scrollback", (() => this.resize(this._bufferService.cols, this._bufferService.rows)))), this.register(this._optionsService.onSpecificOptionChange("tabStopWidth", (() => this.setupTabStops())));
          }
          reset() {
            this._normal = new n.Buffer(true, this._optionsService, this._bufferService), this._normal.fillViewportRows(), this._alt = new n.Buffer(false, this._optionsService, this._bufferService), this._activeBuffer = this._normal, this._onBufferActivate.fire({ activeBuffer: this._normal, inactiveBuffer: this._alt }), this.setupTabStops();
          }
          get alt() {
            return this._alt;
          }
          get active() {
            return this._activeBuffer;
          }
          get normal() {
            return this._normal;
          }
          activateNormalBuffer() {
            this._activeBuffer !== this._normal && (this._normal.x = this._alt.x, this._normal.y = this._alt.y, this._alt.clearAllMarkers(), this._alt.clear(), this._activeBuffer = this._normal, this._onBufferActivate.fire({ activeBuffer: this._normal, inactiveBuffer: this._alt }));
          }
          activateAltBuffer(e3) {
            this._activeBuffer !== this._alt && (this._alt.fillViewportRows(e3), this._alt.x = this._normal.x, this._alt.y = this._normal.y, this._activeBuffer = this._alt, this._onBufferActivate.fire({ activeBuffer: this._alt, inactiveBuffer: this._normal }));
          }
          resize(e3, t3) {
            this._normal.resize(e3, t3), this._alt.resize(e3, t3), this.setupTabStops(e3);
          }
          setupTabStops(e3) {
            this._normal.setupTabStops(e3), this._alt.setupTabStops(e3);
          }
        }
        t2.BufferSet = o;
      }, 511: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CellData = void 0;
        const s2 = i2(482), r = i2(643), n = i2(3734);
        class o extends n.AttributeData {
          constructor() {
            super(...arguments), this.content = 0, this.fg = 0, this.bg = 0, this.extended = new n.ExtendedAttrs(), this.combinedData = "";
          }
          static fromCharData(e3) {
            const t3 = new o();
            return t3.setFromCharData(e3), t3;
          }
          isCombined() {
            return 2097152 & this.content;
          }
          getWidth() {
            return this.content >> 22;
          }
          getChars() {
            return 2097152 & this.content ? this.combinedData : 2097151 & this.content ? (0, s2.stringFromCodePoint)(2097151 & this.content) : "";
          }
          getCode() {
            return this.isCombined() ? this.combinedData.charCodeAt(this.combinedData.length - 1) : 2097151 & this.content;
          }
          setFromCharData(e3) {
            this.fg = e3[r.CHAR_DATA_ATTR_INDEX], this.bg = 0;
            let t3 = false;
            if (e3[r.CHAR_DATA_CHAR_INDEX].length > 2) t3 = true;
            else if (2 === e3[r.CHAR_DATA_CHAR_INDEX].length) {
              const i3 = e3[r.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
              if (55296 <= i3 && i3 <= 56319) {
                const s3 = e3[r.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
                56320 <= s3 && s3 <= 57343 ? this.content = 1024 * (i3 - 55296) + s3 - 56320 + 65536 | e3[r.CHAR_DATA_WIDTH_INDEX] << 22 : t3 = true;
              } else t3 = true;
            } else this.content = e3[r.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | e3[r.CHAR_DATA_WIDTH_INDEX] << 22;
            t3 && (this.combinedData = e3[r.CHAR_DATA_CHAR_INDEX], this.content = 2097152 | e3[r.CHAR_DATA_WIDTH_INDEX] << 22);
          }
          getAsCharData() {
            return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
          }
        }
        t2.CellData = o;
      }, 643: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.WHITESPACE_CELL_CODE = t2.WHITESPACE_CELL_WIDTH = t2.WHITESPACE_CELL_CHAR = t2.NULL_CELL_CODE = t2.NULL_CELL_WIDTH = t2.NULL_CELL_CHAR = t2.CHAR_DATA_CODE_INDEX = t2.CHAR_DATA_WIDTH_INDEX = t2.CHAR_DATA_CHAR_INDEX = t2.CHAR_DATA_ATTR_INDEX = t2.DEFAULT_EXT = t2.DEFAULT_ATTR = t2.DEFAULT_COLOR = void 0, t2.DEFAULT_COLOR = 0, t2.DEFAULT_ATTR = 256 | t2.DEFAULT_COLOR << 9, t2.DEFAULT_EXT = 0, t2.CHAR_DATA_ATTR_INDEX = 0, t2.CHAR_DATA_CHAR_INDEX = 1, t2.CHAR_DATA_WIDTH_INDEX = 2, t2.CHAR_DATA_CODE_INDEX = 3, t2.NULL_CELL_CHAR = "", t2.NULL_CELL_WIDTH = 1, t2.NULL_CELL_CODE = 0, t2.WHITESPACE_CELL_CHAR = " ", t2.WHITESPACE_CELL_WIDTH = 1, t2.WHITESPACE_CELL_CODE = 32;
      }, 4863: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Marker = void 0;
        const s2 = i2(8460), r = i2(844);
        class n {
          get id() {
            return this._id;
          }
          constructor(e3) {
            this.line = e3, this.isDisposed = false, this._disposables = [], this._id = n._nextId++, this._onDispose = this.register(new s2.EventEmitter()), this.onDispose = this._onDispose.event;
          }
          dispose() {
            this.isDisposed || (this.isDisposed = true, this.line = -1, this._onDispose.fire(), (0, r.disposeArray)(this._disposables), this._disposables.length = 0);
          }
          register(e3) {
            return this._disposables.push(e3), e3;
          }
        }
        t2.Marker = n, n._nextId = 1;
      }, 7116: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DEFAULT_CHARSET = t2.CHARSETS = void 0, t2.CHARSETS = {}, t2.DEFAULT_CHARSET = t2.CHARSETS.B, t2.CHARSETS[0] = { "`": "\u25C6", a: "\u2592", b: "\u2409", c: "\u240C", d: "\u240D", e: "\u240A", f: "\xB0", g: "\xB1", h: "\u2424", i: "\u240B", j: "\u2518", k: "\u2510", l: "\u250C", m: "\u2514", n: "\u253C", o: "\u23BA", p: "\u23BB", q: "\u2500", r: "\u23BC", s: "\u23BD", t: "\u251C", u: "\u2524", v: "\u2534", w: "\u252C", x: "\u2502", y: "\u2264", z: "\u2265", "{": "\u03C0", "|": "\u2260", "}": "\xA3", "~": "\xB7" }, t2.CHARSETS.A = { "#": "\xA3" }, t2.CHARSETS.B = void 0, t2.CHARSETS[4] = { "#": "\xA3", "@": "\xBE", "[": "ij", "\\": "\xBD", "]": "|", "{": "\xA8", "|": "f", "}": "\xBC", "~": "\xB4" }, t2.CHARSETS.C = t2.CHARSETS[5] = { "[": "\xC4", "\\": "\xD6", "]": "\xC5", "^": "\xDC", "`": "\xE9", "{": "\xE4", "|": "\xF6", "}": "\xE5", "~": "\xFC" }, t2.CHARSETS.R = { "#": "\xA3", "@": "\xE0", "[": "\xB0", "\\": "\xE7", "]": "\xA7", "{": "\xE9", "|": "\xF9", "}": "\xE8", "~": "\xA8" }, t2.CHARSETS.Q = { "@": "\xE0", "[": "\xE2", "\\": "\xE7", "]": "\xEA", "^": "\xEE", "`": "\xF4", "{": "\xE9", "|": "\xF9", "}": "\xE8", "~": "\xFB" }, t2.CHARSETS.K = { "@": "\xA7", "[": "\xC4", "\\": "\xD6", "]": "\xDC", "{": "\xE4", "|": "\xF6", "}": "\xFC", "~": "\xDF" }, t2.CHARSETS.Y = { "#": "\xA3", "@": "\xA7", "[": "\xB0", "\\": "\xE7", "]": "\xE9", "`": "\xF9", "{": "\xE0", "|": "\xF2", "}": "\xE8", "~": "\xEC" }, t2.CHARSETS.E = t2.CHARSETS[6] = { "@": "\xC4", "[": "\xC6", "\\": "\xD8", "]": "\xC5", "^": "\xDC", "`": "\xE4", "{": "\xE6", "|": "\xF8", "}": "\xE5", "~": "\xFC" }, t2.CHARSETS.Z = { "#": "\xA3", "@": "\xA7", "[": "\xA1", "\\": "\xD1", "]": "\xBF", "{": "\xB0", "|": "\xF1", "}": "\xE7" }, t2.CHARSETS.H = t2.CHARSETS[7] = { "@": "\xC9", "[": "\xC4", "\\": "\xD6", "]": "\xC5", "^": "\xDC", "`": "\xE9", "{": "\xE4", "|": "\xF6", "}": "\xE5", "~": "\xFC" }, t2.CHARSETS["="] = { "#": "\xF9", "@": "\xE0", "[": "\xE9", "\\": "\xE7", "]": "\xEA", "^": "\xEE", _: "\xE8", "`": "\xF4", "{": "\xE4", "|": "\xF6", "}": "\xFC", "~": "\xFB" };
      }, 2584: (e2, t2) => {
        var i2, s2, r;
        Object.defineProperty(t2, "__esModule", { value: true }), t2.C1_ESCAPED = t2.C1 = t2.C0 = void 0, (function(e3) {
          e3.NUL = "\0", e3.SOH = "", e3.STX = "", e3.ETX = "", e3.EOT = "", e3.ENQ = "", e3.ACK = "", e3.BEL = "\x07", e3.BS = "\b", e3.HT = "	", e3.LF = "\n", e3.VT = "\v", e3.FF = "\f", e3.CR = "\r", e3.SO = "", e3.SI = "", e3.DLE = "", e3.DC1 = "", e3.DC2 = "", e3.DC3 = "", e3.DC4 = "", e3.NAK = "", e3.SYN = "", e3.ETB = "", e3.CAN = "", e3.EM = "", e3.SUB = "", e3.ESC = "\x1B", e3.FS = "", e3.GS = "", e3.RS = "", e3.US = "", e3.SP = " ", e3.DEL = "\x7F";
        })(i2 || (t2.C0 = i2 = {})), (function(e3) {
          e3.PAD = "\x80", e3.HOP = "\x81", e3.BPH = "\x82", e3.NBH = "\x83", e3.IND = "\x84", e3.NEL = "\x85", e3.SSA = "\x86", e3.ESA = "\x87", e3.HTS = "\x88", e3.HTJ = "\x89", e3.VTS = "\x8A", e3.PLD = "\x8B", e3.PLU = "\x8C", e3.RI = "\x8D", e3.SS2 = "\x8E", e3.SS3 = "\x8F", e3.DCS = "\x90", e3.PU1 = "\x91", e3.PU2 = "\x92", e3.STS = "\x93", e3.CCH = "\x94", e3.MW = "\x95", e3.SPA = "\x96", e3.EPA = "\x97", e3.SOS = "\x98", e3.SGCI = "\x99", e3.SCI = "\x9A", e3.CSI = "\x9B", e3.ST = "\x9C", e3.OSC = "\x9D", e3.PM = "\x9E", e3.APC = "\x9F";
        })(s2 || (t2.C1 = s2 = {})), (function(e3) {
          e3.ST = `${i2.ESC}\\`;
        })(r || (t2.C1_ESCAPED = r = {}));
      }, 7399: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.evaluateKeyboardEvent = void 0;
        const s2 = i2(2584), r = { 48: ["0", ")"], 49: ["1", "!"], 50: ["2", "@"], 51: ["3", "#"], 52: ["4", "$"], 53: ["5", "%"], 54: ["6", "^"], 55: ["7", "&"], 56: ["8", "*"], 57: ["9", "("], 186: [";", ":"], 187: ["=", "+"], 188: [",", "<"], 189: ["-", "_"], 190: [".", ">"], 191: ["/", "?"], 192: ["`", "~"], 219: ["[", "{"], 220: ["\\", "|"], 221: ["]", "}"], 222: ["'", '"'] };
        t2.evaluateKeyboardEvent = function(e3, t3, i3, n) {
          const o = { type: 0, cancel: false, key: void 0 }, a = (e3.shiftKey ? 1 : 0) | (e3.altKey ? 2 : 0) | (e3.ctrlKey ? 4 : 0) | (e3.metaKey ? 8 : 0);
          switch (e3.keyCode) {
            case 0:
              "UIKeyInputUpArrow" === e3.key ? o.key = t3 ? s2.C0.ESC + "OA" : s2.C0.ESC + "[A" : "UIKeyInputLeftArrow" === e3.key ? o.key = t3 ? s2.C0.ESC + "OD" : s2.C0.ESC + "[D" : "UIKeyInputRightArrow" === e3.key ? o.key = t3 ? s2.C0.ESC + "OC" : s2.C0.ESC + "[C" : "UIKeyInputDownArrow" === e3.key && (o.key = t3 ? s2.C0.ESC + "OB" : s2.C0.ESC + "[B");
              break;
            case 8:
              if (e3.altKey) {
                o.key = s2.C0.ESC + s2.C0.DEL;
                break;
              }
              o.key = s2.C0.DEL;
              break;
            case 9:
              if (e3.shiftKey) {
                o.key = s2.C0.ESC + "[Z";
                break;
              }
              o.key = s2.C0.HT, o.cancel = true;
              break;
            case 13:
              o.key = e3.altKey ? s2.C0.ESC + s2.C0.CR : s2.C0.CR, o.cancel = true;
              break;
            case 27:
              o.key = s2.C0.ESC, e3.altKey && (o.key = s2.C0.ESC + s2.C0.ESC), o.cancel = true;
              break;
            case 37:
              if (e3.metaKey) break;
              a ? (o.key = s2.C0.ESC + "[1;" + (a + 1) + "D", o.key === s2.C0.ESC + "[1;3D" && (o.key = s2.C0.ESC + (i3 ? "b" : "[1;5D"))) : o.key = t3 ? s2.C0.ESC + "OD" : s2.C0.ESC + "[D";
              break;
            case 39:
              if (e3.metaKey) break;
              a ? (o.key = s2.C0.ESC + "[1;" + (a + 1) + "C", o.key === s2.C0.ESC + "[1;3C" && (o.key = s2.C0.ESC + (i3 ? "f" : "[1;5C"))) : o.key = t3 ? s2.C0.ESC + "OC" : s2.C0.ESC + "[C";
              break;
            case 38:
              if (e3.metaKey) break;
              a ? (o.key = s2.C0.ESC + "[1;" + (a + 1) + "A", i3 || o.key !== s2.C0.ESC + "[1;3A" || (o.key = s2.C0.ESC + "[1;5A")) : o.key = t3 ? s2.C0.ESC + "OA" : s2.C0.ESC + "[A";
              break;
            case 40:
              if (e3.metaKey) break;
              a ? (o.key = s2.C0.ESC + "[1;" + (a + 1) + "B", i3 || o.key !== s2.C0.ESC + "[1;3B" || (o.key = s2.C0.ESC + "[1;5B")) : o.key = t3 ? s2.C0.ESC + "OB" : s2.C0.ESC + "[B";
              break;
            case 45:
              e3.shiftKey || e3.ctrlKey || (o.key = s2.C0.ESC + "[2~");
              break;
            case 46:
              o.key = a ? s2.C0.ESC + "[3;" + (a + 1) + "~" : s2.C0.ESC + "[3~";
              break;
            case 36:
              o.key = a ? s2.C0.ESC + "[1;" + (a + 1) + "H" : t3 ? s2.C0.ESC + "OH" : s2.C0.ESC + "[H";
              break;
            case 35:
              o.key = a ? s2.C0.ESC + "[1;" + (a + 1) + "F" : t3 ? s2.C0.ESC + "OF" : s2.C0.ESC + "[F";
              break;
            case 33:
              e3.shiftKey ? o.type = 2 : e3.ctrlKey ? o.key = s2.C0.ESC + "[5;" + (a + 1) + "~" : o.key = s2.C0.ESC + "[5~";
              break;
            case 34:
              e3.shiftKey ? o.type = 3 : e3.ctrlKey ? o.key = s2.C0.ESC + "[6;" + (a + 1) + "~" : o.key = s2.C0.ESC + "[6~";
              break;
            case 112:
              o.key = a ? s2.C0.ESC + "[1;" + (a + 1) + "P" : s2.C0.ESC + "OP";
              break;
            case 113:
              o.key = a ? s2.C0.ESC + "[1;" + (a + 1) + "Q" : s2.C0.ESC + "OQ";
              break;
            case 114:
              o.key = a ? s2.C0.ESC + "[1;" + (a + 1) + "R" : s2.C0.ESC + "OR";
              break;
            case 115:
              o.key = a ? s2.C0.ESC + "[1;" + (a + 1) + "S" : s2.C0.ESC + "OS";
              break;
            case 116:
              o.key = a ? s2.C0.ESC + "[15;" + (a + 1) + "~" : s2.C0.ESC + "[15~";
              break;
            case 117:
              o.key = a ? s2.C0.ESC + "[17;" + (a + 1) + "~" : s2.C0.ESC + "[17~";
              break;
            case 118:
              o.key = a ? s2.C0.ESC + "[18;" + (a + 1) + "~" : s2.C0.ESC + "[18~";
              break;
            case 119:
              o.key = a ? s2.C0.ESC + "[19;" + (a + 1) + "~" : s2.C0.ESC + "[19~";
              break;
            case 120:
              o.key = a ? s2.C0.ESC + "[20;" + (a + 1) + "~" : s2.C0.ESC + "[20~";
              break;
            case 121:
              o.key = a ? s2.C0.ESC + "[21;" + (a + 1) + "~" : s2.C0.ESC + "[21~";
              break;
            case 122:
              o.key = a ? s2.C0.ESC + "[23;" + (a + 1) + "~" : s2.C0.ESC + "[23~";
              break;
            case 123:
              o.key = a ? s2.C0.ESC + "[24;" + (a + 1) + "~" : s2.C0.ESC + "[24~";
              break;
            default:
              if (!e3.ctrlKey || e3.shiftKey || e3.altKey || e3.metaKey) if (i3 && !n || !e3.altKey || e3.metaKey) !i3 || e3.altKey || e3.ctrlKey || e3.shiftKey || !e3.metaKey ? e3.key && !e3.ctrlKey && !e3.altKey && !e3.metaKey && e3.keyCode >= 48 && 1 === e3.key.length ? o.key = e3.key : e3.key && e3.ctrlKey && ("_" === e3.key && (o.key = s2.C0.US), "@" === e3.key && (o.key = s2.C0.NUL)) : 65 === e3.keyCode && (o.type = 1);
              else {
                const t4 = r[e3.keyCode], i4 = null == t4 ? void 0 : t4[e3.shiftKey ? 1 : 0];
                if (i4) o.key = s2.C0.ESC + i4;
                else if (e3.keyCode >= 65 && e3.keyCode <= 90) {
                  const t5 = e3.ctrlKey ? e3.keyCode - 64 : e3.keyCode + 32;
                  let i5 = String.fromCharCode(t5);
                  e3.shiftKey && (i5 = i5.toUpperCase()), o.key = s2.C0.ESC + i5;
                } else if (32 === e3.keyCode) o.key = s2.C0.ESC + (e3.ctrlKey ? s2.C0.NUL : " ");
                else if ("Dead" === e3.key && e3.code.startsWith("Key")) {
                  let t5 = e3.code.slice(3, 4);
                  e3.shiftKey || (t5 = t5.toLowerCase()), o.key = s2.C0.ESC + t5, o.cancel = true;
                }
              }
              else e3.keyCode >= 65 && e3.keyCode <= 90 ? o.key = String.fromCharCode(e3.keyCode - 64) : 32 === e3.keyCode ? o.key = s2.C0.NUL : e3.keyCode >= 51 && e3.keyCode <= 55 ? o.key = String.fromCharCode(e3.keyCode - 51 + 27) : 56 === e3.keyCode ? o.key = s2.C0.DEL : 219 === e3.keyCode ? o.key = s2.C0.ESC : 220 === e3.keyCode ? o.key = s2.C0.FS : 221 === e3.keyCode && (o.key = s2.C0.GS);
          }
          return o;
        };
      }, 482: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Utf8ToUtf32 = t2.StringToUtf32 = t2.utf32ToString = t2.stringFromCodePoint = void 0, t2.stringFromCodePoint = function(e3) {
          return e3 > 65535 ? (e3 -= 65536, String.fromCharCode(55296 + (e3 >> 10)) + String.fromCharCode(e3 % 1024 + 56320)) : String.fromCharCode(e3);
        }, t2.utf32ToString = function(e3, t3 = 0, i2 = e3.length) {
          let s2 = "";
          for (let r = t3; r < i2; ++r) {
            let t4 = e3[r];
            t4 > 65535 ? (t4 -= 65536, s2 += String.fromCharCode(55296 + (t4 >> 10)) + String.fromCharCode(t4 % 1024 + 56320)) : s2 += String.fromCharCode(t4);
          }
          return s2;
        }, t2.StringToUtf32 = class {
          constructor() {
            this._interim = 0;
          }
          clear() {
            this._interim = 0;
          }
          decode(e3, t3) {
            const i2 = e3.length;
            if (!i2) return 0;
            let s2 = 0, r = 0;
            if (this._interim) {
              const i3 = e3.charCodeAt(r++);
              56320 <= i3 && i3 <= 57343 ? t3[s2++] = 1024 * (this._interim - 55296) + i3 - 56320 + 65536 : (t3[s2++] = this._interim, t3[s2++] = i3), this._interim = 0;
            }
            for (let n = r; n < i2; ++n) {
              const r2 = e3.charCodeAt(n);
              if (55296 <= r2 && r2 <= 56319) {
                if (++n >= i2) return this._interim = r2, s2;
                const o = e3.charCodeAt(n);
                56320 <= o && o <= 57343 ? t3[s2++] = 1024 * (r2 - 55296) + o - 56320 + 65536 : (t3[s2++] = r2, t3[s2++] = o);
              } else 65279 !== r2 && (t3[s2++] = r2);
            }
            return s2;
          }
        }, t2.Utf8ToUtf32 = class {
          constructor() {
            this.interim = new Uint8Array(3);
          }
          clear() {
            this.interim.fill(0);
          }
          decode(e3, t3) {
            const i2 = e3.length;
            if (!i2) return 0;
            let s2, r, n, o, a = 0, h2 = 0, c = 0;
            if (this.interim[0]) {
              let s3 = false, r2 = this.interim[0];
              r2 &= 192 == (224 & r2) ? 31 : 224 == (240 & r2) ? 15 : 7;
              let n2, o2 = 0;
              for (; (n2 = 63 & this.interim[++o2]) && o2 < 4; ) r2 <<= 6, r2 |= n2;
              const h3 = 192 == (224 & this.interim[0]) ? 2 : 224 == (240 & this.interim[0]) ? 3 : 4, l2 = h3 - o2;
              for (; c < l2; ) {
                if (c >= i2) return 0;
                if (n2 = e3[c++], 128 != (192 & n2)) {
                  c--, s3 = true;
                  break;
                }
                this.interim[o2++] = n2, r2 <<= 6, r2 |= 63 & n2;
              }
              s3 || (2 === h3 ? r2 < 128 ? c-- : t3[a++] = r2 : 3 === h3 ? r2 < 2048 || r2 >= 55296 && r2 <= 57343 || 65279 === r2 || (t3[a++] = r2) : r2 < 65536 || r2 > 1114111 || (t3[a++] = r2)), this.interim.fill(0);
            }
            const l = i2 - 4;
            let d = c;
            for (; d < i2; ) {
              for (; !(!(d < l) || 128 & (s2 = e3[d]) || 128 & (r = e3[d + 1]) || 128 & (n = e3[d + 2]) || 128 & (o = e3[d + 3])); ) t3[a++] = s2, t3[a++] = r, t3[a++] = n, t3[a++] = o, d += 4;
              if (s2 = e3[d++], s2 < 128) t3[a++] = s2;
              else if (192 == (224 & s2)) {
                if (d >= i2) return this.interim[0] = s2, a;
                if (r = e3[d++], 128 != (192 & r)) {
                  d--;
                  continue;
                }
                if (h2 = (31 & s2) << 6 | 63 & r, h2 < 128) {
                  d--;
                  continue;
                }
                t3[a++] = h2;
              } else if (224 == (240 & s2)) {
                if (d >= i2) return this.interim[0] = s2, a;
                if (r = e3[d++], 128 != (192 & r)) {
                  d--;
                  continue;
                }
                if (d >= i2) return this.interim[0] = s2, this.interim[1] = r, a;
                if (n = e3[d++], 128 != (192 & n)) {
                  d--;
                  continue;
                }
                if (h2 = (15 & s2) << 12 | (63 & r) << 6 | 63 & n, h2 < 2048 || h2 >= 55296 && h2 <= 57343 || 65279 === h2) continue;
                t3[a++] = h2;
              } else if (240 == (248 & s2)) {
                if (d >= i2) return this.interim[0] = s2, a;
                if (r = e3[d++], 128 != (192 & r)) {
                  d--;
                  continue;
                }
                if (d >= i2) return this.interim[0] = s2, this.interim[1] = r, a;
                if (n = e3[d++], 128 != (192 & n)) {
                  d--;
                  continue;
                }
                if (d >= i2) return this.interim[0] = s2, this.interim[1] = r, this.interim[2] = n, a;
                if (o = e3[d++], 128 != (192 & o)) {
                  d--;
                  continue;
                }
                if (h2 = (7 & s2) << 18 | (63 & r) << 12 | (63 & n) << 6 | 63 & o, h2 < 65536 || h2 > 1114111) continue;
                t3[a++] = h2;
              }
            }
            return a;
          }
        };
      }, 225: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.UnicodeV6 = void 0;
        const i2 = [[768, 879], [1155, 1158], [1160, 1161], [1425, 1469], [1471, 1471], [1473, 1474], [1476, 1477], [1479, 1479], [1536, 1539], [1552, 1557], [1611, 1630], [1648, 1648], [1750, 1764], [1767, 1768], [1770, 1773], [1807, 1807], [1809, 1809], [1840, 1866], [1958, 1968], [2027, 2035], [2305, 2306], [2364, 2364], [2369, 2376], [2381, 2381], [2385, 2388], [2402, 2403], [2433, 2433], [2492, 2492], [2497, 2500], [2509, 2509], [2530, 2531], [2561, 2562], [2620, 2620], [2625, 2626], [2631, 2632], [2635, 2637], [2672, 2673], [2689, 2690], [2748, 2748], [2753, 2757], [2759, 2760], [2765, 2765], [2786, 2787], [2817, 2817], [2876, 2876], [2879, 2879], [2881, 2883], [2893, 2893], [2902, 2902], [2946, 2946], [3008, 3008], [3021, 3021], [3134, 3136], [3142, 3144], [3146, 3149], [3157, 3158], [3260, 3260], [3263, 3263], [3270, 3270], [3276, 3277], [3298, 3299], [3393, 3395], [3405, 3405], [3530, 3530], [3538, 3540], [3542, 3542], [3633, 3633], [3636, 3642], [3655, 3662], [3761, 3761], [3764, 3769], [3771, 3772], [3784, 3789], [3864, 3865], [3893, 3893], [3895, 3895], [3897, 3897], [3953, 3966], [3968, 3972], [3974, 3975], [3984, 3991], [3993, 4028], [4038, 4038], [4141, 4144], [4146, 4146], [4150, 4151], [4153, 4153], [4184, 4185], [4448, 4607], [4959, 4959], [5906, 5908], [5938, 5940], [5970, 5971], [6002, 6003], [6068, 6069], [6071, 6077], [6086, 6086], [6089, 6099], [6109, 6109], [6155, 6157], [6313, 6313], [6432, 6434], [6439, 6440], [6450, 6450], [6457, 6459], [6679, 6680], [6912, 6915], [6964, 6964], [6966, 6970], [6972, 6972], [6978, 6978], [7019, 7027], [7616, 7626], [7678, 7679], [8203, 8207], [8234, 8238], [8288, 8291], [8298, 8303], [8400, 8431], [12330, 12335], [12441, 12442], [43014, 43014], [43019, 43019], [43045, 43046], [64286, 64286], [65024, 65039], [65056, 65059], [65279, 65279], [65529, 65531]], s2 = [[68097, 68099], [68101, 68102], [68108, 68111], [68152, 68154], [68159, 68159], [119143, 119145], [119155, 119170], [119173, 119179], [119210, 119213], [119362, 119364], [917505, 917505], [917536, 917631], [917760, 917999]];
        let r;
        t2.UnicodeV6 = class {
          constructor() {
            if (this.version = "6", !r) {
              r = new Uint8Array(65536), r.fill(1), r[0] = 0, r.fill(0, 1, 32), r.fill(0, 127, 160), r.fill(2, 4352, 4448), r[9001] = 2, r[9002] = 2, r.fill(2, 11904, 42192), r[12351] = 1, r.fill(2, 44032, 55204), r.fill(2, 63744, 64256), r.fill(2, 65040, 65050), r.fill(2, 65072, 65136), r.fill(2, 65280, 65377), r.fill(2, 65504, 65511);
              for (let e3 = 0; e3 < i2.length; ++e3) r.fill(0, i2[e3][0], i2[e3][1] + 1);
            }
          }
          wcwidth(e3) {
            return e3 < 32 ? 0 : e3 < 127 ? 1 : e3 < 65536 ? r[e3] : (function(e4, t3) {
              let i3, s3 = 0, r2 = t3.length - 1;
              if (e4 < t3[0][0] || e4 > t3[r2][1]) return false;
              for (; r2 >= s3; ) if (i3 = s3 + r2 >> 1, e4 > t3[i3][1]) s3 = i3 + 1;
              else {
                if (!(e4 < t3[i3][0])) return true;
                r2 = i3 - 1;
              }
              return false;
            })(e3, s2) ? 0 : e3 >= 131072 && e3 <= 196605 || e3 >= 196608 && e3 <= 262141 ? 2 : 1;
          }
        };
      }, 5981: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.WriteBuffer = void 0;
        const s2 = i2(8460), r = i2(844);
        class n extends r.Disposable {
          constructor(e3) {
            super(), this._action = e3, this._writeBuffer = [], this._callbacks = [], this._pendingData = 0, this._bufferOffset = 0, this._isSyncWriting = false, this._syncCalls = 0, this._didUserInput = false, this._onWriteParsed = this.register(new s2.EventEmitter()), this.onWriteParsed = this._onWriteParsed.event;
          }
          handleUserInput() {
            this._didUserInput = true;
          }
          writeSync(e3, t3) {
            if (void 0 !== t3 && this._syncCalls > t3) return void (this._syncCalls = 0);
            if (this._pendingData += e3.length, this._writeBuffer.push(e3), this._callbacks.push(void 0), this._syncCalls++, this._isSyncWriting) return;
            let i3;
            for (this._isSyncWriting = true; i3 = this._writeBuffer.shift(); ) {
              this._action(i3);
              const e4 = this._callbacks.shift();
              e4 && e4();
            }
            this._pendingData = 0, this._bufferOffset = 2147483647, this._isSyncWriting = false, this._syncCalls = 0;
          }
          write(e3, t3) {
            if (this._pendingData > 5e7) throw new Error("write data discarded, use flow control to avoid losing data");
            if (!this._writeBuffer.length) {
              if (this._bufferOffset = 0, this._didUserInput) return this._didUserInput = false, this._pendingData += e3.length, this._writeBuffer.push(e3), this._callbacks.push(t3), void this._innerWrite();
              setTimeout((() => this._innerWrite()));
            }
            this._pendingData += e3.length, this._writeBuffer.push(e3), this._callbacks.push(t3);
          }
          _innerWrite(e3 = 0, t3 = true) {
            const i3 = e3 || Date.now();
            for (; this._writeBuffer.length > this._bufferOffset; ) {
              const e4 = this._writeBuffer[this._bufferOffset], s3 = this._action(e4, t3);
              if (s3) {
                const e5 = (e6) => Date.now() - i3 >= 12 ? setTimeout((() => this._innerWrite(0, e6))) : this._innerWrite(i3, e6);
                return void s3.catch(((e6) => (queueMicrotask((() => {
                  throw e6;
                })), Promise.resolve(false)))).then(e5);
              }
              const r2 = this._callbacks[this._bufferOffset];
              if (r2 && r2(), this._bufferOffset++, this._pendingData -= e4.length, Date.now() - i3 >= 12) break;
            }
            this._writeBuffer.length > this._bufferOffset ? (this._bufferOffset > 50 && (this._writeBuffer = this._writeBuffer.slice(this._bufferOffset), this._callbacks = this._callbacks.slice(this._bufferOffset), this._bufferOffset = 0), setTimeout((() => this._innerWrite()))) : (this._writeBuffer.length = 0, this._callbacks.length = 0, this._pendingData = 0, this._bufferOffset = 0), this._onWriteParsed.fire();
          }
        }
        t2.WriteBuffer = n;
      }, 5941: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.toRgbString = t2.parseColor = void 0;
        const i2 = /^([\da-f])\/([\da-f])\/([\da-f])$|^([\da-f]{2})\/([\da-f]{2})\/([\da-f]{2})$|^([\da-f]{3})\/([\da-f]{3})\/([\da-f]{3})$|^([\da-f]{4})\/([\da-f]{4})\/([\da-f]{4})$/, s2 = /^[\da-f]+$/;
        function r(e3, t3) {
          const i3 = e3.toString(16), s3 = i3.length < 2 ? "0" + i3 : i3;
          switch (t3) {
            case 4:
              return i3[0];
            case 8:
              return s3;
            case 12:
              return (s3 + s3).slice(0, 3);
            default:
              return s3 + s3;
          }
        }
        t2.parseColor = function(e3) {
          if (!e3) return;
          let t3 = e3.toLowerCase();
          if (0 === t3.indexOf("rgb:")) {
            t3 = t3.slice(4);
            const e4 = i2.exec(t3);
            if (e4) {
              const t4 = e4[1] ? 15 : e4[4] ? 255 : e4[7] ? 4095 : 65535;
              return [Math.round(parseInt(e4[1] || e4[4] || e4[7] || e4[10], 16) / t4 * 255), Math.round(parseInt(e4[2] || e4[5] || e4[8] || e4[11], 16) / t4 * 255), Math.round(parseInt(e4[3] || e4[6] || e4[9] || e4[12], 16) / t4 * 255)];
            }
          } else if (0 === t3.indexOf("#") && (t3 = t3.slice(1), s2.exec(t3) && [3, 6, 9, 12].includes(t3.length))) {
            const e4 = t3.length / 3, i3 = [0, 0, 0];
            for (let s3 = 0; s3 < 3; ++s3) {
              const r2 = parseInt(t3.slice(e4 * s3, e4 * s3 + e4), 16);
              i3[s3] = 1 === e4 ? r2 << 4 : 2 === e4 ? r2 : 3 === e4 ? r2 >> 4 : r2 >> 8;
            }
            return i3;
          }
        }, t2.toRgbString = function(e3, t3 = 16) {
          const [i3, s3, n] = e3;
          return `rgb:${r(i3, t3)}/${r(s3, t3)}/${r(n, t3)}`;
        };
      }, 5770: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.PAYLOAD_LIMIT = void 0, t2.PAYLOAD_LIMIT = 1e7;
      }, 6351: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DcsHandler = t2.DcsParser = void 0;
        const s2 = i2(482), r = i2(8742), n = i2(5770), o = [];
        t2.DcsParser = class {
          constructor() {
            this._handlers = /* @__PURE__ */ Object.create(null), this._active = o, this._ident = 0, this._handlerFb = () => {
            }, this._stack = { paused: false, loopPosition: 0, fallThrough: false };
          }
          dispose() {
            this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
            }, this._active = o;
          }
          registerHandler(e3, t3) {
            void 0 === this._handlers[e3] && (this._handlers[e3] = []);
            const i3 = this._handlers[e3];
            return i3.push(t3), { dispose: () => {
              const e4 = i3.indexOf(t3);
              -1 !== e4 && i3.splice(e4, 1);
            } };
          }
          clearHandler(e3) {
            this._handlers[e3] && delete this._handlers[e3];
          }
          setHandlerFallback(e3) {
            this._handlerFb = e3;
          }
          reset() {
            if (this._active.length) for (let e3 = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; e3 >= 0; --e3) this._active[e3].unhook(false);
            this._stack.paused = false, this._active = o, this._ident = 0;
          }
          hook(e3, t3) {
            if (this.reset(), this._ident = e3, this._active = this._handlers[e3] || o, this._active.length) for (let e4 = this._active.length - 1; e4 >= 0; e4--) this._active[e4].hook(t3);
            else this._handlerFb(this._ident, "HOOK", t3);
          }
          put(e3, t3, i3) {
            if (this._active.length) for (let s3 = this._active.length - 1; s3 >= 0; s3--) this._active[s3].put(e3, t3, i3);
            else this._handlerFb(this._ident, "PUT", (0, s2.utf32ToString)(e3, t3, i3));
          }
          unhook(e3, t3 = true) {
            if (this._active.length) {
              let i3 = false, s3 = this._active.length - 1, r2 = false;
              if (this._stack.paused && (s3 = this._stack.loopPosition - 1, i3 = t3, r2 = this._stack.fallThrough, this._stack.paused = false), !r2 && false === i3) {
                for (; s3 >= 0 && (i3 = this._active[s3].unhook(e3), true !== i3); s3--) if (i3 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = s3, this._stack.fallThrough = false, i3;
                s3--;
              }
              for (; s3 >= 0; s3--) if (i3 = this._active[s3].unhook(false), i3 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = s3, this._stack.fallThrough = true, i3;
            } else this._handlerFb(this._ident, "UNHOOK", e3);
            this._active = o, this._ident = 0;
          }
        };
        const a = new r.Params();
        a.addParam(0), t2.DcsHandler = class {
          constructor(e3) {
            this._handler = e3, this._data = "", this._params = a, this._hitLimit = false;
          }
          hook(e3) {
            this._params = e3.length > 1 || e3.params[0] ? e3.clone() : a, this._data = "", this._hitLimit = false;
          }
          put(e3, t3, i3) {
            this._hitLimit || (this._data += (0, s2.utf32ToString)(e3, t3, i3), this._data.length > n.PAYLOAD_LIMIT && (this._data = "", this._hitLimit = true));
          }
          unhook(e3) {
            let t3 = false;
            if (this._hitLimit) t3 = false;
            else if (e3 && (t3 = this._handler(this._data, this._params), t3 instanceof Promise)) return t3.then(((e4) => (this._params = a, this._data = "", this._hitLimit = false, e4)));
            return this._params = a, this._data = "", this._hitLimit = false, t3;
          }
        };
      }, 2015: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.EscapeSequenceParser = t2.VT500_TRANSITION_TABLE = t2.TransitionTable = void 0;
        const s2 = i2(844), r = i2(8742), n = i2(6242), o = i2(6351);
        class a {
          constructor(e3) {
            this.table = new Uint8Array(e3);
          }
          setDefault(e3, t3) {
            this.table.fill(e3 << 4 | t3);
          }
          add(e3, t3, i3, s3) {
            this.table[t3 << 8 | e3] = i3 << 4 | s3;
          }
          addMany(e3, t3, i3, s3) {
            for (let r2 = 0; r2 < e3.length; r2++) this.table[t3 << 8 | e3[r2]] = i3 << 4 | s3;
          }
        }
        t2.TransitionTable = a;
        const h2 = 160;
        t2.VT500_TRANSITION_TABLE = (function() {
          const e3 = new a(4095), t3 = Array.apply(null, Array(256)).map(((e4, t4) => t4)), i3 = (e4, i4) => t3.slice(e4, i4), s3 = i3(32, 127), r2 = i3(0, 24);
          r2.push(25), r2.push.apply(r2, i3(28, 32));
          const n2 = i3(0, 14);
          let o2;
          for (o2 in e3.setDefault(1, 0), e3.addMany(s3, 0, 2, 0), n2) e3.addMany([24, 26, 153, 154], o2, 3, 0), e3.addMany(i3(128, 144), o2, 3, 0), e3.addMany(i3(144, 152), o2, 3, 0), e3.add(156, o2, 0, 0), e3.add(27, o2, 11, 1), e3.add(157, o2, 4, 8), e3.addMany([152, 158, 159], o2, 0, 7), e3.add(155, o2, 11, 3), e3.add(144, o2, 11, 9);
          return e3.addMany(r2, 0, 3, 0), e3.addMany(r2, 1, 3, 1), e3.add(127, 1, 0, 1), e3.addMany(r2, 8, 0, 8), e3.addMany(r2, 3, 3, 3), e3.add(127, 3, 0, 3), e3.addMany(r2, 4, 3, 4), e3.add(127, 4, 0, 4), e3.addMany(r2, 6, 3, 6), e3.addMany(r2, 5, 3, 5), e3.add(127, 5, 0, 5), e3.addMany(r2, 2, 3, 2), e3.add(127, 2, 0, 2), e3.add(93, 1, 4, 8), e3.addMany(s3, 8, 5, 8), e3.add(127, 8, 5, 8), e3.addMany([156, 27, 24, 26, 7], 8, 6, 0), e3.addMany(i3(28, 32), 8, 0, 8), e3.addMany([88, 94, 95], 1, 0, 7), e3.addMany(s3, 7, 0, 7), e3.addMany(r2, 7, 0, 7), e3.add(156, 7, 0, 0), e3.add(127, 7, 0, 7), e3.add(91, 1, 11, 3), e3.addMany(i3(64, 127), 3, 7, 0), e3.addMany(i3(48, 60), 3, 8, 4), e3.addMany([60, 61, 62, 63], 3, 9, 4), e3.addMany(i3(48, 60), 4, 8, 4), e3.addMany(i3(64, 127), 4, 7, 0), e3.addMany([60, 61, 62, 63], 4, 0, 6), e3.addMany(i3(32, 64), 6, 0, 6), e3.add(127, 6, 0, 6), e3.addMany(i3(64, 127), 6, 0, 0), e3.addMany(i3(32, 48), 3, 9, 5), e3.addMany(i3(32, 48), 5, 9, 5), e3.addMany(i3(48, 64), 5, 0, 6), e3.addMany(i3(64, 127), 5, 7, 0), e3.addMany(i3(32, 48), 4, 9, 5), e3.addMany(i3(32, 48), 1, 9, 2), e3.addMany(i3(32, 48), 2, 9, 2), e3.addMany(i3(48, 127), 2, 10, 0), e3.addMany(i3(48, 80), 1, 10, 0), e3.addMany(i3(81, 88), 1, 10, 0), e3.addMany([89, 90, 92], 1, 10, 0), e3.addMany(i3(96, 127), 1, 10, 0), e3.add(80, 1, 11, 9), e3.addMany(r2, 9, 0, 9), e3.add(127, 9, 0, 9), e3.addMany(i3(28, 32), 9, 0, 9), e3.addMany(i3(32, 48), 9, 9, 12), e3.addMany(i3(48, 60), 9, 8, 10), e3.addMany([60, 61, 62, 63], 9, 9, 10), e3.addMany(r2, 11, 0, 11), e3.addMany(i3(32, 128), 11, 0, 11), e3.addMany(i3(28, 32), 11, 0, 11), e3.addMany(r2, 10, 0, 10), e3.add(127, 10, 0, 10), e3.addMany(i3(28, 32), 10, 0, 10), e3.addMany(i3(48, 60), 10, 8, 10), e3.addMany([60, 61, 62, 63], 10, 0, 11), e3.addMany(i3(32, 48), 10, 9, 12), e3.addMany(r2, 12, 0, 12), e3.add(127, 12, 0, 12), e3.addMany(i3(28, 32), 12, 0, 12), e3.addMany(i3(32, 48), 12, 9, 12), e3.addMany(i3(48, 64), 12, 0, 11), e3.addMany(i3(64, 127), 12, 12, 13), e3.addMany(i3(64, 127), 10, 12, 13), e3.addMany(i3(64, 127), 9, 12, 13), e3.addMany(r2, 13, 13, 13), e3.addMany(s3, 13, 13, 13), e3.add(127, 13, 0, 13), e3.addMany([27, 156, 24, 26], 13, 14, 0), e3.add(h2, 0, 2, 0), e3.add(h2, 8, 5, 8), e3.add(h2, 6, 0, 6), e3.add(h2, 11, 0, 11), e3.add(h2, 13, 13, 13), e3;
        })();
        class c extends s2.Disposable {
          constructor(e3 = t2.VT500_TRANSITION_TABLE) {
            super(), this._transitions = e3, this._parseStack = { state: 0, handlers: [], handlerPos: 0, transition: 0, chunkPos: 0 }, this.initialState = 0, this.currentState = this.initialState, this._params = new r.Params(), this._params.addParam(0), this._collect = 0, this.precedingCodepoint = 0, this._printHandlerFb = (e4, t3, i3) => {
            }, this._executeHandlerFb = (e4) => {
            }, this._csiHandlerFb = (e4, t3) => {
            }, this._escHandlerFb = (e4) => {
            }, this._errorHandlerFb = (e4) => e4, this._printHandler = this._printHandlerFb, this._executeHandlers = /* @__PURE__ */ Object.create(null), this._csiHandlers = /* @__PURE__ */ Object.create(null), this._escHandlers = /* @__PURE__ */ Object.create(null), this.register((0, s2.toDisposable)((() => {
              this._csiHandlers = /* @__PURE__ */ Object.create(null), this._executeHandlers = /* @__PURE__ */ Object.create(null), this._escHandlers = /* @__PURE__ */ Object.create(null);
            }))), this._oscParser = this.register(new n.OscParser()), this._dcsParser = this.register(new o.DcsParser()), this._errorHandler = this._errorHandlerFb, this.registerEscHandler({ final: "\\" }, (() => true));
          }
          _identifier(e3, t3 = [64, 126]) {
            let i3 = 0;
            if (e3.prefix) {
              if (e3.prefix.length > 1) throw new Error("only one byte as prefix supported");
              if (i3 = e3.prefix.charCodeAt(0), i3 && 60 > i3 || i3 > 63) throw new Error("prefix must be in range 0x3c .. 0x3f");
            }
            if (e3.intermediates) {
              if (e3.intermediates.length > 2) throw new Error("only two bytes as intermediates are supported");
              for (let t4 = 0; t4 < e3.intermediates.length; ++t4) {
                const s4 = e3.intermediates.charCodeAt(t4);
                if (32 > s4 || s4 > 47) throw new Error("intermediate must be in range 0x20 .. 0x2f");
                i3 <<= 8, i3 |= s4;
              }
            }
            if (1 !== e3.final.length) throw new Error("final must be a single byte");
            const s3 = e3.final.charCodeAt(0);
            if (t3[0] > s3 || s3 > t3[1]) throw new Error(`final must be in range ${t3[0]} .. ${t3[1]}`);
            return i3 <<= 8, i3 |= s3, i3;
          }
          identToString(e3) {
            const t3 = [];
            for (; e3; ) t3.push(String.fromCharCode(255 & e3)), e3 >>= 8;
            return t3.reverse().join("");
          }
          setPrintHandler(e3) {
            this._printHandler = e3;
          }
          clearPrintHandler() {
            this._printHandler = this._printHandlerFb;
          }
          registerEscHandler(e3, t3) {
            const i3 = this._identifier(e3, [48, 126]);
            void 0 === this._escHandlers[i3] && (this._escHandlers[i3] = []);
            const s3 = this._escHandlers[i3];
            return s3.push(t3), { dispose: () => {
              const e4 = s3.indexOf(t3);
              -1 !== e4 && s3.splice(e4, 1);
            } };
          }
          clearEscHandler(e3) {
            this._escHandlers[this._identifier(e3, [48, 126])] && delete this._escHandlers[this._identifier(e3, [48, 126])];
          }
          setEscHandlerFallback(e3) {
            this._escHandlerFb = e3;
          }
          setExecuteHandler(e3, t3) {
            this._executeHandlers[e3.charCodeAt(0)] = t3;
          }
          clearExecuteHandler(e3) {
            this._executeHandlers[e3.charCodeAt(0)] && delete this._executeHandlers[e3.charCodeAt(0)];
          }
          setExecuteHandlerFallback(e3) {
            this._executeHandlerFb = e3;
          }
          registerCsiHandler(e3, t3) {
            const i3 = this._identifier(e3);
            void 0 === this._csiHandlers[i3] && (this._csiHandlers[i3] = []);
            const s3 = this._csiHandlers[i3];
            return s3.push(t3), { dispose: () => {
              const e4 = s3.indexOf(t3);
              -1 !== e4 && s3.splice(e4, 1);
            } };
          }
          clearCsiHandler(e3) {
            this._csiHandlers[this._identifier(e3)] && delete this._csiHandlers[this._identifier(e3)];
          }
          setCsiHandlerFallback(e3) {
            this._csiHandlerFb = e3;
          }
          registerDcsHandler(e3, t3) {
            return this._dcsParser.registerHandler(this._identifier(e3), t3);
          }
          clearDcsHandler(e3) {
            this._dcsParser.clearHandler(this._identifier(e3));
          }
          setDcsHandlerFallback(e3) {
            this._dcsParser.setHandlerFallback(e3);
          }
          registerOscHandler(e3, t3) {
            return this._oscParser.registerHandler(e3, t3);
          }
          clearOscHandler(e3) {
            this._oscParser.clearHandler(e3);
          }
          setOscHandlerFallback(e3) {
            this._oscParser.setHandlerFallback(e3);
          }
          setErrorHandler(e3) {
            this._errorHandler = e3;
          }
          clearErrorHandler() {
            this._errorHandler = this._errorHandlerFb;
          }
          reset() {
            this.currentState = this.initialState, this._oscParser.reset(), this._dcsParser.reset(), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingCodepoint = 0, 0 !== this._parseStack.state && (this._parseStack.state = 2, this._parseStack.handlers = []);
          }
          _preserveStack(e3, t3, i3, s3, r2) {
            this._parseStack.state = e3, this._parseStack.handlers = t3, this._parseStack.handlerPos = i3, this._parseStack.transition = s3, this._parseStack.chunkPos = r2;
          }
          parse(e3, t3, i3) {
            let s3, r2 = 0, n2 = 0, o2 = 0;
            if (this._parseStack.state) if (2 === this._parseStack.state) this._parseStack.state = 0, o2 = this._parseStack.chunkPos + 1;
            else {
              if (void 0 === i3 || 1 === this._parseStack.state) throw this._parseStack.state = 1, new Error("improper continuation due to previous async handler, giving up parsing");
              const t4 = this._parseStack.handlers;
              let n3 = this._parseStack.handlerPos - 1;
              switch (this._parseStack.state) {
                case 3:
                  if (false === i3 && n3 > -1) {
                    for (; n3 >= 0 && (s3 = t4[n3](this._params), true !== s3); n3--) if (s3 instanceof Promise) return this._parseStack.handlerPos = n3, s3;
                  }
                  this._parseStack.handlers = [];
                  break;
                case 4:
                  if (false === i3 && n3 > -1) {
                    for (; n3 >= 0 && (s3 = t4[n3](), true !== s3); n3--) if (s3 instanceof Promise) return this._parseStack.handlerPos = n3, s3;
                  }
                  this._parseStack.handlers = [];
                  break;
                case 6:
                  if (r2 = e3[this._parseStack.chunkPos], s3 = this._dcsParser.unhook(24 !== r2 && 26 !== r2, i3), s3) return s3;
                  27 === r2 && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
                  break;
                case 5:
                  if (r2 = e3[this._parseStack.chunkPos], s3 = this._oscParser.end(24 !== r2 && 26 !== r2, i3), s3) return s3;
                  27 === r2 && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
              }
              this._parseStack.state = 0, o2 = this._parseStack.chunkPos + 1, this.precedingCodepoint = 0, this.currentState = 15 & this._parseStack.transition;
            }
            for (let i4 = o2; i4 < t3; ++i4) {
              switch (r2 = e3[i4], n2 = this._transitions.table[this.currentState << 8 | (r2 < 160 ? r2 : h2)], n2 >> 4) {
                case 2:
                  for (let s4 = i4 + 1; ; ++s4) {
                    if (s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 126 && r2 < h2) {
                      this._printHandler(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                    if (++s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 126 && r2 < h2) {
                      this._printHandler(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                    if (++s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 126 && r2 < h2) {
                      this._printHandler(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                    if (++s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 126 && r2 < h2) {
                      this._printHandler(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                  }
                  break;
                case 3:
                  this._executeHandlers[r2] ? this._executeHandlers[r2]() : this._executeHandlerFb(r2), this.precedingCodepoint = 0;
                  break;
                case 0:
                  break;
                case 1:
                  if (this._errorHandler({ position: i4, code: r2, currentState: this.currentState, collect: this._collect, params: this._params, abort: false }).abort) return;
                  break;
                case 7:
                  const o3 = this._csiHandlers[this._collect << 8 | r2];
                  let a2 = o3 ? o3.length - 1 : -1;
                  for (; a2 >= 0 && (s3 = o3[a2](this._params), true !== s3); a2--) if (s3 instanceof Promise) return this._preserveStack(3, o3, a2, n2, i4), s3;
                  a2 < 0 && this._csiHandlerFb(this._collect << 8 | r2, this._params), this.precedingCodepoint = 0;
                  break;
                case 8:
                  do {
                    switch (r2) {
                      case 59:
                        this._params.addParam(0);
                        break;
                      case 58:
                        this._params.addSubParam(-1);
                        break;
                      default:
                        this._params.addDigit(r2 - 48);
                    }
                  } while (++i4 < t3 && (r2 = e3[i4]) > 47 && r2 < 60);
                  i4--;
                  break;
                case 9:
                  this._collect <<= 8, this._collect |= r2;
                  break;
                case 10:
                  const c2 = this._escHandlers[this._collect << 8 | r2];
                  let l = c2 ? c2.length - 1 : -1;
                  for (; l >= 0 && (s3 = c2[l](), true !== s3); l--) if (s3 instanceof Promise) return this._preserveStack(4, c2, l, n2, i4), s3;
                  l < 0 && this._escHandlerFb(this._collect << 8 | r2), this.precedingCodepoint = 0;
                  break;
                case 11:
                  this._params.reset(), this._params.addParam(0), this._collect = 0;
                  break;
                case 12:
                  this._dcsParser.hook(this._collect << 8 | r2, this._params);
                  break;
                case 13:
                  for (let s4 = i4 + 1; ; ++s4) if (s4 >= t3 || 24 === (r2 = e3[s4]) || 26 === r2 || 27 === r2 || r2 > 127 && r2 < h2) {
                    this._dcsParser.put(e3, i4, s4), i4 = s4 - 1;
                    break;
                  }
                  break;
                case 14:
                  if (s3 = this._dcsParser.unhook(24 !== r2 && 26 !== r2), s3) return this._preserveStack(6, [], 0, n2, i4), s3;
                  27 === r2 && (n2 |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingCodepoint = 0;
                  break;
                case 4:
                  this._oscParser.start();
                  break;
                case 5:
                  for (let s4 = i4 + 1; ; s4++) if (s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 127 && r2 < h2) {
                    this._oscParser.put(e3, i4, s4), i4 = s4 - 1;
                    break;
                  }
                  break;
                case 6:
                  if (s3 = this._oscParser.end(24 !== r2 && 26 !== r2), s3) return this._preserveStack(5, [], 0, n2, i4), s3;
                  27 === r2 && (n2 |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingCodepoint = 0;
              }
              this.currentState = 15 & n2;
            }
          }
        }
        t2.EscapeSequenceParser = c;
      }, 6242: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OscHandler = t2.OscParser = void 0;
        const s2 = i2(5770), r = i2(482), n = [];
        t2.OscParser = class {
          constructor() {
            this._state = 0, this._active = n, this._id = -1, this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
            }, this._stack = { paused: false, loopPosition: 0, fallThrough: false };
          }
          registerHandler(e3, t3) {
            void 0 === this._handlers[e3] && (this._handlers[e3] = []);
            const i3 = this._handlers[e3];
            return i3.push(t3), { dispose: () => {
              const e4 = i3.indexOf(t3);
              -1 !== e4 && i3.splice(e4, 1);
            } };
          }
          clearHandler(e3) {
            this._handlers[e3] && delete this._handlers[e3];
          }
          setHandlerFallback(e3) {
            this._handlerFb = e3;
          }
          dispose() {
            this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
            }, this._active = n;
          }
          reset() {
            if (2 === this._state) for (let e3 = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; e3 >= 0; --e3) this._active[e3].end(false);
            this._stack.paused = false, this._active = n, this._id = -1, this._state = 0;
          }
          _start() {
            if (this._active = this._handlers[this._id] || n, this._active.length) for (let e3 = this._active.length - 1; e3 >= 0; e3--) this._active[e3].start();
            else this._handlerFb(this._id, "START");
          }
          _put(e3, t3, i3) {
            if (this._active.length) for (let s3 = this._active.length - 1; s3 >= 0; s3--) this._active[s3].put(e3, t3, i3);
            else this._handlerFb(this._id, "PUT", (0, r.utf32ToString)(e3, t3, i3));
          }
          start() {
            this.reset(), this._state = 1;
          }
          put(e3, t3, i3) {
            if (3 !== this._state) {
              if (1 === this._state) for (; t3 < i3; ) {
                const i4 = e3[t3++];
                if (59 === i4) {
                  this._state = 2, this._start();
                  break;
                }
                if (i4 < 48 || 57 < i4) return void (this._state = 3);
                -1 === this._id && (this._id = 0), this._id = 10 * this._id + i4 - 48;
              }
              2 === this._state && i3 - t3 > 0 && this._put(e3, t3, i3);
            }
          }
          end(e3, t3 = true) {
            if (0 !== this._state) {
              if (3 !== this._state) if (1 === this._state && this._start(), this._active.length) {
                let i3 = false, s3 = this._active.length - 1, r2 = false;
                if (this._stack.paused && (s3 = this._stack.loopPosition - 1, i3 = t3, r2 = this._stack.fallThrough, this._stack.paused = false), !r2 && false === i3) {
                  for (; s3 >= 0 && (i3 = this._active[s3].end(e3), true !== i3); s3--) if (i3 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = s3, this._stack.fallThrough = false, i3;
                  s3--;
                }
                for (; s3 >= 0; s3--) if (i3 = this._active[s3].end(false), i3 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = s3, this._stack.fallThrough = true, i3;
              } else this._handlerFb(this._id, "END", e3);
              this._active = n, this._id = -1, this._state = 0;
            }
          }
        }, t2.OscHandler = class {
          constructor(e3) {
            this._handler = e3, this._data = "", this._hitLimit = false;
          }
          start() {
            this._data = "", this._hitLimit = false;
          }
          put(e3, t3, i3) {
            this._hitLimit || (this._data += (0, r.utf32ToString)(e3, t3, i3), this._data.length > s2.PAYLOAD_LIMIT && (this._data = "", this._hitLimit = true));
          }
          end(e3) {
            let t3 = false;
            if (this._hitLimit) t3 = false;
            else if (e3 && (t3 = this._handler(this._data), t3 instanceof Promise)) return t3.then(((e4) => (this._data = "", this._hitLimit = false, e4)));
            return this._data = "", this._hitLimit = false, t3;
          }
        };
      }, 8742: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Params = void 0;
        const i2 = 2147483647;
        class s2 {
          static fromArray(e3) {
            const t3 = new s2();
            if (!e3.length) return t3;
            for (let i3 = Array.isArray(e3[0]) ? 1 : 0; i3 < e3.length; ++i3) {
              const s3 = e3[i3];
              if (Array.isArray(s3)) for (let e4 = 0; e4 < s3.length; ++e4) t3.addSubParam(s3[e4]);
              else t3.addParam(s3);
            }
            return t3;
          }
          constructor(e3 = 32, t3 = 32) {
            if (this.maxLength = e3, this.maxSubParamsLength = t3, t3 > 256) throw new Error("maxSubParamsLength must not be greater than 256");
            this.params = new Int32Array(e3), this.length = 0, this._subParams = new Int32Array(t3), this._subParamsLength = 0, this._subParamsIdx = new Uint16Array(e3), this._rejectDigits = false, this._rejectSubDigits = false, this._digitIsSub = false;
          }
          clone() {
            const e3 = new s2(this.maxLength, this.maxSubParamsLength);
            return e3.params.set(this.params), e3.length = this.length, e3._subParams.set(this._subParams), e3._subParamsLength = this._subParamsLength, e3._subParamsIdx.set(this._subParamsIdx), e3._rejectDigits = this._rejectDigits, e3._rejectSubDigits = this._rejectSubDigits, e3._digitIsSub = this._digitIsSub, e3;
          }
          toArray() {
            const e3 = [];
            for (let t3 = 0; t3 < this.length; ++t3) {
              e3.push(this.params[t3]);
              const i3 = this._subParamsIdx[t3] >> 8, s3 = 255 & this._subParamsIdx[t3];
              s3 - i3 > 0 && e3.push(Array.prototype.slice.call(this._subParams, i3, s3));
            }
            return e3;
          }
          reset() {
            this.length = 0, this._subParamsLength = 0, this._rejectDigits = false, this._rejectSubDigits = false, this._digitIsSub = false;
          }
          addParam(e3) {
            if (this._digitIsSub = false, this.length >= this.maxLength) this._rejectDigits = true;
            else {
              if (e3 < -1) throw new Error("values lesser than -1 are not allowed");
              this._subParamsIdx[this.length] = this._subParamsLength << 8 | this._subParamsLength, this.params[this.length++] = e3 > i2 ? i2 : e3;
            }
          }
          addSubParam(e3) {
            if (this._digitIsSub = true, this.length) if (this._rejectDigits || this._subParamsLength >= this.maxSubParamsLength) this._rejectSubDigits = true;
            else {
              if (e3 < -1) throw new Error("values lesser than -1 are not allowed");
              this._subParams[this._subParamsLength++] = e3 > i2 ? i2 : e3, this._subParamsIdx[this.length - 1]++;
            }
          }
          hasSubParams(e3) {
            return (255 & this._subParamsIdx[e3]) - (this._subParamsIdx[e3] >> 8) > 0;
          }
          getSubParams(e3) {
            const t3 = this._subParamsIdx[e3] >> 8, i3 = 255 & this._subParamsIdx[e3];
            return i3 - t3 > 0 ? this._subParams.subarray(t3, i3) : null;
          }
          getSubParamsAll() {
            const e3 = {};
            for (let t3 = 0; t3 < this.length; ++t3) {
              const i3 = this._subParamsIdx[t3] >> 8, s3 = 255 & this._subParamsIdx[t3];
              s3 - i3 > 0 && (e3[t3] = this._subParams.slice(i3, s3));
            }
            return e3;
          }
          addDigit(e3) {
            let t3;
            if (this._rejectDigits || !(t3 = this._digitIsSub ? this._subParamsLength : this.length) || this._digitIsSub && this._rejectSubDigits) return;
            const s3 = this._digitIsSub ? this._subParams : this.params, r = s3[t3 - 1];
            s3[t3 - 1] = ~r ? Math.min(10 * r + e3, i2) : e3;
          }
        }
        t2.Params = s2;
      }, 5741: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.AddonManager = void 0, t2.AddonManager = class {
          constructor() {
            this._addons = [];
          }
          dispose() {
            for (let e3 = this._addons.length - 1; e3 >= 0; e3--) this._addons[e3].instance.dispose();
          }
          loadAddon(e3, t3) {
            const i2 = { instance: t3, dispose: t3.dispose, isDisposed: false };
            this._addons.push(i2), t3.dispose = () => this._wrappedAddonDispose(i2), t3.activate(e3);
          }
          _wrappedAddonDispose(e3) {
            if (e3.isDisposed) return;
            let t3 = -1;
            for (let i2 = 0; i2 < this._addons.length; i2++) if (this._addons[i2] === e3) {
              t3 = i2;
              break;
            }
            if (-1 === t3) throw new Error("Could not dispose an addon that has not been loaded");
            e3.isDisposed = true, e3.dispose.apply(e3.instance), this._addons.splice(t3, 1);
          }
        };
      }, 8771: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferApiView = void 0;
        const s2 = i2(3785), r = i2(511);
        t2.BufferApiView = class {
          constructor(e3, t3) {
            this._buffer = e3, this.type = t3;
          }
          init(e3) {
            return this._buffer = e3, this;
          }
          get cursorY() {
            return this._buffer.y;
          }
          get cursorX() {
            return this._buffer.x;
          }
          get viewportY() {
            return this._buffer.ydisp;
          }
          get baseY() {
            return this._buffer.ybase;
          }
          get length() {
            return this._buffer.lines.length;
          }
          getLine(e3) {
            const t3 = this._buffer.lines.get(e3);
            if (t3) return new s2.BufferLineApiView(t3);
          }
          getNullCell() {
            return new r.CellData();
          }
        };
      }, 3785: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferLineApiView = void 0;
        const s2 = i2(511);
        t2.BufferLineApiView = class {
          constructor(e3) {
            this._line = e3;
          }
          get isWrapped() {
            return this._line.isWrapped;
          }
          get length() {
            return this._line.length;
          }
          getCell(e3, t3) {
            if (!(e3 < 0 || e3 >= this._line.length)) return t3 ? (this._line.loadCell(e3, t3), t3) : this._line.loadCell(e3, new s2.CellData());
          }
          translateToString(e3, t3, i3) {
            return this._line.translateToString(e3, t3, i3);
          }
        };
      }, 8285: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferNamespaceApi = void 0;
        const s2 = i2(8771), r = i2(8460), n = i2(844);
        class o extends n.Disposable {
          constructor(e3) {
            super(), this._core = e3, this._onBufferChange = this.register(new r.EventEmitter()), this.onBufferChange = this._onBufferChange.event, this._normal = new s2.BufferApiView(this._core.buffers.normal, "normal"), this._alternate = new s2.BufferApiView(this._core.buffers.alt, "alternate"), this._core.buffers.onBufferActivate((() => this._onBufferChange.fire(this.active)));
          }
          get active() {
            if (this._core.buffers.active === this._core.buffers.normal) return this.normal;
            if (this._core.buffers.active === this._core.buffers.alt) return this.alternate;
            throw new Error("Active buffer is neither normal nor alternate");
          }
          get normal() {
            return this._normal.init(this._core.buffers.normal);
          }
          get alternate() {
            return this._alternate.init(this._core.buffers.alt);
          }
        }
        t2.BufferNamespaceApi = o;
      }, 7975: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ParserApi = void 0, t2.ParserApi = class {
          constructor(e3) {
            this._core = e3;
          }
          registerCsiHandler(e3, t3) {
            return this._core.registerCsiHandler(e3, ((e4) => t3(e4.toArray())));
          }
          addCsiHandler(e3, t3) {
            return this.registerCsiHandler(e3, t3);
          }
          registerDcsHandler(e3, t3) {
            return this._core.registerDcsHandler(e3, ((e4, i2) => t3(e4, i2.toArray())));
          }
          addDcsHandler(e3, t3) {
            return this.registerDcsHandler(e3, t3);
          }
          registerEscHandler(e3, t3) {
            return this._core.registerEscHandler(e3, t3);
          }
          addEscHandler(e3, t3) {
            return this.registerEscHandler(e3, t3);
          }
          registerOscHandler(e3, t3) {
            return this._core.registerOscHandler(e3, t3);
          }
          addOscHandler(e3, t3) {
            return this.registerOscHandler(e3, t3);
          }
        };
      }, 7090: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.UnicodeApi = void 0, t2.UnicodeApi = class {
          constructor(e3) {
            this._core = e3;
          }
          register(e3) {
            this._core.unicodeService.register(e3);
          }
          get versions() {
            return this._core.unicodeService.versions;
          }
          get activeVersion() {
            return this._core.unicodeService.activeVersion;
          }
          set activeVersion(e3) {
            this._core.unicodeService.activeVersion = e3;
          }
        };
      }, 744: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferService = t2.MINIMUM_ROWS = t2.MINIMUM_COLS = void 0;
        const n = i2(8460), o = i2(844), a = i2(5295), h2 = i2(2585);
        t2.MINIMUM_COLS = 2, t2.MINIMUM_ROWS = 1;
        let c = t2.BufferService = class extends o.Disposable {
          get buffer() {
            return this.buffers.active;
          }
          constructor(e3) {
            super(), this.isUserScrolling = false, this._onResize = this.register(new n.EventEmitter()), this.onResize = this._onResize.event, this._onScroll = this.register(new n.EventEmitter()), this.onScroll = this._onScroll.event, this.cols = Math.max(e3.rawOptions.cols || 0, t2.MINIMUM_COLS), this.rows = Math.max(e3.rawOptions.rows || 0, t2.MINIMUM_ROWS), this.buffers = this.register(new a.BufferSet(e3, this));
          }
          resize(e3, t3) {
            this.cols = e3, this.rows = t3, this.buffers.resize(e3, t3), this._onResize.fire({ cols: e3, rows: t3 });
          }
          reset() {
            this.buffers.reset(), this.isUserScrolling = false;
          }
          scroll(e3, t3 = false) {
            const i3 = this.buffer;
            let s3;
            s3 = this._cachedBlankLine, s3 && s3.length === this.cols && s3.getFg(0) === e3.fg && s3.getBg(0) === e3.bg || (s3 = i3.getBlankLine(e3, t3), this._cachedBlankLine = s3), s3.isWrapped = t3;
            const r2 = i3.ybase + i3.scrollTop, n2 = i3.ybase + i3.scrollBottom;
            if (0 === i3.scrollTop) {
              const e4 = i3.lines.isFull;
              n2 === i3.lines.length - 1 ? e4 ? i3.lines.recycle().copyFrom(s3) : i3.lines.push(s3.clone()) : i3.lines.splice(n2 + 1, 0, s3.clone()), e4 ? this.isUserScrolling && (i3.ydisp = Math.max(i3.ydisp - 1, 0)) : (i3.ybase++, this.isUserScrolling || i3.ydisp++);
            } else {
              const e4 = n2 - r2 + 1;
              i3.lines.shiftElements(r2 + 1, e4 - 1, -1), i3.lines.set(n2, s3.clone());
            }
            this.isUserScrolling || (i3.ydisp = i3.ybase), this._onScroll.fire(i3.ydisp);
          }
          scrollLines(e3, t3, i3) {
            const s3 = this.buffer;
            if (e3 < 0) {
              if (0 === s3.ydisp) return;
              this.isUserScrolling = true;
            } else e3 + s3.ydisp >= s3.ybase && (this.isUserScrolling = false);
            const r2 = s3.ydisp;
            s3.ydisp = Math.max(Math.min(s3.ydisp + e3, s3.ybase), 0), r2 !== s3.ydisp && (t3 || this._onScroll.fire(s3.ydisp));
          }
        };
        t2.BufferService = c = s2([r(0, h2.IOptionsService)], c);
      }, 7994: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CharsetService = void 0, t2.CharsetService = class {
          constructor() {
            this.glevel = 0, this._charsets = [];
          }
          reset() {
            this.charset = void 0, this._charsets = [], this.glevel = 0;
          }
          setgLevel(e3) {
            this.glevel = e3, this.charset = this._charsets[e3];
          }
          setgCharset(e3, t3) {
            this._charsets[e3] = t3, this.glevel === e3 && (this.charset = t3);
          }
        };
      }, 1753: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CoreMouseService = void 0;
        const n = i2(2585), o = i2(8460), a = i2(844), h2 = { NONE: { events: 0, restrict: () => false }, X10: { events: 1, restrict: (e3) => 4 !== e3.button && 1 === e3.action && (e3.ctrl = false, e3.alt = false, e3.shift = false, true) }, VT200: { events: 19, restrict: (e3) => 32 !== e3.action }, DRAG: { events: 23, restrict: (e3) => 32 !== e3.action || 3 !== e3.button }, ANY: { events: 31, restrict: (e3) => true } };
        function c(e3, t3) {
          let i3 = (e3.ctrl ? 16 : 0) | (e3.shift ? 4 : 0) | (e3.alt ? 8 : 0);
          return 4 === e3.button ? (i3 |= 64, i3 |= e3.action) : (i3 |= 3 & e3.button, 4 & e3.button && (i3 |= 64), 8 & e3.button && (i3 |= 128), 32 === e3.action ? i3 |= 32 : 0 !== e3.action || t3 || (i3 |= 3)), i3;
        }
        const l = String.fromCharCode, d = { DEFAULT: (e3) => {
          const t3 = [c(e3, false) + 32, e3.col + 32, e3.row + 32];
          return t3[0] > 255 || t3[1] > 255 || t3[2] > 255 ? "" : `\x1B[M${l(t3[0])}${l(t3[1])}${l(t3[2])}`;
        }, SGR: (e3) => {
          const t3 = 0 === e3.action && 4 !== e3.button ? "m" : "M";
          return `\x1B[<${c(e3, true)};${e3.col};${e3.row}${t3}`;
        }, SGR_PIXELS: (e3) => {
          const t3 = 0 === e3.action && 4 !== e3.button ? "m" : "M";
          return `\x1B[<${c(e3, true)};${e3.x};${e3.y}${t3}`;
        } };
        let _ = t2.CoreMouseService = class extends a.Disposable {
          constructor(e3, t3) {
            super(), this._bufferService = e3, this._coreService = t3, this._protocols = {}, this._encodings = {}, this._activeProtocol = "", this._activeEncoding = "", this._lastEvent = null, this._onProtocolChange = this.register(new o.EventEmitter()), this.onProtocolChange = this._onProtocolChange.event;
            for (const e4 of Object.keys(h2)) this.addProtocol(e4, h2[e4]);
            for (const e4 of Object.keys(d)) this.addEncoding(e4, d[e4]);
            this.reset();
          }
          addProtocol(e3, t3) {
            this._protocols[e3] = t3;
          }
          addEncoding(e3, t3) {
            this._encodings[e3] = t3;
          }
          get activeProtocol() {
            return this._activeProtocol;
          }
          get areMouseEventsActive() {
            return 0 !== this._protocols[this._activeProtocol].events;
          }
          set activeProtocol(e3) {
            if (!this._protocols[e3]) throw new Error(`unknown protocol "${e3}"`);
            this._activeProtocol = e3, this._onProtocolChange.fire(this._protocols[e3].events);
          }
          get activeEncoding() {
            return this._activeEncoding;
          }
          set activeEncoding(e3) {
            if (!this._encodings[e3]) throw new Error(`unknown encoding "${e3}"`);
            this._activeEncoding = e3;
          }
          reset() {
            this.activeProtocol = "NONE", this.activeEncoding = "DEFAULT", this._lastEvent = null;
          }
          triggerMouseEvent(e3) {
            if (e3.col < 0 || e3.col >= this._bufferService.cols || e3.row < 0 || e3.row >= this._bufferService.rows) return false;
            if (4 === e3.button && 32 === e3.action) return false;
            if (3 === e3.button && 32 !== e3.action) return false;
            if (4 !== e3.button && (2 === e3.action || 3 === e3.action)) return false;
            if (e3.col++, e3.row++, 32 === e3.action && this._lastEvent && this._equalEvents(this._lastEvent, e3, "SGR_PIXELS" === this._activeEncoding)) return false;
            if (!this._protocols[this._activeProtocol].restrict(e3)) return false;
            const t3 = this._encodings[this._activeEncoding](e3);
            return t3 && ("DEFAULT" === this._activeEncoding ? this._coreService.triggerBinaryEvent(t3) : this._coreService.triggerDataEvent(t3, true)), this._lastEvent = e3, true;
          }
          explainEvents(e3) {
            return { down: !!(1 & e3), up: !!(2 & e3), drag: !!(4 & e3), move: !!(8 & e3), wheel: !!(16 & e3) };
          }
          _equalEvents(e3, t3, i3) {
            if (i3) {
              if (e3.x !== t3.x) return false;
              if (e3.y !== t3.y) return false;
            } else {
              if (e3.col !== t3.col) return false;
              if (e3.row !== t3.row) return false;
            }
            return e3.button === t3.button && e3.action === t3.action && e3.ctrl === t3.ctrl && e3.alt === t3.alt && e3.shift === t3.shift;
          }
        };
        t2.CoreMouseService = _ = s2([r(0, n.IBufferService), r(1, n.ICoreService)], _);
      }, 6975: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CoreService = void 0;
        const n = i2(1439), o = i2(8460), a = i2(844), h2 = i2(2585), c = Object.freeze({ insertMode: false }), l = Object.freeze({ applicationCursorKeys: false, applicationKeypad: false, bracketedPasteMode: false, origin: false, reverseWraparound: false, sendFocus: false, wraparound: true });
        let d = t2.CoreService = class extends a.Disposable {
          constructor(e3, t3, i3) {
            super(), this._bufferService = e3, this._logService = t3, this._optionsService = i3, this.isCursorInitialized = false, this.isCursorHidden = false, this._onData = this.register(new o.EventEmitter()), this.onData = this._onData.event, this._onUserInput = this.register(new o.EventEmitter()), this.onUserInput = this._onUserInput.event, this._onBinary = this.register(new o.EventEmitter()), this.onBinary = this._onBinary.event, this._onRequestScrollToBottom = this.register(new o.EventEmitter()), this.onRequestScrollToBottom = this._onRequestScrollToBottom.event, this.modes = (0, n.clone)(c), this.decPrivateModes = (0, n.clone)(l);
          }
          reset() {
            this.modes = (0, n.clone)(c), this.decPrivateModes = (0, n.clone)(l);
          }
          triggerDataEvent(e3, t3 = false) {
            if (this._optionsService.rawOptions.disableStdin) return;
            const i3 = this._bufferService.buffer;
            t3 && this._optionsService.rawOptions.scrollOnUserInput && i3.ybase !== i3.ydisp && this._onRequestScrollToBottom.fire(), t3 && this._onUserInput.fire(), this._logService.debug(`sending data "${e3}"`, (() => e3.split("").map(((e4) => e4.charCodeAt(0))))), this._onData.fire(e3);
          }
          triggerBinaryEvent(e3) {
            this._optionsService.rawOptions.disableStdin || (this._logService.debug(`sending binary "${e3}"`, (() => e3.split("").map(((e4) => e4.charCodeAt(0))))), this._onBinary.fire(e3));
          }
        };
        t2.CoreService = d = s2([r(0, h2.IBufferService), r(1, h2.ILogService), r(2, h2.IOptionsService)], d);
      }, 9074: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DecorationService = void 0;
        const s2 = i2(8055), r = i2(8460), n = i2(844), o = i2(6106);
        let a = 0, h2 = 0;
        class c extends n.Disposable {
          get decorations() {
            return this._decorations.values();
          }
          constructor() {
            super(), this._decorations = new o.SortedList(((e3) => null == e3 ? void 0 : e3.marker.line)), this._onDecorationRegistered = this.register(new r.EventEmitter()), this.onDecorationRegistered = this._onDecorationRegistered.event, this._onDecorationRemoved = this.register(new r.EventEmitter()), this.onDecorationRemoved = this._onDecorationRemoved.event, this.register((0, n.toDisposable)((() => this.reset())));
          }
          registerDecoration(e3) {
            if (e3.marker.isDisposed) return;
            const t3 = new l(e3);
            if (t3) {
              const e4 = t3.marker.onDispose((() => t3.dispose()));
              t3.onDispose((() => {
                t3 && (this._decorations.delete(t3) && this._onDecorationRemoved.fire(t3), e4.dispose());
              })), this._decorations.insert(t3), this._onDecorationRegistered.fire(t3);
            }
            return t3;
          }
          reset() {
            for (const e3 of this._decorations.values()) e3.dispose();
            this._decorations.clear();
          }
          *getDecorationsAtCell(e3, t3, i3) {
            var s3, r2, n2;
            let o2 = 0, a2 = 0;
            for (const h3 of this._decorations.getKeyIterator(t3)) o2 = null !== (s3 = h3.options.x) && void 0 !== s3 ? s3 : 0, a2 = o2 + (null !== (r2 = h3.options.width) && void 0 !== r2 ? r2 : 1), e3 >= o2 && e3 < a2 && (!i3 || (null !== (n2 = h3.options.layer) && void 0 !== n2 ? n2 : "bottom") === i3) && (yield h3);
          }
          forEachDecorationAtCell(e3, t3, i3, s3) {
            this._decorations.forEachByKey(t3, ((t4) => {
              var r2, n2, o2;
              a = null !== (r2 = t4.options.x) && void 0 !== r2 ? r2 : 0, h2 = a + (null !== (n2 = t4.options.width) && void 0 !== n2 ? n2 : 1), e3 >= a && e3 < h2 && (!i3 || (null !== (o2 = t4.options.layer) && void 0 !== o2 ? o2 : "bottom") === i3) && s3(t4);
            }));
          }
        }
        t2.DecorationService = c;
        class l extends n.Disposable {
          get isDisposed() {
            return this._isDisposed;
          }
          get backgroundColorRGB() {
            return null === this._cachedBg && (this.options.backgroundColor ? this._cachedBg = s2.css.toColor(this.options.backgroundColor) : this._cachedBg = void 0), this._cachedBg;
          }
          get foregroundColorRGB() {
            return null === this._cachedFg && (this.options.foregroundColor ? this._cachedFg = s2.css.toColor(this.options.foregroundColor) : this._cachedFg = void 0), this._cachedFg;
          }
          constructor(e3) {
            super(), this.options = e3, this.onRenderEmitter = this.register(new r.EventEmitter()), this.onRender = this.onRenderEmitter.event, this._onDispose = this.register(new r.EventEmitter()), this.onDispose = this._onDispose.event, this._cachedBg = null, this._cachedFg = null, this.marker = e3.marker, this.options.overviewRulerOptions && !this.options.overviewRulerOptions.position && (this.options.overviewRulerOptions.position = "full");
          }
          dispose() {
            this._onDispose.fire(), super.dispose();
          }
        }
      }, 4348: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.InstantiationService = t2.ServiceCollection = void 0;
        const s2 = i2(2585), r = i2(8343);
        class n {
          constructor(...e3) {
            this._entries = /* @__PURE__ */ new Map();
            for (const [t3, i3] of e3) this.set(t3, i3);
          }
          set(e3, t3) {
            const i3 = this._entries.get(e3);
            return this._entries.set(e3, t3), i3;
          }
          forEach(e3) {
            for (const [t3, i3] of this._entries.entries()) e3(t3, i3);
          }
          has(e3) {
            return this._entries.has(e3);
          }
          get(e3) {
            return this._entries.get(e3);
          }
        }
        t2.ServiceCollection = n, t2.InstantiationService = class {
          constructor() {
            this._services = new n(), this._services.set(s2.IInstantiationService, this);
          }
          setService(e3, t3) {
            this._services.set(e3, t3);
          }
          getService(e3) {
            return this._services.get(e3);
          }
          createInstance(e3, ...t3) {
            const i3 = (0, r.getServiceDependencies)(e3).sort(((e4, t4) => e4.index - t4.index)), s3 = [];
            for (const t4 of i3) {
              const i4 = this._services.get(t4.id);
              if (!i4) throw new Error(`[createInstance] ${e3.name} depends on UNKNOWN service ${t4.id}.`);
              s3.push(i4);
            }
            const n2 = i3.length > 0 ? i3[0].index : t3.length;
            if (t3.length !== n2) throw new Error(`[createInstance] First service dependency of ${e3.name} at position ${n2 + 1} conflicts with ${t3.length} static arguments`);
            return new e3(...[...t3, ...s3]);
          }
        };
      }, 7866: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.traceCall = t2.setTraceLogger = t2.LogService = void 0;
        const n = i2(844), o = i2(2585), a = { trace: o.LogLevelEnum.TRACE, debug: o.LogLevelEnum.DEBUG, info: o.LogLevelEnum.INFO, warn: o.LogLevelEnum.WARN, error: o.LogLevelEnum.ERROR, off: o.LogLevelEnum.OFF };
        let h2, c = t2.LogService = class extends n.Disposable {
          get logLevel() {
            return this._logLevel;
          }
          constructor(e3) {
            super(), this._optionsService = e3, this._logLevel = o.LogLevelEnum.OFF, this._updateLogLevel(), this.register(this._optionsService.onSpecificOptionChange("logLevel", (() => this._updateLogLevel()))), h2 = this;
          }
          _updateLogLevel() {
            this._logLevel = a[this._optionsService.rawOptions.logLevel];
          }
          _evalLazyOptionalParams(e3) {
            for (let t3 = 0; t3 < e3.length; t3++) "function" == typeof e3[t3] && (e3[t3] = e3[t3]());
          }
          _log(e3, t3, i3) {
            this._evalLazyOptionalParams(i3), e3.call(console, (this._optionsService.options.logger ? "" : "xterm.js: ") + t3, ...i3);
          }
          trace(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o.LogLevelEnum.TRACE && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.trace.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.log, e3, t3);
          }
          debug(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o.LogLevelEnum.DEBUG && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.debug.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.log, e3, t3);
          }
          info(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o.LogLevelEnum.INFO && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.info.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.info, e3, t3);
          }
          warn(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o.LogLevelEnum.WARN && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.warn.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.warn, e3, t3);
          }
          error(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o.LogLevelEnum.ERROR && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.error.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.error, e3, t3);
          }
        };
        t2.LogService = c = s2([r(0, o.IOptionsService)], c), t2.setTraceLogger = function(e3) {
          h2 = e3;
        }, t2.traceCall = function(e3, t3, i3) {
          if ("function" != typeof i3.value) throw new Error("not supported");
          const s3 = i3.value;
          i3.value = function(...e4) {
            if (h2.logLevel !== o.LogLevelEnum.TRACE) return s3.apply(this, e4);
            h2.trace(`GlyphRenderer#${s3.name}(${e4.map(((e5) => JSON.stringify(e5))).join(", ")})`);
            const t4 = s3.apply(this, e4);
            return h2.trace(`GlyphRenderer#${s3.name} return`, t4), t4;
          };
        };
      }, 7302: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OptionsService = t2.DEFAULT_OPTIONS = void 0;
        const s2 = i2(8460), r = i2(844), n = i2(6114);
        t2.DEFAULT_OPTIONS = { cols: 80, rows: 24, cursorBlink: false, cursorStyle: "block", cursorWidth: 1, cursorInactiveStyle: "outline", customGlyphs: true, drawBoldTextInBrightColors: true, fastScrollModifier: "alt", fastScrollSensitivity: 5, fontFamily: "courier-new, courier, monospace", fontSize: 15, fontWeight: "normal", fontWeightBold: "bold", ignoreBracketedPasteMode: false, lineHeight: 1, letterSpacing: 0, linkHandler: null, logLevel: "info", logger: null, scrollback: 1e3, scrollOnUserInput: true, scrollSensitivity: 1, screenReaderMode: false, smoothScrollDuration: 0, macOptionIsMeta: false, macOptionClickForcesSelection: false, minimumContrastRatio: 1, disableStdin: false, allowProposedApi: false, allowTransparency: false, tabStopWidth: 8, theme: {}, rightClickSelectsWord: n.isMac, windowOptions: {}, windowsMode: false, windowsPty: {}, wordSeparator: " ()[]{}',\"`", altClickMovesCursor: true, convertEol: false, termName: "xterm", cancelEvents: false, overviewRulerWidth: 0 };
        const o = ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
        class a extends r.Disposable {
          constructor(e3) {
            super(), this._onOptionChange = this.register(new s2.EventEmitter()), this.onOptionChange = this._onOptionChange.event;
            const i3 = Object.assign({}, t2.DEFAULT_OPTIONS);
            for (const t3 in e3) if (t3 in i3) try {
              const s3 = e3[t3];
              i3[t3] = this._sanitizeAndValidateOption(t3, s3);
            } catch (e4) {
              console.error(e4);
            }
            this.rawOptions = i3, this.options = Object.assign({}, i3), this._setupOptions();
          }
          onSpecificOptionChange(e3, t3) {
            return this.onOptionChange(((i3) => {
              i3 === e3 && t3(this.rawOptions[e3]);
            }));
          }
          onMultipleOptionChange(e3, t3) {
            return this.onOptionChange(((i3) => {
              -1 !== e3.indexOf(i3) && t3();
            }));
          }
          _setupOptions() {
            const e3 = (e4) => {
              if (!(e4 in t2.DEFAULT_OPTIONS)) throw new Error(`No option with key "${e4}"`);
              return this.rawOptions[e4];
            }, i3 = (e4, i4) => {
              if (!(e4 in t2.DEFAULT_OPTIONS)) throw new Error(`No option with key "${e4}"`);
              i4 = this._sanitizeAndValidateOption(e4, i4), this.rawOptions[e4] !== i4 && (this.rawOptions[e4] = i4, this._onOptionChange.fire(e4));
            };
            for (const t3 in this.rawOptions) {
              const s3 = { get: e3.bind(this, t3), set: i3.bind(this, t3) };
              Object.defineProperty(this.options, t3, s3);
            }
          }
          _sanitizeAndValidateOption(e3, i3) {
            switch (e3) {
              case "cursorStyle":
                if (i3 || (i3 = t2.DEFAULT_OPTIONS[e3]), !/* @__PURE__ */ (function(e4) {
                  return "block" === e4 || "underline" === e4 || "bar" === e4;
                })(i3)) throw new Error(`"${i3}" is not a valid value for ${e3}`);
                break;
              case "wordSeparator":
                i3 || (i3 = t2.DEFAULT_OPTIONS[e3]);
                break;
              case "fontWeight":
              case "fontWeightBold":
                if ("number" == typeof i3 && 1 <= i3 && i3 <= 1e3) break;
                i3 = o.includes(i3) ? i3 : t2.DEFAULT_OPTIONS[e3];
                break;
              case "cursorWidth":
                i3 = Math.floor(i3);
              case "lineHeight":
              case "tabStopWidth":
                if (i3 < 1) throw new Error(`${e3} cannot be less than 1, value: ${i3}`);
                break;
              case "minimumContrastRatio":
                i3 = Math.max(1, Math.min(21, Math.round(10 * i3) / 10));
                break;
              case "scrollback":
                if ((i3 = Math.min(i3, 4294967295)) < 0) throw new Error(`${e3} cannot be less than 0, value: ${i3}`);
                break;
              case "fastScrollSensitivity":
              case "scrollSensitivity":
                if (i3 <= 0) throw new Error(`${e3} cannot be less than or equal to 0, value: ${i3}`);
                break;
              case "rows":
              case "cols":
                if (!i3 && 0 !== i3) throw new Error(`${e3} must be numeric, value: ${i3}`);
                break;
              case "windowsPty":
                i3 = null != i3 ? i3 : {};
            }
            return i3;
          }
        }
        t2.OptionsService = a;
      }, 2660: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o2 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a = e3.length - 1; a >= 0; a--) (r2 = e3[a]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OscLinkService = void 0;
        const n = i2(2585);
        let o = t2.OscLinkService = class {
          constructor(e3) {
            this._bufferService = e3, this._nextId = 1, this._entriesWithId = /* @__PURE__ */ new Map(), this._dataByLinkId = /* @__PURE__ */ new Map();
          }
          registerLink(e3) {
            const t3 = this._bufferService.buffer;
            if (void 0 === e3.id) {
              const i4 = t3.addMarker(t3.ybase + t3.y), s4 = { data: e3, id: this._nextId++, lines: [i4] };
              return i4.onDispose((() => this._removeMarkerFromLink(s4, i4))), this._dataByLinkId.set(s4.id, s4), s4.id;
            }
            const i3 = e3, s3 = this._getEntryIdKey(i3), r2 = this._entriesWithId.get(s3);
            if (r2) return this.addLineToLink(r2.id, t3.ybase + t3.y), r2.id;
            const n2 = t3.addMarker(t3.ybase + t3.y), o2 = { id: this._nextId++, key: this._getEntryIdKey(i3), data: i3, lines: [n2] };
            return n2.onDispose((() => this._removeMarkerFromLink(o2, n2))), this._entriesWithId.set(o2.key, o2), this._dataByLinkId.set(o2.id, o2), o2.id;
          }
          addLineToLink(e3, t3) {
            const i3 = this._dataByLinkId.get(e3);
            if (i3 && i3.lines.every(((e4) => e4.line !== t3))) {
              const e4 = this._bufferService.buffer.addMarker(t3);
              i3.lines.push(e4), e4.onDispose((() => this._removeMarkerFromLink(i3, e4)));
            }
          }
          getLinkData(e3) {
            var t3;
            return null === (t3 = this._dataByLinkId.get(e3)) || void 0 === t3 ? void 0 : t3.data;
          }
          _getEntryIdKey(e3) {
            return `${e3.id};;${e3.uri}`;
          }
          _removeMarkerFromLink(e3, t3) {
            const i3 = e3.lines.indexOf(t3);
            -1 !== i3 && (e3.lines.splice(i3, 1), 0 === e3.lines.length && (void 0 !== e3.data.id && this._entriesWithId.delete(e3.key), this._dataByLinkId.delete(e3.id)));
          }
        };
        t2.OscLinkService = o = s2([r(0, n.IBufferService)], o);
      }, 8343: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.createDecorator = t2.getServiceDependencies = t2.serviceRegistry = void 0;
        const i2 = "di$target", s2 = "di$dependencies";
        t2.serviceRegistry = /* @__PURE__ */ new Map(), t2.getServiceDependencies = function(e3) {
          return e3[s2] || [];
        }, t2.createDecorator = function(e3) {
          if (t2.serviceRegistry.has(e3)) return t2.serviceRegistry.get(e3);
          const r = function(e4, t3, n) {
            if (3 !== arguments.length) throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
            !(function(e5, t4, r2) {
              t4[i2] === t4 ? t4[s2].push({ id: e5, index: r2 }) : (t4[s2] = [{ id: e5, index: r2 }], t4[i2] = t4);
            })(r, e4, n);
          };
          return r.toString = () => e3, t2.serviceRegistry.set(e3, r), r;
        };
      }, 2585: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.IDecorationService = t2.IUnicodeService = t2.IOscLinkService = t2.IOptionsService = t2.ILogService = t2.LogLevelEnum = t2.IInstantiationService = t2.ICharsetService = t2.ICoreService = t2.ICoreMouseService = t2.IBufferService = void 0;
        const s2 = i2(8343);
        var r;
        t2.IBufferService = (0, s2.createDecorator)("BufferService"), t2.ICoreMouseService = (0, s2.createDecorator)("CoreMouseService"), t2.ICoreService = (0, s2.createDecorator)("CoreService"), t2.ICharsetService = (0, s2.createDecorator)("CharsetService"), t2.IInstantiationService = (0, s2.createDecorator)("InstantiationService"), (function(e3) {
          e3[e3.TRACE = 0] = "TRACE", e3[e3.DEBUG = 1] = "DEBUG", e3[e3.INFO = 2] = "INFO", e3[e3.WARN = 3] = "WARN", e3[e3.ERROR = 4] = "ERROR", e3[e3.OFF = 5] = "OFF";
        })(r || (t2.LogLevelEnum = r = {})), t2.ILogService = (0, s2.createDecorator)("LogService"), t2.IOptionsService = (0, s2.createDecorator)("OptionsService"), t2.IOscLinkService = (0, s2.createDecorator)("OscLinkService"), t2.IUnicodeService = (0, s2.createDecorator)("UnicodeService"), t2.IDecorationService = (0, s2.createDecorator)("DecorationService");
      }, 1480: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.UnicodeService = void 0;
        const s2 = i2(8460), r = i2(225);
        t2.UnicodeService = class {
          constructor() {
            this._providers = /* @__PURE__ */ Object.create(null), this._active = "", this._onChange = new s2.EventEmitter(), this.onChange = this._onChange.event;
            const e3 = new r.UnicodeV6();
            this.register(e3), this._active = e3.version, this._activeProvider = e3;
          }
          dispose() {
            this._onChange.dispose();
          }
          get versions() {
            return Object.keys(this._providers);
          }
          get activeVersion() {
            return this._active;
          }
          set activeVersion(e3) {
            if (!this._providers[e3]) throw new Error(`unknown Unicode version "${e3}"`);
            this._active = e3, this._activeProvider = this._providers[e3], this._onChange.fire(e3);
          }
          register(e3) {
            this._providers[e3.version] = e3;
          }
          wcwidth(e3) {
            return this._activeProvider.wcwidth(e3);
          }
          getStringCellWidth(e3) {
            let t3 = 0;
            const i3 = e3.length;
            for (let s3 = 0; s3 < i3; ++s3) {
              let r2 = e3.charCodeAt(s3);
              if (55296 <= r2 && r2 <= 56319) {
                if (++s3 >= i3) return t3 + this.wcwidth(r2);
                const n = e3.charCodeAt(s3);
                56320 <= n && n <= 57343 ? r2 = 1024 * (r2 - 55296) + n - 56320 + 65536 : t3 += this.wcwidth(n);
              }
              t3 += this.wcwidth(r2);
            }
            return t3;
          }
        };
      } }, t = {};
      function i(s2) {
        var r = t[s2];
        if (void 0 !== r) return r.exports;
        var n = t[s2] = { exports: {} };
        return e[s2].call(n.exports, n, n.exports, i), n.exports;
      }
      var s = {};
      return (() => {
        var e2 = s;
        Object.defineProperty(e2, "__esModule", { value: true }), e2.Terminal = void 0;
        const t2 = i(9042), r = i(3236), n = i(844), o = i(5741), a = i(8285), h2 = i(7975), c = i(7090), l = ["cols", "rows"];
        class d extends n.Disposable {
          constructor(e3) {
            super(), this._core = this.register(new r.Terminal(e3)), this._addonManager = this.register(new o.AddonManager()), this._publicOptions = Object.assign({}, this._core.options);
            const t3 = (e4) => this._core.options[e4], i2 = (e4, t4) => {
              this._checkReadonlyOptions(e4), this._core.options[e4] = t4;
            };
            for (const e4 in this._core.options) {
              const s2 = { get: t3.bind(this, e4), set: i2.bind(this, e4) };
              Object.defineProperty(this._publicOptions, e4, s2);
            }
          }
          _checkReadonlyOptions(e3) {
            if (l.includes(e3)) throw new Error(`Option "${e3}" can only be set in the constructor`);
          }
          _checkProposedApi() {
            if (!this._core.optionsService.rawOptions.allowProposedApi) throw new Error("You must set the allowProposedApi option to true to use proposed API");
          }
          get onBell() {
            return this._core.onBell;
          }
          get onBinary() {
            return this._core.onBinary;
          }
          get onCursorMove() {
            return this._core.onCursorMove;
          }
          get onData() {
            return this._core.onData;
          }
          get onKey() {
            return this._core.onKey;
          }
          get onLineFeed() {
            return this._core.onLineFeed;
          }
          get onRender() {
            return this._core.onRender;
          }
          get onResize() {
            return this._core.onResize;
          }
          get onScroll() {
            return this._core.onScroll;
          }
          get onSelectionChange() {
            return this._core.onSelectionChange;
          }
          get onTitleChange() {
            return this._core.onTitleChange;
          }
          get onWriteParsed() {
            return this._core.onWriteParsed;
          }
          get element() {
            return this._core.element;
          }
          get parser() {
            return this._parser || (this._parser = new h2.ParserApi(this._core)), this._parser;
          }
          get unicode() {
            return this._checkProposedApi(), new c.UnicodeApi(this._core);
          }
          get textarea() {
            return this._core.textarea;
          }
          get rows() {
            return this._core.rows;
          }
          get cols() {
            return this._core.cols;
          }
          get buffer() {
            return this._buffer || (this._buffer = this.register(new a.BufferNamespaceApi(this._core))), this._buffer;
          }
          get markers() {
            return this._checkProposedApi(), this._core.markers;
          }
          get modes() {
            const e3 = this._core.coreService.decPrivateModes;
            let t3 = "none";
            switch (this._core.coreMouseService.activeProtocol) {
              case "X10":
                t3 = "x10";
                break;
              case "VT200":
                t3 = "vt200";
                break;
              case "DRAG":
                t3 = "drag";
                break;
              case "ANY":
                t3 = "any";
            }
            return { applicationCursorKeysMode: e3.applicationCursorKeys, applicationKeypadMode: e3.applicationKeypad, bracketedPasteMode: e3.bracketedPasteMode, insertMode: this._core.coreService.modes.insertMode, mouseTrackingMode: t3, originMode: e3.origin, reverseWraparoundMode: e3.reverseWraparound, sendFocusMode: e3.sendFocus, wraparoundMode: e3.wraparound };
          }
          get options() {
            return this._publicOptions;
          }
          set options(e3) {
            for (const t3 in e3) this._publicOptions[t3] = e3[t3];
          }
          blur() {
            this._core.blur();
          }
          focus() {
            this._core.focus();
          }
          resize(e3, t3) {
            this._verifyIntegers(e3, t3), this._core.resize(e3, t3);
          }
          open(e3) {
            this._core.open(e3);
          }
          attachCustomKeyEventHandler(e3) {
            this._core.attachCustomKeyEventHandler(e3);
          }
          registerLinkProvider(e3) {
            return this._core.registerLinkProvider(e3);
          }
          registerCharacterJoiner(e3) {
            return this._checkProposedApi(), this._core.registerCharacterJoiner(e3);
          }
          deregisterCharacterJoiner(e3) {
            this._checkProposedApi(), this._core.deregisterCharacterJoiner(e3);
          }
          registerMarker(e3 = 0) {
            return this._verifyIntegers(e3), this._core.registerMarker(e3);
          }
          registerDecoration(e3) {
            var t3, i2, s2;
            return this._checkProposedApi(), this._verifyPositiveIntegers(null !== (t3 = e3.x) && void 0 !== t3 ? t3 : 0, null !== (i2 = e3.width) && void 0 !== i2 ? i2 : 0, null !== (s2 = e3.height) && void 0 !== s2 ? s2 : 0), this._core.registerDecoration(e3);
          }
          hasSelection() {
            return this._core.hasSelection();
          }
          select(e3, t3, i2) {
            this._verifyIntegers(e3, t3, i2), this._core.select(e3, t3, i2);
          }
          getSelection() {
            return this._core.getSelection();
          }
          getSelectionPosition() {
            return this._core.getSelectionPosition();
          }
          clearSelection() {
            this._core.clearSelection();
          }
          selectAll() {
            this._core.selectAll();
          }
          selectLines(e3, t3) {
            this._verifyIntegers(e3, t3), this._core.selectLines(e3, t3);
          }
          dispose() {
            super.dispose();
          }
          scrollLines(e3) {
            this._verifyIntegers(e3), this._core.scrollLines(e3);
          }
          scrollPages(e3) {
            this._verifyIntegers(e3), this._core.scrollPages(e3);
          }
          scrollToTop() {
            this._core.scrollToTop();
          }
          scrollToBottom() {
            this._core.scrollToBottom();
          }
          scrollToLine(e3) {
            this._verifyIntegers(e3), this._core.scrollToLine(e3);
          }
          clear() {
            this._core.clear();
          }
          write(e3, t3) {
            this._core.write(e3, t3);
          }
          writeln(e3, t3) {
            this._core.write(e3), this._core.write("\r\n", t3);
          }
          paste(e3) {
            this._core.paste(e3);
          }
          refresh(e3, t3) {
            this._verifyIntegers(e3, t3), this._core.refresh(e3, t3);
          }
          reset() {
            this._core.reset();
          }
          clearTextureAtlas() {
            this._core.clearTextureAtlas();
          }
          loadAddon(e3) {
            this._addonManager.loadAddon(this, e3);
          }
          static get strings() {
            return t2;
          }
          _verifyIntegers(...e3) {
            for (const t3 of e3) if (t3 === 1 / 0 || isNaN(t3) || t3 % 1 != 0) throw new Error("This API only accepts integers");
          }
          _verifyPositiveIntegers(...e3) {
            for (const t3 of e3) if (t3 && (t3 === 1 / 0 || isNaN(t3) || t3 % 1 != 0 || t3 < 0)) throw new Error("This API only accepts positive integers");
          }
        }
        e2.Terminal = d;
      })(), s;
    })()));
  }
});

// node_modules/xterm-addon-fit/lib/xterm-addon-fit.js
var require_xterm_addon_fit = __commonJS({
  "node_modules/xterm-addon-fit/lib/xterm-addon-fit.js"(exports, module2) {
    !(function(e, t) {
      "object" == typeof exports && "object" == typeof module2 ? module2.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.FitAddon = t() : e.FitAddon = t();
    })(self, (() => (() => {
      "use strict";
      var e = {};
      return (() => {
        var t = e;
        Object.defineProperty(t, "__esModule", { value: true }), t.FitAddon = void 0, t.FitAddon = class {
          activate(e2) {
            this._terminal = e2;
          }
          dispose() {
          }
          fit() {
            const e2 = this.proposeDimensions();
            if (!e2 || !this._terminal || isNaN(e2.cols) || isNaN(e2.rows)) return;
            const t2 = this._terminal._core;
            this._terminal.rows === e2.rows && this._terminal.cols === e2.cols || (t2._renderService.clear(), this._terminal.resize(e2.cols, e2.rows));
          }
          proposeDimensions() {
            if (!this._terminal) return;
            if (!this._terminal.element || !this._terminal.element.parentElement) return;
            const e2 = this._terminal._core, t2 = e2._renderService.dimensions;
            if (0 === t2.css.cell.width || 0 === t2.css.cell.height) return;
            const r = 0 === this._terminal.options.scrollback ? 0 : e2.viewport.scrollBarWidth, i = window.getComputedStyle(this._terminal.element.parentElement), o = parseInt(i.getPropertyValue("height")), s = Math.max(0, parseInt(i.getPropertyValue("width"))), n = window.getComputedStyle(this._terminal.element), l = o - (parseInt(n.getPropertyValue("padding-top")) + parseInt(n.getPropertyValue("padding-bottom"))), a = s - (parseInt(n.getPropertyValue("padding-right")) + parseInt(n.getPropertyValue("padding-left"))) - r;
            return { cols: Math.max(2, Math.floor(a / t2.css.cell.width)), rows: Math.max(1, Math.floor(l / t2.css.cell.height)) };
          }
        };
      })(), e;
    })()));
  }
});

// src/client.tsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");
var import_react_dom = require("react-dom");
var import_xterm = __toESM(require_xterm(), 1);
var import_xterm_addon_fit = __toESM(require_xterm_addon_fit(), 1);

// node_modules/xterm/css/xterm.css
var xterm_default = `/**
 * Copyright (c) 2014 The xterm.js authors. All rights reserved.
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * https://github.com/chjj/term.js
 * @license MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Originally forked from (with the author's permission):
 *   Fabrice Bellard's javascript vt100 for jslinux:
 *   http://bellard.org/jslinux/
 *   Copyright (c) 2011 Fabrice Bellard
 *   The original design remains. The terminal itself
 *   has been extended to include xterm CSI codes, among
 *   other features.
 */

/**
 *  Default styles for xterm.js
 */

.xterm {
    cursor: text;
    position: relative;
    user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
}

.xterm.focus,
.xterm:focus {
    outline: none;
}

.xterm .xterm-helpers {
    position: absolute;
    top: 0;
    /**
     * The z-index of the helpers must be higher than the canvases in order for
     * IMEs to appear on top.
     */
    z-index: 5;
}

.xterm .xterm-helper-textarea {
    padding: 0;
    border: 0;
    margin: 0;
    /* Move textarea out of the screen to the far left, so that the cursor is not visible */
    position: absolute;
    opacity: 0;
    left: -9999em;
    top: 0;
    width: 0;
    height: 0;
    z-index: -5;
    /** Prevent wrapping so the IME appears against the textarea at the correct position */
    white-space: nowrap;
    overflow: hidden;
    resize: none;
}

.xterm .composition-view {
    /* TODO: Composition position got messed up somewhere */
    background: #000;
    color: #FFF;
    display: none;
    position: absolute;
    white-space: nowrap;
    z-index: 1;
}

.xterm .composition-view.active {
    display: block;
}

.xterm .xterm-viewport {
    /* On OS X this is required in order for the scroll bar to appear fully opaque */
    background-color: #000;
    overflow-y: scroll;
    cursor: default;
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
}

.xterm .xterm-screen {
    position: relative;
}

.xterm .xterm-screen canvas {
    position: absolute;
    left: 0;
    top: 0;
}

.xterm .xterm-scroll-area {
    visibility: hidden;
}

.xterm-char-measure-element {
    display: inline-block;
    visibility: hidden;
    position: absolute;
    top: 0;
    left: -9999em;
    line-height: normal;
}

.xterm.enable-mouse-events {
    /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */
    cursor: default;
}

.xterm.xterm-cursor-pointer,
.xterm .xterm-cursor-pointer {
    cursor: pointer;
}

.xterm.column-select.focus {
    /* Column selection mode */
    cursor: crosshair;
}

.xterm .xterm-accessibility,
.xterm .xterm-message {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 10;
    color: transparent;
    pointer-events: none;
}

.xterm .live-region {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

.xterm-dim {
    /* Dim should not apply to background, so the opacity of the foreground color is applied
     * explicitly in the generated class and reset to 1 here */
    opacity: 1 !important;
}

.xterm-underline-1 { text-decoration: underline; }
.xterm-underline-2 { text-decoration: double underline; }
.xterm-underline-3 { text-decoration: wavy underline; }
.xterm-underline-4 { text-decoration: dotted underline; }
.xterm-underline-5 { text-decoration: dashed underline; }

.xterm-overline {
    text-decoration: overline;
}

.xterm-overline.xterm-underline-1 { text-decoration: overline underline; }
.xterm-overline.xterm-underline-2 { text-decoration: overline double underline; }
.xterm-overline.xterm-underline-3 { text-decoration: overline wavy underline; }
.xterm-overline.xterm-underline-4 { text-decoration: overline dotted underline; }
.xterm-overline.xterm-underline-5 { text-decoration: overline dashed underline; }

.xterm-strikethrough {
    text-decoration: line-through;
}

.xterm-screen .xterm-decoration-container .xterm-decoration {
	z-index: 6;
	position: absolute;
}

.xterm-screen .xterm-decoration-container .xterm-decoration.xterm-decoration-top-layer {
	z-index: 7;
}

.xterm-decoration-overview-ruler {
    z-index: 8;
    position: absolute;
    top: 0;
    right: 0;
    pointer-events: none;
}

.xterm-decoration-top {
    z-index: 2;
    position: relative;
}
`;

// src/types.ts
var DEVICE_TYPES = [
  "next-gen-firewall",
  "intrusion-detection",
  "intrusion-prevention",
  "web-application-firewall",
  "load-balancer",
  "other"
];
var DEVICE_TYPE_LABELS = {
  "next-gen-firewall": "\u4E0B\u4E00\u4EE3\u9632\u706B\u5899",
  "intrusion-detection": "\u5165\u4FB5\u68C0\u6D4B",
  "intrusion-prevention": "\u5165\u4FB5\u9632\u5FA1",
  "web-application-firewall": "Web \u5E94\u7528\u9632\u706B\u5899",
  "load-balancer": "\u8D1F\u8F7D\u5747\u8861",
  other: "\u5176\u4ED6"
};

// src/client.tsx
var cssInjected = false;
function ensureXtermCss() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  try {
    const style = document.createElement("style");
    style.setAttribute("data-plugin", "dsh-hillstone-cli-ops");
    style.textContent = typeof xterm_default === "string" ? xterm_default : "";
    document.head.appendChild(style);
  } catch {
  }
}
var PANEL_ID = "dsh-hillstone-cli-ops";
var API_PORT = 18783;
var API_BASE = `http://127.0.0.1:${API_PORT}`;
var API = API_BASE + "/ops-api";
var TOKEN_KEY = "dsh-hillstone-ops-token";
var sessionToken = "";
var tokenProbed = false;
var tokenNotice = null;
function setTokenNotice(fn) {
  tokenNotice = fn;
}
function manualToken() {
  try {
    return (localStorage.getItem(TOKEN_KEY) || "").trim();
  } catch {
    return "";
  }
}
function setManualToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
  }
}
async function bootstrapToken() {
  if (tokenProbed) return manualToken() || sessionToken;
  tokenProbed = true;
  const m = manualToken();
  if (m) return m;
  try {
    const r = await fetch(API + "/_session");
    const j = await r.json();
    if (j.enabled && j.token) sessionToken = j.token;
  } catch {
  }
  return sessionToken;
}
async function api(path, opts = {}) {
  const token = await bootstrapToken();
  const headers = { "content-type": "application/json" };
  if (token) headers["X-Ops-Token"] = token;
  const res = await fetch(API + path, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== void 0 ? JSON.stringify(opts.body) : void 0
  });
  if (res.status === 401) {
    const reason = "\u8BBE\u5907\u8FD0\u7EF4\u8BBF\u95EE\u4EE4\u724C\u7F3A\u5931\u6216\u65E0\u6548\u3002host \u5DF2\u653E\u884C\u672C\u673A\u6765\u6E90\uFF1B\u82E5\u4ECD\u62A5\u9519\uFF0C\u8BF7\u7C98\u8D34\u672C\u673A\u4EE4\u724C\u540E\u91CD\u8BD5\u3002";
    tokenNotice?.(reason);
    throw new Error(reason);
  }
  const j = await res.json();
  if (!j.ok && j.error) throw new Error(j.error.message || "request failed");
  return j;
}
var pendingConnect = null;
var pendingConnectResult = null;
var pendingConnectError = null;
var pendingConnectListeners = /* @__PURE__ */ new Set();
async function requestConnect(deviceId, deviceName) {
  pendingConnect = { deviceId, deviceName };
  pendingConnectResult = null;
  pendingConnectError = null;
  try {
    const j = await api("/connect", {
      method: "POST",
      // m04040: name the session the connection belongs to, so the host's
      // connect watcher can put the sidebar back in this conversation even if
      // the user has moved to another one in the meantime.
      body: panelSessionId ? { deviceId, originSessionId: panelSessionId } : { deviceId }
    });
    pendingConnectResult = j.connection;
  } catch (e) {
    pendingConnectError = `\u8FDE\u63A5 ${deviceName} \u5931\u8D25\uFF1A${e.message}`;
  }
  for (const fn of [...pendingConnectListeners]) fn();
}
function takePendingConnect() {
  const out = { result: pendingConnectResult, error: pendingConnectError };
  pendingConnect = null;
  pendingConnectResult = null;
  pendingConnectError = null;
  return out;
}
function onPendingConnect(fn) {
  pendingConnectListeners.add(fn);
  return () => {
    pendingConnectListeners.delete(fn);
  };
}
var revealListeners = /* @__PURE__ */ new Set();
var pendingReveals = /* @__PURE__ */ new Set();
var revealSidebar = null;
var connectWatch = null;
var panelSessionId = null;
function onRevealTerminal(fn) {
  revealListeners.add(fn);
  return () => {
    revealListeners.delete(fn);
  };
}
function requestRevealTerminal(originSessionId) {
  if (revealListeners.size > 0) {
    for (const fn of [...revealListeners]) fn();
    if (originSessionId && originSessionId !== panelSessionId) {
      pendingReveals.add(originSessionId);
    }
    return;
  }
  pendingReveals.add(originSessionId ?? panelSessionId ?? "");
}
function takePendingReveal(sessionId) {
  const key = sessionId ?? "";
  if (!pendingReveals.has(key)) return false;
  pendingReveals.delete(key);
  return true;
}
var REVEAL_POLL_MS = 4e3;
var seenConnIds = /* @__PURE__ */ new Set();
function startConnectWatch() {
  if (connectWatch) return;
  let prev = "";
  let primed = false;
  const tick = async () => {
    if (!revealSidebar) return;
    try {
      const j = await api("/conn");
      const list = j.connections || [];
      const live = list.filter((c) => c.status === "ready" || c.status === "connecting");
      const now = live.map((c) => c.connId).sort().join(",");
      if (!primed) {
        primed = true;
        prev = now;
        for (const c of list) seenConnIds.add(c.connId);
        return;
      }
      if (now && now !== prev) {
        const fresh = live.filter((c) => !seenConnIds.has(c.connId));
        prev = now;
        for (const c of list) seenConnIds.add(c.connId);
        if (fresh.length) {
          for (const c of fresh) requestRevealTerminal(c.originSessionId);
          for (const c of fresh) revealSidebar?.(c.originSessionId);
        }
      } else if (!now) {
        prev = "";
      }
    } catch {
    }
  };
  const iv = setInterval(() => void tick(), REVEAL_POLL_MS);
  connectWatch = () => clearInterval(iv);
}
var panelCss = `
.ops-root { display: flex; flex-direction: column; height: 100%; box-sizing: border-box; font-family: var(--dsw-font-family, inherit); }

/* Page header */
.ops-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 0 0 10px; }
.ops-title { font-size: 15px; line-height: 22px; font-weight: 600; color: var(--dsw-alias-label-primary, #e7e7ea); margin: 0; }
.ops-sub { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-head-right { margin-left: auto; display: flex; align-items: center; gap: 6px; }

/* Segmented tab switcher */
.ops-seg { display: inline-flex; align-items: center; gap: 2px; padding: 2px; border-radius: var(--dsw-radius-md, 12px); background: var(--dsw-alias-bg-layer-1, #1a1b1f); border: 1px solid var(--dsw-alias-border-l2, #2a2a36); box-shadow: var(--dsw-shadow-lv1, 0 1px 3px 0 rgba(0,0,0,.18)); }
.ops-seg button { border: none; background: transparent; color: var(--dsw-alias-label-tertiary, #9a9aa6); padding: 4px 14px; border-radius: var(--dsw-radius-sm, 8px); cursor: pointer; font-family: inherit; font-size: 13px; line-height: 20px; white-space: nowrap; transition: background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-seg button:hover { color: var(--dsw-alias-label-primary, #e7e7ea); background: var(--dsw-alias-interactive-bg-hover, #ffffff10); }
.ops-seg button.on { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 18%, transparent); color: var(--dsw-alias-label-primary, #e7e7ea); font-weight: 500; box-shadow: 0 1px 2px 0 rgba(0,0,0,.18); }

/* Minimal buttons: the card already carries enough weight, so the buttons
   stay quiet \u2014 a near-flat surface that only tints on hover, thin borders,
   and accent fills dialled right down so the everyday verbs don't shout. */
.ops-btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, #2c2c2e) 55%, transparent); border: 1px solid var(--dsw-alias-border-l2, #3a414b); color: var(--dsw-alias-label-secondary, #cfd3d6); border-radius: var(--dsw-radius-sm, 8px); cursor: pointer; font-family: inherit; font-size: 13px; line-height: 20px; padding: 4px 12px; white-space: nowrap; transition: background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), box-shadow var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), transform var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #ffffff14); color: var(--dsw-alias-label-primary, #f9fafb); border-color: var(--dsw-alias-border-l4, #4a4d55); }
.ops-btn:active:not(:disabled) { background: var(--dsw-alias-interactive-bg-active, #ffffff1f); border-color: var(--dsw-alias-border-l4, #4a4d55); transform: translateY(1px); }
.ops-btn:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4176e6); outline-offset: 1px; }
.ops-btn:disabled { opacity: .45; cursor: default; }
.ops-btn.sm { padding: 2px 10px; font-size: 12px; }
.ops-btn.primary { color: var(--dsw-alias-state-business-primary, #4176e6); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 30%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 8%, transparent); }
.ops-btn.primary:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 14%, transparent); color: var(--dsw-alias-state-business-primary, #4176e6); }
.ops-btn.danger { color: var(--dsw-alias-state-error-primary, #f85149); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 24%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 7%, transparent); }
.ops-btn.danger:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 13%, transparent); color: var(--dsw-alias-state-error-primary, #f85149); }
.ops-btn.plain { background: transparent; border-color: transparent; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-btn.plain:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #ffffff14); border-color: transparent; color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-btn.on { color: var(--dsw-alias-state-business-primary, #4176e6); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 40%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 12%, var(--dsw-alias-bg-layer-3, #2c2c2e)); }

/* Form */
.ops-field { display: block; margin-bottom: 12px; }
.ops-label { display: block; margin-bottom: 5px; font-size: 12.5px; line-height: 18px; color: var(--dsw-alias-label-secondary, #cfd3d6); }
.ops-label i { font-style: normal; color: var(--dsw-alias-label-caption, #81858c); font-size: 11.5px; margin-left: 4px; }
.ops-input { box-sizing: border-box; width: 100%; padding: 5px 10px; border-radius: var(--dsw-radius-sm, 8px); border: 1px solid var(--dsw-alias-border-l2, #3a414b); background: var(--dsw-alias-bg-layer-2, #232324); color: var(--dsw-alias-label-primary, #f9fafb); font-family: inherit; font-size: 13px; line-height: 20px; outline: none; transition: border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-input::placeholder { color: var(--dsw-alias-label-caption, #81858c); }
.ops-input:hover { border-color: var(--dsw-alias-border-l4, #4a4d55); }
.ops-input:focus { border-color: var(--dsw-alias-state-business-primary, #4176e6); background: var(--dsw-alias-bg-layer-1, #1e1f23); }
.ops-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; }

/* Execution-policy form bits (\u6267\u884C\u7B56\u7565). The switch is a label-wrapped checkbox
   so the OS keeps the a11y semantics; the visible track is pure CSS. */
.ops-switch { display: inline-flex; align-items: center; cursor: pointer; }
.ops-switch input { position: absolute; opacity: 0; width: 0; height: 0; }
.ops-switch-track { position: relative; width: 38px; height: 22px; border-radius: 999px; background: var(--dsw-alias-bg-layer-3, #2c2c2e); border: 1px solid var(--dsw-alias-border-l4, #4a4d55); transition: background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-switch-track::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--dsw-alias-label-secondary, #cfd3d6); transition: transform var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-switch input:checked + .ops-switch-track { background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 36%, transparent); border-color: var(--dsw-alias-state-success-primary, #22c55e); }
.ops-switch input:checked + .ops-switch-track::after { transform: translateX(16px); background: var(--dsw-alias-state-success-primary, #22c55e); }
.ops-switch input:focus-visible + .ops-switch-track { box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 50%, transparent); }
.ops-textarea { resize: vertical; min-height: 96px; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; line-height: 19px; }
.ops-form-hint { margin-top: 10px; font-size: 11.5px; line-height: 18px; color: var(--dsw-alias-label-caption, #81858c); }

/* What the \u6267\u884C\u7B56\u7565 tab is FOR, shown once above the list.
   Without it the tab reads as another settings page: the operator cannot tell
   from "3 \u6761\u7B56\u7565" that these rules are aimed at the agent, not at the panel. */
.ops-intro { margin: 0 0 12px; padding: 11px 13px; border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-sm, 6px); background: var(--dsw-alias-bg-layer-1, #1e1f23); font-size: 12px; line-height: 19px; color: var(--dsw-alias-label-secondary, #c9c9cf); }
.ops-intro b { color: var(--dsw-alias-label-primary, #f9fafb); font-weight: 500; }
.ops-intro .ops-intro-scope { display: block; margin-top: 5px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }

/* Device dialog (\u65B0\u589E / \u7F16\u8F91 / \u590D\u5236 / \u5220\u9664\u786E\u8BA4 / \u65E5\u5FD7\u660E\u7EC6).
   The right rail is only a few hundred px wide, so an inline form and the device
   list cannot share it; every device edit happens in a dialog instead. OpsModal
   portals it to <body>, because the rail renders inside a low z-index stacking
   context and a fixed overlay painted in place would slip under the host's own
   chrome.

   Centred, and modelled on the host's own alert dialogs (m09852). This reverses
   m03664, which anchored the card to the RIGHT edge so it sat next to the panel
   that opened it. The reason that no longer holds: an edit form that hangs off
   the edge reads as a panel of the ops sidebar rather than a dialog about the
   device, and the eye has to travel from the card it came from across the whole
   window. The scrim stays almost transparent and non-blocking (the scrim opts
   out of pointer events, the card restores them) so the conversation underneath
   is still readable and clickable \u2014 a centred position does not require a
   takeover, and the earlier "covers the entire application" complaint was aimed
   at the opaque backdrop and the blur, not at the placement.

   The 40px background blur stayed out for good: smeared over a full-viewport
   scrim it turned the conversation into an unreadable wash. The right-edge
   justification and its asymmetric padding are gone with it \u2014 a centred card
   needs neither, and leaving them would silently re-anchor it on the next edit.
   Clicks on the app behind still reach the app. */
.ops-modal-scrim { position: fixed; inset: 0; z-index: 1100; display: flex; align-items: center; justify-content: center; background: var(--dsw-alias-bg-mask-2, #00000008); pointer-events: none; }
.ops-modal-scrim > .ops-modal { pointer-events: auto; }
.ops-modal { width: min(480px, calc(100vw - 48px)); max-height: min(84vh, 760px); display: flex; flex-direction: column; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-lg, 16px); background: var(--dsw-alias-bg-layer-1, #232324); box-shadow: var(--dsw-shadow-lv4, 0 0 1px 0 #0000001a, 0 16px 48px 0 #00000033); overflow: hidden; animation: ops-modal-in .12s var(--ds-ease-in-out, ease); }
.ops-modal-head { display: flex; align-items: center; gap: 8px; padding: 13px 16px; border-bottom: .5px solid var(--dsw-alias-border-l1, #ffffff0f); }
.ops-modal-head b { font-size: 14px; line-height: 22px; font-weight: 600; color: var(--dsw-alias-label-primary, #f9fafb); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-modal-close { margin-left: auto; width: 26px; height: 26px; padding: 0; font-size: 13px; line-height: 1; }
.ops-modal-body { padding: 14px 16px 2px; overflow: auto; }
.ops-modal-foot { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-top: .5px solid var(--dsw-alias-border-l1, #ffffff0f); background: var(--dsw-alias-bg-layer-2, #2c2c2e); }
@keyframes ops-modal-in { from { opacity: 0; } to { opacity: 1; } }

/* Confirm dialog (delete). The device being removed is the only thing the user
   must check, so it is shown as a labelled fact list rather than prose: a
   paraphrase in a sentence is what people skim past. */
.ops-confirm-target { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-sm, 8px); background: var(--dsw-alias-bg-layer-2, #1e1f23); }
.ops-confirm-target div { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.ops-confirm-target span { flex: none; width: 52px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-confirm-target b { flex: 1; min-width: 0; font-size: 13px; line-height: 20px; font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-confirm-warn { font-size: 12.5px; line-height: 20px; color: var(--dsw-alias-state-error-primary, #f85149); }

/* Device list search + pagination. The rail shows ~20 cards comfortably; past
   that, scrolling becomes the only way to reach a device and the cards are tall
   enough that the target is off-screen most of the time. */
.ops-toolbar { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.ops-search { flex: 1; min-width: 0; position: relative; display: flex; align-items: center; }
.ops-search .ops-input { padding-left: 26px; }
.ops-search-mark { position: absolute; left: 8px; font-size: 12px; line-height: 1; color: var(--dsw-alias-label-caption, #81858c); pointer-events: none; }
.ops-search-clear { position: absolute; right: 6px; width: 20px; height: 20px; padding: 0; border: none; background: transparent; color: var(--dsw-alias-label-tertiary, #9a9aa6); cursor: pointer; font-size: 12px; line-height: 1; border-radius: var(--dsw-radius-xs, 4px); }
.ops-search-clear:hover { background: var(--dsw-alias-interactive-bg-hover, #ffffff14); color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-pager { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding-top: 10px; border-top: .5px solid var(--dsw-alias-border-l2, #2a2a36); }
.ops-pager-info { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); font-variant-numeric: tabular-nums; }
.ops-pager-acts { margin-left: auto; display: flex; align-items: center; gap: 6px; }

/* Device cards \u2014 a table forced a 6-column squeeze into a narrow right rail;
   stacked cards keep the identity readable and the actions thumb-reachable. */
.ops-list { display: flex; flex-direction: column; gap: 10px; }
.ops-dev { border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-md, 12px); background: var(--dsw-alias-bg-layer-2, #1e1f23); padding: 12px 14px 10px; box-shadow: var(--dsw-shadow-lv1, 0 1px 3px 0 rgba(0,0,0,.18)); transition: border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), box-shadow var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), transform var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-dev:hover { border-color: var(--dsw-alias-border-l4, #4a4d55); box-shadow: var(--dsw-shadow-lv2, 0 6px 16px 0 rgba(0,0,0,.22)); transform: translateY(-1px); }
/* The name row holds the lamp, the identity and the two ways in. It wraps: at
   rail width the lamp plus a truncated name are the part worth keeping, and a
   button group that refuses to shrink would shove both off the card. */
.ops-dev-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
/* Name and address are one identity (m05901). The account and the SSH or web
   port live on in the lamp's tooltip and in the edit dialog; printing them
   under every name made the list read like a database dump. */
.ops-dev-id { display: flex; align-items: baseline; gap: 8px; flex: 1 1 auto; min-width: 0; }
.ops-dev-name { font-size: 14px; line-height: 22px; font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-dev-ip { flex: none; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-dev-note { margin-top: 6px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-caption, #81858c); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* m05847 \u2014 the two ways in, parked on the name row so the card opens with how
   to get onto the box instead of with record-management verbs. */
.ops-dev-logins { display: flex; align-items: center; gap: 6px; flex: none; margin-left: auto; }
.ops-btn.login { gap: 5px; padding: 4px 11px; font-size: 12px; line-height: 18px; font-weight: 500; background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, #2c2c2e) 55%, transparent); border-color: var(--dsw-alias-border-l2, #3a414b); }
.ops-btn.login:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #ffffff14); border-color: var(--dsw-alias-border-l4, #4a4d55); }
.ops-btn.login svg { flex: none; opacity: .9; }
/* The CLI path is the everyday one, so it keeps the faintest accent tint at
   rest and deepens on hover; WebUI stays neutral. Needed explicitly because
   .login sets a background that would otherwise win over .primary on equal
   specificity. */
.ops-btn.login.cli { color: var(--dsw-alias-state-business-primary, #4176e6); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 32%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 8%, transparent); }
.ops-btn.login.cli:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 14%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 48%, transparent); }
.ops-btn.login.cli:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 24%, var(--dsw-alias-bg-layer-3, #2c2c2e)); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 55%, transparent); }
/* m05915 \u2014 the liveness verdict as a lamp, not as a word. Nothing renders
   before the first scan: a lamp that is merely unlit would read as a verdict,
   and "not looked at yet" is not one. The glow is the point \u2014 a status light
   that does not glow reads as a painted dot, not as "this box is on". */
.ops-dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-border-l4, #4a4d55); }
.ops-dot.online { background: var(--dsw-alias-state-success-primary, #22c55e); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 22%, transparent), 0 0 8px 1px color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 55%, transparent); }
.ops-dot.offline { background: var(--dsw-alias-state-error-primary, #f85149); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 22%, transparent), 0 0 8px 1px color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 50%, transparent); }
.ops-dot.probing { background: var(--dsw-alias-label-caption, #81858c); box-shadow: 0 0 6px 0 color-mix(in srgb, var(--dsw-alias-label-caption, #81858c) 45%, transparent); animation: ops-blink 1.1s ease-in-out infinite; }
@keyframes ops-blink { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
.ops-dev-acts { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding-top: 10px; margin-top: 10px; border-top: .5px solid var(--dsw-alias-border-l2, #2a2a36); }
.ops-dev-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 7px; }
/* A native <select> keeps the OS popup, so appearance:auto stays \u2014 but then the
   UA paints its own background, which is WHITE in dark mode. Text colour comes
   from the theme (near-white), so every CJK label vanished white-on-white.
   Pin the fill to the themed layer colour and keep the theme's border. */
.ops-select { appearance: auto; cursor: pointer; background-color: var(--dsw-alias-bg-layer-2, #2c2c2e); color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-select option { background-color: var(--dsw-alias-bg-layer-2, #2c2c2e); color: var(--dsw-alias-label-primary, #f9fafb); }

/* WebUI login (m05288). The verdict lives under the buttons rather than in the
   top-level banner because it is per device: a banner can only say one thing at
   a time, and the operator pressing \u767B\u5F55 on three boxes needs to see all three
   outcomes. The captcha state gets the warn colour because it is the one state
   that needs the operator to go and do something, in the window, by hand. */
.ops-webui { display: flex; align-items: flex-start; gap: 6px; margin-top: 8px; padding: 6px 9px; border-radius: var(--dsw-radius-sm, 8px); font-size: 12px; line-height: 18px; border: 1px solid transparent; }
.ops-webui b { flex: none; font-weight: 500; }
.ops-webui span { min-width: 0; word-break: break-word; }
.ops-webui.ready { color: var(--dsw-alias-state-success-primary, #22c55e); background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 10%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 26%, transparent); }
.ops-webui.captcha { color: var(--dsw-alias-state-warn-label, #dd8629); background: color-mix(in srgb, var(--dsw-alias-state-warn-label, #dd8629) 12%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-state-warn-label, #dd8629) 28%, transparent); }
.ops-webui.error { color: var(--dsw-alias-state-error-primary, #f85149); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 10%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 26%, transparent); }

/* Badges / status dots */
.ops-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; line-height: 18px; padding: 1px 9px; border-radius: 999px; }
.ops-badge b { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
.ops-badge.ready { color: var(--dsw-alias-state-success-primary, #22c55e); background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 14%, transparent); }
.ops-badge.connecting { color: var(--dsw-alias-state-business-primary, #4176e6); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 14%, transparent); }
.ops-badge.error { color: var(--dsw-alias-state-error-primary, #f85149); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 14%, transparent); }
.ops-badge.idle { color: var(--dsw-alias-label-secondary, #cfd3d6); background: color-mix(in srgb, var(--dsw-alias-label-tertiary, #9a9aa6) 16%, transparent); }
.ops-badge.agent { color: var(--dsw-alias-state-warn-label, #dd8629); background: color-mix(in srgb, var(--dsw-alias-state-warn-label, #dd8629) 16%, transparent); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-badge.type { color: var(--dsw-alias-state-business-primary, #4176e6); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 14%, transparent); }

/* Messages */
.ops-msg { display: flex; align-items: flex-start; gap: 8px; padding: 9px 12px; margin-bottom: 12px; border-radius: var(--dsw-radius-sm, 8px); font-size: 12.5px; line-height: 20px; border: 1px solid transparent; }
.ops-msg.ok { color: var(--dsw-alias-state-success-primary, #22c55e); background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 10%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 28%, transparent); }
.ops-msg.err { color: var(--dsw-alias-state-error-primary, #f85149); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 10%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 28%, transparent); }
.ops-msg code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; flex: 1; min-width: 0; }
.ops-msg-acts { display: flex; gap: 6px; margin-top: 8px; }

/* Empty state */
.ops-empty { border: 1.5px dashed var(--dsw-alias-border-l3, #3a414b); border-radius: var(--dsw-radius-md, 12px); padding: 26px 16px; text-align: center; color: var(--dsw-alias-label-tertiary, #9a9aa6); font-size: 12.5px; line-height: 20px; }
.ops-empty b { display: block; font-size: 13.5px; line-height: 20px; font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); margin-bottom: 4px; }
.ops-loading { display: flex; align-items: center; gap: 8px; color: var(--dsw-alias-label-tertiary, #9a9aa6); font-size: 12.5px; line-height: 20px; padding: 18px 2px; }

/* Terminal. The right rail is narrow, so the identity row wraps internally
   instead of clipping the agent badge against the action buttons. */
.ops-term-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 6px 2px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-term-id { display: inline-flex; align-items: center; gap: 7px; min-width: 0; flex: 1 1 auto; flex-wrap: wrap; overflow: hidden; }
.ops-term-id b { font-size: 13px; line-height: 18px; font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-term-id code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; color: var(--dsw-alias-label-caption, #81858c); }
.ops-term-acts { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-shrink: 0; }
/* The canvas is artwork, not a themed surface: a terminal must stay dark even
   in the light palette, so this one color is deliberately literal. */
.ops-term-canvas { flex: 1; min-height: 0; background: #0d0d12; border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-md, 12px); padding: 6px 4px; overflow: hidden; }
.ops-conns { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.ops-conns-label { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); margin-right: 2px; }

/* Session log. A single column of sessions; the transcript opens in a dialog
   (m03664), because two columns in a ~400px rail squeezed both \u2014 the session
   names truncated to unreadable slivers and the transcript got the leftovers. */
.ops-logs { display: flex; flex-direction: column; gap: 10px; }
.ops-log-list { display: flex; flex-direction: column; gap: 6px; }
.ops-log-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-log-row { display: block; width: 100%; text-align: left; font-family: inherit; cursor: pointer; border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-sm, 8px); background: var(--dsw-alias-bg-layer-2, #1e1f23); padding: 8px 11px; color: inherit; transition: border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-log-row:hover { border-color: var(--dsw-alias-border-l4, #4a4d55); }
.ops-log-row-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ops-log-row-top b { font-size: 13px; line-height: 20px; font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-log-row-meta { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-top: 4px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-log-row-meta code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.ops-log-row-sub { margin-top: 3px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-caption, #81858c); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-log-detail { border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-md, 12px); background: var(--dsw-alias-bg-layer-2, #1e1f23); padding: 12px 14px; }
.ops-log-detail-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13.5px; }
.ops-log-detail-head b { font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-log-detail-head code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; color: var(--dsw-alias-label-caption, #81858c); }
/* Inside a dialog the detail sits on the dialog's own surface, so it drops its
   frame and padding: a panel-in-a-panel is noise. */
.ops-modal .ops-log-detail { border: none; border-radius: 0; background: none; padding: 0; }
.ops-log-detail-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 6px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-log-detail-acts { margin-top: 8px; }
.ops-log-entries { margin-top: 8px; border-top: .5px solid var(--dsw-alias-border-l2, #2a2a36); }
.ops-log-entry { display: flex; align-items: baseline; gap: 7px; padding: 4px 0; border-bottom: .5px solid var(--dsw-alias-border-l1, #202027); font-size: 12px; line-height: 18px; }
.ops-log-entry-time { flex: none; color: var(--dsw-alias-label-caption, #81858c); font-variant-numeric: tabular-nums; }
.ops-log-entry-kind { flex: none; width: 10px; text-align: center; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-log-entry-src { flex: none; min-width: 34px; color: var(--dsw-alias-label-caption, #81858c); }
.ops-log-entry-text { flex: 1; min-width: 0; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; color: var(--dsw-alias-label-secondary, #cfd3d6); word-break: break-all; white-space: pre-wrap; }
.ops-log-entry.command .ops-log-entry-text { color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-log-entry.event .ops-log-entry-text { color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-log-entry.input .ops-log-entry-text { color: var(--dsw-alias-label-caption, #81858c); }
`;
var stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  try {
    const id = "dsh-hillstone-cli-ops-style";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = panelCss;
    document.head.appendChild(el);
  } catch {
  }
}
var STATUS_TEXT = {
  connecting: "\u8FDE\u63A5\u4E2D",
  ready: "\u5DF2\u8FDE\u63A5",
  closed: "\u5DF2\u65AD\u5F00",
  error: "\u8FDE\u63A5\u5F02\u5E38"
};
var STATUS_CLASS = {
  connecting: "connecting",
  ready: "ready",
  closed: "idle",
  error: "error"
};
function StatusBadge({ status }) {
  return (0, import_react.createElement)(
    "span",
    { className: "ops-badge " + (STATUS_CLASS[status] || "idle") },
    (0, import_react.createElement)("b", null),
    STATUS_TEXT[status] || status
  );
}
function Field({ label, hint, ...rest }) {
  return (0, import_react.createElement)(
    "label",
    { className: "ops-field" },
    (0, import_react.createElement)("span", { className: "ops-label" }, label, hint ? (0, import_react.createElement)("i", null, hint) : null),
    (0, import_react.createElement)("input", { className: "ops-input", ...rest })
  );
}
var PAGE_SIZE = 20;
var WEBUI_TEXT = {
  idle: "\u672A\u767B\u5F55",
  ready: "\u5DF2\u767B\u5F55",
  captcha: "\u9700\u4EBA\u5DE5\u5B8C\u6210",
  error: "\u5931\u8D25"
};
function WebUiVerdict({ state }) {
  return (0, import_react.createElement)(
    "div",
    { className: "ops-webui " + state.status, title: state.message || state.url },
    (0, import_react.createElement)("b", null, `WebUI ${WEBUI_TEXT[state.status] ?? state.status}`),
    (0, import_react.createElement)("span", null, state.message || state.url)
  );
}
var LIVENESS_TEXT = { online: "\u7AEF\u53E3\u53EF\u8FBE", offline: "\u7AEF\u53E3\u4E0D\u53EF\u8FBE", probing: "\u68C0\u6D4B\u4E2D" };
var LIVENESS_TITLE = {
  online: "TCP \u63E1\u624B\u6210\u529F\uFF1A\u8FD9\u53F0\u8BBE\u5907\u7684 SSH \u7AEF\u53E3\u5728\u76D1\u542C\uFF0C\u8D26\u53F7\u5BC6\u7801\u5C1A\u672A\u6821\u9A8C\u3002",
  offline: "TCP \u63E1\u624B\u5931\u8D25\uFF1A\u8BBE\u5907\u5173\u673A\u3001IP \u4E0D\u901A\uFF0C\u6216\u88AB\u9632\u706B\u5899\u62E6\u622A\u4E86 SSH \u7AEF\u53E3\u3002",
  probing: "\u6B63\u5728\u505A TCP \u8FDE\u63A5\u6D4B\u8BD5\u2026"
};
var livenessStore = {};
var livenessListeners = /* @__PURE__ */ new Set();
function subscribeLiveness(fn) {
  livenessListeners.add(fn);
  return () => {
    livenessListeners.delete(fn);
  };
}
function putLiveness(next) {
  livenessStore = next;
  for (const fn of [...livenessListeners]) fn();
}
function LivenessDot({ liveness, port }) {
  const cls = liveness.state === "online" ? "online" : liveness.state === "offline" ? "offline" : "probing";
  const detail = liveness.state === "online" && liveness.ms !== void 0 ? `${LIVENESS_TEXT[cls]}\uFF08${liveness.ms}ms\uFF09` : LIVENESS_TEXT[cls];
  return (0, import_react.createElement)("span", {
    className: "ops-dot " + cls,
    role: "img",
    "aria-label": detail,
    // The error is the actionable part of a failed probe (refused vs timeout vs
    // unreachable), so it goes in the tooltip rather than being flattened away.
    title: [detail, LIVENESS_TITLE[cls], `SSH ${liveness.ip}:${port ?? liveness.port}`, liveness.error].filter(Boolean).join("\n")
  });
}
function OpsModal({ title, onClose, foot, children }) {
  const downInside = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    const onDown = (e) => {
      downInside.current = !!e.target && !!e.target.closest?.(".ops-modal");
    };
    const onClick = (e) => {
      if (downInside.current) return;
      if (!e.target?.closest?.(".ops-modal")) onClose();
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [onClose]);
  const panel = (0, import_react.createElement)(
    "div",
    { className: "ops-modal", role: "dialog", "aria-modal": false, "aria-label": typeof title === "string" ? title : void 0 },
    (0, import_react.createElement)(
      "div",
      { className: "ops-modal-head" },
      (0, import_react.createElement)("b", null, title),
      (0, import_react.createElement)("button", { className: "ops-btn plain ops-modal-close", onClick: onClose, "aria-label": "\u5173\u95ED", title: "\u5173\u95ED" }, "\u2715")
    ),
    (0, import_react.createElement)("div", { className: "ops-modal-body" }, children),
    foot ? (0, import_react.createElement)("div", { className: "ops-modal-foot" }, foot) : null
  );
  const scrim = (0, import_react.createElement)("div", { className: "ops-modal-scrim" }, panel);
  if (typeof document !== "undefined" && typeof import_react_dom.createPortal === "function") return (0, import_react_dom.createPortal)(scrim, document.body);
  return scrim;
}
function ConfirmDialog({ title, lines, warning, confirmText, onConfirm, onClose }) {
  return (0, import_react.createElement)(
    OpsModal,
    { title, onClose, foot: (0, import_react.createElement)(
      import_react.Fragment,
      null,
      (0, import_react.createElement)("button", { className: "ops-btn danger", onClick: onConfirm, autoFocus: true }, confirmText),
      (0, import_react.createElement)("button", { className: "ops-btn plain", onClick: onClose }, "\u53D6\u6D88")
    ) },
    (0, import_react.createElement)(
      "div",
      { className: "ops-confirm-target" },
      lines.map((l, i) => (0, import_react.createElement)("div", { key: i }, (0, import_react.createElement)("span", null, l.label), (0, import_react.createElement)("b", { title: typeof l.value === "string" ? l.value : void 0 }, l.value)))
    ),
    warning ? (0, import_react.createElement)("div", { className: "ops-confirm-warn" }, warning) : null
  );
}
var EMPTY_FORM = {
  name: "",
  ip: "",
  account: "",
  password: "",
  port: "22",
  webPort: "",
  deviceType: "next-gen-firewall",
  note: ""
};
function formFrom(d, name2) {
  return {
    name: name2 ?? d.name,
    ip: d.ip,
    account: d.account,
    password: "",
    port: String(d.port),
    webPort: d.webPort ? String(d.webPort) : "",
    deviceType: d.deviceType ?? "other",
    note: d.note || ""
  };
}
function defaultCopyName(source, all) {
  const taken = new Set(all.map((d) => d.name));
  const base = `${source.name}-\u526F\u672C`;
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base} (${n})`)) n++;
  return `${base} (${n})`;
}
function DeviceDialog({ editing, copyFrom, form, setForm, busy, notice, error, onSave, onClose }) {
  const isNew = !editing.id || editing.id === "__new__";
  const set = (patch) => setForm({ ...form, ...patch });
  const title = copyFrom ? `\u65B0\u589E\u8BBE\u5907 \xB7 \u590D\u5236\u81EA ${copyFrom.name}` : isNew ? "\u65B0\u589E\u8BBE\u5907" : `\u7F16\u8F91\u8BBE\u5907 \xB7 ${editing.name ?? ""}`;
  return (0, import_react.createElement)(OpsModal, {
    title,
    onClose,
    foot: (0, import_react.createElement)(
      import_react.Fragment,
      null,
      (0, import_react.createElement)("button", { className: "ops-btn primary", onClick: onSave, disabled: busy }, busy ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58"),
      (0, import_react.createElement)("button", { className: "ops-btn plain", onClick: onClose, disabled: busy }, "\u53D6\u6D88")
    ),
    children: (0, import_react.createElement)(
      import_react.Fragment,
      null,
      error ? (0, import_react.createElement)("div", { className: "ops-msg err", style: { marginBottom: 12 } }, (0, import_react.createElement)("code", null, error)) : null,
      notice ? (0, import_react.createElement)("div", { className: "ops-msg ok", style: { marginBottom: 12 } }, (0, import_react.createElement)("code", null, notice)) : null,
      (0, import_react.createElement)(
        "div",
        { className: "ops-grid2" },
        Field({ label: "\u8BBE\u5907\u540D\u79F0", value: form.name, placeholder: "\u4F8B\u5982\uFF1A\u6838\u5FC3\u4EA4\u6362\u673A", onChange: (e) => set({ name: e.target.value }) }),
        Field({ label: "IP \u5730\u5740", value: form.ip, placeholder: "\u4F8B\u5982\uFF1A192.168.1.10", onChange: (e) => set({ ip: e.target.value }) }),
        (0, import_react.createElement)(
          "label",
          { className: "ops-field" },
          (0, import_react.createElement)("span", { className: "ops-label" }, "\u8BBE\u5907\u7C7B\u578B"),
          (0, import_react.createElement)("select", {
            className: "ops-input ops-select",
            value: form.deviceType,
            onChange: (e) => set({ deviceType: e.target.value })
          }, DEVICE_TYPES.map((t) => (0, import_react.createElement)("option", { key: t, value: t }, DEVICE_TYPE_LABELS[t])))
        ),
        Field({ label: "\u8D26\u53F7", value: form.account, placeholder: "admin", onChange: (e) => set({ account: e.target.value }) }),
        // On a copy the host duplicates the ciphertext, so an empty box means
        // "same password as 核心交换机" rather than "no password" — worth spelling
        // out, because on this dialog an empty box means the opposite in edit mode.
        Field({ label: "\u5BC6\u7801", hint: copyFrom ? "\u7559\u7A7A\u7EE7\u627F\u539F\u8BBE\u5907" : isNew ? "\u5FC5\u586B" : "\u7559\u7A7A\u8868\u793A\u4E0D\u4FEE\u6539", type: "password", value: form.password, onChange: (e) => set({ password: e.target.value }) }),
        Field({ label: "SSH \u7AEF\u53E3", value: form.port, placeholder: "22", onChange: (e) => set({ port: e.target.value }) }),
        Field({ label: "Web \u7AEF\u53E3", hint: "\u7BA1\u7406\u9875\u9762", value: form.webPort, placeholder: "443", onChange: (e) => set({ webPort: e.target.value }) }),
        Field({ label: "\u5907\u6CE8", value: form.note, placeholder: "\u53EF\u9009", onChange: (e) => set({ note: e.target.value }) })
      )
    )
  });
}
function CliIcon() {
  return (0, import_react.createElement)(
    "svg",
    { viewBox: "0 0 16 16", width: 12, height: 12, "aria-hidden": "true", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" },
    (0, import_react.createElement)("path", { d: "M3 4.5 6.5 8 3 11.5" }),
    (0, import_react.createElement)("path", { d: "M8.5 12h4.5" })
  );
}
function WebIcon() {
  return (0, import_react.createElement)(
    "svg",
    { viewBox: "0 0 16 16", width: 12, height: 12, "aria-hidden": "true", fill: "none", stroke: "currentColor", strokeWidth: 1.4 },
    (0, import_react.createElement)("circle", { cx: 8, cy: 8, r: 5.6 }),
    (0, import_react.createElement)("path", { d: "M2.6 8h10.8" }),
    (0, import_react.createElement)("path", { d: "M8 2.4c1.6 2 2.4 3.6 2.4 5.6S9.6 11.6 8 13.6c-1.6-2-2.4-3.6-2.4-5.6S6.4 4.4 8 2.4z" })
  );
}
function DeviceManager() {
  const [devices, setDevices] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [editing, setEditing] = (0, import_react.useState)(null);
  const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
  const [formNotice, setFormNotice] = (0, import_react.useState)(null);
  const [formError, setFormError] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [msg, setMsg] = (0, import_react.useState)(null);
  const [removing, setRemoving] = (0, import_react.useState)(null);
  const [copyFrom, setCopyFrom] = (0, import_react.useState)(null);
  const [query, setQuery] = (0, import_react.useState)("");
  const [page, setPage] = (0, import_react.useState)(1);
  const [, bumpLiveness] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => subscribeLiveness(() => bumpLiveness((n) => n + 1)), []);
  const liveness = livenessStore;
  const [probing, setProbing] = (0, import_react.useState)(false);
  const [webUi, setWebUi] = (0, import_react.useState)({});
  const [webUiBusy, setWebUiBusy] = (0, import_react.useState)(null);
  const webLogin = async (d) => {
    if (webUiBusy) return;
    setWebUiBusy(d.id);
    setWebUi((prev) => ({
      ...prev,
      [d.id]: { deviceId: d.id, url: "", status: "idle", at: (/* @__PURE__ */ new Date()).toISOString(), message: "\u6B63\u5728\u6253\u5F00\u6D4F\u89C8\u5668\u5E76\u767B\u5F55\u2026" }
    }));
    try {
      const j = await api("/web-login", { method: "POST", body: { deviceId: d.id } });
      const state = j.state;
      if (state) setWebUi((prev) => ({ ...prev, [d.id]: state }));
      else setMsg({ kind: "err", text: `WebUI \u767B\u5F55\u5931\u8D25\uFF1Ahost \u6CA1\u6709\u8FD4\u56DE\u7ED3\u679C\uFF08${d.name}\uFF09` });
    } catch (e) {
      const text = `WebUI \u767B\u5F55\u5931\u8D25\uFF1A${e.message}`;
      setWebUi((prev) => ({
        ...prev,
        [d.id]: { deviceId: d.id, url: "", status: "error", at: (/* @__PURE__ */ new Date()).toISOString(), message: text }
      }));
    } finally {
      setWebUiBusy(null);
    }
  };
  const webLoginClose = async (d) => {
    setWebUiBusy(d.id);
    try {
      await api("/web-login/close", { method: "POST", body: { deviceId: d.id } });
      setWebUi((prev) => {
        const next = { ...prev };
        delete next[d.id];
        return next;
      });
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setWebUiBusy(null);
    }
  };
  const refresh = (0, import_react.useCallback)(async () => {
    setLoading(true);
    try {
      const j = await api("/devices");
      setDevices(j.devices || []);
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setLoading(false);
    }
  }, []);
  const refreshWebUi = (0, import_react.useCallback)(async () => {
    try {
      const j = await api("/web-login");
      const next = {};
      for (const s of j.states || []) next[s.deviceId] = s;
      setWebUi((prev) => {
        if (webUiBusy && prev[webUiBusy]?.message === "\u6B63\u5728\u6253\u5F00\u6D4F\u89C8\u5668\u5E76\u767B\u5F55\u2026") {
          return { ...next, [webUiBusy]: prev[webUiBusy] };
        }
        return next;
      });
    } catch {
    }
  }, [webUiBusy]);
  (0, import_react.useEffect)(() => {
    refresh();
  }, [refresh]);
  (0, import_react.useEffect)(() => {
    refreshWebUi();
    const iv = setInterval(() => void refreshWebUi(), 8e3);
    return () => clearInterval(iv);
  }, [refreshWebUi]);
  const openCreate = () => {
    setEditing({ id: "__new__" });
    setForm({ ...EMPTY_FORM });
    setCopyFrom(null);
    setFormNotice(null);
    setFormError(null);
  };
  const openEdit = (d) => {
    setEditing(d);
    setForm(formFrom(d));
    setCopyFrom(null);
    setFormNotice(null);
    setFormError(null);
  };
  const openCopy = (source) => {
    setEditing({ id: "__new__" });
    setForm(formFrom(source, defaultCopyName(source, devices)));
    setCopyFrom(source);
    setFormNotice(`\u5DF2\u590D\u5236\u300C${source.name}\u300D\u7684\u4FE1\u606F\uFF0C\u4FDD\u5B58\u540E\u521B\u5EFA\u65B0\u8BBE\u5907\uFF08\u5BC6\u7801\u7EE7\u627F\u539F\u8BBE\u5907\uFF09`);
    setFormError(null);
  };
  const closeForm = () => {
    setEditing(null);
    setCopyFrom(null);
  };
  const save = async () => {
    const isNew = !editing?.id || editing.id === "__new__";
    if (!form.name || !form.ip || !form.account || isNew && !copyFrom && !form.password) {
      setFormError(copyFrom ? "\u540D\u79F0 / IP / \u8D26\u53F7 \u4E0D\u80FD\u4E3A\u7A7A" : "\u540D\u79F0 / IP / \u8D26\u53F7 / \u5BC6\u7801\uFF08\u65B0\u5EFA\u65F6\u5FC5\u586B\uFF09\u4E0D\u80FD\u4E3A\u7A7A");
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name,
        ip: form.ip,
        account: form.account,
        port: Number(form.port) || 22,
        deviceType: form.deviceType,
        // An empty web-port box must clear the stored value, so send null
        // rather than omitting the key (omitted means "leave alone" on PUT).
        webPort: form.webPort.trim() ? Number(form.webPort) : null,
        note: form.note
      };
      if (copyFrom) {
        const j = await api(`/devices/${copyFrom.id}/copy`, {
          method: "POST",
          body: { ...payload, password: form.password || void 0 }
        });
        const created = j?.device;
        if (!created?.id || created.id === copyFrom.id) {
          setFormError("\u590D\u5236\u5931\u8D25\uFF1Ahost \u6CA1\u6709\u8FD4\u56DE\u65B0\u8BBE\u5907\uFF0C\u5DF2\u653E\u5F03\u4FDD\u5B58\uFF08\u6CA1\u6709\u5199\u5165\u4EFB\u4F55\u8BB0\u5F55\uFF09");
          return;
        }
        setMsg({ kind: "ok", text: `\u5DF2\u4FDD\u5B58\uFF1A\u65B0\u589E\u300C${created.name}\u300D\uFF08\u542B\u539F\u8BBE\u5907\u5BC6\u7801\uFF09` });
      } else if (isNew) {
        await api("/devices", { method: "POST", body: { ...payload, password: form.password } });
        setMsg({ kind: "ok", text: "\u5DF2\u4FDD\u5B58" });
      } else {
        await api(`/devices/${editing.id}`, { method: "PUT", body: { ...payload, password: form.password || void 0 } });
        setMsg({ kind: "ok", text: "\u5DF2\u4FDD\u5B58" });
      }
      closeForm();
      refresh();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id) => {
    setBusy(true);
    try {
      await api(`/devices/${id}`, { method: "DELETE" });
      setRemoving(null);
      setMsg({ kind: "ok", text: `\u5DF2\u5220\u9664\u300C${devices.find((d) => d.id === id)?.name ?? "\u8BBE\u5907"}\u300D` });
      refresh();
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setBusy(false);
    }
  };
  const [connectingId, setConnectingId] = (0, import_react.useState)(null);
  const connectDevice = async (d) => {
    setConnectingId(d.id);
    setMsg({ kind: "ok", text: `\u6B63\u5728\u8FDE\u63A5 ${d.name}\u2026` });
    try {
      await requestConnect(d.id, d.name);
    } finally {
      setConnectingId(null);
    }
  };
  const scanLiveness = async () => {
    if (probing) return;
    setProbing(true);
    putLiveness({
      ...livenessStore,
      ...Object.fromEntries(devices.map((d) => [d.id, { deviceId: d.id, ip: d.ip, port: d.port, state: "probing" }]))
    });
    try {
      const j = await api("/devices/ping", { method: "POST", body: {} });
      const results = j.results || [];
      putLiveness({
        ...livenessStore,
        ...Object.fromEntries(results.map((r) => [r.deviceId, r]))
      });
      const up = results.filter((r) => r.state === "online").length;
      setMsg({
        kind: "ok",
        text: results.length ? `\u5B58\u6D3B\u68C0\u6D4B\uFF1A${up}/${results.length} \u53F0 SSH \u7AEF\u53E3\u53EF\u8FBE` : "\u6CA1\u6709\u53EF\u68C0\u6D4B\u7684\u8BBE\u5907"
      });
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setProbing(false);
    }
  };
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = devices.filter((d) => {
    if (!terms.length) return true;
    const hay = [d.name, d.ip, d.account, d.note, DEVICE_TYPE_LABELS[d.deviceType ?? "other"]].filter(Boolean).join(" ").toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const knownIds = new Set(devices.map((d) => d.id));
  const liveLiveness = Object.fromEntries(Object.entries(liveness).filter(([id]) => knownIds.has(id)));
  const liveWebUi = Object.fromEntries(Object.entries(webUi).filter(([id]) => knownIds.has(id)));
  return (0, import_react.createElement)(
    import_react.Fragment,
    null,
    (0, import_react.createElement)(
      "div",
      { className: "ops-head" },
      (0, import_react.createElement)(
        "div",
        null,
        (0, import_react.createElement)("h2", { className: "ops-title" }, "\u8BBE\u5907\u7BA1\u7406"),
        (0, import_react.createElement)(
          "div",
          { className: "ops-sub" },
          filtered.length === devices.length ? `\u5171 ${devices.length} \u53F0\u8BBE\u5907` : `\u5339\u914D ${filtered.length} / ${devices.length} \u53F0\u8BBE\u5907`
        )
      ),
      (0, import_react.createElement)(
        "div",
        { className: "ops-head-right" },
        (0, import_react.createElement)("button", {
          className: "ops-btn",
          onClick: () => void scanLiveness(),
          disabled: probing || devices.length === 0,
          title: "\u5BF9\u6BCF\u53F0\u8BBE\u5907\u7684 SSH \u7AEF\u53E3\u505A\u4E00\u6B21 TCP \u8FDE\u63A5\u6D4B\u8BD5\uFF08\u4E0D\u5EFA\u7ACB SSH \u4F1A\u8BDD\uFF09"
        }, probing ? "\u68C0\u6D4B\u4E2D\u2026" : "\u68C0\u6D4B\u5B58\u6D3B"),
        (0, import_react.createElement)("button", { className: "ops-btn", onClick: () => void refresh(), disabled: loading }, "\u5237\u65B0"),
        (0, import_react.createElement)("button", { className: "ops-btn primary", onClick: openCreate, disabled: busy }, "+ \u65B0\u589E\u8BBE\u5907")
      )
    ),
    msg && (0, import_react.createElement)("div", { className: "ops-msg " + (msg.kind === "ok" ? "ok" : "err") }, (0, import_react.createElement)("code", null, msg.text)),
    devices.length > 0 && (0, import_react.createElement)(
      "div",
      { className: "ops-toolbar" },
      (0, import_react.createElement)(
        "div",
        { className: "ops-search" },
        (0, import_react.createElement)("span", { className: "ops-search-mark" }, "\u2315"),
        (0, import_react.createElement)("input", {
          className: "ops-input",
          value: query,
          placeholder: "\u641C\u7D22\u540D\u79F0 / IP / \u8D26\u53F7 / \u5907\u6CE8",
          onChange: (e) => {
            setQuery(e.target.value);
            setPage(1);
          }
        }),
        query ? (0, import_react.createElement)("button", {
          className: "ops-search-clear",
          onClick: () => {
            setQuery("");
            setPage(1);
          },
          "aria-label": "\u6E05\u9664\u641C\u7D22",
          title: "\u6E05\u9664"
        }, "\u2715") : null
      )
    ),
    editing && (0, import_react.createElement)(DeviceDialog, {
      editing,
      copyFrom,
      form,
      setForm,
      busy,
      notice: formNotice,
      error: formError,
      onSave: () => void save(),
      onClose: closeForm
    }),
    removing && (0, import_react.createElement)(ConfirmDialog, {
      title: "\u5220\u9664\u8BBE\u5907",
      lines: [
        { label: "\u540D\u79F0", value: removing.name },
        { label: "IP", value: `${removing.ip}:${removing.port}` },
        { label: "\u8D26\u53F7", value: removing.account },
        { label: "\u7C7B\u578B", value: DEVICE_TYPE_LABELS[removing.deviceType ?? "other"] }
      ],
      warning: "\u5220\u9664\u540E\u65E0\u6CD5\u6062\u590D\uFF0C\u8BE5\u8BBE\u5907\u7684\u5BC6\u7801\u4E0E\u914D\u7F6E\u4F1A\u4E00\u5E76\u79FB\u9664\u3002\u5DF2\u4FDD\u5B58\u7684\u8FDE\u63A5\u65E5\u5FD7\u4F1A\u4FDD\u7559\u3002",
      confirmText: "\u5220\u9664",
      onConfirm: () => void remove(removing.id),
      onClose: () => setRemoving(null)
    }),
    loading && devices.length === 0 ? (0, import_react.createElement)("div", { className: "ops-loading" }, "\u52A0\u8F7D\u4E2D\u2026") : devices.length === 0 ? (0, import_react.createElement)(
      "div",
      { className: "ops-empty" },
      (0, import_react.createElement)("b", null, "\u8FD8\u6CA1\u6709\u8BBE\u5907"),
      "\u70B9\u51FB\u53F3\u4E0A\u89D2\u300C+ \u65B0\u589E\u8BBE\u5907\u300D\u5F55\u5165\u7B2C\u4E00\u53F0\u8BBE\u5907\uFF0C\u4FDD\u5B58\u540E\u5373\u53EF\u4E00\u952E\u8FDE\u63A5 SSH \u7EC8\u7AEF\u3002"
    ) : filtered.length === 0 ? (0, import_react.createElement)(
      "div",
      { className: "ops-empty" },
      (0, import_react.createElement)("b", null, "\u6CA1\u6709\u5339\u914D\u7684\u8BBE\u5907"),
      `\u6CA1\u6709\u8BBE\u5907\u5305\u542B\u300C${query.trim()}\u300D\uFF0C\u6362\u4E2A\u5173\u952E\u8BCD\u6216\u6E05\u9664\u641C\u7D22\u3002`
    ) : (0, import_react.createElement)(
      import_react.Fragment,
      null,
      (0, import_react.createElement)("div", { className: "ops-list" }, pageItems.map((d) => {
        const live = liveLiveness[d.id];
        const wu = liveWebUi[d.id];
        const wuBusy = webUiBusy === d.id;
        return (0, import_react.createElement)(
          "div",
          { key: d.id, className: "ops-dev" },
          (0, import_react.createElement)(
            "div",
            { className: "ops-dev-top" },
            live ? (0, import_react.createElement)(LivenessDot, { liveness: live, port: d.port }) : null,
            (0, import_react.createElement)(
              "div",
              { className: "ops-dev-id" },
              (0, import_react.createElement)("span", { className: "ops-dev-name", title: d.name }, d.name),
              (0, import_react.createElement)("code", { className: "ops-dev-ip", title: `${d.account}@${d.ip}:${d.port}` }, d.ip)
            ),
            // m05847: the two ways onto the box, both on the name row and
            // right-aligned. They are one decision ("get me onto this
            // device"), so they sit together; 编辑/复制/删除 are record
            // management and stay on the row below.
            (0, import_react.createElement)(
              "div",
              { className: "ops-dev-logins" },
              (0, import_react.createElement)("button", {
                className: "ops-btn login cli primary",
                onClick: () => connectDevice(d),
                disabled: connectingId === d.id,
                title: `\u7528 ${d.account} \u6253\u5F00 ${d.ip}:${d.port} \u7684 SSH \u7EC8\u7AEF\uFF08CLI\uFF09`
              }, (0, import_react.createElement)(CliIcon), connectingId === d.id ? "\u8FDE\u63A5\u4E2D\u2026" : "CLI \u767B\u5F55"),
              // m05288: opens the management UI in a real browser window and
              // logs in with the stored account. The password is filled in by
              // the host, so this button never has one to send.
              (0, import_react.createElement)("button", {
                className: "ops-btn login web" + (wu?.status === "ready" ? " on" : ""),
                onClick: () => void webLogin(d),
                disabled: wuBusy,
                title: `\u6253\u5F00 ${d.ip} \u7684 Web \u7BA1\u7406\u754C\u9762\u5E76\u81EA\u52A8\u767B\u5F55\uFF08\u7528\u8BBE\u5907\u8868\u91CC\u4FDD\u5B58\u7684\u8D26\u53F7\u5BC6\u7801\uFF09`
              }, (0, import_react.createElement)(WebIcon), wuBusy ? "\u767B\u5F55\u4E2D\u2026" : "WebUI \u767B\u5F55")
            )
          ),
          (0, import_react.createElement)(
            "div",
            { className: "ops-dev-tags" },
            (0, import_react.createElement)("span", { className: "ops-badge type", title: "\u8BBE\u5907\u7C7B\u578B" }, DEVICE_TYPE_LABELS[d.deviceType ?? "other"])
          ),
          d.note ? (0, import_react.createElement)("div", { className: "ops-dev-note", title: d.note }, d.note) : null,
          (0, import_react.createElement)(
            "div",
            { className: "ops-dev-acts" },
            (0, import_react.createElement)("button", { className: "ops-btn sm", onClick: () => openEdit(d) }, "\u7F16\u8F91"),
            (0, import_react.createElement)("button", {
              className: "ops-btn sm",
              onClick: () => openCopy(d),
              title: `\u4EE5\u300C${d.name}\u300D\u7684\u4FE1\u606F\u9884\u586B\u65B0\u589E\u8868\u5355\uFF08\u542B\u5DF2\u4FDD\u5B58\u7684\u5BC6\u7801\uFF09\uFF0C\u70B9\u4FDD\u5B58\u540E\u624D\u521B\u5EFA`
            }, "\u590D\u5236"),
            (0, import_react.createElement)("button", { className: "ops-btn sm plain danger", onClick: () => setRemoving(d) }, "\u5220\u9664"),
            // Only offered while a window is actually open: a close
            // control that appears unconditionally teaches the operator
            // to press a button that does nothing.
            wu ? (0, import_react.createElement)("button", {
              className: "ops-btn sm plain",
              onClick: () => void webLoginClose(d),
              disabled: wuBusy,
              title: "\u5173\u95ED\u8BE5\u8BBE\u5907\u7684\u7BA1\u7406\u754C\u9762\u7A97\u53E3"
            }, "\u5173\u95ED\u7A97\u53E3") : null
          ),
          wu ? (0, import_react.createElement)(WebUiVerdict, { state: wu }) : null
        );
      })),
      totalPages > 1 && (0, import_react.createElement)(
        "div",
        { className: "ops-pager" },
        (0, import_react.createElement)(
          "span",
          { className: "ops-pager-info" },
          `\u7B2C ${currentPage}/${totalPages} \u9875 \xB7 ${filtered.length} \u53F0`
        ),
        (0, import_react.createElement)(
          "div",
          { className: "ops-pager-acts" },
          (0, import_react.createElement)("button", {
            className: "ops-btn sm",
            disabled: currentPage <= 1,
            onClick: () => setPage(currentPage - 1)
          }, "\u4E0A\u4E00\u9875"),
          (0, import_react.createElement)("button", {
            className: "ops-btn sm",
            disabled: currentPage >= totalPages,
            onClick: () => setPage(currentPage + 1)
          }, "\u4E0B\u4E00\u9875")
        )
      )
    )
  );
}
var TERM_THEME = {
  background: "#0d0d12",
  foreground: "#e8e8ec",
  cursor: "#e8e8ec",
  cursorAccent: "#0d0d12",
  selectionBackground: "rgba(122, 152, 205, 0.35)",
  black: "#1b1e25",
  red: "#f85149",
  green: "#3fb950",
  yellow: "#d6a419",
  blue: "#4c8dff",
  magenta: "#bc8cff",
  cyan: "#39c5cf",
  white: "#c3c9d4",
  brightBlack: "#6b7280",
  brightRed: "#ff8078",
  brightGreen: "#5ad46a",
  brightYellow: "#e8c05a",
  brightBlue: "#79b8ff",
  brightMagenta: "#d2a8ff",
  brightCyan: "#56d4dd",
  brightWhite: "#f2f5f9"
};
var TERM_FONT = '"Cascadia Mono", "JetBrains Mono", Consolas, "SF Mono", Menlo, "DejaVu Sans Mono", monospace';
var FONT_SIZES = [11, 12, 13, 14, 16, 18];
var DEFAULT_FONT = 2;
var INPUT_FLUSH_MS = 8;
var INPUT_MAX = 4096;
var OUT_MAX = 512 * 1024;
function TerminalPane({ conn }) {
  const containerRef = (0, import_react.useRef)(null);
  const termRef = (0, import_react.useRef)(null);
  const fitRef = (0, import_react.useRef)(null);
  const esRef = (0, import_react.useRef)(null);
  const sizeObserverRef = (0, import_react.useRef)(null);
  const pushSizeRef = (0, import_react.useRef)(null);
  const [status, setStatus] = (0, import_react.useState)(conn.status);
  const [agentCmd, setAgentCmd] = (0, import_react.useState)(null);
  const [fontIdx, setFontIdx] = (0, import_react.useState)(DEFAULT_FONT);
  const [inputErr, setInputErr] = (0, import_react.useState)(null);
  const [link, setLink] = (0, import_react.useState)("up");
  (0, import_react.useEffect)(() => {
    const el = containerRef.current;
    if (!el) return;
    ensureXtermCss();
    const term = new import_xterm.Terminal({
      convertEol: true,
      fontFamily: TERM_FONT,
      fontSize: FONT_SIZES[fontIdx],
      lineHeight: 1.25,
      scrollback: 2e4,
      cursorBlink: true,
      cursorStyle: "bar",
      drawBoldTextInBrightColors: true,
      theme: TERM_THEME
    });
    const fit = new import_xterm_addon_fit.FitAddon();
    term.loadAddon(fit);
    term.open(el);
    try {
      fit.fit();
    } catch {
    }
    termRef.current = term;
    fitRef.current = fit;
    let pending = "";
    let dropped = 0;
    let cancelPaint = null;
    const flushOut = () => {
      cancelPaint = null;
      if (!pending) return;
      const text = pending;
      pending = "";
      try {
        term.write(text);
      } catch {
      }
      if (dropped > 0) {
        const n = dropped;
        dropped = 0;
        try {
          term.write(`\r
\x1B[33m[\u754C\u9762\u6765\u4E0D\u53CA\u7ED8\u5236\uFF0C\u5DF2\u7701\u7565 ${n} \u6279\u8F93\u51FA]\x1B[0m\r
`);
        } catch {
        }
      }
    };
    const paint = () => {
      if (cancelPaint) return;
      if (typeof requestAnimationFrame === "function") {
        const id = requestAnimationFrame(flushOut);
        cancelPaint = () => cancelAnimationFrame(id);
      } else {
        const id = window.setTimeout(flushOut, 16);
        cancelPaint = () => window.clearTimeout(id);
      }
    };
    const pushOut = (text) => {
      pending += text;
      if (pending.length > OUT_MAX) {
        pending = pending.slice(-OUT_MAX);
        dropped += 1;
      }
      paint();
    };
    const pushSize = () => {
      const { cols, rows } = term;
      if (!cols || !rows) return;
      api("/conn/resize", { method: "POST", body: { connId: conn.connId, cols, rows } }).catch(() => {
      });
    };
    pushSizeRef.current = pushSize;
    pushSize();
    term.onResize(pushSize);
    const onResize = () => {
      try {
        fit.fit();
      } catch {
      }
      pushSize();
    };
    window.addEventListener("resize", onResize);
    if (typeof ResizeObserver !== "undefined") {
      try {
        const ro = new ResizeObserver(onResize);
        ro.observe(el);
        sizeObserverRef.current = ro;
      } catch {
      }
    }
    let inputBuf = "";
    let inputTimer;
    const flushInput = () => {
      if (inputTimer !== void 0) {
        window.clearTimeout(inputTimer);
        inputTimer = void 0;
      }
      if (!inputBuf) return;
      const data = inputBuf;
      inputBuf = "";
      api("/conn/input", { method: "POST", body: { connId: conn.connId, data } }).then(
        () => setInputErr(null),
        (e) => setInputErr(`\u8F93\u5165\u672A\u9001\u8FBE\u8BBE\u5907\uFF1A${e.message}`)
      );
    };
    const pushInput = (data) => {
      inputBuf += data;
      if (inputBuf.length >= INPUT_MAX) flushInput();
      else if (inputTimer === void 0) inputTimer = window.setTimeout(flushInput, INPUT_FLUSH_MS);
    };
    const onData = term.onData((d) => pushInput(d));
    let stopped = false;
    let seenStream = false;
    let retries = 0;
    let retryTimer;
    let es = null;
    const open = () => {
      if (stopped) return;
      const s = new EventSource(API + `/conn/${conn.connId}/stream`);
      es = s;
      esRef.current = s;
      s.addEventListener("data", (ev) => {
        let p;
        try {
          p = JSON.parse(ev.data);
        } catch {
          return;
        }
        const text = typeof p?.text === "string" ? p.text : "";
        if (p?.snapshot && seenStream) {
          pending = "";
          try {
            term.reset();
          } catch {
          }
        }
        if (text) {
          seenStream = true;
          pushOut(text);
        }
      });
      s.addEventListener("status", (ev) => {
        try {
          const p = JSON.parse(ev.data);
          setStatus(p.status);
          if (p.status === "closed" || p.status === "error") stopped = true;
        } catch {
        }
      });
      s.addEventListener("agent", (ev) => {
        try {
          const p = JSON.parse(ev.data);
          setAgentCmd(p.active ? String(p.command ?? "") : null);
        } catch {
        }
      });
      s.onerror = () => {
        try {
          s.close();
        } catch {
        }
        if (es === s) esRef.current = null;
        if (stopped) return;
        setLink("down");
        retries += 1;
        const wait = Math.min(5e3, 250 * 2 ** Math.min(retries, 5));
        retryTimer = window.setTimeout(open, wait);
      };
    };
    open();
    return () => {
      stopped = true;
      if (retryTimer !== void 0) window.clearTimeout(retryTimer);
      cancelPaint?.();
      if (inputTimer !== void 0) window.clearTimeout(inputTimer);
      onData.dispose();
      window.removeEventListener("resize", onResize);
      pushSizeRef.current = null;
      try {
        sizeObserverRef.current?.disconnect();
      } catch {
      }
      sizeObserverRef.current = null;
      try {
        esRef.current?.close();
      } catch {
      }
      try {
        term.dispose();
      } catch {
      }
    };
  }, [conn.connId]);
  (0, import_react.useEffect)(() => {
    const term = termRef.current;
    if (!term) return;
    try {
      term.options.fontSize = FONT_SIZES[fontIdx];
    } catch {
    }
    try {
      fitRef.current?.fit();
    } catch {
    }
    pushSizeRef.current?.();
  }, [fontIdx]);
  const fontSmaller = fontIdx > 0;
  const fontBigger = fontIdx < FONT_SIZES.length - 1;
  return (0, import_react.createElement)(
    "div",
    { style: { display: "flex", flexDirection: "column", height: "100%" } },
    (0, import_react.createElement)(
      "div",
      { className: "ops-term-bar" },
      (0, import_react.createElement)(
        "span",
        { className: "ops-term-id" },
        (0, import_react.createElement)("b", null, conn.deviceName),
        (0, import_react.createElement)(StatusBadge, { status: status || "connecting" }),
        (0, import_react.createElement)("code", null, conn.connId.slice(0, 8)),
        // While the agent drives this shell, say so — the command is typed by
        // the host, not by the operator, and the output below is live.
        agentCmd ? (0, import_react.createElement)("span", { className: "ops-badge agent", title: "Agent \u6B63\u5728\u8FD9\u6761\u4F1A\u8BDD\u4E0A\u6267\u884C\u547D\u4EE4\uFF0C\u56DE\u663E\u4F1A\u5B9E\u65F6\u51FA\u73B0\u5728\u4E0B\u65B9" }, `agent: ${agentCmd}`) : null,
        link === "down" ? (0, import_react.createElement)("span", { className: "ops-badge error", title: "\u8F93\u51FA\u6D41\u5DF2\u65AD\u5F00\uFF0C\u6B63\u5728\u81EA\u52A8\u91CD\u8FDE\u5E76\u6062\u590D\u6EDA\u5C4F" }, "\u8F93\u51FA\u6D41\u65AD\u5F00\uFF0C\u91CD\u8FDE\u4E2D\u2026") : null,
        inputErr ? (0, import_react.createElement)("span", { className: "ops-badge error", title: "\u8F93\u5165\u6CA1\u6709\u9001\u8FBE\u8BBE\u5907\uFF0C\u68C0\u67E5\u8FDE\u63A5\u540E\u91CD\u8BD5" }, inputErr) : null
      ),
      (0, import_react.createElement)(
        "span",
        { className: "ops-term-acts" },
        (0, import_react.createElement)("button", {
          className: "ops-btn sm plain",
          disabled: !fontSmaller,
          title: "\u7F29\u5C0F\u5B57\u53F7",
          onClick: () => setFontIdx((i) => Math.max(0, i - 1))
        }, "A-"),
        (0, import_react.createElement)("button", {
          className: "ops-btn sm plain",
          disabled: !fontBigger,
          title: "\u653E\u5927\u5B57\u53F7",
          onClick: () => setFontIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))
        }, "A+"),
        (0, import_react.createElement)("button", { className: "ops-btn sm", onClick: () => {
          try {
            termRef.current?.clear();
          } catch {
          }
        } }, "\u6E05\u5C4F"),
        (0, import_react.createElement)("button", { className: "ops-btn sm danger", onClick: () => api("/disconnect", { method: "POST", body: { connId: conn.connId } }).catch(() => {
        }) }, "\u65AD\u5F00")
      )
    ),
    (0, import_react.createElement)("div", { ref: containerRef, className: "ops-term-canvas" })
  );
}
function fmtTime(iso) {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function fmtInput(text) {
  return text.replace(/\r/g, "\u23CE").replace(/\n/g, "\u23CE").replace(/\x7f|\x08/g, "\u232B").replace(/\x03/g, "^C").replace(/\x1b\[([A-Za-z])/g, "^[").replace(/[\x00-\x1f]/g, "");
}
var SOURCE_LABEL = { operator: "\u64CD\u4F5C\u5458", agent: "Agent", system: "\u7CFB\u7EDF" };
function LogTab() {
  const [logs, setLogs] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [msg, setMsg] = (0, import_react.useState)(null);
  const [activeId, setActiveId] = (0, import_react.useState)(null);
  const [detail, setDetail] = (0, import_react.useState)(null);
  const [detailLoading, setDetailLoading] = (0, import_react.useState)(false);
  const [showInput, setShowInput] = (0, import_react.useState)(false);
  const refresh = (0, import_react.useCallback)(async () => {
    setLoading(true);
    try {
      const j = await api("/logs");
      setLogs(j.logs || []);
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setLoading(false);
    }
  }, []);
  (0, import_react.useEffect)(() => {
    refresh();
    const iv = setInterval(refresh, 5e3);
    return () => clearInterval(iv);
  }, [refresh]);
  (0, import_react.useEffect)(() => {
    if (!activeId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    api(`/logs/${encodeURIComponent(activeId)}`).then((j) => {
      if (!cancelled) setDetail(j.log);
    }).catch((e) => {
      if (!cancelled) setMsg({ kind: "err", text: e.message });
    }).finally(() => {
      if (!cancelled) setDetailLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeId]);
  const entries = (detail?.entries || []).filter((e) => showInput || e.kind !== "input");
  const commandCount = (detail?.entries || []).filter((e) => e.kind === "command").length;
  return (0, import_react.createElement)(
    import_react.Fragment,
    null,
    (0, import_react.createElement)(
      "div",
      { className: "ops-head" },
      (0, import_react.createElement)(
        "div",
        null,
        (0, import_react.createElement)("h2", { className: "ops-title" }, "\u65E5\u5FD7"),
        (0, import_react.createElement)(
          "div",
          { className: "ops-sub" },
          logs.length ? `\u5171 ${logs.length} \u6B21\u8FDE\u63A5\u8BB0\u5F55 \xB7 \u4FDD\u7559\u6700\u8FD1 30 \u5929` : "\u6682\u65E0\u8FDE\u63A5\u8BB0\u5F55"
        )
      ),
      (0, import_react.createElement)(
        "div",
        { className: "ops-head-right" },
        (0, import_react.createElement)("button", { className: "ops-btn", onClick: () => void refresh(), disabled: loading }, "\u5237\u65B0")
      )
    ),
    msg && (0, import_react.createElement)("div", { className: "ops-msg " + (msg.kind === "ok" ? "ok" : "err") }, (0, import_react.createElement)("code", null, msg.text)),
    // The transcript lives in a dialog now (m03664), so the log tab is a list of
    // sessions and nothing else. Two columns in a 400px rail meant the session
    // names were truncated to unreadable slivers; the list gets the full width
    // and the detail gets a readable card.
    detail && (0, import_react.createElement)(
      OpsModal,
      {
        title: (0, import_react.createElement)(
          import_react.Fragment,
          null,
          (0, import_react.createElement)("span", { className: "ops-log-title" }, detail.deviceName),
          (0, import_react.createElement)(StatusBadge, { status: detail.active ? "ready" : "closed" })
        ),
        onClose: () => setActiveId(null)
      },
      detailLoading ? (0, import_react.createElement)("div", { className: "ops-loading" }, "\u52A0\u8F7D\u4E2D\u2026") : (0, import_react.createElement)(
        import_react.Fragment,
        null,
        (0, import_react.createElement)(
          "div",
          { className: "ops-log-detail-meta" },
          (0, import_react.createElement)("span", null, `\u4F1A\u8BDD ${detail.connId.slice(0, 8)}`),
          (0, import_react.createElement)("span", null, `\u5F00\u59CB ${fmtTime(detail.startedAt)}`),
          (0, import_react.createElement)("span", null, `\u7ED3\u675F ${fmtTime(detail.endedAt)}`),
          (0, import_react.createElement)("span", null, `\u547D\u4EE4 ${commandCount} \u6761`),
          detail.deviceType ? (0, import_react.createElement)("span", null, DEVICE_TYPE_LABELS[detail.deviceType] ?? detail.deviceType) : null
        ),
        (0, import_react.createElement)(
          "div",
          { className: "ops-log-detail-acts" },
          (0, import_react.createElement)("button", {
            className: "ops-btn sm" + (showInput ? " on" : ""),
            onClick: () => setShowInput((v) => !v),
            title: "\u9010\u5B57\u7B26\u7684\u8F93\u5165\u8BB0\u5F55\u566A\u97F3\u5F88\u5927\uFF0C\u9ED8\u8BA4\u6298\u53E0"
          }, showInput ? "\u9690\u85CF\u9010\u952E\u8F93\u5165" : "\u663E\u793A\u9010\u952E\u8F93\u5165")
        ),
        entries.length === 0 ? (0, import_react.createElement)("div", { className: "ops-empty" }, "\u8BE5\u8BB0\u5F55\u6CA1\u6709\u53EF\u663E\u793A\u7684\u6761\u76EE") : (0, import_react.createElement)("div", { className: "ops-log-entries" }, entries.map(
          (e) => (0, import_react.createElement)(
            "div",
            { key: e.seq, className: "ops-log-entry " + e.kind },
            (0, import_react.createElement)("span", { className: "ops-log-entry-time" }, fmtTime(e.at).slice(6)),
            (0, import_react.createElement)("span", { className: "ops-log-entry-kind" }, e.kind === "command" ? "$" : e.kind === "event" ? "\u2022" : "\u2328"),
            (0, import_react.createElement)("span", { className: "ops-log-entry-src" }, SOURCE_LABEL[e.source || "system"] || e.source),
            (0, import_react.createElement)(
              "code",
              { className: "ops-log-entry-text" },
              e.kind === "input" ? fmtInput(e.text) : e.text
            )
          )
        ))
      )
    ),
    loading && logs.length === 0 ? (0, import_react.createElement)("div", { className: "ops-loading" }, "\u52A0\u8F7D\u4E2D\u2026") : logs.length === 0 ? (0, import_react.createElement)(
      "div",
      { className: "ops-empty" },
      (0, import_react.createElement)("b", null, "\u8FD8\u6CA1\u6709\u8FDE\u63A5\u8BB0\u5F55"),
      "\u6BCF\u6B21\u8FDE\u63A5\u8BBE\u5907\u90FD\u4F1A\u5728\u8FD9\u91CC\u7559\u4E0B\u4E00\u6761\u8BB0\u5F55\uFF0C\u5305\u542B\u64CD\u4F5C\u5458\u8F93\u5165\u7684\u547D\u4EE4\u3001Agent \u6267\u884C\u7684\u547D\u4EE4\u548C\u8FDE\u63A5\u4E8B\u4EF6\u3002"
    ) : (0, import_react.createElement)(
      "div",
      { className: "ops-logs" },
      (0, import_react.createElement)(
        "div",
        { className: "ops-log-list" },
        logs.map(
          (l) => (0, import_react.createElement)(
            "button",
            {
              key: l.id,
              className: "ops-log-row",
              onClick: () => setActiveId(l.id)
            },
            (0, import_react.createElement)(
              "div",
              { className: "ops-log-row-top" },
              (0, import_react.createElement)("b", null, l.deviceName || "\u672A\u77E5\u8BBE\u5907"),
              l.active ? (0, import_react.createElement)("span", { className: "ops-badge ready" }, "\u8FDB\u884C\u4E2D") : (0, import_react.createElement)("span", { className: "ops-badge idle" }, "\u5DF2\u7ED3\u675F")
            ),
            (0, import_react.createElement)(
              "div",
              { className: "ops-log-row-meta" },
              (0, import_react.createElement)("code", null, (l.connId || "").slice(0, 8) || "\u2014"),
              (0, import_react.createElement)("span", null, "\xB7"),
              (0, import_react.createElement)("span", null, l.account || "\u2014"),
              (0, import_react.createElement)("span", null, "\xB7"),
              (0, import_react.createElement)("span", null, fmtTime(l.startedAt))
            ),
            (0, import_react.createElement)("div", { className: "ops-log-row-sub" }, `${l.entryCount} \u6761\u8BB0\u5F55 \xB7 ${l.endReason || (l.active ? "\u8FDB\u884C\u4E2D" : "\u5DF2\u7ED3\u675F")}`)
          )
        )
      )
    )
  );
}
function TerminalTab() {
  const [conns, setConns] = (0, import_react.useState)([]);
  const [activeConn, setActiveConn] = (0, import_react.useState)(null);
  const [connecting, setConnecting] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const refreshConns = (0, import_react.useCallback)(async () => {
    try {
      const j = await api("/conn");
      setConns(j.connections || []);
    } catch {
    }
  }, []);
  (0, import_react.useEffect)(() => {
    refreshConns();
    const iv = setInterval(refreshConns, 3e3);
    return () => clearInterval(iv);
  }, [refreshConns]);
  (0, import_react.useEffect)(() => {
    if (!conns.length) return;
    setActiveConn(
      (cur) => cur && conns.some((c) => c.connId === cur) ? cur : conns[conns.length - 1].connId
    );
    for (const c of conns) seenConnIds.add(c.connId);
  }, [conns]);
  (0, import_react.useEffect)(() => onPendingConnect(() => {
    if (!pendingConnect) return;
    const { result, error: error2 } = takePendingConnect();
    if (result) {
      setConns((prev) => [...prev.filter((c) => c.connId !== result.connId), result]);
      setActiveConn(result.connId);
    }
    if (error2) setError(error2);
    setConnecting(false);
  }), []);
  const active = conns.find((c) => c.connId === activeConn);
  return (0, import_react.createElement)(
    import_react.Fragment,
    null,
    (0, import_react.createElement)(
      "div",
      { className: "ops-head" },
      (0, import_react.createElement)(
        "div",
        null,
        (0, import_react.createElement)("h2", { className: "ops-title" }, "\u7EC8\u7AEF"),
        (0, import_react.createElement)("div", { className: "ops-sub" }, conns.length ? `${conns.length} \u6761\u6D3B\u52A8\u8FDE\u63A5` : "\u6682\u65E0\u6D3B\u52A8\u8FDE\u63A5")
      ),
      (0, import_react.createElement)(
        "div",
        { className: "ops-head-right" },
        (0, import_react.createElement)("button", { className: "ops-btn", onClick: () => void refreshConns() }, "\u5237\u65B0\u8FDE\u63A5")
      )
    ),
    error && (0, import_react.createElement)("div", { className: "ops-msg err" }, (0, import_react.createElement)("code", null, error)),
    connecting && (0, import_react.createElement)("div", { className: "ops-loading" }, "\u6B63\u5728\u8FDE\u63A5\u2026"),
    conns.length > 0 ? (0, import_react.createElement)(
      "div",
      { className: "ops-conns" },
      (0, import_react.createElement)("span", { className: "ops-conns-label" }, "\u4F1A\u8BDD"),
      conns.map((c) => (0, import_react.createElement)("button", { key: c.connId, className: "ops-btn sm" + (c.connId === activeConn ? " on" : ""), onClick: () => setActiveConn(c.connId) }, c.deviceName))
    ) : !connecting ? (0, import_react.createElement)(
      "div",
      { className: "ops-empty" },
      (0, import_react.createElement)("b", null, "\u6682\u65E0\u8FDE\u63A5"),
      "\u8FDE\u63A5\u6210\u529F\u540E\u4F1A\u81EA\u52A8\u5207\u5230\u8FD9\u4E2A\u9875\u9762\u3002\u5728\u300C\u8BBE\u5907\u7BA1\u7406\u300D\u4E2D\u70B9\u51FB\u300CCLI \u767B\u5F55\u300D\uFF0C\u6216\u8BA9 agent \u8C03\u7528 hillstone_open_terminal\uFF0C\u5373\u53EF\u5728\u8FD9\u91CC\u6253\u5F00 SSH \u7EC8\u7AEF\u3002"
    ) : null,
    (0, import_react.createElement)("div", { style: { flex: 1, minHeight: 320 } }, active ? (0, import_react.createElement)(TerminalPane, { key: active.connId, conn: active }) : null)
  );
}
var TIME_STEP_MINUTES = 15;
var TIME_OPTIONS = (() => {
  const out = [""];
  for (let m = 0; m < 24 * 60; m += TIME_STEP_MINUTES) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    out.push(`${hh}:${mm}`);
  }
  return out;
})();
function windowValue(stored) {
  const s = (stored || "").trim();
  if (!s || TIME_OPTIONS.includes(s)) return s;
  return OFF_GRID_OPTION_PREFIX + s;
}
var OFF_GRID_OPTION_PREFIX = "keep:";
function offGridOption(stored, label) {
  const s = (stored || "").trim();
  if (!s || TIME_OPTIONS.includes(s)) return null;
  return (0, import_react.createElement)("option", { key: OFF_GRID_OPTION_PREFIX + s, value: OFF_GRID_OPTION_PREFIX + s }, `${label} ${s}\uFF08\u975E\u6574\u523B\u5EA6\uFF09`);
}
function unwindowValue(v) {
  return v.startsWith(OFF_GRID_OPTION_PREFIX) ? v.slice(OFF_GRID_OPTION_PREFIX.length) : v;
}
function describeWindow(win) {
  if (!win || !win.start && !win.end) return "\u59CB\u7EC8\u751F\u6548";
  const s = win.start || "00:00";
  const e = win.end || "24:00";
  return `\u6BCF\u65E5 ${s}\u2013${e}`;
}
var POLICY_TIMEZONE = "Asia/Shanghai";
var EMPTY_POLICY = {
  name: "",
  enabled: true,
  start: "",
  end: "",
  commands: "",
  note: ""
};
function PolicyManager() {
  const [policies, setPolicies] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [editing, setEditing] = (0, import_react.useState)(null);
  const [form, setForm] = (0, import_react.useState)(EMPTY_POLICY);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [formError, setFormError] = (0, import_react.useState)(null);
  const [msg, setMsg] = (0, import_react.useState)(null);
  const [removing, setRemoving] = (0, import_react.useState)(null);
  const refresh = (0, import_react.useCallback)(async () => {
    setLoading(true);
    try {
      const j = await api("/policies");
      setPolicies(j.policies || []);
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setLoading(false);
    }
  }, []);
  (0, import_react.useEffect)(() => {
    void refresh();
  }, [refresh]);
  const openCreate = () => {
    setEditing({});
    setForm({ ...EMPTY_POLICY });
    setFormError(null);
  };
  const openEdit = (p) => {
    setEditing({ id: p.id });
    setForm({
      name: p.name,
      enabled: p.enabled,
      start: p.window?.start || "",
      end: p.window?.end || "",
      commands: (p.commands || []).join("\n"),
      note: p.note || ""
    });
    setFormError(null);
  };
  const closeForm = () => setEditing(null);
  const save = async () => {
    const commands = form.commands.split("\n").map((c) => c.trim()).filter(Boolean);
    if (!form.name.trim() || commands.length === 0) {
      setFormError("\u7B56\u7565\u540D\u79F0\u4E0E\u81F3\u5C11\u4E00\u4E2A\u547D\u4EE4\u6A21\u5F0F\u5FC5\u586B");
      return;
    }
    const start = form.start.trim();
    const end = form.end.trim();
    const payload = {
      name: form.name.trim(),
      enabled: form.enabled,
      // A window needs at least one bound. `start === end` means "always" to a
      // reader (00:00–00:00 looks like a bug), and the host agrees in effect:
      // [start, end) with equal bounds is an empty range, so it would block
      // nothing while LOOKING armed. Say 始终生效 instead.
      window: start || end ? { start, end, timezone: POLICY_TIMEZONE } : void 0,
      commands,
      note: form.note.trim() || void 0
    };
    setBusy(true);
    setFormError(null);
    try {
      if (editing?.id) {
        await api(`/policies/${editing.id}`, { method: "PUT", body: payload });
        setMsg({ kind: "ok", text: `\u5DF2\u4FDD\u5B58\u7B56\u7565\u300C${payload.name}\u300D` });
      } else {
        await api("/policies", { method: "POST", body: payload });
        setMsg({ kind: "ok", text: `\u5DF2\u65B0\u5EFA\u7B56\u7565\u300C${payload.name}\u300D` });
      }
      closeForm();
      refresh();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id) => {
    setBusy(true);
    try {
      await api(`/policies/${id}`, { method: "DELETE" });
      setRemoving(null);
      setMsg({ kind: "ok", text: `\u5DF2\u5220\u9664\u7B56\u7565\u300C${removing?.name ?? ""}\u300D` });
      refresh();
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setBusy(false);
    }
  };
  return (0, import_react.createElement)(
    import_react.Fragment,
    null,
    (0, import_react.createElement)(
      "div",
      { className: "ops-head" },
      (0, import_react.createElement)(
        "div",
        null,
        (0, import_react.createElement)("h2", { className: "ops-title" }, "\u6267\u884C\u7B56\u7565"),
        (0, import_react.createElement)(
          "div",
          { className: "ops-sub" },
          loading ? "\u52A0\u8F7D\u4E2D\u2026" : policies.length ? `\u5171 ${policies.length} \u6761\u7B56\u7565` : "\u8FD8\u6CA1\u6709\u7B56\u7565"
        )
      ),
      (0, import_react.createElement)(
        "div",
        { className: "ops-head-right" },
        (0, import_react.createElement)("button", { className: "ops-btn", onClick: () => void refresh(), disabled: loading }, "\u5237\u65B0"),
        (0, import_react.createElement)("button", { className: "ops-btn primary", onClick: openCreate, disabled: busy }, "+ \u65B0\u589E\u7B56\u7565")
      )
    ),
    // The purpose line (m09323). It names the constrained party — the agent —
    // and the two entry points, because "限制哪些命令" reads as a panel-wide
    // filter until you know the operator's own terminal is untouched by design.
    (0, import_react.createElement)(
      "div",
      { className: "ops-intro" },
      (0, import_react.createElement)("b", null, "\u6267\u884C\u7B56\u7565\u7528\u4E8E\u9650\u5236 agent \u8C03\u7528\u8FD0\u7EF4\u5DE5\u5177\u65F6\u6267\u884C\u547D\u4EE4\u3002"),
      "\u6BCF\u6761\u7B56\u7565 = \u4E00\u4E2A\u65F6\u95F4\u7A97\u53E3 + \u4E00\u7EC4\u547D\u4EE4\u6A21\u5F0F\uFF1B\u547D\u4E2D\u5373\u62D2\u7EDD\uFF0C\u4E0D\u4E0B\u53D1\u5230\u8BBE\u5907\u3002",
      (0, import_react.createElement)(
        "span",
        { className: "ops-intro-scope" },
        "\u62E6\u622A\u70B9\uFF1Ahillstone_run_and_analyze\u3001hillstone_send_input\u3002\u4F60\u5728\u7EC8\u7AEF\u91CC\u624B\u52A8\u6572\u7684\u547D\u4EE4\u4E0D\u53D7\u5F71\u54CD\u3002"
      )
    ),
    msg && (0, import_react.createElement)("div", { className: "ops-msg " + (msg.kind === "ok" ? "ok" : "err") }, (0, import_react.createElement)("code", null, msg.text)),
    loading && policies.length === 0 ? (0, import_react.createElement)("div", { className: "ops-loading" }, "\u52A0\u8F7D\u4E2D\u2026") : policies.length === 0 ? (0, import_react.createElement)(
      "div",
      { className: "ops-empty" },
      (0, import_react.createElement)("b", null, "\u8FD8\u6CA1\u6709\u6267\u884C\u7B56\u7565"),
      "\u70B9\u51FB\u53F3\u4E0A\u89D2\u300C+ \u65B0\u589E\u7B56\u7565\u300D\u521B\u5EFA\u89C4\u5219\uFF1A\u9009\u62E9\u65F6\u95F4\u7A97\u53E3\u5E76\u586B\u5165\u8981\u9650\u5236\u7684\u547D\u4EE4\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09\u3002\u547D\u4E2D\u7B56\u7565\u7684\u547D\u4EE4\u5728 agent \u8C03\u7528\u8FD0\u7EF4\u5DE5\u5177\u65F6\u4F1A\u88AB\u62D2\u7EDD\u3002"
    ) : (0, import_react.createElement)("div", { className: "ops-list" }, policies.map(
      (p) => (0, import_react.createElement)(
        "div",
        { key: p.id, className: "ops-dev" },
        (0, import_react.createElement)(
          "div",
          { className: "ops-dev-top" },
          (0, import_react.createElement)(
            "div",
            { className: "ops-dev-id" },
            (0, import_react.createElement)("span", { className: "ops-dev-name", title: p.name }, p.name),
            (0, import_react.createElement)("code", { className: "ops-dev-ip" }, describeWindow(p.window))
          ),
          (0, import_react.createElement)(
            "div",
            { className: "ops-dev-logins" },
            (0, import_react.createElement)("button", {
              className: "ops-btn sm" + (p.enabled ? " on" : ""),
              title: p.enabled ? "\u70B9\u51FB\u505C\u7528" : "\u70B9\u51FB\u542F\u7528",
              onClick: async () => {
                try {
                  await api(`/policies/${p.id}`, { method: "PUT", body: { name: p.name, enabled: !p.enabled, commands: p.commands, note: p.note, window: p.window } });
                  refresh();
                } catch (e) {
                  setMsg({ kind: "err", text: e.message });
                }
              }
            }, p.enabled ? "\u5DF2\u542F\u7528" : "\u5DF2\u505C\u7528")
          )
        ),
        (0, import_react.createElement)(
          "div",
          { className: "ops-dev-tags" },
          (p.commands || []).map((c, i) => (0, import_react.createElement)("span", { key: i, className: "ops-badge type", title: `\u547D\u4E2D\u7684\u547D\u4EE4\u6A21\u5F0F\uFF1A${c}` }, c))
        ),
        p.note ? (0, import_react.createElement)("div", { className: "ops-dev-note", title: p.note }, p.note) : null,
        (0, import_react.createElement)(
          "div",
          { className: "ops-dev-acts" },
          (0, import_react.createElement)("button", { className: "ops-btn sm", onClick: () => openEdit(p) }, "\u7F16\u8F91"),
          (0, import_react.createElement)("button", { className: "ops-btn sm plain danger", onClick: () => setRemoving(p) }, "\u5220\u9664")
        )
      )
    )),
    editing && (0, import_react.createElement)(OpsModal, {
      title: editing.id ? "\u7F16\u8F91\u7B56\u7565" : "\u65B0\u589E\u7B56\u7565",
      onClose: closeForm,
      foot: (0, import_react.createElement)(
        import_react.Fragment,
        null,
        (0, import_react.createElement)("button", { className: "ops-btn primary", onClick: () => void save(), disabled: busy }, busy ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58"),
        (0, import_react.createElement)("button", { className: "ops-btn plain", onClick: closeForm, disabled: busy }, "\u53D6\u6D88")
      ),
      children: (0, import_react.createElement)(
        import_react.Fragment,
        null,
        formError ? (0, import_react.createElement)("div", { className: "ops-msg err", style: { marginBottom: 12 } }, (0, import_react.createElement)("code", null, formError)) : null,
        (0, import_react.createElement)(
          "div",
          { className: "ops-grid2" },
          (0, import_react.createElement)(
            "label",
            { className: "ops-field" },
            (0, import_react.createElement)("span", { className: "ops-label" }, "\u7B56\u7565\u540D\u79F0"),
            (0, import_react.createElement)("input", { className: "ops-input", value: form.name, placeholder: "\u4F8B\u5982\uFF1A\u591C\u95F4\u9AD8\u5371\u547D\u4EE4\u51BB\u7ED3", onChange: (e) => setForm({ ...form, name: e.target.value }) })
          ),
          (0, import_react.createElement)(
            "label",
            { className: "ops-field" },
            (0, import_react.createElement)("span", { className: "ops-label" }, "\u542F\u7528"),
            (0, import_react.createElement)(
              "label",
              { className: "ops-switch" },
              (0, import_react.createElement)("input", { type: "checkbox", checked: form.enabled, onChange: (e) => setForm({ ...form, enabled: e.target.checked }) }),
              (0, import_react.createElement)("span", { className: "ops-switch-track" })
            )
          ),
          (0, import_react.createElement)(
            "label",
            { className: "ops-field" },
            (0, import_react.createElement)("span", { className: "ops-label" }, "\u5F00\u59CB\u65F6\u95F4", (0, import_react.createElement)("i", null, "\u4E0D\u9650\u4E0B\u754C")),
            (0, import_react.createElement)("select", {
              className: "ops-input ops-select",
              value: windowValue(form.start),
              onChange: (e) => setForm({ ...form, start: unwindowValue(e.target.value) })
            }, offGridOption(form.start, "\u81EA") ?? null, TIME_OPTIONS.map((t) => (0, import_react.createElement)("option", { key: t || "any", value: t }, t || "\u4E0D\u9650")))
          ),
          (0, import_react.createElement)(
            "label",
            { className: "ops-field" },
            (0, import_react.createElement)("span", { className: "ops-label" }, "\u7ED3\u675F\u65F6\u95F4", (0, import_react.createElement)("i", null, "\u4E0D\u9650\u4E0A\u754C")),
            (0, import_react.createElement)("select", {
              className: "ops-input ops-select",
              value: windowValue(form.end),
              onChange: (e) => setForm({ ...form, end: unwindowValue(e.target.value) })
            }, offGridOption(form.end, "\u81EA") ?? null, TIME_OPTIONS.map((t) => (0, import_react.createElement)("option", { key: t || "any", value: t }, t || "\u4E0D\u9650")))
          ),
          (0, import_react.createElement)(
            "label",
            { className: "ops-field", style: { gridColumn: "1 / -1" } },
            (0, import_react.createElement)("span", { className: "ops-label" }, "\u547D\u4EE4\u6A21\u5F0F", (0, import_react.createElement)("i", null, "\u6BCF\u884C\u4E00\u4E2A\uFF0C\u8BCD\u8FB9\u754C\u5339\u914D")),
            (0, import_react.createElement)("textarea", { className: "ops-input ops-textarea", rows: 5, value: form.commands, placeholder: "reload\ndeleten\nerase", onChange: (e) => setForm({ ...form, commands: e.target.value }) })
          ),
          (0, import_react.createElement)(
            "label",
            { className: "ops-field", style: { gridColumn: "1 / -1" } },
            (0, import_react.createElement)("span", { className: "ops-label" }, "\u5907\u6CE8", (0, import_react.createElement)("i", null, "\u53EF\u9009")),
            (0, import_react.createElement)("input", { className: "ops-input", value: form.note, placeholder: "\u53EF\u9009", onChange: (e) => setForm({ ...form, note: e.target.value }) })
          )
        ),
        (0, import_react.createElement)("div", { className: "ops-form-hint" }, '\u65F6\u95F4\u7A97\u53E3\u4E3A\u7A7A\u8868\u793A\u59CB\u7EC8\u751F\u6548\uFF0C\u6B65\u8FDB 15 \u5206\u949F\uFF0C\u65F6\u533A\u56FA\u5B9A Asia/Shanghai\u3002\u547D\u4EE4\u6309\u8BCD\u8FB9\u754C\u5305\u542B\u5339\u914D\uFF08\u5982 "reload" \u547D\u4E2D "reload force"\uFF0C\u4F46\u4E0D\u547D\u4E2D "reloading"\uFF09\u3002')
      )
    }),
    removing && (0, import_react.createElement)(ConfirmDialog, {
      title: "\u5220\u9664\u7B56\u7565",
      lines: [
        { label: "\u540D\u79F0", value: removing.name },
        { label: "\u7A97\u53E3", value: describeWindow(removing.window) },
        { label: "\u547D\u4EE4", value: (removing.commands || []).join(" / ") }
      ],
      warning: "\u5220\u9664\u540E\u8BE5\u9650\u5236\u7ACB\u5373\u5931\u6548\uFF0C\u4E14\u65E0\u6CD5\u6062\u590D\u3002",
      confirmText: "\u5220\u9664",
      onConfirm: () => void remove(removing.id),
      onClose: () => setRemoving(null)
    })
  );
}
function OpsPage(props = {}) {
  const [tab, setTab] = (0, import_react.useState)("devices");
  const [tokenMsg, setTokenMsg] = (0, import_react.useState)(null);
  const [tokenInput, setTokenInput] = (0, import_react.useState)("");
  const sessionId = typeof props.sessionId === "string" && props.sessionId ? props.sessionId : panelSessionId;
  (0, import_react.useEffect)(() => {
    setTokenNotice((reason) => setTokenMsg(reason));
    return () => setTokenNotice(null);
  }, []);
  (0, import_react.useEffect)(() => onPendingConnect(() => setTab("terminal")), []);
  (0, import_react.useEffect)(() => {
    if (takePendingReveal(sessionId)) setTab("terminal");
    return onRevealTerminal(() => setTab("terminal"));
  }, [sessionId]);
  injectStyles();
  const TABS = { devices: "\u8BBE\u5907\u7BA1\u7406", terminal: "\u7EC8\u7AEF", logs: "\u65E5\u5FD7", policies: "\u6267\u884C\u7B56\u7565" };
  return (0, import_react.createElement)(
    "div",
    { className: "ops-root", style: { padding: "16px 16px 0", color: "var(--dsw-alias-label-primary, #e7e7ea)" } },
    (0, import_react.createElement)(
      "div",
      { className: "ops-seg" },
      Object.keys(TABS).map(
        (t) => (0, import_react.createElement)("button", { key: t, className: tab === t ? "on" : "", onClick: () => setTab(t) }, TABS[t])
      )
    ),
    // Token banner lives on the page shell so it is reachable from BOTH tabs.
    tokenMsg && (0, import_react.createElement)(
      "div",
      { className: "ops-msg err", style: { marginTop: 12 } },
      (0, import_react.createElement)("code", null, tokenMsg),
      (0, import_react.createElement)(
        "div",
        { className: "ops-msg-acts" },
        (0, import_react.createElement)("input", { className: "ops-input", style: { flex: 1 }, placeholder: "\u7C98\u8D34\u4EE4\u724C", value: tokenInput, onChange: (e) => setTokenInput(e.target.value) }),
        (0, import_react.createElement)("button", { className: "ops-btn primary", onClick: () => {
          setManualToken(tokenInput.trim());
          setTokenMsg(null);
          tokenProbed = false;
          location.reload();
        } }, "\u4FDD\u5B58\u4EE4\u724C\u5E76\u91CD\u8BD5")
      )
    ),
    (0, import_react.createElement)(
      "div",
      { style: { flex: 1, minHeight: 0, overflow: "auto", paddingBottom: 16 } },
      tab === "devices" ? (0, import_react.createElement)(DeviceManager, null) : tab === "terminal" ? (0, import_react.createElement)(TerminalTab, null) : tab === "logs" ? (0, import_react.createElement)(LogTab, null) : (0, import_react.createElement)(PolicyManager, null)
    )
  );
}
var IconComponent = () => (0, import_react.createElement)(
  "svg",
  { viewBox: "0 0 24 24", width: 18, height: 18, "aria-hidden": true, style: { display: "block" } },
  (0, import_react.createElement)("path", { fill: "currentColor", d: "M4 5h16v3H4zM4 10h16v3H4zM4 15h16v4H4z", opacity: 0.9 }),
  (0, import_react.createElement)("circle", { cx: 17.5, cy: 6.5, r: 1, fill: "currentColor" })
);
var name = "dsh-hillstone-cli-ops-client";
var inject = ["slots", "sidebarRightTabs", "sidebarRight", "uiWorkspace"];
var TAB_KIND = PANEL_ID;
function apply(ctx) {
  try {
    const unwatch = ctx.inject(
      ["sidebarRightTabs", "sidebarRight"],
      (sidebarCtx) => {
        try {
          ctx.sidebarRightTabs.register({
            id: TAB_KIND,
            kind: TAB_KIND,
            priority: "extension",
            title: () => "\u8BBE\u5907\u8FD0\u7EF4",
            guide: [
              {
                order: 20,
                title: () => "\u8BBE\u5907\u8FD0\u7EF4",
                description: () => "\u7BA1\u7406 Hillstone / StoneOS \u8BBE\u5907\uFF0C\u6253\u5F00 SSH \u7EC8\u7AEF\u3001\u67E5\u770B\u8FDE\u63A5\u5BA1\u8BA1\u65E5\u5FD7\uFF0C\u5E76\u7528\u300C\u6267\u884C\u7B56\u7565\u300D\u9650\u5B9A agent \u5728\u4F60\u8BBE\u5B9A\u7684\u65F6\u95F4\u7A97\u53E3\u5185\u4E0D\u5F97\u6267\u884C\u4F60\u6307\u5B9A\u7684\u547D\u4EE4\uFF1B\u8FDE\u63A5\u6210\u529F\u540E\u81EA\u52A8\u5207\u5230\u7EC8\u7AEF\u9875\uFF0C\u53EF\u76F4\u63A5\u770B\u5B9E\u65F6\u8F93\u51FA\u3002",
                icon: IconComponent
              }
            ]
          });
          ctx.slots.inject(
            "sidebar.right.pane.tab",
            () => ctx.slots.register(
              {
                name: "sidebar.right.pane.tab",
                key: TAB_KIND,
                // m04040: the right-sidebar tab slot is scoped to one Session and
                // hands its body the owning sessionId, which is the only place
                // the panel can learn which conversation it belongs to. Remember
                // it so requestConnect can name the origin.
                inject: (sessionId) => {
                  panelSessionId = typeof sessionId === "string" ? sessionId : null;
                  return { api: ctx };
                }
              },
              OpsPage
            )
          );
        } catch (error) {
          console.error("[dsh-hillstone-cli-ops] right tab registration failed:", error);
        }
        revealSidebar = (originSessionId) => {
          const openHere = () => {
            const sr = ctx.sidebarRight;
            sr.openTab(TAB_KIND);
            if (!sr.isExpanded()) sr.toggleExpanded();
          };
          try {
            const sr = ctx.sidebarRight;
            if (originSessionId && typeof sr.openTabIn === "function") {
              sr.openTabIn(originSessionId, TAB_KIND);
              if ((sr.tabsIn?.(originSessionId) ?? []).some((t) => t.kind === TAB_KIND)) return;
              console.info("[dsh-hillstone-cli-ops] origin session has no sidebar yet; opening it");
            }
            const mounted = sr.mounted?.getSnapshot?.();
            if (originSessionId && originSessionId !== mounted && typeof ctx.uiWorkspace?.openSession === "function") {
              ctx.uiWorkspace.openSession(originSessionId);
              const mountedNow = sr.mounted?.getSnapshot?.();
              if (originSessionId !== mountedNow) {
                setTimeout(() => {
                  try {
                    openHere();
                  } catch (error) {
                    console.warn("[dsh-hillstone-cli-ops] openTab after session switch failed:", error);
                  }
                }, 0);
                return;
              }
            }
            openHere();
          } catch (error) {
            console.warn("[dsh-hillstone-cli-ops] openTab failed:", error);
          }
        };
        return () => {
          if (revealSidebar) revealSidebar = null;
          panelSessionId = null;
          connectWatch?.();
          connectWatch = null;
        };
      }
    );
    void unwatch;
    startConnectWatch();
  } catch (error) {
    console.error("[dsh-hillstone-cli-ops] client failed to load:", error);
  }
}
return module.exports; } });
//# sourceMappingURL=client.js.map
