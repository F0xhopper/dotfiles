return {
  {
    "zbirenbaum/copilot.lua",
    event = "InsertEnter",
    opts = {
      filetypes = {
        markdown = false,
      },
      suggestion = {
        enabled = true,
        auto_trigger = true,
        hide_during_completion = false,
        keymap = {
          accept = "<Tab>",
          accept_word = "<M-w>",
          accept_line = "<C-l>",
          next = "<M-]>",
          prev = "<M-[>",
          dismiss = "<C-]>",
        },
      },
      theme = "dragon",
      panel = { enabled = false },
    },
  },
}
