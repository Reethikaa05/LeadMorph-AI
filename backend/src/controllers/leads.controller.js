const { JsonStore } = require("../utils/store");

const leadsStore = new JsonStore("leads", []);

function listLeads(req, res, next) {
  try {
    const { status, source, search, page = 1, limit = 20 } = req.query;
    let leads = leadsStore.read();

    if (status) leads = leads.filter((l) => l.crm_status === status);
    if (source) leads = leads.filter((l) => l.data_source === source);
    if (search) {
      const q = String(search).toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.mobile_without_country_code?.includes(q)
      );
    }

    leads = [...leads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const start = (pageNum - 1) * limitNum;
    const paginated = leads.slice(start, start + limitNum);

    res.json({
      success: true,
      total: leads.length,
      page: pageNum,
      limit: limitNum,
      hasMore: start + limitNum < leads.length,
      leads: paginated,
    });
  } catch (err) {
    next(err);
  }
}

function leadStats(req, res, next) {
  try {
    const leads = leadsStore.read();
    const byStatus = leads.reduce((acc, l) => {
      const key = l.crm_status || "UNSET";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayKey = d.toISOString().slice(0, 10);
      const count = leads.filter((l) => (l.created_at || "").slice(0, 10) === dayKey).length;
      return { date: dayKey, count };
    });

    res.json({
      success: true,
      total: leads.length,
      byStatus,
      trend: last7Days,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listLeads, leadStats };
