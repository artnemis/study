import { describe, it, expect } from "vitest";
import { checkPermission } from "./permissions";
import { MODULE_ROLES } from "./module.types";

describe("checkPermission", () => {
  it("owner always true for any action", () => {
    expect(checkPermission("owner", "read")).toBe(true);
    expect(checkPermission("owner", "edit")).toBe(true);
    expect(checkPermission("owner", "updateConfig")).toBe(true);
    expect(checkPermission("owner", "delete")).toBe(true);
    expect(checkPermission("owner", "changeRole")).toBe(true);
    expect(checkPermission("owner", "removeMember")).toBe(true);
  });

  it("editor cannot perform owner actions", () => {
    expect(checkPermission("editor", "read")).toBe(true);
    expect(checkPermission("editor", "edit")).toBe(true);
    expect(checkPermission("editor", "updateConfig")).toBe(true);
    expect(checkPermission("editor", "delete")).toBe(false);
    expect(checkPermission("editor", "changeRole")).toBe(false);
    expect(checkPermission("editor", "removeMember")).toBe(false);
  });

  it("viewer is read-only", () => {
    expect(checkPermission("viewer", "read")).toBe(true);
    expect(checkPermission("viewer", "edit")).toBe(false);
    expect(checkPermission("viewer", "updateConfig")).toBe(false);
    expect(checkPermission("viewer", "delete")).toBe(false);
    expect(checkPermission("viewer", "changeRole")).toBe(false);
    expect(checkPermission("viewer", "removeMember")).toBe(false);
  });

  it("invalid role is rejected", () => {
    // @ts-expect-error
    expect(checkPermission("invalid", "read")).toBe(false);
  });
});
