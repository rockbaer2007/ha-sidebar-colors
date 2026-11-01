/* Sidebar Colors 0.1.0 | MIT | https://github.com/rockbaer2007/ha-sidebar-colors */
(() => {
  // src/core.js
  var VERSION = "0.1.0";
  var STORE_KEY = "ugso_sidebar_colors_v1";
  function supportedVersion(version) {
    const match = /^(\d+)\.(\d+)\.(\d+)(?:\D.*)?$/.exec(version || "");
    if (!match) return false;
    const [, year, month, patch] = match.map(Number);
    return year > 2026 || year === 2026 && (month > 10 || month === 10 && patch >= 3);
  }
  function normalizeColor(color) {
    if (!color || typeof color.hex !== "string" || !/^#[0-9a-f]{6}$/i.test(color.hex) || !Number.isInteger(color.alpha) || color.alpha < 0 || color.alpha > 100) return null;
    return { hex: color.hex.toLowerCase(), alpha: color.alpha };
  }
  function rgba(color) {
    const c = normalizeColor(color);
    if (!c) return null;
    const n = Number.parseInt(c.hex.slice(1), 16);
    return `rgba(${n >> 16}, ${n >> 8 & 255}, ${n & 255}, ${c.alpha / 100})`;
  }
  function normalizeRecord(record) {
    if (record != null && (record.version !== 1 || !record.colors || typeof record.colors !== "object" || Array.isArray(record.colors))) throw new Error("unsupported_record");
    const colors = /* @__PURE__ */ Object.create(null);
    for (const [key, value] of Object.entries(record?.colors || {})) {
      const color = normalizeColor(value);
      if (key.length > 0 && key.length <= 256 && color) colors[key] = color;
    }
    return { version: 1, colors };
  }
  function stable(value) {
    if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
    if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
    return JSON.stringify(value);
  }
  var clone = (value) => structuredClone(value);
  async function saveColorDraft({ base, draft, read, write, nativeSave, nativeChanged, backup }) {
    if (stable(base) === stable(draft)) {
      if (nativeChanged) await nativeSave();
      return;
    }
    const before = await read();
    if (stable(normalizeRecord(before)) !== stable(base)) throw new Error("conflict");
    const record = { ...before || {}, version: 1, colors: clone(draft.colors) };
    await backup(before);
    let saved2 = false;
    try {
      try {
        await write(record);
        saved2 = true;
      } catch {
        const actual = await read();
        if (stable(actual) !== stable(record)) throw new Error("save_uncertain");
        saved2 = true;
      }
      if (nativeChanged) await nativeSave();
    } catch (error) {
      if (saved2) {
        try {
          if (stable(await read()) === stable(record)) await write(before);
          else throw new Error("conflict");
        } catch {
          throw new Error("rollback_uncertain");
        }
      }
      throw error;
    }
  }
  function hsvToHex(h, s, v) {
    h = (h % 360 + 360) % 360;
    s = Math.min(1, Math.max(0, s));
    v = Math.min(1, Math.max(0, v));
    const c = v * s, x = c * (1 - Math.abs(h / 60 % 2 - 1)), m = v - c;
    const rgb = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return "#" + rgb.map((n) => Math.round((n + m) * 255).toString(16).padStart(2, "0")).join("");
  }
  function hexToHsv(hex) {
    const n = Number.parseInt(hex.slice(1), 16);
    const [r, g, b] = [n >> 16, n >> 8 & 255, n & 255].map((n2) => n2 / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) h = max === r ? 60 * ((g - b) / d % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
    return [(h + 360) % 360, max ? d / max : 0, max];
  }

  // src/color-picker.js
  var STRINGS = {
    de: {
      color: "Farbe",
      alpha: "Deckkraft",
      hue: "Farbton",
      plane: "Sättigung und Helligkeit",
      hex: "HEX-Farbe",
      theme: "Theme-Farbe",
      done: "Übernehmen",
      cancel: "Abbrechen",
      edit: "Farbe für",
      saved: "Farben pro Benutzer synchronisiert",
      unavailable: "Seitenleistenfarben konnten nicht geladen werden. Dialog schließen und erneut öffnen.",
      conflict: "Farben wurden auf einem anderen Gerät geändert. Bitte schließen und neu öffnen.",
      error: "Farben konnten nicht sicher gespeichert werden. Entwurf bleibt offen. Bitte Verbindung prüfen.",
      incompatible: "Seitenleistenfarben: Diese HA-Oberfläche wird noch nicht unterstützt.",
      busy: "Farben werden gespeichert …",
      transparent: "Vollständig transparent",
      reset: "Auf Theme-Farbe zurücksetzen"
    },
    en: {
      color: "Color",
      alpha: "Opacity",
      hue: "Hue",
      plane: "Saturation and brightness",
      hex: "HEX color",
      theme: "Theme color",
      done: "Apply",
      cancel: "Cancel",
      edit: "Color for",
      saved: "Colors synced per user",
      unavailable: "Sidebar colors could not be loaded. Close and reopen this dialog.",
      conflict: "Colors changed on another device. Please close and reopen this dialog.",
      error: "Colors could not be saved safely. Your draft remains open. Please check the connection.",
      incompatible: "Sidebar colors: This HA interface is not supported yet.",
      busy: "Saving colors …",
      transparent: "Fully transparent",
      reset: "Reset to theme color"
    },
    fr: {
      color: "Couleur",
      alpha: "Opacité",
      hue: "Teinte",
      plane: "Saturation et luminosité",
      hex: "Couleur HEX",
      theme: "Couleur du thème",
      done: "Appliquer",
      cancel: "Annuler",
      edit: "Couleur de",
      saved: "Couleurs synchronisées par utilisateur",
      unavailable: "Impossible de charger les couleurs. Fermez puis rouvrez cette fenêtre.",
      conflict: "Les couleurs ont changé sur un autre appareil. Fermez puis rouvrez cette fenêtre.",
      error: "Enregistrement des couleurs non confirmé. Votre brouillon reste ouvert. Vérifiez la connexion.",
      incompatible: "Couleurs du menu : cette interface HA n’est pas encore prise en charge.",
      busy: "Enregistrement des couleurs …",
      transparent: "Entièrement transparent",
      reset: "Rétablir la couleur du thème"
    }
  };
  var strings = (hass) => STRINGS[(hass?.language || hass?.locale?.language || "en").split("-")[0]] || STRINGS.en;
  var SidebarColorPicker = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `<style>
      :host{color:var(--primary-text-color,#eee);font-family:var(--ha-font-family-body,Arial,sans-serif)}
      dialog{color:inherit;background:var(--card-background-color,#222);border:1px solid var(--divider-color,#666);border-radius:16px;padding:20px;width:320px;max-width:calc(100vw - 56px);box-shadow:0 12px 40px #0008}
      dialog::backdrop{background:#0005}h3{font-size:17px;margin:0 0 16px;overflow-wrap:anywhere}
      .sv{position:relative;height:160px;border-radius:8px;touch-action:none;outline-offset:3px;background:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,transparent),var(--hue)}
      .cursor{position:absolute;width:12px;height:12px;border:2px solid white;border-radius:50%;box-shadow:0 0 2px #000;transform:translate(-50%,-50%);pointer-events:none}
      label{display:block;font-size:13px;margin-top:12px}input[type=range]{width:100%;margin:10px 0 0;accent-color:var(--primary-color,#03a9f4)}
      .hue{appearance:none;height:14px;border-radius:8px;background:linear-gradient(to right,red,#ff0,#0f0,#0ff,#00f,#f0f,red)}
      .checker{background-color:#fff;background-image:conic-gradient(#aaa 25%,transparent 0 50%,#aaa 0 75%,transparent 0);background-size:12px 12px}
      .alpha-track{border-radius:8px;margin-top:8px}.alpha-track input{appearance:none;height:14px;border-radius:8px;margin:0;display:block;background:linear-gradient(to right,transparent,var(--solid))}
      .fields{display:flex;gap:12px;align-items:end}.fields label{flex:1;min-width:0}.fields input{box-sizing:border-box;width:100%;padding:8px;border:1px solid var(--divider-color,#777);border-radius:6px;background:var(--primary-background-color,#181818);color:inherit;font:inherit;margin-top:6px}
      .preview{margin:14px 0 0;border-radius:6px;overflow:hidden}.preview span{display:block;height:28px;background:var(--value)}
      .warn{font-size:12px;color:var(--warning-color,#ffb74d);min-height:16px;margin-top:6px}
      footer{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:12px}button{font:inherit;color:var(--primary-color,#03a9f4);background:transparent;border:1px solid var(--divider-color,#777);border-radius:8px;padding:8px 10px;min-height:40px;cursor:pointer}button:focus-visible{outline:2px solid var(--primary-color,#03a9f4);outline-offset:2px}.theme{margin-right:auto}
    </style><dialog aria-labelledby="title"><h3 id="title"></h3>
      <div class="sv" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100"><span class="cursor"></span></div>
      <label class="hue-label"><span></span><input class="hue" type="range" min="0" max="360" step="1"></label>
      <label class="alpha-label"><span></span><div class="alpha-track checker"><input class="alpha" type="range" min="0" max="100" step="1"></div></label>
      <div class="fields"><label class="hex-label"><span></span><input class="hex" type="text" maxlength="7" spellcheck="false" pattern="#[0-9a-fA-F]{6}"></label>
      <label class="opacity-label"><span></span><input class="opacity" type="number" min="0" max="100" step="1"></label></div>
      <div class="preview checker"><span></span></div><div class="warn" role="status"></div>
      <footer><button class="theme" type="button"></button><button class="cancel" type="button"></button><button class="done" type="button"></button></footer>
    </dialog>`;
      const $ = (selector) => this.shadowRoot.querySelector(selector);
      this.$ = $;
      $(".hue").addEventListener("input", (e) => {
        this.hsv[0] = Number(e.target.value);
        this.change();
      });
      $(".alpha").addEventListener("input", (e) => {
        this.color.alpha = Number(e.target.value);
        this.change();
      });
      $(".opacity").addEventListener("input", (e) => {
        if (e.target.validity.valid && e.target.value !== "") {
          this.color.alpha = Number(e.target.value);
          this.change();
        }
      });
      $(".hex").addEventListener("input", (e) => {
        const c = normalizeColor({ hex: e.target.value, alpha: this.color.alpha });
        e.target.setCustomValidity(c ? "" : "#RRGGBB");
        if (c) {
          this.color = c;
          this.hsv = hexToHsv(c.hex);
          this.change();
        }
      });
      const plane = $(".sv");
      const move = (e) => {
        const rect = plane.getBoundingClientRect();
        this.hsv[1] = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.hsv[2] = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        this.change();
      };
      plane.addEventListener("pointerdown", (e) => {
        plane.setPointerCapture(e.pointerId);
        move(e);
      });
      plane.addEventListener("pointermove", (e) => {
        if (plane.hasPointerCapture(e.pointerId)) move(e);
      });
      plane.addEventListener("keydown", (e) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.key === "ArrowLeft") this.hsv[1] = Math.max(0, this.hsv[1] - 0.01);
        if (e.key === "ArrowRight") this.hsv[1] = Math.min(1, this.hsv[1] + 0.01);
        if (e.key === "ArrowDown") this.hsv[2] = Math.max(0, this.hsv[2] - 0.01);
        if (e.key === "ArrowUp") this.hsv[2] = Math.min(1, this.hsv[2] + 0.01);
        this.change();
      });
      $(".theme").addEventListener("click", () => {
        this.onChange(null);
        this.finish();
      });
      $(".cancel").addEventListener("click", () => this.cancel());
      $(".done").addEventListener("click", () => {
        if ($(".hex").reportValidity() && $(".opacity").reportValidity()) this.finish();
      });
      $("dialog").addEventListener("cancel", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.cancel();
      });
      $("dialog").addEventListener("keydown", (e) => e.stopPropagation());
    }
    show({ label, color, hass, onChange }) {
      this.text = strings(hass);
      this.original = color ? { ...color } : null;
      this.color = color ? { ...color } : { hex: "#03a9f4", alpha: 100 };
      this.onChange = onChange;
      this.hsv = hexToHsv(this.color.hex);
      this.$("#title").textContent = `${this.text.edit} ${label}`;
      for (const [selector, key] of [[".hue-label span", "hue"], [".alpha-label span", "alpha"], [".hex-label span", "hex"], [".opacity-label span", "alpha"], [".theme", "theme"], [".cancel", "cancel"], [".done", "done"]]) this.$(selector).textContent = this.text[key];
      this.$(".sv").setAttribute("aria-label", this.text.plane);
      this.$(".hex").setCustomValidity("");
      this.render();
      this.$("dialog").showModal();
      this.$(".hex").focus();
    }
    render() {
      const [h, s, v] = this.hsv;
      this.$(".sv").style.setProperty("--hue", hsvToHex(h, 1, 1));
      this.$(".sv").setAttribute("aria-valuenow", String(Math.round(s * 100)));
      this.$(".sv").setAttribute("aria-valuetext", `${Math.round(s * 100)}% / ${Math.round(v * 100)}%`);
      this.$(".cursor").style.left = `${s * 100}%`;
      this.$(".cursor").style.top = `${(1 - v) * 100}%`;
      this.$(".hue").value = h;
      this.$(".alpha").value = this.color.alpha;
      this.$(".opacity").value = this.color.alpha;
      this.$(".hex").value = this.color.hex;
      this.$(".alpha-track").style.setProperty("--solid", this.color.hex);
      this.$(".preview").style.setProperty("--value", rgba(this.color));
      this.$(".warn").textContent = this.color.alpha === 0 ? this.text.transparent : "";
    }
    change() {
      this.color.hex = hsvToHex(...this.hsv);
      this.render();
      this.onChange({ ...this.color });
    }
    cancel() {
      this.onChange(this.original);
      this.finish();
    }
    finish() {
      this.$("dialog").close();
      this.remove();
    }
  };

  // src/sidebar-colors.js
  var FLAG = /* @__PURE__ */ Symbol.for("ugso.sidebar.colors.loaded");
  var sessions = /* @__PURE__ */ new WeakMap();
  var styled = /* @__PURE__ */ new Map();
  var controllers = /* @__PURE__ */ new Set();
  var activeSession = null;
  var currentHass = null;
  var currentConnection = null;
  var currentUser = null;
  var saved = normalizeRecord(null);
  var unsubscribe;
  var epoch = 0;
  function findAll(root, selector) {
    const result = [...root.querySelectorAll(selector)];
    for (const node of root.querySelectorAll("*")) if (node.shadowRoot) result.push(...findAll(node.shadowRoot, selector));
    return result;
  }
  function warn(hass) {
    console.warn(`[Sidebar Colors ${VERSION}] ${strings(hass).incompatible}`);
  }
  function request(dialog) {
    dialog.requestUpdate?.();
  }
  function message(session, text, error = false) {
    session.message = text;
    session.messageError = error;
    if (!session.dialog?.shadowRoot) return;
    let box = session.dialog.shadowRoot.querySelector(".ugso-color-status");
    if (!box) {
      box = document.createElement("div");
      box.className = "ugso-color-status";
      box.setAttribute("role", "status");
      box.style.cssText = "font-size:12px;padding:4px 24px 8px;overflow-wrap:anywhere";
      const content = session.dialog.shadowRoot.querySelector(".content");
      content?.prepend(box);
    }
    box.textContent = text;
    box.style.color = error ? "var(--error-color,#db4437)" : "var(--secondary-text-color,#888)";
  }
  function isSupported(hass) {
    return supportedVersion(hass?.config?.version);
  }
  async function ws(hass, msg) {
    let timer;
    try {
      return await Promise.race([
        hass.connection.sendMessagePromise(msg),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error("timeout")), 12e3);
        })
      ]);
    } finally {
      clearTimeout(timer);
    }
  }
  async function readRecord(hass, key = STORE_KEY) {
    return (await ws(hass, { type: "frontend/get_user_data", key })).value;
  }
  function writeRecord(hass, value) {
    return ws(hass, { type: "frontend/set_user_data", key: STORE_KEY, value });
  }
  function cssColor(node, value) {
    if (value) {
      if (!styled.has(node)) styled.set(node, { value: node.style.getPropertyValue("color"), priority: node.style.getPropertyPriority("color") });
      if (node.style.getPropertyValue("color") !== value || node.style.getPropertyPriority("color") !== "important") node.style.setProperty("color", value, "important");
    } else if (styled.has(node)) {
      const original = styled.get(node);
      styled.delete(node);
      if (original.value) node.style.setProperty("color", original.value, original.priority);
      else node.style.removeProperty("color");
    }
  }
  function applyRecord(sidebar, record) {
    if (!sidebar.shadowRoot) return;
    for (const row of sidebar.shadowRoot.querySelectorAll("[id^=sidebar-panel-]")) {
      const key = row.id.slice("sidebar-panel-".length);
      const value = rgba(record.colors[key]);
      for (const node of row.querySelectorAll("ha-icon[slot=start],ha-svg-icon[slot=start],.item-text,[slot=headline]")) cssColor(node, value);
    }
    for (const node of styled.keys()) if (!node.isConnected) styled.delete(node);
  }
  function refresh() {
    const record = activeSession?.loaded ? activeSession.draft : saved;
    for (const sidebar of controllers) {
      if (!sidebar.isConnected) {
        controllers.delete(sidebar);
        continue;
      }
      applyRecord(sidebar, record);
    }
    if (activeSession) syncRows(activeSession);
  }
  async function useConnection(hass) {
    if (!hass?.connection || !hass.user?.id || !isSupported(hass)) return;
    currentHass = hass;
    if (currentConnection === hass.connection && currentUser === hass.user.id) return;
    const generation = ++epoch;
    unsubscribe?.();
    unsubscribe = void 0;
    currentConnection = hass.connection;
    currentUser = hass.user.id;
    saved = normalizeRecord(null);
    activeSession = null;
    refresh();
    try {
      const result = await readRecord(hass);
      if (generation !== epoch) return;
      saved = normalizeRecord(result);
      refresh();
      const off = await hass.connection.subscribeMessage((event) => {
        if (generation !== epoch) return;
        try {
          saved = normalizeRecord(event.value);
          refresh();
        } catch {
          warn(hass);
        }
      }, { type: "frontend/subscribe_user_data", key: STORE_KEY });
      if (generation !== epoch) off();
      else unsubscribe = off;
    } catch {
      console.warn(`[Sidebar Colors ${VERSION}] ${strings(hass).unavailable}`);
    }
  }
  function markDirty(session) {
    session.dialog._dirtyStateContext.setState(clone(session.draft.colors), STORE_KEY);
    request(session.dialog);
    refresh();
  }
  function makeButton(session, item) {
    const key = item.value;
    let button = session.buttons.get(key);
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "ugso-sidebar-color";
      button.dataset.panel = key;
      button.style.cssText = "box-sizing:border-box;width:32px;height:32px;min-width:32px;padding:4px;border:1px solid var(--divider-color,#777);border-radius:7px;background:var(--card-background-color,#222);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;margin-inline:2px 4px;vertical-align:middle";
      const swatch = document.createElement("span");
      swatch.style.cssText = "display:block;width:20px;height:20px;border-radius:4px;overflow:hidden;background-color:#fff;background-image:conic-gradient(#999 25%,transparent 0 50%,#999 0 75%,transparent 0);background-size:8px 8px;pointer-events:none";
      const fill = document.createElement("span");
      fill.style.cssText = "display:block;width:100%;height:100%";
      swatch.append(fill);
      button.append(swatch);
      button.addEventListener("pointerdown", (e) => e.stopPropagation());
      button.addEventListener("keydown", (e) => e.stopPropagation());
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        if (session.saving || !session.loaded) return;
        session.picker?.finish();
        const picker = document.createElement("ugso-sidebar-color-picker");
        session.picker = picker;
        document.body.append(picker);
        picker.show({ label: item.label, color: session.draft.colors[key], hass: session.dialog.hass, onChange: (color) => {
          if (session.saving) return;
          const valid = normalizeColor(color);
          if (valid) session.draft.colors[key] = valid;
          else delete session.draft.colors[key];
          markDirty(session);
        } });
      });
      session.buttons.set(key, button);
    }
    button.setAttribute("aria-label", `${strings(session.dialog.hass).edit} ${item.label}`);
    button.title = button.getAttribute("aria-label");
    button.disabled = !!session.saving;
    const c = session.draft.colors[key];
    button.firstElementChild.firstElementChild.style.background = rgba(c) || "transparent";
    button.dataset.theme = c ? "false" : "true";
    return button;
  }
  function syncRows(session) {
    const editor = session.dialog.shadowRoot?.querySelector("ha-items-display-editor");
    if (!editor || !session.loaded) return;
    if (editor !== session.editor) {
      session.observer?.disconnect();
      session.editor = editor;
      session.previousRenderer = editor.actionsRenderer;
      editor.actionsRenderer = (item) => {
        const field = makeButton(session, item);
        return session.previousRenderer ? [session.previousRenderer(item), field] : field;
      };
      if (editor.shadowRoot) {
        session.observer = new MutationObserver(() => syncRows(session));
        session.observer.observe(editor.shadowRoot, { childList: true, subtree: true });
      }
    }
    for (const item of editor.items || []) makeButton(session, item);
    for (const row of editor.shadowRoot?.querySelectorAll("ha-md-list-item") || []) {
      const c = rgba(session.draft.colors[row.value]);
      for (const target of row.querySelectorAll("[slot=headline],.icon")) cssColor(target, c);
    }
  }
  async function beginDialog(dialog) {
    endDialog(dialog);
    const hass = dialog.hass;
    if (!isSupported(hass) || typeof dialog._dirtyStateContext?.setState !== "function") {
      warn(hass);
      return;
    }
    const session = {
      dialog,
      hass,
      userId: hass.user.id,
      buttons: /* @__PURE__ */ new Map(),
      loaded: false,
      saving: false,
      nativeBase: { order: clone(dialog._order), hidden: clone(dialog._hidden) }
    };
    sessions.set(dialog, session);
    activeSession = session;
    try {
      const [raw, native] = await Promise.all([readRecord(hass), readRecord(hass, "sidebar")]);
      if (sessions.get(dialog) !== session || !dialog._open) return;
      session.rawBase = clone(raw);
      session.nativeStored = clone(native);
      session.base = normalizeRecord(raw);
      session.draft = clone(session.base);
      session.loaded = true;
      saved = clone(session.base);
      dialog._dirtyStateContext.setState(clone(session.base.colors), STORE_KEY);
      message(session, strings(hass).saved);
      request(dialog);
      syncRows(session);
      refresh();
    } catch {
      message(session, strings(hass).unavailable, true);
    }
  }
  function endDialog(dialog) {
    const session = sessions.get(dialog);
    if (!session) return;
    session.picker?.finish();
    session.observer?.disconnect();
    if (session.editor) session.editor.actionsRenderer = session.previousRenderer;
    sessions.delete(dialog);
    if (activeSession === session) activeSession = null;
    refresh();
  }
  async function saveDialog(dialog, original, args, originalClose) {
    const session = sessions.get(dialog);
    if (!session) return original.apply(dialog, args);
    if (session.saving) return;
    if (!session.loaded) {
      message(session, strings(dialog.hass).unavailable, true);
      return;
    }
    if (dialog.hass.user.id !== session.userId || dialog.hass.connection !== session.hass.connection) {
      message(session, strings(dialog.hass).conflict, true);
      return;
    }
    const hass = session.hass;
    session.saving = true;
    session.picker?.finish();
    syncRows(session);
    if (session.editor) session.editor.inert = true;
    message(session, strings(dialog.hass).busy);
    try {
      const nativeChanged = !!dialog._migrateToUserData || stable(session.nativeBase) !== stable({ order: dialog._order, hidden: dialog._hidden });
      if (nativeChanged && stable(await readRecord(hass, "sidebar")) !== stable(session.nativeStored)) throw new Error("conflict");
      await saveColorDraft({
        base: session.base,
        draft: session.draft,
        read: () => readRecord(hass),
        write: (value) => writeRecord(hass, value),
        nativeChanged,
        backup: async (before) => {
          const key = `ugso-sidebar-colors-backup:${session.userId}`;
          localStorage.setItem(key, JSON.stringify({ at: (/* @__PURE__ */ new Date()).toISOString(), colors: before, sidebar: session.nativeStored }));
        },
        nativeSave: async () => {
          if (dialog.hass.user.id !== session.userId || dialog.hass.connection !== hass.connection) throw new Error("conflict");
          await original.apply(dialog, args);
          if (dialog._error || dialog.isDirtyState) throw new Error("native_save_failed");
        }
      });
      saved = clone(session.draft);
      dialog._markDirtyStateClean();
      session.saving = false;
      endDialog(dialog);
      originalClose.call(dialog);
    } catch (error) {
      message(session, error.message === "conflict" ? strings(dialog.hass).conflict : strings(dialog.hass).error, true);
    } finally {
      session.saving = false;
      if (session.editor) session.editor.inert = false;
      syncRows(session);
      request(dialog);
    }
  }
  function patchDialog(Type) {
    const proto = Type.prototype;
    const getData = proto._getData, save = proto._save, close = proto.closeDialog, closed = proto._dialogClosed;
    if ([getData, save, close, closed].some((fn) => typeof fn !== "function")) {
      warn(currentHass);
      return;
    }
    proto._getData = async function(...args) {
      await getData.apply(this, args);
      if (this._open && this._order && this._hidden) await beginDialog(this);
    };
    proto._save = function(...args) {
      return saveDialog(this, save, args, close);
    };
    proto.closeDialog = function(...args) {
      if (sessions.get(this)?.saving) return;
      endDialog(this);
      return close.apply(this, args);
    };
    proto._dialogClosed = function(...args) {
      endDialog(this);
      return closed.apply(this, args);
    };
    const update = proto.updated;
    proto.updated = function(...args) {
      update?.apply(this, args);
      const session = sessions.get(this);
      if (session?.loaded) queueMicrotask(() => syncRows(session));
    };
    for (const dialog of findAll(document, "dialog-edit-sidebar")) if (dialog._open) beginDialog(dialog);
  }
  if (!window[FLAG]) {
    window[FLAG] = true;
    if (!customElements.get("ugso-sidebar-color-picker")) customElements.define("ugso-sidebar-color-picker", SidebarColorPicker);
    customElements.whenDefined("ha-sidebar").then(() => {
      const Type = customElements.get("ha-sidebar"), original = Type.prototype.updated;
      Type.prototype.updated = function(...args) {
        original?.apply(this, args);
        if (!isSupported(this.hass)) return;
        controllers.add(this);
        useConnection(this.hass);
        queueMicrotask(() => applyRecord(this, activeSession?.loaded ? activeSession.draft : saved));
      };
      for (const sidebar of findAll(document, "ha-sidebar")) {
        controllers.add(sidebar);
        useConnection(sidebar.hass);
        sidebar.requestUpdate?.();
      }
    });
    customElements.whenDefined("dialog-edit-sidebar").then(() => patchDialog(customElements.get("dialog-edit-sidebar")));
    console.info(`[Sidebar Colors ${VERSION}] Home Assistant >= 2026.10.3`);
  }
})();
