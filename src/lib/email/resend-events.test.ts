import { describe, expect, it } from "vitest";
import { mapResendEventStatus, canAdvanceMessageStatus } from "./resend-events";

describe("Resend delivery events", () => {
  it("maps provider events to inbox statuses", () => {
    expect(mapResendEventStatus("email.sent")).toBe("sent");
    expect(mapResendEventStatus("email.delivered")).toBe("delivered");
    expect(mapResendEventStatus("email.bounced")).toBe("bounced");
    expect(mapResendEventStatus("email.failed")).toBe("failed");
  });

  it("does not let a late sent event overwrite delivered", () => {
    expect(canAdvanceMessageStatus("delivered", "sent")).toBe(false);
    expect(canAdvanceMessageStatus("sent", "delivered")).toBe(true);
    expect(canAdvanceMessageStatus("pending", "failed")).toBe(true);
  });

  it("preserves a later complaint as the final customer-impact status", () => {
    expect(canAdvanceMessageStatus("delivered", "complained")).toBe(true);
    expect(canAdvanceMessageStatus("complained", "delivered")).toBe(false);
  });
});
