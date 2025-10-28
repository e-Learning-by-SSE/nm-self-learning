# Frontend Library Decision

Date: 2025-10-28

## Status

Accepted.

## Context

As part of the Study Time Heatmap feature for the Student Dashboard, we need a frontend visualization library capable of displaying time-based activity data in various views (day, week, month, year).  
The visualization should integrate seamlessly into our UI, offer flexible customization, and ensure long-term maintainability.

In the initial implementation, we selected Chart.js combined with the Chart.HeatMap plugin because it aligned well with our existing charting setup and provided basic heatmap functionality.

However, during development, it became evident that the Chart.HeatMap plugin is not compatible with the latest Chart.js version (v4+).  
The plugin is no longer actively maintained and depends on outdated Chart.js APIs.  
As a result, integration led to runtime errors and rendering inconsistencies that could not be resolved without downgrading Chart.js, which was not an acceptable trade-off.

Therefore, a reassessment of available libraries was necessary.


1. **Chart.js (with Chart.HeatMap plugin)** - General charting library with a plugin for heatmaps (Discontinued).
2. **Chart.js + chartjs-chart-matrix** - Official Chart.js extension for rendering matrix-style visualizations.
3. **React Calendar Heatmap** - React-specific library for GitHub-style activity views.
4. **Cal-Heatmap** - A flexible, feature-rich JavaScript library for calendar heatmaps.
5. **D3.js** Highly flexible but requires significant custom development effort.


---

## Decision

We will continue using Chart.js as the base visualization library,  
but replace the deprecated Chart.HeatMap plugin with the actively maintained chartjs-chart-matrix plugin.

chartjs-chart-matrix is officially supported by the Chart.js maintainers and provides similar heatmap-like visualization capabilities.  
It allows us to render two-dimensional matrix data (e.g., time vs. day, hours vs. activity level) efficiently and integrates directly with Chart.js v4+ without compatibility issues.

This decision ensures that the Heatmap feature remains fully aligned with our overall charting strategy while preserving compatibility, performance, and maintainability.


---

Alternatives

### 1. Chart.js + Chart.HeatMap (Discontinued)

* **Advantages:**

  * Originally provided simple heatmap visualization.
  * Integrated well with Chart.js v3.
* **Disadvantages:**

  * Not compatible with Chart.js v4 and newer.
  * No longer actively maintained.
  * Causes runtime errors with modern Chart.js builds.

### 2. Chart.js + chartjs-chart-matrix (Chosen)

* **Advantages:**

  * Actively maintained and compatible with Chart.js v4+.
  * Officially recognized by the Chart.js team.
  * Flexible enough to create custom heatmap-style grids.
  * Uses native Chart.js APIs, consistent configuration and theming.
  * Easier long-term maintenance and predictable updates.
* **Disadvantages:**

  * Requires manual implementation of axis labels and tooltips.
  * Does not provide a built-in “calendar heatmap” layout (requires logic for daily, weekly, and monthly aggregation).



### 3. React Calendar Heatmap

* **Advantages:**

  * Lightweight, React-focused solution.
  * Easy to implement for GitHub-style activity views.
* **Disadvantages:**

  * Limited flexibility for alternative layouts (e.g., hourly grids).
  * Smaller community and less active development compared to Chart.js.

### 4. Cal-Heatmap

* **Advantages:**

  * Rich feature set with support for different time scales (hour, day, week, month, year).
  * Built-in support for aggregations, tooltips, and advanced configuration.
* **Disadvantages:**

  * More complex to configure and customize.
  * Not React-specific, requiring additional integration work.

### 5. D3.js

* **Advantages:**

  * Maximum flexibility, supports highly customized visualizations.
  * High performance with large datasets.
* **Disadvantages:**

  * Steep learning curve, higher implementation effort.
  * Increased development time and complexity.
  * Harder to ensure visual consistency across dashboards.

  ## Consequences

* **Positive**:
  * Keeps Chart.js as the unified charting library across the project.
  * Ensures full compatibility with Chart.js v4+ and future versions.
  * Reduces technical debt and maintenance risks.
  * Allows continued use of Chart.js styling, themes, and responsive behavior.
  * Provides enough flexibility for day/week/month/year heatmap variations.

* **Negative**:
  * Requires some custom logic for grid aggregation and tooltips.
  * Slightly more setup effort compared to a dedicated heatmap plugin.
  
  
* **Summary:**  
We replaced the outdated Chart.HeatMap plugin with chartjs-chart-matrix to maintain compatibility with Chart.js v4+, ensure long-term maintainability, and preserve a consistent visualization ecosystem across the application.