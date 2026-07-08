const { JsonStore } = require("./store");
const bcrypt = require("bcryptjs");

const mockLeads = [
  {
    "created_at": "2026-07-07 15:10:00",
    "name": "Aarav Sharma",
    "email": "aarav.sharma@example.com",
    "country_code": "+91",
    "mobile_without_country_code": "9876543210",
    "company": "Tech Solutions",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "lead_owner": "Sarah Jenkins",
    "crm_status": "GOOD_LEAD_FOLLOW_UP",
    "crm_note": "Interested in premium tier packages. Needs follow up tomorrow.",
    "data_source": "leads_on_demand",
    "possession_time": "Immediate",
    "description": "Enquired about software integration services."
  },
  {
    "created_at": "2026-07-07 11:20:00",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "country_code": "+1",
    "mobile_without_country_code": "5551234567",
    "company": "Doe Corp",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "lead_owner": "David Miller",
    "crm_status": "SALE_DONE",
    "crm_note": "Deal closed successfully. Contract signed.",
    "data_source": "meridian_tower",
    "possession_time": "1 month",
    "description": "Purchased commercial suite 5B."
  },
  {
    "created_at": "2026-07-06 18:45:00",
    "name": "Priya Patel",
    "email": "priya.patel@example.com",
    "country_code": "+91",
    "mobile_without_country_code": "9123456789",
    "company": "Creative Agency",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "lead_owner": "Sarah Jenkins",
    "crm_status": "DID_NOT_CONNECT",
    "crm_note": "Called twice, number busy.",
    "data_source": "eden_park",
    "possession_time": "Under construction",
    "description": "Looking for residential plots."
  },
  {
    "created_at": "2026-07-06 09:15:00",
    "name": "Michael Smith",
    "email": "michael.smith@example.com",
    "country_code": "+1",
    "mobile_without_country_code": "2025550143",
    "company": "Smith Enterprises",
    "city": "Austin",
    "state": "Texas",
    "country": "USA",
    "lead_owner": "David Miller",
    "crm_status": "BAD_LEAD",
    "crm_note": "Spam number, wrong contact details.",
    "data_source": "varah_swamy",
    "possession_time": "N/A",
    "description": "Automated form submission."
  },
  {
    "created_at": "2026-07-05 16:30:00",
    "name": "Rohan Das",
    "email": "rohan.das@example.com",
    "country_code": "+91",
    "mobile_without_country_code": "9811223344",
    "company": "Das Logistics",
    "city": "Kolkata",
    "state": "West Bengal",
    "country": "India",
    "lead_owner": "Sarah Jenkins",
    "crm_status": "GOOD_LEAD_FOLLOW_UP",
    "crm_note": "Expressed high interest in plots, requested brochure.",
    "data_source": "sarjapur_plots",
    "possession_time": "6 months",
    "description": "Interested in buying 2BHK flat."
  },
  {
    "created_at": "2026-07-05 10:00:00",
    "name": "Emily Watson",
    "email": "emily.watson@example.com",
    "country_code": "+44",
    "mobile_without_country_code": "7700900077",
    "company": "Watson Design",
    "city": "London",
    "state": "England",
    "country": "UK",
    "lead_owner": "David Miller",
    "crm_status": "SALE_DONE",
    "crm_note": "Converted lead. Subscription activated.",
    "data_source": "leads_on_demand",
    "possession_time": "Immediate",
    "description": "SEO services inquiry."
  },
  {
    "created_at": "2026-07-04 14:10:00",
    "name": "Amit Kumar",
    "email": "amit.kumar@example.com",
    "country_code": "+91",
    "mobile_without_country_code": "9988776655",
    "company": "Kumar Steel",
    "city": "New Delhi",
    "state": "Delhi",
    "country": "India",
    "lead_owner": "Sarah Jenkins",
    "crm_status": "GOOD_LEAD_FOLLOW_UP",
    "crm_note": "Discussing pricing terms next Monday.",
    "data_source": "meridian_tower",
    "possession_time": "Ready to move",
    "description": "Looking for office space for 50 employees."
  },
  {
    "created_at": "2026-07-04 11:05:00",
    "name": "Sarah Davis",
    "email": "sarah.davis@example.com",
    "country_code": "+1",
    "mobile_without_country_code": "6505550198",
    "company": "Davis Real Estate",
    "city": "San Francisco",
    "state": "California",
    "country": "USA",
    "lead_owner": "David Miller",
    "crm_status": "DID_NOT_CONNECT",
    "crm_note": "Left a voicemail.",
    "data_source": "eden_park",
    "possession_time": "2 years",
    "description": "Inquired about phase 3 villa pre-launch."
  },
  {
    "created_at": "2026-07-03 15:40:00",
    "name": "Karan Malhotra",
    "email": "karan.m@example.com",
    "country_code": "+91",
    "mobile_without_country_code": "9345678901",
    "company": "Malhotra Textiles",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "country": "India",
    "lead_owner": "Sarah Jenkins",
    "crm_status": "BAD_LEAD",
    "crm_note": "Accidental submission, not looking for real estate.",
    "data_source": "varah_swamy",
    "possession_time": "N/A",
    "description": "Clicked ad by mistake."
  },
  {
    "created_at": "2026-07-03 09:30:00",
    "name": "Jessica Taylor",
    "email": "jessica.t@example.com",
    "country_code": "+1",
    "mobile_without_country_code": "3125550122",
    "company": "Taylor Consulting",
    "city": "Chicago",
    "state": "Illinois",
    "country": "USA",
    "lead_owner": "David Miller",
    "crm_status": "SALE_DONE",
    "crm_note": "Advance payment received.",
    "data_source": "sarjapur_plots",
    "possession_time": "Immediate",
    "description": "Booked plot #45 at Sarjapur."
  },
  {
    "created_at": "2026-07-02 17:00:00",
    "name": "Vikram Singh",
    "email": "vikram.singh@example.com",
    "country_code": "+91",
    "mobile_without_country_code": "9812345678",
    "company": "Singh Agri",
    "city": "Jaipur",
    "state": "Rajasthan",
    "country": "India",
    "lead_owner": "Sarah Jenkins",
    "crm_status": "GOOD_LEAD_FOLLOW_UP",
    "crm_note": "Callback scheduled for Friday morning.",
    "data_source": "leads_on_demand",
    "possession_time": "3 months",
    "description": "Interested in agricultural plots."
  },
  {
    "created_at": "2026-07-02 13:50:00",
    "name": "David Wilson",
    "email": "david.w@example.com",
    "country_code": "+1",
    "mobile_without_country_code": "2065550175",
    "company": "Wilson Tech",
    "city": "Seattle",
    "state": "Washington",
    "country": "USA",
    "lead_owner": "David Miller",
    "crm_status": "DID_NOT_CONNECT",
    "crm_note": "Switched off.",
    "data_source": "meridian_tower",
    "possession_time": "Immediate",
    "description": "Wants to lease coworking spaces."
  },
  {
    "created_at": "2026-07-02 10:20:00",
    "name": "Neha Gupta",
    "email": "neha.gupta@example.com",
    "country_code": "+91",
    "mobile_without_country_code": "9911223344",
    "company": "Gupta Jewellers",
    "city": "Pune",
    "state": "Maharashtra",
    "country": "India",
    "lead_owner": "Sarah Jenkins",
    "crm_status": "GOOD_LEAD_FOLLOW_UP",
    "crm_note": "Wants to visit site on Sunday.",
    "data_source": "eden_park",
    "possession_time": "Ready to move",
    "description": "Looking for 3BHK luxurious apartment."
  },
  {
    "created_at": "2026-07-01 16:15:00",
    "name": "James Anderson",
    "email": "james.a@example.com",
    "country_code": "+44",
    "mobile_without_country_code": "7700900088",
    "company": "Anderson Capital",
    "city": "Manchester",
    "state": "England",
    "country": "UK",
    "lead_owner": "David Miller",
    "crm_status": "SALE_DONE",
    "crm_note": "First installment paid.",
    "data_source": "varah_swamy",
    "possession_time": "6 months",
    "description": "Commercial unit booking."
  },
  {
    "created_at": "2026-07-01 11:10:00",
    "name": "Siddharth Rao",
    "email": "sid.rao@example.com",
    "country_code": "+91",
    "mobile_without_country_code": "9740123456",
    "company": "Rao Advisory",
    "city": "Hyderabad",
    "state": "Telangana",
    "country": "India",
    "lead_owner": "Sarah Jenkins",
    "crm_status": "BAD_LEAD",
    "crm_note": "Already bought another property. Disqualified.",
    "data_source": "sarjapur_plots",
    "possession_time": "N/A",
    "description": "Looking for investment options."
  },
  {
    "created_at": "2026-07-01 09:00:00",
    "name": "Robert Taylor",
    "email": "robert.t@example.com",
    "country_code": "+1",
    "mobile_without_country_code": "2125550188",
    "company": "Taylor & Co",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "lead_owner": "David Miller",
    "crm_status": "GOOD_LEAD_FOLLOW_UP",
    "crm_note": "Requesting layout plans for review.",
    "data_source": "leads_on_demand",
    "possession_time": "1 year",
    "description": "Interested in penthouse suites."
  }
];

async function seedDatabase() {
  try {
    const usersStore = new JsonStore("users", []);
    const leadsStore = new JsonStore("leads", []);

    const users = usersStore.read();
    if (users.length === 0) {
      console.log("🌱 Database is empty. Seeding demo credentials...");
      
      const hashed = await bcrypt.hash("demo123", 10);
      const demoUser = {
        id: "029a2977-0b80-4f0c-8109-fb20b468dc96",
        name: "Demo User",
        email: "demo@groweasy.ai",
        password: hashed,
        company: "GrowEasy Demo",
        createdAt: new Date().toISOString()
      };
      
      usersStore.push(demoUser);

      // Seed mock leads
      leadsStore.write(mockLeads);
      
      console.log("🌱 Database seeded successfully with demo user and leads!");
    }
  } catch (err) {
    console.error("❌ Failed to seed database:", err);
  }
}

module.exports = { seedDatabase };
