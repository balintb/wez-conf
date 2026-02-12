export interface Mapping {
  id: string;
  mods: string;
  key: string;
  action: string;
}

export interface ActionDef {
  aid: number;
  value: string;
  label: string;
  // Lua expression for the action
  lua: string;
}

export interface ActionGroup {
  label: string;
  actions: ActionDef[];
}

export const ACTION_GROUPS: ActionGroup[] = [
  {
    label: "Clipboard",
    actions: [
      { aid: 1, value: "CopyTo", label: "Copy to clipboard", lua: "wezterm.action.CopyTo 'Clipboard'" },
      { aid: 2, value: "PasteFrom", label: "Paste from clipboard", lua: "wezterm.action.PasteFrom 'Clipboard'" },
    ],
  },
  {
    label: "Panes",
    actions: [
      { aid: 3, value: "SplitHorizontal", label: "Split horizontal", lua: "wezterm.action.SplitHorizontal { domain = 'CurrentPaneDomain' }" },
      { aid: 4, value: "SplitVertical", label: "Split vertical", lua: "wezterm.action.SplitVertical { domain = 'CurrentPaneDomain' }" },
      { aid: 5, value: "CloseCurrentPane", label: "Close pane", lua: "wezterm.action.CloseCurrentPane { confirm = true }" },
      { aid: 6, value: "ActivatePaneDirection-Left", label: "Focus pane left", lua: "wezterm.action.ActivatePaneDirection 'Left'" },
      { aid: 7, value: "ActivatePaneDirection-Right", label: "Focus pane right", lua: "wezterm.action.ActivatePaneDirection 'Right'" },
      { aid: 8, value: "ActivatePaneDirection-Up", label: "Focus pane up", lua: "wezterm.action.ActivatePaneDirection 'Up'" },
      { aid: 9, value: "ActivatePaneDirection-Down", label: "Focus pane down", lua: "wezterm.action.ActivatePaneDirection 'Down'" },
      { aid: 10, value: "TogglePaneZoomState", label: "Toggle pane zoom", lua: "wezterm.action.TogglePaneZoomState" },
    ],
  },
  {
    label: "Tabs",
    actions: [
      { aid: 11, value: "SpawnTab", label: "New tab", lua: "wezterm.action.SpawnTab 'CurrentPaneDomain'" },
      { aid: 12, value: "CloseCurrentTab", label: "Close tab", lua: "wezterm.action.CloseCurrentTab { confirm = true }" },
      { aid: 13, value: "ActivateTabRelative-1", label: "Next tab", lua: "wezterm.action.ActivateTabRelative(1)" },
      { aid: 14, value: "ActivateTabRelative--1", label: "Previous tab", lua: "wezterm.action.ActivateTabRelative(-1)" },
      { aid: 15, value: "MoveTabRelative-1", label: "Move tab right", lua: "wezterm.action.MoveTabRelative(1)" },
      { aid: 16, value: "MoveTabRelative--1", label: "Move tab left", lua: "wezterm.action.MoveTabRelative(-1)" },
    ],
  },
  {
    label: "Window",
    actions: [
      { aid: 17, value: "ToggleFullScreen", label: "Toggle fullscreen", lua: "wezterm.action.ToggleFullScreen" },
      { aid: 18, value: "SpawnWindow", label: "New window", lua: "wezterm.action.SpawnWindow" },
    ],
  },
  {
    label: "Font Size",
    actions: [
      { aid: 19, value: "IncreaseFontSize", label: "Increase font", lua: "wezterm.action.IncreaseFontSize" },
      { aid: 20, value: "DecreaseFontSize", label: "Decrease font", lua: "wezterm.action.DecreaseFontSize" },
      { aid: 21, value: "ResetFontSize", label: "Reset font size", lua: "wezterm.action.ResetFontSize" },
    ],
  },
  {
    label: "Scrolling",
    actions: [
      { aid: 22, value: "ScrollByPage-1", label: "Scroll page up", lua: "wezterm.action.ScrollByPage(-1)" },
      { aid: 23, value: "ScrollByPage+1", label: "Scroll page down", lua: "wezterm.action.ScrollByPage(1)" },
      { aid: 24, value: "ScrollByLine--1", label: "Scroll line up", lua: "wezterm.action.ScrollByLine(-1)" },
      { aid: 25, value: "ScrollByLine-1", label: "Scroll line down", lua: "wezterm.action.ScrollByLine(1)" },
      { aid: 26, value: "ScrollToTop", label: "Scroll to top", lua: "wezterm.action.ScrollToTop" },
      { aid: 27, value: "ScrollToBottom", label: "Scroll to bottom", lua: "wezterm.action.ScrollToBottom" },
    ],
  },
  {
    label: "Search",
    actions: [
      { aid: 28, value: "Search", label: "Search", lua: "wezterm.action.Search 'CurrentSelectionOrEmptyString'" },
    ],
  },
  {
    label: "Misc",
    actions: [
      { aid: 29, value: "ShowDebugOverlay", label: "Debug overlay", lua: "wezterm.action.ShowDebugOverlay" },
      { aid: 30, value: "ActivateCopyMode", label: "Copy mode", lua: "wezterm.action.ActivateCopyMode" },
      { aid: 31, value: "QuickSelect", label: "Quick select", lua: "wezterm.action.QuickSelect" },
      { aid: 32, value: "ShowLauncher", label: "Show launcher", lua: "wezterm.action.ShowLauncher" },
      { aid: 33, value: "ReloadConfiguration", label: "Reload config", lua: "wezterm.action.ReloadConfiguration" },
    ],
  },
];

export const ACTION_VALUES: Set<string> = new Set(
  ACTION_GROUPS.flatMap((g) => g.actions.map((a) => a.value)),
);

export const ACTION_TO_ID = new Map<string, number>();
export const ID_TO_ACTION = new Map<number, string>();
export const ACTION_TO_LUA = new Map<string, string>();

for (const group of ACTION_GROUPS) {
  for (const action of group.actions) {
    ACTION_TO_ID.set(action.value, action.aid);
    ID_TO_ACTION.set(action.aid, action.value);
    ACTION_TO_LUA.set(action.value, action.lua);
  }
}

export function getActionLua(value: string): string {
  return ACTION_TO_LUA.get(value) ?? `wezterm.action.${value}`;
}

export const MODIFIERS = ["CTRL", "SHIFT", "ALT", "SUPER", "LEADER"] as const;
export type Modifier = (typeof MODIFIERS)[number];

export interface KeyGroup {
  label: string;
  keys: { value: string; label: string }[];
}

export const KEY_GROUPS: KeyGroup[] = [
  {
    label: "Letters",
    keys: Array.from({ length: 26 }, (_, i) => {
      const ch = String.fromCharCode(97 + i);
      return { value: ch, label: ch };
    }),
  },
  {
    label: "Numbers",
    keys: Array.from({ length: 10 }, (_, i) => ({
      value: String(i),
      label: String(i),
    })),
  },
  {
    label: "Function",
    keys: Array.from({ length: 12 }, (_, i) => ({
      value: `F${i + 1}`,
      label: `F${i + 1}`,
    })),
  },
  {
    label: "Navigation",
    keys: [
      { value: "UpArrow", label: "Up" },
      { value: "DownArrow", label: "Down" },
      { value: "LeftArrow", label: "Left" },
      { value: "RightArrow", label: "Right" },
      { value: "Home", label: "Home" },
      { value: "End", label: "End" },
      { value: "PageUp", label: "Page Up" },
      { value: "PageDown", label: "Page Down" },
      { value: "Insert", label: "Insert" },
      { value: "Delete", label: "Delete" },
    ],
  },
  {
    label: "Whitespace",
    keys: [
      { value: "Return", label: "Enter" },
      { value: "Escape", label: "Escape" },
      { value: "Tab", label: "Tab" },
      { value: "Backspace", label: "Backspace" },
      { value: "Space", label: "Space" },
    ],
  },
  {
    label: "Punctuation",
    keys: [
      { value: "-", label: "- minus" },
      { value: "=", label: "= equal" },
      { value: "[", label: "[ bracket" },
      { value: "]", label: "] bracket" },
      { value: "\\", label: "\\ backslash" },
      { value: ";", label: "; semicolon" },
      { value: "'", label: "' apostrophe" },
      { value: "`", label: "` grave" },
      { value: ",", label: ", comma" },
      { value: ".", label: ". period" },
      { value: "/", label: "/ slash" },
      { value: "|", label: "| pipe" },
    ],
  },
];

const ALL_KEY_VALUES = new Set(KEY_GROUPS.flatMap((g) => g.keys.map((k) => k.value)));
const MODIFIER_SET: Set<string> = new Set(MODIFIERS);

export function parseMods(mods: string): Set<Modifier> {
  const result = new Set<Modifier>();
  if (!mods) return result;
  for (const part of mods.split("|")) {
    const m = part.trim().toUpperCase();
    if (MODIFIER_SET.has(m)) result.add(m as Modifier);
  }
  return result;
}

export function buildMods(modifiers: Set<Modifier>): string {
  const parts: string[] = [];
  for (const mod of MODIFIERS) {
    if (modifiers.has(mod)) parts.push(mod);
  }
  return parts.join("|");
}

export function isStructuredKey(key: string): boolean {
  if (!key) return true;
  return ALL_KEY_VALUES.has(key) || key.length === 1;
}
