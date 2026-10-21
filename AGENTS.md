# Workspace project rules

For every project created or maintained inside this workspace:

- Keep a folder named `confidential files` at the project root.
- Add `/confidential files/` to that project's `.gitignore` before staging or pushing files.
- Never commit, upload, print, or otherwise expose anything stored in that folder.
- Before every initial push, verify with `git check-ignore` that the folder is ignored.
- Exclude API keys, authentication tokens, private keys, credential files, local databases, and provider-local state from Git.
- Enable the workspace pre-commit safety hook for every project and run a staged-secret review before every initial push.
- Move actual credential-bearing files into the project's `confidential files` folder; do not merely ignore them in their old locations. Update local application references so the project continues to work.
- Keep each project connected to its own private repository under `srj17-max` and, after verification, commit and push safe project changes to GitHub.
