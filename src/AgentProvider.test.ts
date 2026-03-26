import { describe, expect, it } from "vitest";
import { claudeCodeProvider, getAgentProvider } from "./AgentProvider.js";

describe("claudeCodeProvider", () => {
  it("has name 'claude-code'", () => {
    expect(claudeCodeProvider.name).toBe("claude-code");
  });

  it("envManifest contains ANTHROPIC_API_KEY and GH_TOKEN but NOT CLAUDE_CODE_OAUTH_TOKEN", () => {
    expect(claudeCodeProvider.envManifest).not.toHaveProperty(
      "CLAUDE_CODE_OAUTH_TOKEN",
    );
    expect(claudeCodeProvider.envManifest).toHaveProperty("ANTHROPIC_API_KEY");
    expect(claudeCodeProvider.envManifest).toHaveProperty("GH_TOKEN");
  });

  it("has a non-empty dockerfileTemplate", () => {
    expect(claudeCodeProvider.dockerfileTemplate).toContain("FROM");
    expect(claudeCodeProvider.dockerfileTemplate).toContain("claude");
  });
});

describe("claudeCodeProvider.envCheck", () => {
  it("passes with ANTHROPIC_API_KEY and GH_TOKEN", () => {
    expect(() =>
      claudeCodeProvider.envCheck({
        ANTHROPIC_API_KEY: "key",
        GH_TOKEN: "gh",
      }),
    ).not.toThrow();
  });

  it("throws when ANTHROPIC_API_KEY is missing", () => {
    expect(() => claudeCodeProvider.envCheck({ GH_TOKEN: "gh" })).toThrow(
      /ANTHROPIC_API_KEY/,
    );
  });

  it("throws when CLAUDE_CODE_OAUTH_TOKEN is present but ANTHROPIC_API_KEY is absent", () => {
    expect(() =>
      claudeCodeProvider.envCheck({
        CLAUDE_CODE_OAUTH_TOKEN: "tok",
        GH_TOKEN: "gh",
      }),
    ).toThrow(/ANTHROPIC_API_KEY/);
  });

  it("throws when GH_TOKEN is missing", () => {
    expect(() =>
      claudeCodeProvider.envCheck({ ANTHROPIC_API_KEY: "key" }),
    ).toThrow(/GH_TOKEN/);
  });

  it("throws when env is empty", () => {
    expect(() => claudeCodeProvider.envCheck({})).toThrow();
  });
});

describe("getAgentProvider", () => {
  it("returns claude-code provider for 'claude-code'", () => {
    const provider = getAgentProvider("claude-code");
    expect(provider.name).toBe("claude-code");
  });

  it("throws for unknown agent name", () => {
    expect(() => getAgentProvider("unknown-agent")).toThrow(/unknown-agent/);
  });
});
