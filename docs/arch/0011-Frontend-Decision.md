# Frontend Library Decision

Date: 2025-09-30

## Status

Accepted.

## Context

As part of building the Study Time Heatmap for the Student Dashboard, we need a frontend library capable of visualizing time-based activity data. The visualization should be intuitive, support different views (day, week, month, year), and integrate well with our UI/UX design guidelines.

Several libraries and approaches were considered:

1. **Chart.js (with Chart.HeatMap plugin)** - General charting library with a plugin for heatmaps.
2. **React Calendar Heatmap** - React-specific library for GitHub-style activity views.
3. **Cal-Heatmap** - A flexible, feature-rich JavaScript library for calendar heatmaps.
4. **D3.js** Highly flexible but requires significant custom development effort.

---

## Decision

We will use Chart.js as the frontend visualization library, extended with the Chart.HeatMap plugin to enable heatmap rendering.

This choice was made because Chart.js is not only suitable for the heatmap but can also serve as the standard charting library for other visualizations in the Student Dashboard and the Course Creator Dashboard. This avoids the need to integrate and maintain multiple visualization libraries.

---

Alternatives

### 1. Chart.js + Chart.HeatMap (Chosen)

* **Advantages:**

  * Widely adopted, large community, good documentation.
  * Supports multiple chart types → consistent look and feel across dashboards.
  * Heatmap plugin provides sufficient functionality with low configuration overhead.
  * Active ecosystem and plugin system for future extensibility.
* **Disadvantages:**

  * Heatmap support is external (via plugin), not core Chart.js.
  * Less specialized for calendar-style layouts compared to Cal-Heatmap.

### 2. React Calendar Heatmap

* **Advantages:**

  * Lightweight, React-focused solution.
  * Easy to implement for GitHub-style activity views.
* **Disadvantages:**

  * Limited flexibility for alternative layouts (e.g., hourly grids).
  * Smaller community and less active development compared to Chart.js.

### 3. Cal-Heatmap

* **Advantages:**

  * Rich feature set with support for different time scales (hour, day, week, month, year).
  * Built-in support for aggregations, tooltips, and advanced configuration.
* **Disadvantages:**

  * More complex to configure and customize.
  * Not React-specific, requiring additional integration work.

### 4. D3.js

* **Advantages:**

  * Maximum flexibility, supports highly customized visualizations.
  * High performance with large datasets.
* **Disadvantages:**

  * Steep learning curve, higher implementation effort.
  * Increased development time and complexity.
  * Harder to ensure visual consistency across dashboards.

  ## Consequences

* **Positive**:
  * One unified charting library (Chart.js) for heatmaps and other charts → less dependency overhead.
  * Consistent visual design across dashboards (Student + Course Creator).
  * Stable, community-supported ecosystem.
  * Easier onboarding for new developers familiar with Chart.js.

* **Negative**:
  * Reliance on a third-party plugin (Chart.HeatMap) may introduce maintenance risks.
  * Some advanced calendar-like layouts may require workarounds.