# Sourced from ~/.zshrc. Herdr shell integration.

# herdr-automatic-rename: rename the Herdr tab the moment a command starts,
# instead of on the next pane event. No-op outside Herdr.
for _f in ${HOME}/.config/herdr/plugins/github-installations/herdr-automatic-rename-*/*/checkout/shell/hook.zsh(N) \
          ${HOME}/.config/herdr/plugins/github/herdr-automatic-rename-*/shell/hook.zsh(N); do
  source $_f; break
done
unset _f
