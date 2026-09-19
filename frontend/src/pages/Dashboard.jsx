import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Download,
  Edit3,
  Filter,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import {
  createSpend,
  getDashboard,
  getSpends,
  updateSpend,
} from "../services/api";

import "./Dashboard.css";


const initialFilters = {
  date_from: "",
  date_to: "",
  business_unit: "",
  category: "",
  vendor: "",
  location: "",
  status: "",
};


const emptyForm = {
  date: "",
  department: "",
  business_unit: "",
  category: "",
  vendor: "",
  location: "",
  budget: "",
  actual_spend: "",
  status: "Approved",
  priority: "Medium",
  payment_method: "Monthly",
};


function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}


function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}


function Dashboard({ onLogout }) {

  const [filters, setFilters] = useState(initialFilters);

  const [dashboard, setDashboard] = useState(null);

  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [sortField, setSortField] = useState("date");

  const [sortDirection, setSortDirection] = useState("desc");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(8);

  const [showColumns, setShowColumns] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);


  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    department: true,
    business_unit: true,
    category: true,
    vendor: true,
    location: true,
    budget: true,
    actual_spend: true,
    savings: true,
    status: true,
  });

  const [pinnedColumns, setPinnedColumns] = useState([]);

  const tableRef = useRef(null);
const [pinnedOffsets, setPinnedOffsets] = useState({});

  const [columnOrder, setColumnOrder] = useState([
    "date",
    "department",
    "business_unit",
    "category",
    "vendor",
    "location",
    "budget",
    "actual_spend",
    "savings",
    "status",
  ]);


  const columnLabels = {
    date: "Date",
    department: "Department",
    business_unit: "Business Unit",
    category: "Category",
    vendor: "Vendor",
    location: "Location",
    budget: "Budget",
    actual_spend: "Actual Spend",
    savings: "Savings",
    status: "Status",
  };


  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [dashboardData, spendData] = await Promise.all([
        getDashboard(filters),
        getSpends(),
      ]);

      setDashboard(dashboardData);

      const spendRecords = Array.isArray(spendData)
        ? spendData
        : spendData.results || [];

      setRecords(spendRecords);

    } catch (err) {

      console.error(err);

      if (err.response?.status === 401) {
        onLogout();
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard data."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, [filters]);


  const handleFilterChange = (field, value) => {

    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));

    setPage(1);
  };


  const resetFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };


  const handleSort = (field) => {

    if (sortField === field) {

      setSortDirection(
        sortDirection === "asc" ? "desc" : "asc"
      );

    } else {

      setSortField(field);
      setSortDirection("asc");
    }
  };


  const filteredRecords = useMemo(() => {

    let result = [...records];

    const query = search.trim().toLowerCase();

    if (query) {

      result = result.filter((record) =>
        [
          record.vendor,
          record.category,
          record.business_unit,
          record.department,
          record.location,
          record.status,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          )
      );
    }


    // Apply dashboard filters to the table too.
    if (filters.date_from) {
      result = result.filter(
        (record) =>
          String(record.date) >= filters.date_from
      );
    }

    if (filters.date_to) {
      result = result.filter(
        (record) =>
          String(record.date) <= filters.date_to
      );
    }

    if (filters.business_unit) {
      result = result.filter(
        (record) =>
          record.business_unit === filters.business_unit
      );
    }

    if (filters.category) {
      result = result.filter(
        (record) =>
          record.category === filters.category
      );
    }

    if (filters.vendor) {
      result = result.filter(
        (record) =>
          record.vendor === filters.vendor
      );
    }

    if (filters.location) {
      result = result.filter(
        (record) =>
          record.location === filters.location
      );
    }

    if (filters.status) {
      result = result.filter(
        (record) =>
          record.status === filters.status
      );
    }


    result.sort((a, b) => {

      let first = a[sortField];
      let second = b[sortField];

      if (
        ["budget", "actual_spend", "savings"].includes(sortField)
      ) {
        first = Number(first || 0);
        second = Number(second || 0);
      } else {
        first = String(first || "").toLowerCase();
        second = String(second || "").toLowerCase();
      }

      if (first < second) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (first > second) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });

    return result;

  }, [
    records,
    search,
    filters,
    sortField,
    sortDirection,
  ]);


  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / pageSize)
  );


  const paginatedRecords = filteredRecords.slice(
    (page - 1) * pageSize,
    page * pageSize
  );


  useEffect(() => {

    if (page > totalPages) {
      setPage(totalPages);
    }

  }, [page, totalPages]);


  const openAddModal = () => {
    setEditingRecord(null);
    setForm(emptyForm);
    setModalOpen(true);
  };


  const openEditModal = (record) => {

    setEditingRecord(record);

    setForm({
      date: record.date || "",
      department: record.department || "",
      business_unit: record.business_unit || "",
      category: record.category || "",
      vendor: record.vendor || "",
      location: record.location || "",
      budget: record.budget || "",
      actual_spend: record.actual_spend || "",
      status: record.status || "Approved",
      priority: record.priority || "Medium",
      payment_method: record.payment_method || "Monthly",
    });

    setModalOpen(true);
  };


  const handleFormChange = (field, value) => {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  const handleSubmit = async (event) => {
  event.preventDefault();

  // Required field validation
  if (
    !form.date ||
    !form.department ||
    !form.business_unit ||
    !form.category ||
    !form.vendor ||
    !form.location ||
    !form.budget ||
    !form.actual_spend
  ) {
    alert("Please fill all required fields.");
    return;
  }

  // Numeric validation
  const budget = Number(form.budget);
  const actualSpend = Number(form.actual_spend);

  if (Number.isNaN(budget) || Number.isNaN(actualSpend)) {
    alert("Budget and Actual Spend must be valid numbers.");
    return;
  }

  // Negative value validation
  if (budget < 0 || actualSpend < 0) {
    alert("Budget and Actual Spend cannot be negative.");
    return;
  }

  // Budget cannot be zero
  if (budget === 0) {
    alert("Budget must be greater than zero.");
    return;
  }


    const calculatedStatus =
      Number(form.actual_spend) > Number(form.budget)
        ? "Over Budget"
        : "Approved";


    const payload = {
      ...form,
      budget: Number(form.budget),
      actual_spend: Number(form.actual_spend),
      status: calculatedStatus,
    };


    try {

      setSaving(true);

      if (editingRecord) {

        await updateSpend(
          editingRecord.id,
          payload
        );

      } else {

        await createSpend(payload);
      }

      setModalOpen(false);

      await loadData();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Unable to save record."
      );

    } finally {
      setSaving(false);
    }
  };


  const moveColumn = (column, direction) => {

    setColumnOrder((previous) => {

      const currentIndex = previous.indexOf(column);

      const newIndex =
        direction === "left"
          ? currentIndex - 1
          : currentIndex + 1;

      if (
        currentIndex === -1 ||
        newIndex < 0 ||
        newIndex >= previous.length
      ) {
        return previous;
      }

      const next = [...previous];

      [
        next[currentIndex],
        next[newIndex],
      ] = [
        next[newIndex],
        next[currentIndex],
      ];

      return next;
    });
  };


  const toggleColumn = (column) => {

    setVisibleColumns((previous) => ({
      ...previous,
      [column]: !previous[column],
    }));
  };

  const togglePinColumn = (column) => {
  setPinnedColumns((prev) =>
    prev.includes(column)
      ? prev.filter((item) => item !== column)
      : [...prev, column]
  );
};

useLayoutEffect(() => {
  const calculatePinnedOffsets = () => {
    if (!tableRef.current) {
      return;
    }

    const orderedPinnedColumns = columnOrder.filter(
      (column) =>
        visibleColumns[column] &&
        pinnedColumns.includes(column)
    );

    const offsets = {};
    let currentOffset = 0;

    orderedPinnedColumns.forEach((column) => {
      const element = tableRef.current.querySelector(
        `[data-column="${column}"]`
      );

      if (!element) {
        return;
      }

      offsets[column] = currentOffset;
      currentOffset += element.getBoundingClientRect().width;
    });

    setPinnedOffsets(offsets);
  };

  calculatePinnedOffsets();

  const resizeObserver = new ResizeObserver(
    calculatePinnedOffsets
  );

  if (tableRef.current) {
    resizeObserver.observe(tableRef.current);

    tableRef.current
      .querySelectorAll("[data-column]")
      .forEach((element) => {
        resizeObserver.observe(element);
      });
  }

  window.addEventListener(
    "resize",
    calculatePinnedOffsets
  );

  return () => {
    resizeObserver.disconnect();

    window.removeEventListener(
      "resize",
      calculatePinnedOffsets
    );
  };
}, [
  columnOrder,
  pinnedColumns,
  visibleColumns,
]);

  const kpis = dashboard?.kpis || {};

  const charts = dashboard?.charts || {};

  const filtersData = dashboard?.filters || {};

  const insights = dashboard?.insights || [];


  const donutData = charts.statuses || [];


  if (loading && !dashboard) {

    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }


  return (
    <div className="dashboard-shell">

      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        <div className="brand">

          <div className="brand-icon">
            SS
          </div>

          <div>
            <strong>Spend & Saving</strong>
            <span>Analytics Platform</span>
          </div>

        </div>


        <nav className="sidebar-nav">

          <div className="nav-item active">
            <BarChart3 size={19} />
            Dashboard
          </div>

          <div className="nav-item">
            <Wallet size={19} />
            Spend Records
          </div>

        </nav>


        <div className="sidebar-bottom">

          <div className="user-mini">
            <div className="avatar">A</div>

            <div>
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>


      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}


      {/* MAIN */}

      <main className="main-content">

        <header className="topbar">

          <button
            className="mobile-menu"
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
          >
            <Menu size={22} />
          </button>

          <div>
            <h1>Spend Analytics</h1>
            <p>
              Monitor spending, budgets and savings performance
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={loadData}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </header>


        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}


        {/* FILTERS */}

        <section className="filter-panel">

          <div className="filter-heading">
            <div>
              <Filter size={18} />
              <strong>Global Filters</strong>
            </div>

            <button
              className="reset-button"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>


          <div className="filter-grid">

            <div className="filter-field date-field">

              <label>From Date</label>

              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  handleFilterChange(
                    "date_from",
                    e.target.value
                  )
                }
              />

            </div>


            <div className="filter-field date-field">

              <label>To Date</label>

              <input
                type="date"
                value={filters.date_to}
                onChange={(e) =>
                  handleFilterChange(
                    "date_to",
                    e.target.value
                  )
                }
              />

            </div>


            <SelectFilter
              label="Business Unit"
              value={filters.business_unit}
              options={filtersData.business_units || []}
              onChange={(value) =>
                handleFilterChange(
                  "business_unit",
                  value
                )
              }
            />


            <SelectFilter
              label="Category"
              value={filters.category}
              options={filtersData.categories || []}
              onChange={(value) =>
                handleFilterChange(
                  "category",
                  value
                )
              }
            />


            <SelectFilter
              label="Vendor"
              value={filters.vendor}
              options={filtersData.vendors || []}
              onChange={(value) =>
                handleFilterChange(
                  "vendor",
                  value
                )
              }
            />


            <SelectFilter
              label="Location"
              value={filters.location}
              options={filtersData.locations || []}
              onChange={(value) =>
                handleFilterChange(
                  "location",
                  value
                )
              }
            />


            <SelectFilter
              label="Status"
              value={filters.status}
              options={filtersData.statuses || []}
              onChange={(value) =>
                handleFilterChange(
                  "status",
                  value
                )
              }
            />

          </div>

        </section>


        {/* KPI CARDS */}

        <section className="kpi-grid">

          <KpiCard
            title="Total Budget"
            value={formatCurrency(kpis.total_budget)}
            icon={<Wallet size={21} />}
            subtitle={`${formatNumber(kpis.total_records)} records`}
          />

          <KpiCard
            title="Actual Spend"
            value={formatCurrency(kpis.total_spend)}
            icon={<DollarSign size={21} />}
            subtitle={`Avg. ${formatCurrency(kpis.average_spend)}`}
          />

          <KpiCard
            title="Total Savings"
            value={formatCurrency(kpis.total_savings)}
            icon={
              kpis.total_savings >= 0
                ? <TrendingDown size={21} />
                : <TrendingUp size={21} />
            }
            subtitle="Budget minus actual spend"
            negative={kpis.total_savings < 0}
          />

          <KpiCard
            title="Savings Rate"
            value={`${kpis.savings_percentage || 0}%`}
            icon={<TrendingDown size={21} />}
            subtitle="Against total budget"
            negative={kpis.savings_percentage < 0}
          />

          <KpiCard
            title="Over Budget"
            value={formatNumber(kpis.over_budget_count)}
            icon={<TrendingUp size={21} />}
            subtitle="Records exceeding budget"
            negative={kpis.over_budget_count > 0}
          />

          <KpiCard
            title="Approved Records"
            value={formatNumber(kpis.approved_count)}
            icon={<BarChart3 size={21} />}
            subtitle={`of ${formatNumber(kpis.total_records)} records`}
          />

        </section>


        {/* CHARTS */}

        <section className="chart-grid">

          <ChartCard
            title="Monthly Budget vs Actual Spend"
            subtitle="Spending trend over time"
            className="chart-wide"
          >

            <ResponsiveContainer width="100%" height={300}>

              <LineChart data={charts.monthly || []}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="month" />

                <YAxis
                  tickFormatter={(value) =>
                    `₹${Math.round(value / 1000)}k`
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="budget"
                  name="Budget"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="actual_spend"
                  name="Actual Spend"
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

              </LineChart>

            </ResponsiveContainer>

          </ChartCard>


          <ChartCard
            title="Spend by Category"
            subtitle="Actual spend distribution"
          >

            <ResponsiveContainer width="100%" height={300}>

              <BarChart
                data={charts.categories || []}
                layout="vertical"
                margin={{
                  left: 20,
                  right: 20,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  tickFormatter={(value) =>
                    `₹${Math.round(value / 1000)}k`
                  }
                />

                <YAxis
                  type="category"
                  dataKey="category"
                  width={125}
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Bar
                  dataKey="actual_spend"
                  name="Actual Spend"
                  fill="#6366f1"
                  radius={[0, 6, 6, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </ChartCard>


          <ChartCard
            title="Business Unit Performance"
            subtitle="Budget vs actual spend"
          >

            <ResponsiveContainer width="100%" height={300}>

              <BarChart data={charts.business_units || []}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="business_unit" />

                <YAxis
                  tickFormatter={(value) =>
                    `₹${Math.round(value / 1000)}k`
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Legend />

                <Bar
                  dataKey="budget"
                  name="Budget"
                  fill="#94a3b8"
                />

                <Bar
                  dataKey="actual_spend"
                  name="Actual Spend"
                  fill="#6366f1"
                />

              </BarChart>

            </ResponsiveContainer>

          </ChartCard>


          <ChartCard
            title="Spend Status"
            subtitle="Approved vs over budget"
          >

            <ResponsiveContainer width="100%" height={300}>

              <PieChart>

                <Pie
                  data={donutData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                >

                  {donutData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.status ===
                          "Over Budget"
                            ? "#ef4444"
                            : "#10b981"
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </ChartCard>


          <ChartCard
            title="Budget & Spend Area"
            subtitle="Cumulative financial trend"
            className="chart-wide"
          >

            <ResponsiveContainer width="100%" height={300}>

              <AreaChart data={charts.monthly || []}>

                <defs>

                  <linearGradient
                    id="budgetGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#6366f1"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="#6366f1"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="spendGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#0f766e"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="#0f766e"
                      stopOpacity={0}
                    />
                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="month" />

                <YAxis
                  tickFormatter={(value) =>
                    `₹${Math.round(value / 1000)}k`
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Legend />

                <Area
                  type="monotone"
                  dataKey="budget"
                  name="Budget"
                  stroke="#6366f1"
                  fill="url(#budgetGradient)"
                />

                <Area
                  type="monotone"
                  dataKey="actual_spend"
                  name="Actual Spend"
                  stroke="#0f766e"
                  fill="url(#spendGradient)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </ChartCard>

        </section>


        {/* INSIGHTS */}

        <section className="insights-section">

          <div className="section-title">

            <div>
              <h2>Smart Insights</h2>
              <p>
                Automatically generated from current filters
              </p>
            </div>

          </div>


          <div className="insight-grid">

            {insights.slice(0, 6).map(
              (insight, index) => (

                <div
                  className="insight-card"
                  key={index}
                >

                  <div className="insight-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <p>{insight}</p>

                </div>

              )
            )}

          </div>

        </section>


        {/* TABLE */}

        <section className="table-section">

          <div className="table-header">

            <div>
              <h2>Spend Records</h2>

              <p>
                {filteredRecords.length} records
                {search
                  ? ` matching "${search}"`
                  : ""}
              </p>
            </div>


            <div className="table-actions">

              <div className="search-box">

                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search vendor, category..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />

              </div>


              <div className="column-settings">

                <button
                  className="secondary-button"
                  onClick={() =>
                    setShowColumns(!showColumns)
                  }
                >
                  <Settings2 size={17} />
                  Columns
                </button>


                {showColumns && (

                  <div className="column-menu">

                    <strong>
                      Table Columns
                    </strong>

                    {columnOrder.map(
                      (column) => (

                        <div
                          className="column-option"
                          key={column}
                        >

                          <label>

                            <input
                              type="checkbox"
                              checked={
                                visibleColumns[column]
                              }
                              onChange={() =>
                                toggleColumn(column)
                              }
                            />

                            {columnLabels[column]}

                          </label>


                          <div className="column-move">

  <button
    type="button"
    title={
      pinnedColumns.includes(column)
        ? "Unpin column"
        : "Pin column"
    }
    className={
      pinnedColumns.includes(column)
        ? "pin-button active"
        : "pin-button"
    }
    onClick={() =>
      togglePinColumn(column)
    }
  >
    📌
  </button>

  <button
    type="button"
    onClick={() =>
      moveColumn(column, "left")
    }
  >
    ←
  </button>

  <button
    type="button"
    onClick={() =>
      moveColumn(column, "right")
    }
  >
    →
  </button>

</div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>


              <button
                className="primary-button"
                onClick={openAddModal}
              >
                <Plus size={18} />
                Add Record
              </button>

            </div>

          </div>


          <div className="table-wrapper">

            <table ref={tableRef}>

              <thead>
  <tr>
    {columnOrder
      .filter((column) => visibleColumns[column])
      .map((column) => {

        return (
          <th
  key={column}
  data-column={column}
  className={
    pinnedColumns.includes(column)
      ? "pinned-column"
      : ""
  }
  style={
    pinnedColumns.includes(column)
      ? {
          "--pin-left": `${
            pinnedOffsets[column] || 0
          }px`,
        }
      : {}
  }
  onClick={() => handleSort(column)}
>
            <span>
              {columnLabels[column]}
            </span>

            {sortField === column &&
              (sortDirection === "asc" ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              ))}
          </th>
        );
      })}

    <th>Actions</th>
  </tr>
</thead>


              <tbody>

                {paginatedRecords.length === 0 ? (

                  <tr>

                    <td
                      colSpan={
                        columnOrder.filter(
                          (column) =>
                            visibleColumns[column]
                        ).length + 1
                      }
                      className="empty-table"
                    >
                      No records found.
                    </td>

                  </tr>

                ) : (

                  paginatedRecords.map(
                    (record) => (

                      <tr key={record.id}>

                        {columnOrder
                          .filter(
                            (column) =>
                              visibleColumns[column]
                          )
                          .map((column) => (

                            <td
  key={column}
  data-column={column}
  className={
    pinnedColumns.includes(column)
      ? "pinned-column"
      : ""
  }
  style={
    pinnedColumns.includes(column)
      ? {
          "--pin-left": `${
            pinnedOffsets[column] || 0
          }px`,
        }
      : {}
  }
>

                              {column ===
                                "budget" ||
                              column ===
                                "actual_spend" ||
                              column ===
                                "savings"
                                ? formatCurrency(
                                    record[column]
                                  )
                                : column ===
                                  "status"
                                ? (
                                  <span
                                    className={`status-badge ${
                                      record.status ===
                                      "Over Budget"
                                        ? "status-danger"
                                        : "status-success"
                                    }`}
                                  >
                                    {record.status}
                                  </span>
                                )
                                : record[column]}

                            </td>

                          ))}


                        <td>

                          <button
                            className="edit-button"
                            onClick={() =>
                              openEditModal(
                                record
                              )
                            }
                          >
                            <Edit3 size={15} />
                            Edit
                          </button>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>


          <div className="pagination">

            <div className="page-size">

              <span>Rows:</span>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(
                    Number(e.target.value)
                  );
                  setPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>

            </div>


            <div className="pagination-controls">

              <button
                disabled={page === 1}
                onClick={() =>
                  setPage(
                    Math.max(1, page - 1)
                  )
                }
              >
                Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage(
                    Math.min(
                      totalPages,
                      page + 1
                    )
                  )
                }
              >
                Next
              </button>

            </div>

          </div>

        </section>

      </main>


      {/* ADD / EDIT MODAL */}

      {modalOpen && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingRecord
                    ? "Edit Spend Record"
                    : "Add Spend Record"}
                </h2>

                <p>
                  Changes are persisted to PostgreSQL.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setModalOpen(false)
                }
              >
                <X size={20} />
              </button>

            </div>


            <form
              className="record-form"
              onSubmit={handleSubmit}
            >

              <FormInput
                label="Date"
                type="date"
                value={form.date}
                onChange={(value) =>
                  handleFormChange(
                    "date",
                    value
                  )
                }
                required
              />

              <FormInput
                label="Department"
                value={form.department}
                onChange={(value) =>
                  handleFormChange(
                    "department",
                    value
                  )
                }
                required
              />


              <FormInput
                label="Business Unit"
                value={form.business_unit}
                onChange={(value) =>
                  handleFormChange(
                    "business_unit",
                    value
                  )
                }
                required
              />


              <FormInput
                label="Category"
                value={form.category}
                onChange={(value) =>
                  handleFormChange(
                    "category",
                    value
                  )
                }
                required
              />


              <FormInput
                label="Vendor"
                value={form.vendor}
                onChange={(value) =>
                  handleFormChange(
                    "vendor",
                    value
                  )
                }
                required
              />


              <FormInput
                label="Location"
                value={form.location}
                onChange={(value) =>
                  handleFormChange(
                    "location",
                    value
                  )
                }
                required
              />


              <FormInput
                label="Budget"
                type="number"
                min="0"
                value={form.budget}
                onChange={(value) =>
                  handleFormChange(
                    "budget",
                    value
                  )
                }
                required
              />


              <FormInput
                label="Actual Spend"
                type="number"
                min="0"
                value={form.actual_spend}
                onChange={(value) =>
                  handleFormChange(
                    "actual_spend",
                    value
                  )
                }
                required
              />


              <FormSelect
                label="Priority"
                value={form.priority}
                options={[
                  "High",
                  "Medium",
                  "Low",
                ]}
                onChange={(value) =>
                  handleFormChange(
                    "priority",
                    value
                  )
                }
              />


              <FormSelect
                label="Payment Method"
                value={form.payment_method}
                options={[
                  "Monthly",
                  "Purchase Order",
                  "Project",
                  "Annual Contract",
                  "Corporate Card",
                ]}
                onChange={(value) =>
                  handleFormChange(
                    "payment_method",
                    value
                  )
                }
              />


              <div className="calculation-preview">

                <div>
                  <span>Savings</span>

                  <strong>
                    {formatCurrency(
                      Number(form.budget || 0) -
                        Number(
                          form.actual_spend || 0
                        )
                    )}
                  </strong>
                </div>

                <div>
                  <span>Savings %</span>

                  <strong>
                    {Number(form.budget) > 0
                      ? (
                          (
                            Number(
                              form.budget
                            ) -
                            Number(
                              form.actual_spend
                            )
                          ) /
                          Number(
                            form.budget
                          ) *
                          100
                        ).toFixed(2)
                      : "0.00"}
                    %
                  </strong>
                </div>

              </div>


              <div className="modal-actions">

    {editingRecord && (
        <button
            type="button"
            className="delete-button"
            disabled={saving}
            onClick={async () => {
                const confirmed = window.confirm(
                    `Are you sure you want to delete "${editingRecord.vendor}"? This action cannot be undone.`
                );

                if (!confirmed) {
                    return;
                }

                try {
                    setSaving(true);

                    const token = localStorage.getItem("access_token");

                    const response = await fetch(
                        `http://127.0.0.1:8000/api/spends/${editingRecord.id}/`,
                        {
                            method: "DELETE",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Failed to delete record.");
                    }

                    alert("Record deleted successfully.");

                    setModalOpen(false);

                    // Refresh the dashboard/table so all calculations update.
                    window.location.reload();

                } catch (error) {
                    console.error("Delete error:", error);
                    alert("Unable to delete the record. Please try again.");
                    setSaving(false);
                }
            }}
        >
            Delete Record
        </button>
    )}

    <button
        type="button"
        className="secondary-button"
        onClick={() => setModalOpen(false)}
    >
        Cancel
    </button>

    <button
        type="submit"
        className="primary-button"
        disabled={saving}
    >
        {saving
            ? "Saving..."
            : editingRecord
            ? "Update Record"
            : "Create Record"}
    </button>

</div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


/* -------------------------------------------------- */
/* SMALL COMPONENTS */
/* -------------------------------------------------- */


function KpiCard({
  title,
  value,
  icon,
  subtitle,
  negative,
}) {

  return (
    <div
      className={`kpi-card ${
        negative ? "kpi-negative" : ""
      }`}
    >

      <div className="kpi-top">

        <span>{title}</span>

        <div className="kpi-icon">
          {icon}
        </div>

      </div>

      <strong>{value}</strong>

      <small>{subtitle}</small>

    </div>
  );
}


function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}) {

  return (
    <div
      className={`chart-card ${className}`}
    >

      <div className="chart-card-header">

        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

      </div>

      {children}

    </div>
  );
}


function SelectFilter({
  label,
  value,
  options,
  onChange,
}) {

  return (
    <div className="filter-field">

      <label>{label}</label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >

        <option value="">
          All {label}s
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}


function FormInput({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  min,
}) {

  return (
    <div className="form-field">

      <label>
        {label}
        {required && (
          <span className="required">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        min={min}
        required={required}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>
  );
}


function FormSelect({
  label,
  value,
  options,
  onChange,
}) {

  return (
    <div className="form-field">

      <label>{label}</label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}


export default Dashboard;