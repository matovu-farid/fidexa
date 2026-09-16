import { describe, expect, it } from "vitest";
import { classifyOutreachDashboard, getBoundedOutreachCompanyId } from "./outreach-dashboard";

describe("outreach dashboard state", () => {
  it("rejects empty and overlong company selectors instead of forwarding them", () => {
    expect(getBoundedOutreachCompanyId(null)).toBeNull();
    expect(getBoundedOutreachCompanyId("  ")).toBeNull();
    expect(getBoundedOutreachCompanyId("company-1")).toBe("company-1");
    expect(getBoundedOutreachCompanyId("x".repeat(201))).toBeNull();
  });

  it("classifies empty, missing, ready, and unavailable dashboard states", () => {
    expect(classifyOutreachDashboard({ workerAvailable: true, companyRequested: false, companyFound: false, companyCount: 0 })).toBe("empty");
    expect(classifyOutreachDashboard({ workerAvailable: true, companyRequested: true, companyFound: false, companyCount: 1 })).toBe("missing");
    expect(classifyOutreachDashboard({ workerAvailable: true, companyRequested: true, companyFound: true, companyCount: 1 })).toBe("ready");
    expect(classifyOutreachDashboard({ workerAvailable: false, companyRequested: false, companyFound: false, companyCount: 0 })).toBe("unavailable");
  });
});
