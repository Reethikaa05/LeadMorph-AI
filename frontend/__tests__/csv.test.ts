import { recordsToCsv, formatBytes } from "@/lib/csv";
import type { CrmRecord } from "@/lib/types";

describe("recordsToCsv", () => {
  test("serializes CRM records with correct headers", () => {
    const record: CrmRecord = {
      created_at: "2026-06-29 10:00:00",
      name: "Amit Shetty",
      email: "amit@example.com",
      country_code: "+91",
      mobile_without_country_code: "9876543210",
      company: "Acme",
      city: "Bangalore",
      state: "",
      country: "India",
      lead_owner: "",
      crm_status: "GOOD_LEAD_FOLLOW_UP",
      crm_note: "",
      data_source: "sarjapur_plots",
      possession_time: "",
      description: "",
    };

    const csv = recordsToCsv([record]);
    expect(csv).toContain("created_at,name,email");
    expect(csv).toContain("Amit Shetty");
    expect(csv).toContain("amit@example.com");
  });
});

describe("formatBytes", () => {
  test("formats bytes, kilobytes and megabytes", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});
