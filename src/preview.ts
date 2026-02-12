import { getValue, subscribe } from "./state";
import { SCHEME_DATA } from "./scheme-data";

let root: HTMLElement;
let titlebar: HTMLElement;
let tabBarTop: HTMLElement;
let tabBarBottom: HTMLElement;
let terminal: HTMLElement;
let terminalInner: HTMLElement;

function el(tag: string, cls?: string, text?: string): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function buildTabBar(): HTMLElement {
  const bar = el("div", "wez-tab-bar");
  const tabs = el("div", "wez-tabs");

  const tab1 = el("div", "wez-tab active");
  tab1.innerHTML = `<span class="wez-tab-label">~ zsh</span>`;

  const tab2 = el("div", "wez-tab inactive");
  tab2.innerHTML = `<span class="wez-tab-label">nvim</span>`;

  const newTabBtn = el("div", "wez-tab new-tab-btn");
  newTabBtn.textContent = "+";

  tabs.appendChild(tab1);
  tabs.appendChild(tab2);
  tabs.appendChild(newTabBtn);
  bar.appendChild(tabs);
  return bar;
}

function buildTerminalContent(): HTMLElement {
  const inner = el("div", "wez-terminal-inner");
  inner.innerHTML = `<div class="line"><span class="c2">~</span> <span class="c4">$</span> <span class="fg">ls -la</span></div>
<div class="line"><span class="c8">total 32</span></div>
<div class="line"><span class="c4">drwxr-xr-x</span>  <span class="c6">5</span> <span class="c3">user</span> <span class="c3">staff</span>  <span class="fg">160</span> <span class="c5">Jan 10</span> <span class="c12">.</span></div>
<div class="line"><span class="c4">drwxr-xr-x</span> <span class="c6">12</span> <span class="c3">user</span> <span class="c3">staff</span>  <span class="fg">384</span> <span class="c5">Jan  9</span> <span class="c12">..</span></div>
<div class="line"><span class="c4">-rw-r--r--</span>  <span class="c6">1</span> <span class="c3">user</span> <span class="c3">staff</span> <span class="fg">2048</span> <span class="c5">Jan 10</span> <span class="c10">wezterm.lua</span></div>
<div class="line"><span class="c4">-rwxr-xr-x</span>  <span class="c6">1</span> <span class="c3">user</span> <span class="c3">staff</span>  <span class="fg">512</span> <span class="c5">Jan  8</span> <span class="c2">setup.sh</span></div>
<div class="line"><span class="c4">drwxr-xr-x</span>  <span class="c6">3</span> <span class="c3">user</span> <span class="c3">staff</span>   <span class="fg">96</span> <span class="c5">Jan  7</span> <span class="c12">src/</span></div>
<div class="line"><span class="c8">See </span><span class="url">https://wezfurlong.org/wezterm/</span></div>
<div class="line"></div>
<div class="line"><span class="c2">~</span> <span class="c4">$</span> <span class="cursor-char">&nbsp;</span></div>`;
  return inner;
}

export function createPreview(container: HTMLElement): void {
  root = el("div", "wez-preview");

  titlebar = el("div", "wez-titlebar");
  const lights = el("div", "traffic-lights");
  lights.appendChild(el("span", "tl-close"));
  lights.appendChild(el("span", "tl-minimize"));
  lights.appendChild(el("span", "tl-zoom"));
  titlebar.appendChild(lights);
  titlebar.appendChild(el("span", "wez-title", "WezTerm (drag me!)"));
  root.appendChild(titlebar);

  tabBarTop = buildTabBar();
  tabBarTop.classList.add("position-top");
  root.appendChild(tabBarTop);

  terminal = el("div", "wez-terminal");
  terminalInner = buildTerminalContent();
  terminal.appendChild(terminalInner);
  root.appendChild(terminal);

  tabBarBottom = buildTabBar();
  tabBarBottom.classList.add("position-bottom");
  root.appendChild(tabBarBottom);

  container.appendChild(root);

  setupDrag();
  subscribe(updatePreview);
  updatePreview();
}

function setupDrag(): void {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let isFloating = false;

  titlebar.style.cursor = "grab";

  titlebar.addEventListener("mousedown", (e) => {
    if ((e.target as HTMLElement).closest(".traffic-lights")) return;
    e.preventDefault();
    isDragging = true;
    titlebar.style.cursor = "grabbing";

    if (!isFloating) {
      const rect = root.getBoundingClientRect();
      root.classList.add("floating");
      root.style.left = `${rect.left}px`;
      root.style.top = `${rect.top}px`;
      root.style.width = `${rect.width}px`;
      isFloating = true;
    }

    offsetX = e.clientX - root.getBoundingClientRect().left;
    offsetY = e.clientY - root.getBoundingClientRect().top;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    root.style.left = `${e.clientX - offsetX}px`;
    root.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    titlebar.style.cursor = "grab";
  });

  titlebar.addEventListener("dblclick", (e) => {
    if ((e.target as HTMLElement).closest(".traffic-lights")) return;
    if (!isFloating) return;
    root.classList.remove("floating");
    root.style.left = "";
    root.style.top = "";
    root.style.width = "";
    isFloating = false;
  });
}

function updatePreview(): void {
  const s = root.style;

  // Apply color scheme or defaults
  const scheme = SCHEME_DATA[getValue("color_scheme")];
  const fg = scheme ? scheme.fg : "#cccccc";
  const bg = scheme ? scheme.bg : "#000000";
  const cursor = scheme ? scheme.cursor : "#cccccc";
  s.setProperty("--p-fg", fg);
  s.setProperty("--p-bg", bg);
  s.setProperty("--p-cursor", cursor);

  if (scheme) {
    for (let i = 0; i < 8; i++) {
      s.setProperty(`--p-c${i}`, scheme.ansi[i]);
      s.setProperty(`--p-c${i + 8}`, scheme.brights[i]);
    }
  } else {
    // Reset to CSS defaults by removing overrides
    for (let i = 0; i < 16; i++) {
      s.removeProperty(`--p-c${i}`);
    }
  }

  const opacity = getValue("window_background_opacity");
  const r = parseInt(bg.slice(1, 3), 16);
  const g = parseInt(bg.slice(3, 5), 16);
  const b = parseInt(bg.slice(5, 7), 16);
  s.setProperty("--p-bg-rgba", `rgba(${r}, ${g}, ${b}, ${opacity})`);

  const fontFamily = getValue("font_family");
  if (fontFamily) {
    s.setProperty("--p-font", `"${fontFamily}", monospace`);
  } else {
    s.setProperty("--p-font", "monospace");
  }
  s.setProperty("--p-font-size", `${getValue("font_size") || "12"}px`);

  // Padding
  const pl = getValue("window_padding_left") || "0";
  const pr = getValue("window_padding_right") || "0";
  const pt = getValue("window_padding_top") || "0";
  const pb = getValue("window_padding_bottom") || "0";
  terminalInner.style.padding = `max(${pt}px, 8px) max(${pr}px, 8px) max(${pb}px, 8px) max(${pl}px, 8px)`;

  // Cursor
  const cursorEl = terminalInner.querySelector(".cursor-char");
  if (cursorEl) {
    cursorEl.className = "cursor-char";
    const style = getValue("default_cursor_style");
    if (style.includes("Block")) cursorEl.classList.add("cursor-block");
    else if (style.includes("Bar")) cursorEl.classList.add("cursor-beam");
    else if (style.includes("Underline")) cursorEl.classList.add("cursor-underline");
    else cursorEl.classList.add("cursor-block");

    const blinkRate = parseInt(getValue("cursor_blink_rate") || "800", 10);
    if (blinkRate === 0 || !style.includes("Blinking")) {
      s.setProperty("--p-cursor-blink", "none");
    } else {
      const duration = blinkRate / 500;
      s.setProperty("--p-cursor-blink", `cursor-blink ${duration}s step-end infinite`);
    }
  }

  // Tab bar
  const tabBarEnabled = getValue("enable_tab_bar") !== "false";
  const atBottom = getValue("tab_bar_at_bottom") === "true";
  tabBarTop.classList.toggle("hidden", !tabBarEnabled || atBottom);
  tabBarBottom.classList.toggle("hidden", !tabBarEnabled || !atBottom);

  // Fancy tab bar styling
  const fancy = getValue("use_fancy_tab_bar") !== "false";
  for (const bar of [tabBarTop, tabBarBottom]) {
    bar.classList.toggle("fancy", fancy);
  }

  // New tab button visibility
  const showNewTab = getValue("show_new_tab_button_in_tab_bar") !== "false";
  for (const btn of root.querySelectorAll<HTMLElement>(".new-tab-btn")) {
    btn.classList.toggle("hidden", !showNewTab);
  }

  // Window decorations
  const decorations = getValue("window_decorations");
  titlebar.classList.toggle("hidden", decorations === "NONE" || decorations === "RESIZE");
  root.classList.toggle("no-radius", decorations === "NONE");
}
