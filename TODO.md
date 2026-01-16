# TODO

- [x] **Usability & Debugging**
    - [x] Add `--help` flag to show usage information and available options.
    - [x] Add `--debug` flag to print verbose error messages to stderr for troubleshooting (instead of just "N/A").

- [ ] **Platform Support**
    - [ ] Add `CLAUDE_OAUTH_TOKEN` environment variable support to allow usage on Linux/Windows and simplify testing.

- [ ] **Performance & API Courtesy**
    - [ ] Implement local caching (e.g., 1-5 minutes) to reduce API calls and improve status line responsiveness.

- [ ] **Integration**
    - [ ] Add `--json` flag to output raw data for integration with other tools (Waybar, Polybar, etc.).
