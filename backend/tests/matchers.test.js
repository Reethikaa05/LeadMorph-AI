const { heuristicExtract, normalizeStatus, normalizeSource } = require("../src/utils/matchers");

describe("heuristicExtract", () => {
  test("maps a Facebook-style lead export to CRM fields", () => {
    const headers = ["Full Name", "Email Address", "Phone Number", "Campaign Name", "Created On"];
    const rows = [
      {
        "Full Name": "Amit Shetty",
        "Email Address": "amit@example.com",
        "Phone Number": "+919876543210",
        "Campaign Name": "sarjapur_plots promo",
        "Created On": "2026-06-29 10:00:00",
      },
    ];

    const { records, skipped } = heuristicExtract(rows, headers);
    expect(skipped).toHaveLength(0);
    expect(records).toHaveLength(1);
    expect(records[0].name).toBe("Amit Shetty");
    expect(records[0].email).toBe("amit@example.com");
    expect(records[0].data_source).toBe("sarjapur_plots");
  });

  test("skips rows with neither email nor phone", () => {
    const headers = ["Name", "Note"];
    const rows = [{ Name: "No Contact Info", Note: "Just a name" }];
    const { records, skipped } = heuristicExtract(rows, headers);
    expect(records).toHaveLength(0);
    expect(skipped).toHaveLength(1);
  });

  test("captures extra emails/phones into crm_note", () => {
    const headers = ["Name", "Email", "Phone", "Other Contact"];
    const rows = [
      {
        Name: "Multi Contact",
        Email: "primary@example.com",
        Phone: "9876543210",
        "Other Contact": "secondary@example.com / 9998887777",
      },
    ];
    const { records } = heuristicExtract(rows, headers);
    expect(records[0].email).toBe("primary@example.com");
    expect(records[0].crm_note).toContain("secondary@example.com");
  });
});

describe("normalizeStatus", () => {
  test("maps free text to allowed enum", () => {
    expect(normalizeStatus("Deal closed - won!")).toBe("SALE_DONE");
    expect(normalizeStatus("Not interested at all")).toBe("BAD_LEAD");
    expect(normalizeStatus("No answer, tried twice")).toBe("DID_NOT_CONNECT");
    expect(normalizeStatus("random text")).toBe("");
  });
});

describe("normalizeSource", () => {
  test("maps known source substrings", () => {
    expect(normalizeSource("Eden Park Campaign")).toBe("eden_park");
    expect(normalizeSource("unknown-source")).toBe("");
  });
});
