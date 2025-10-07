# 10. Location of KPI Calculation

Date: 2025-09-22

## Status

Accepted.

## Context

As part of building the data dashboard, we need to calculate and present KPIs (e.g., user activity, sales trends, engagement metrics). The choice of where to calculate these KPIs has a major impact on performance, maintainability, and scalability.

The options considered were:

1. **Database (Views / Materialized Views in PostgreSQL)** – KPIs are calculated directly in the database and exposed to the backend.
2. **Backend (Application Layer via Prisma/ORM or custom queries)** – KPIs are computed dynamically in the service layer, possibly cached in memory or via Redis.
3. **Frontend (React, client-side aggregation)** – KPIs are calculated in the browser after fetching raw data via APIs.

---

## Decision

We compared the alternatives across 5 criteria:

1. **Performance & Scalability**
2. **Consistency of KPI definitions**
3. **Ease of Maintenance & Flexibility**
4. **Impact on Frontend Complexity**
5. **Educational/Architectural Value**

We decided to calculate KPIs in the **Database (PostgreSQL, using views/materialized views)**.

---

## Alternatives

### 1. Database (PostgreSQL Views / Materialized Views)

* **Advantages**:

  * Centralized KPI definitions → single source of truth.
  * Optimized execution with indexes, caching (materialized views), and DB engine tuning.
  * Reduces load on application and frontend layers.
  * Easier to expose consistent KPIs to multiple consumers (backend, external tools, analytics).
* **Disadvantages**:

  * Requires explicit refresh strategies for materialized views.
  * Less flexibility for rapidly changing KPI definitions (requires SQL changes).
  * Developers need SQL/DB expertise.

### 2. Backend (Service Layer)

* **Advantages**:

  * Flexible: KPI logic can be implemented in TypeScript/JavaScript with Prisma or raw queries.
  * Easier to add caching (e.g., Redis, in-memory) at the application level.
  * Business logic is closer to APIs that serve the frontend.
* **Disadvantages**:

  * Higher compute load on the backend.
  * Risk of duplicating logic if multiple services need the same KPI.
  * Consistency issues if not carefully maintained.

### 3. Frontend (React / Client-Side Aggregation)

* **Advantages**:

  * Maximum flexibility for experimentation and prototyping.
  * Reduces backend/database load (calculations happen on the client).
  * Can work offline if raw data is cached locally.
* **Disadvantages**:

  * Significant data transfer → raw data must be exposed over APIs.
  * Inconsistent KPI definitions (each frontend could calculate differently).
  * Poor performance for large datasets.
  * Increased complexity in frontend code, making maintainability harder.

---

## Consequences

* **Positive**:

  * Centralized KPI logic → all consumers (frontend, APIs, reporting tools) see consistent values.
  * Optimized performance through database-level computation.
  * Reduced complexity in backend and frontend code.
  * Educational value for the team by working with SQL views/materialized views.

* **Negative**:

  * Additional operational overhead for maintaining materialized view refresh strategies.
  * Requires SQL knowledge for developers unfamiliar with database-centric design.
  * Less flexibility for rapid KPI iteration compared to application logic.
