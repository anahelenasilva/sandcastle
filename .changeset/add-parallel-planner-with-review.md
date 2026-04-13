---
"@ai-hero/sandcastle": patch
---

Add `parallel-planner-with-review` template that combines parallel execution with per-branch code review using `createSandbox`. Also fix `maxIterations` defaults: sequential-reviewer reviewer 10→1, parallel-planner merger 10→1.
