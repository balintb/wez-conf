import { SETTINGS_MAP } from "./schema";
import { setValue, setMappingsBatch } from "./state";

// Best-effort parser for wezterm.lua config files.
// Handles config.key = value, wezterm.font(), window_padding, keys, default_prog, harfbuzz_features
export function parseConfig(text: string): number {
  let applied = 0;

  // Parse simple config.key = value assignments
  const simpleAssignRe = /config\.(\w+)\s*=\s*(.+)/g;
  let match: RegExpExecArray | null;

  while ((match = simpleAssignRe.exec(text)) !== null) {
    const key = match[1];
    const rawValue = match[2].trim();

    // Skip multi-line structures — they're parsed separately
    if (key === "keys" || key === "window_padding" || key === "default_prog" || key === "harfbuzz_features") continue;

    // font = wezterm.font('...')
    if (key === "font" || key === "font_family") {
      const fontMatch = rawValue.match(/wezterm\.font\s*\(\s*'([^']+)'\s*\)/);
      if (fontMatch) {
        setValue("font_family", fontMatch[1]);
        applied++;
      }
      continue;
    }

    if (!SETTINGS_MAP.has(key)) continue;

    const value = parseLuaValue(rawValue);
    if (value !== null) {
      setValue(key, value);
      applied++;
    }
  }

  // Parse config.font = wezterm.font('...')
  const fontMatch = text.match(/config\.font\s*=\s*wezterm\.font\s*\(\s*'([^']+)'\s*\)/);
  if (fontMatch) {
    setValue("font_family", fontMatch[1]);
    applied++;
  }

  // Parse window_padding table
  const paddingMatch = text.match(/config\.window_padding\s*=\s*\{([^}]+)\}/);
  if (paddingMatch) {
    const inner = paddingMatch[1];
    for (const side of ["left", "right", "top", "bottom"]) {
      const sideMatch = inner.match(new RegExp(`${side}\\s*=\\s*(\\d+)`));
      if (sideMatch) {
        setValue(`window_padding_${side}`, sideMatch[1]);
        applied++;
      }
    }
  }

  // Parse default_prog table
  const progMatch = text.match(/config\.default_prog\s*=\s*\{([^}]+)\}/);
  if (progMatch) {
    const items = parseStringTable(progMatch[1]);
    if (items.length > 0) {
      setValue("default_prog", items.join(","));
      applied++;
    }
  }

  // Parse harfbuzz_features table
  const hbMatch = text.match(/config\.harfbuzz_features\s*=\s*\{([^}]+)\}/);
  if (hbMatch) {
    const items = parseStringTable(hbMatch[1]);
    if (items.length > 0) {
      setValue("harfbuzz_features", items.join(", "));
      applied++;
    }
  }

  // Parse key bindings
  const keysMatch = text.match(/config\.keys\s*=\s*\{([\s\S]*?)\n\}/);
  if (keysMatch) {
    const parsedMappings = parseKeyBindings(keysMatch[1]);
    if (parsedMappings.length > 0) {
      setMappingsBatch(parsedMappings);
      applied += parsedMappings.length;
    }
  }

  return applied;
}

function parseLuaValue(raw: string): string | null {
  // Remove trailing comma if present
  let s = raw.replace(/,\s*$/, "").trim();

  // Boolean
  if (s === "true") return "true";
  if (s === "false") return "false";

  // Number
  if (/^-?\d+(\.\d+)?$/.test(s)) return s;

  // Single-quoted string
  const sq = s.match(/^'([^']*)'$/);
  if (sq) return sq[1];

  // Double-quoted string
  const dq = s.match(/^"([^"]*)"$/);
  if (dq) return dq[1];

  return null;
}

function parseStringTable(inner: string): string[] {
  const items: string[] = [];
  const re = /'([^']*)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(inner)) !== null) {
    items.push(m[1]);
  }
  return items;
}

function parseKeyBindings(inner: string): { mods: string; key: string; action: string }[] {
  const results: { mods: string; key: string; action: string }[] = [];
  // Match individual key binding tables: { key = '...', ... }
  const entryRe = /\{[^{}]*\bkey\s*=\s*'([^']+)'[^{}]*\}/g;
  let m: RegExpExecArray | null;

  while ((m = entryRe.exec(inner)) !== null) {
    const entry = m[0];
    const key = m[1];

    const modsMatch = entry.match(/mods\s*=\s*'([^']+)'/);
    const mods = modsMatch ? modsMatch[1] : "";

    const actionMatch = entry.match(/action\s*=\s*(wezterm\.action\.\w+[^,}]*)/);
    const action = actionMatch ? identifyAction(actionMatch[1].trim()) : "";

    if (key && action) {
      results.push({ mods, key, action });
    }
  }

  return results;
}

function identifyAction(luaExpr: string): string {
  // Try to match known action Lua expressions back to our action values
  // Simple actions: wezterm.action.FooBar
  const simpleMatch = luaExpr.match(/^wezterm\.action\.(\w+)$/);
  if (simpleMatch) return simpleMatch[1];

  // Actions with string arg: wezterm.action.Foo 'bar'
  const strArgMatch = luaExpr.match(/^wezterm\.action\.(\w+)\s+'([^']+)'$/);
  if (strArgMatch) {
    const name = strArgMatch[1];
    const arg = strArgMatch[2];
    if (name === "ActivatePaneDirection") return `${name}-${arg}`;
    if (name === "CopyTo" || name === "PasteFrom") return name;
    if (name === "SpawnTab") return name;
    if (name === "Search") return name;
    return name;
  }

  // Actions with numeric arg: wezterm.action.Foo(N) or Foo(-N)
  const numArgMatch = luaExpr.match(/^wezterm\.action\.(\w+)\((-?\d+)\)$/);
  if (numArgMatch) {
    return `${numArgMatch[1]}-${numArgMatch[2]}`;
  }

  // Actions with table arg: wezterm.action.Foo { ... }
  const tableArgMatch = luaExpr.match(/^wezterm\.action\.(\w+)\s*\{/);
  if (tableArgMatch) {
    return tableArgMatch[1];
  }

  return "";
}
