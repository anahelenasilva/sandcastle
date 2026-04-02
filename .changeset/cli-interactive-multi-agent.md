---
"@ai-hero/sandcastle": patch
---

Wire CLI interactive command for multi-agent support. The `interactive` command now accepts `--agent` and `--model` flags, uses the provider's `buildInteractiveArgs()` for docker exec, and displays the provider name in status messages.
