import type { Config } from 'tailwindcss'

const config: Config = {
  "darkMode": "class",
  "content": [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  "theme": {
    "extend": {
      "colors": {
        "primary": {
          "50": "#eff6ff",
          "100": "#dbeafe",
          "200": "#bfdbfe",
          "300": "#93c5fd",
          "400": "#60a5fa",
          "500": "#3b82f6",
          "600": "#2563eb",
          "700": "#1d4ed8",
          "800": "#1e40af",
          "900": "#1e3a8a",
          "DEFAULT": "#3b82f6"
        },
        "secondary": {
          "50": "#faf5ff",
          "100": "#f3e8ff",
          "200": "#e9d5ff",
          "300": "#d8b4fe",
          "400": "#c084fc",
          "500": "#a855f7",
          "600": "#9333ea",
          "700": "#7e22ce",
          "800": "#6b21a8",
          "900": "#581c87",
          "DEFAULT": "#a855f7"
        },
        "success": {
          "50": "#f0fdf4",
          "100": "#dcfce7",
          "500": "#22c55e",
          "600": "#16a34a",
          "700": "#15803d",
          "DEFAULT": "#22c55e"
        },
        "warning": {
          "50": "#fffbeb",
          "100": "#fef3c7",
          "500": "#f59e0b",
          "600": "#d97706",
          "700": "#b45309",
          "DEFAULT": "#f59e0b"
        },
        "error": {
          "50": "#fef2f2",
          "100": "#fee2e2",
          "500": "#ef4444",
          "600": "#dc2626",
          "700": "#b91c1c",
          "DEFAULT": "#ef4444"
        },
        "info": {
          "50": "#eff6ff",
          "100": "#dbeafe",
          "500": "#3b82f6",
          "600": "#2563eb",
          "700": "#1d4ed8",
          "DEFAULT": "#3b82f6"
        }
      },
      "fontFamily": {
        "sans": [
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "\"Fira Sans\"",
          "\"Droid Sans\"",
          "\"Helvetica Neue\"",
          "sans-serif"
        ],
        "mono": [
          "ui-monospace",
          "SFMono-Regular",
          "\"SF Mono\"",
          "Menlo",
          "Monaco",
          "Consolas",
          "\"Liberation Mono\"",
          "\"Courier New\"",
          "monospace"
        ]
      },
      "fontSize": {
        "xs": [
          "0.75rem",
          {
            "lineHeight": "1rem"
          }
        ],
        "sm": [
          "0.875rem",
          {
            "lineHeight": "1.25rem"
          }
        ],
        "base": [
          "1rem",
          {
            "lineHeight": "1.5rem"
          }
        ],
        "lg": [
          "1.125rem",
          {
            "lineHeight": "1.75rem"
          }
        ],
        "xl": [
          "1.25rem",
          {
            "lineHeight": "1.75rem"
          }
        ],
        "2xl": [
          "1.5rem",
          {
            "lineHeight": "2rem"
          }
        ],
        "3xl": [
          "1.875rem",
          {
            "lineHeight": "2.25rem"
          }
        ],
        "4xl": [
          "2.25rem",
          {
            "lineHeight": "2.5rem"
          }
        ],
        "5xl": [
          "3rem",
          {
            "lineHeight": "1"
          }
        ]
      },
      "spacing": {
        "0": "0",
        "1": "0.25rem",
        "2": "0.5rem",
        "3": "0.75rem",
        "4": "1rem",
        "5": "1.25rem",
        "6": "1.5rem",
        "8": "2rem",
        "10": "2.5rem",
        "12": "3rem",
        "16": "4rem",
        "20": "5rem",
        "24": "6rem"
      },
      "borderRadius": {
        "none": "0",
        "sm": "0.125rem",
        "DEFAULT": "0.25rem",
        "md": "0.375rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      "boxShadow": {
        "xs": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "sm": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        "DEFAULT": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        "none": "none"
      },
      "transitionDuration": {
        "fast": "150ms",
        "DEFAULT": "200ms",
        "slow": "300ms"
      },
      "transitionTimingFunction": {
        "DEFAULT": "cubic-bezier(0.4, 0, 0.2, 1)"
      },
      "zIndex": {
        "dropdown": "1000",
        "sticky": "1020",
        "fixed": "1030",
        "modal-backdrop": "1040",
        "modal": "1050",
        "popover": "1060",
        "tooltip": "1070"
      },
      "screens": {
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1536px"
      }
    }
  },
  "plugins": []
}

export default config