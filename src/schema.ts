export type SettingType = "string" | "float" | "int" | "enum" | "bool";

interface SettingBase {
  key: string;
  sid: number; // stable share ID — never reuse or change once assigned
  label: string;
  type: SettingType;
  default: string;
  description?: string;
}

interface StringSetting extends SettingBase {
  type: "string";
}
interface FloatSetting extends SettingBase {
  type: "float";
  min?: number;
  max?: number;
  step?: number;
}
interface IntSetting extends SettingBase {
  type: "int";
  min?: number;
  max?: number;
}
interface EnumSetting extends SettingBase {
  type: "enum";
  options: string[];
}
interface BoolSetting extends SettingBase {
  type: "bool";
}

export type Setting =
  | StringSetting
  | FloatSetting
  | IntSetting
  | EnumSetting
  | BoolSetting;

export interface Category {
  id: string;
  title: string;
  settings: Setting[];
}

export const CATEGORIES: Category[] = [
  {
    id: "color_scheme",
    title: "Color Scheme",
    settings: [
      {
        key: "color_scheme",
        sid: 0,
        label: "Color scheme",
        type: "enum",
        default: "",
        options: [],
        description: "Built-in color scheme name. Leave empty for default.",
      },
    ],
  },
  {
    id: "fonts",
    title: "Fonts",
    settings: [
      {
        key: "font_family",
        sid: 1,
        label: "Font family",
        type: "string",
        default: "",
        description: "Generates wezterm.font() call",
      },
      {
        key: "font_size",
        sid: 2,
        label: "Font size",
        type: "float",
        default: "12.0",
        min: 1,
        max: 72,
        step: 0.5,
      },
      {
        key: "line_height",
        sid: 3,
        label: "Line height",
        type: "float",
        default: "1.0",
        min: 0.5,
        max: 3.0,
        step: 0.05,
      },
      {
        key: "cell_width",
        sid: 4,
        label: "Cell width",
        type: "float",
        default: "1.0",
        min: 0.5,
        max: 2.0,
        step: 0.05,
      },
      {
        key: "bold_brightens_ansi_colors",
        sid: 5,
        label: "Bold brightens ANSI",
        type: "enum",
        default: "BrightAndBold",
        options: ["BrightAndBold", "BrightOnly", "No"],
      },
      {
        key: "freetype_load_target",
        sid: 6,
        label: "FreeType load target",
        type: "enum",
        default: "Normal",
        options: ["Normal", "Light", "Mono", "HorizontalLcd"],
      },
      {
        key: "harfbuzz_features",
        sid: 7,
        label: "HarfBuzz features",
        type: "string",
        default: "",
        description: "Comma-separated, e.g. calt=1, liga=1",
      },
    ],
  },
  {
    id: "cursor",
    title: "Cursor",
    settings: [
      {
        key: "default_cursor_style",
        sid: 10,
        label: "Style",
        type: "enum",
        default: "SteadyBlock",
        options: [
          "SteadyBlock",
          "BlinkingBlock",
          "SteadyUnderline",
          "BlinkingUnderline",
          "SteadyBar",
          "BlinkingBar",
        ],
      },
      {
        key: "cursor_blink_rate",
        sid: 11,
        label: "Blink rate",
        type: "int",
        default: "800",
        min: 0,
        description: "Milliseconds. 0 = no blink",
      },
      {
        key: "force_reverse_video_cursor",
        sid: 12,
        label: "Reverse video cursor",
        type: "bool",
        default: "false",
      },
      {
        key: "cursor_thickness",
        sid: 13,
        label: "Thickness",
        type: "float",
        default: "1.0",
        min: 0.1,
        max: 5.0,
        step: 0.1,
        description: "Pixels",
      },
      {
        key: "animation_fps",
        sid: 14,
        label: "Animation FPS",
        type: "int",
        default: "10",
        min: 1,
        max: 120,
      },
    ],
  },
  {
    id: "window",
    title: "Window",
    settings: [
      {
        key: "window_decorations",
        sid: 20,
        label: "Decorations",
        type: "enum",
        default: "FULL",
        options: ["FULL", "NONE", "TITLE", "RESIZE", "TITLE | RESIZE"],
      },
      {
        key: "window_background_opacity",
        sid: 21,
        label: "Background opacity",
        type: "float",
        default: "1.0",
        min: 0,
        max: 1,
        step: 0.05,
      },
      {
        key: "macos_window_background_blur",
        sid: 22,
        label: "macOS bg blur",
        type: "int",
        default: "0",
        min: 0,
        max: 100,
        description: "macOS background blur radius",
      },
      {
        key: "text_background_opacity",
        sid: 23,
        label: "Text bg opacity",
        type: "float",
        default: "1.0",
        min: 0,
        max: 1,
        step: 0.05,
      },
      {
        key: "window_padding_left",
        sid: 24,
        label: "Padding left",
        type: "int",
        default: "0",
        min: 0,
        description: "Grouped as window_padding in Lua output",
      },
      {
        key: "window_padding_right",
        sid: 25,
        label: "Padding right",
        type: "int",
        default: "0",
        min: 0,
      },
      {
        key: "window_padding_top",
        sid: 26,
        label: "Padding top",
        type: "int",
        default: "0",
        min: 0,
      },
      {
        key: "window_padding_bottom",
        sid: 27,
        label: "Padding bottom",
        type: "int",
        default: "0",
        min: 0,
      },
      {
        key: "initial_cols",
        sid: 28,
        label: "Initial columns",
        type: "int",
        default: "80",
        min: 1,
      },
      {
        key: "initial_rows",
        sid: 29,
        label: "Initial rows",
        type: "int",
        default: "24",
        min: 1,
      },
      {
        key: "window_close_confirmation",
        sid: 30,
        label: "Close confirmation",
        type: "enum",
        default: "AlwaysPrompt",
        options: ["AlwaysPrompt", "NeverPrompt"],
      },
      {
        key: "adjust_window_size_when_changing_font_size",
        sid: 31,
        label: "Adjust size on font change",
        type: "bool",
        default: "true",
      },
      {
        key: "max_fps",
        sid: 32,
        label: "Max FPS",
        type: "int",
        default: "60",
        min: 1,
        max: 255,
      },
    ],
  },
  {
    id: "tab_bar",
    title: "Tab Bar",
    settings: [
      {
        key: "enable_tab_bar",
        sid: 40,
        label: "Enable tab bar",
        type: "bool",
        default: "true",
      },
      {
        key: "hide_tab_bar_if_only_one_tab",
        sid: 41,
        label: "Hide if one tab",
        type: "bool",
        default: "false",
      },
      {
        key: "tab_bar_at_bottom",
        sid: 42,
        label: "Tab bar at bottom",
        type: "bool",
        default: "false",
      },
      {
        key: "use_fancy_tab_bar",
        sid: 43,
        label: "Fancy tab bar",
        type: "bool",
        default: "true",
      },
      {
        key: "tab_max_width",
        sid: 44,
        label: "Tab max width",
        type: "int",
        default: "16",
        min: 1,
      },
      {
        key: "show_tab_index_in_tab_bar",
        sid: 45,
        label: "Show tab index",
        type: "bool",
        default: "true",
      },
      {
        key: "show_new_tab_button_in_tab_bar",
        sid: 46,
        label: "Show new tab button",
        type: "bool",
        default: "true",
      },
    ],
  },
  {
    id: "terminal",
    title: "Terminal",
    settings: [
      {
        key: "scrollback_lines",
        sid: 50,
        label: "Scrollback lines",
        type: "int",
        default: "3500",
        min: 0,
      },
      {
        key: "enable_scroll_bar",
        sid: 51,
        label: "Scroll bar",
        type: "bool",
        default: "false",
      },
      {
        key: "term",
        sid: 52,
        label: "TERM",
        type: "string",
        default: "xterm-256color",
      },
      {
        key: "automatically_reload_config",
        sid: 53,
        label: "Auto-reload config",
        type: "bool",
        default: "true",
      },
      {
        key: "exit_behavior",
        sid: 54,
        label: "Exit behavior",
        type: "enum",
        default: "CloseOnCleanExit",
        options: ["CloseOnCleanExit", "Hold", "Close"],
      },
      {
        key: "exit_behavior_messaging",
        sid: 55,
        label: "Exit messaging",
        type: "enum",
        default: "Verbose",
        options: ["Verbose", "Brief", "None"],
      },
      {
        key: "default_prog",
        sid: 56,
        label: "Default program",
        type: "string",
        default: "",
        description: "Comma-separated args, e.g. /bin/bash,-l",
      },
      {
        key: "default_cwd",
        sid: 57,
        label: "Default CWD",
        type: "string",
        default: "",
      },
      {
        key: "front_end",
        sid: 58,
        label: "Front end",
        type: "enum",
        default: "OpenGL",
        options: ["OpenGL", "WebGpu", "Software"],
      },
    ],
  },
];

export const SETTINGS_MAP: Map<string, Setting> = new Map(
  CATEGORIES.flatMap((c) => c.settings.map((s) => [s.key, s] as const)),
);
