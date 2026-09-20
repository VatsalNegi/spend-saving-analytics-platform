# Spend & Saving Analytics Platform

A full-stack Spend & Saving Analytics Platform built using **React, Django REST Framework, and PostgreSQL**.

The platform helps users analyze organizational spending, monitor budgets, identify savings opportunities, visualize spending patterns, and manage spend records through a secure authenticated dashboard.

---

## 🚀 Live Application

### Frontend
https://spend-saving-analytics-platform.vercel.app

### Backend API
https://dashboard.render.com/web/srv-dan8np142hec73dksqi0

### GitHub Repository
https://github.com/VatsalNegi/spend-saving-analytics-platform

---

## 📌 Project Overview

The Spend & Saving Analytics Platform is a full-stack web application designed to provide an interactive view of organizational spending and savings.

Users can:

- Monitor total budget and actual spending
- Analyze savings and savings percentage
- Identify over-budget records
- Filter spending data dynamically
- Analyze vendors, categories, locations, and business units
- View interactive charts
- Generate data-driven insights
- Search and manage spend records
- Add, edit, and delete records
- Persist all changes to PostgreSQL

The application follows a modern **React frontend + REST API backend + PostgreSQL database** architecture.

---

# ✨ Features

## 🔐 Authentication

- JWT-based authentication
- Secure login
- Logout functionality
- Protected dashboard
- Automatic access-token refresh
- Authenticated REST API requests

---

## 📊 Analytics Dashboard

The dashboard provides a centralized view of organizational spending.

### Global Filters

Users can filter the complete dashboard using:

- Date Range
- Business Unit
- Category
- Vendor
- Location
- Status

All dashboard components dynamically update according to the selected filters.

### Filter Controls

- Apply filters
- Reset filters
- Dynamic dashboard updates

---

# 📈 KPI Cards

The dashboard provides multiple key performance indicators:

- Total Budget
- Total Actual Spend
- Total Savings
- Savings Percentage
- Over Budget Count
- Approved Count
- Total Records
- Average Spend

---

# 📉 Data Visualizations

The application includes multiple dynamic visualizations:

- Line Chart
- Bar Chart
- Pie / Donut Chart
- Stacked Bar Chart
- Area Chart
- Comparative spending analytics

All visualizations are generated dynamically from database data and respond to dashboard filters.

---

# 💡 Dynamic Business Insights

The platform generates data-driven insights based on the available spend data.

Examples include:

- Highest spending category
- Highest actual-spend business unit
- Vendor spending patterns
- Over-budget records
- Category-level savings
- Average spend per record

The insights update dynamically when dashboard filters are changed.

---

# 📋 Spend Management

The Spend Records section provides an interactive data table.

### Table Features

- Search
- Sorting
- Filtering
- Pagination
- Column resizing
- Column reordering
- Column pinning
- Show / hide columns
- Horizontal scrolling

---

# ✏️ CRUD Operations

Users can manage spend records directly from the application.

### Create

Add a new spend record using the form.

### Read

View spend records retrieved from PostgreSQL through REST APIs.

### Update

Edit:

- Date
- Department
- Business Unit
- Category
- Vendor
- Location
- Budget
- Actual Spend
- Priority
- Payment Method

### Delete

Delete an existing spend record with confirmation.

All changes are persisted to the production PostgreSQL database.

---

# 🧮 Savings Calculations

The platform calculates savings dynamically.

### Savings

```text
Savings = Budget - Actual Spend
