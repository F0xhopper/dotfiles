return {
  {
    "webhooked/kanso.nvim",
    lazy = false,
    priority = 1000,
    opts = {
      theme = "zen",
      foreground = "saturated",
      minimal = false,
      bold = true,
      transparent = true,
      italics = true,
      undercurl = true,
      commentStyle = { italic = true },
      functionStyle = { bold = true },
      keywordStyle = { italic = true },
      dimInactive = false,
      on_highlights = function(hl, c)
        hl.BlinkCmpLabel = { fg = c.fg_dark or "#a0a0a0" }
        hl.BlinkCmpLabelMatch = { fg = c.fg or "#c0c0c0", bold = true }
        hl.BlinkCmpKind = { fg = c.fg_dark or "#a0a0a0" }
        hl.CopilotSuggestion = { fg = c.fg_dark or "#555555", italic = true }
      end,
    },
  },
  -- {
  --   "projekt0n/github-nvim-theme",
  --   name = "github-theme",
  --   lazy = false,
  --   priority = 1000,
  --   config = function()
  --     require("github-theme").setup({
  --       -- ...
  --     })
  --
  --     vim.cmd("colorscheme github_dark_default")
  --   end,
  -- },
  {
    "LazyVim/LazyVim",
    opts = {
      colorscheme = "kanso",
    },
  },
}
