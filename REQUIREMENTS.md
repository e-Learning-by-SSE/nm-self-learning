# Requirements Specification: self-learn Dashboards

**Last Updated:** September 10, 2025

This document outlines the detailed requirements for the new dashboard features. Its structure is designed to ensure clarity, prioritization, and traceability to project management (Jira) and quality assurance (Acceptance Criteria), as per the project guidelines.

### Assumptions and Dependencies

**1. Data Availability Assumption:**
The requirements and designs outlined in this document are based on the assumption that specific student data points are available from the `self-learn` platform's backend. This includes, but is not limited to:
* Timestamps of student study sessions (for the heatmap).
* Per-module completion status and scores (for the progress charts).
* Data on earned achievements (for the achievements widget).

**2. Dependency on Existing Data Structure:**
The final implementation of the data visualizations is **dependent** on the actual data schema and/or API endpoints available to us. The designs may need to be modified if the required data is not available or is in a different format than anticipated. Clarifying the available data is a critical next step for our team.

---

## Feature 1: Student Dashboard

### Desired Behavior
The main purpose of the student dashboard is to give the student their study time data and show achievements or suggestions based on it. It will serve as a motivational and informational hub for the learner.

### Functional Requirements

| ID      | Requirement Description                                                                 | Priority | Jira Ticket      |
| :------ | :-------------------------------------------------------------------------------------- | :------- | :--------------- |
| SD-FR1  | Display a "My Learning Path" widget showing the user's currently active course and a visual progress bar. | High     | [Link to JIRA-101] |
| SD-FR2  | Display a "Study Time Heatmap" widget showing activity for the current week, with a detailed view available. | High     | [Link to JIRA-102] |
| SD-FR3  | The detailed heatmap view must allow filtering by "Today", "This Week", "This Month", and "This Year". | Medium   | [Link to JIRA-103] |
| SD-FR4  | Display a "Student Progress by Module" view with a color-coded bar chart showing completion rates for each module in a course. | High     | [Link to JIRA-104] |
| SD-FR5  | Display an "Achievements" widget showing earned badges and streaks (e.g., "5-Day Streak"). | Medium   | [Link to JIRA-105] |
| SD-FR6  | Provide a "Recommendation" widget with personalized suggestions based on student's learning data. | Low      | [Link to JIRA-106] |

### Non-Functional Requirements

| ID      | Requirement Description                                                                 |
| :------ | :-------------------------------------------------------------------------------------- |
| SD-NFR1 | The dashboard, including all its charts and data, must load completely within 3 seconds.  |
| SD-NFR2 | The dashboard layout must be responsive and fully functional on desktop, tablet, and mobile screen sizes. |

### Acceptance Criteria (Traceability to Tests)

| ID      | Related FRs   | Scenario                                                        | Expected Result                                                                    |
| :------ | :------------ | :-------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| SD-AC1  | SD-FR1, FR2   | A student logs in and lands on the main dashboard page.           | The "My Learning Path," summary "Study Time Heatmap," "Achievements," and "Recommendation" widgets are all visible. |
| SD-AC2  | SD-FR2, FR3   | A student clicks on the "Study Time Heatmap" widget.              | The user is navigated to the detailed heatmap page, showing the four views (Today, Week, Month, Year). |
| SD-AC3  | SD-FR4        | A student clicks on a course from their "My Learning" section.    | The user is navigated to the "Student Progress by Module" page, showing the bar chart for that specific course. |
| SD-AC4  | SD-NFR2       | A student views the dashboard on a mobile phone.                  | All widgets stack vertically in a single column and are fully readable without horizontal scrolling. |

---

## Feature 2: Course Creator Dashboard

### Desired Behavior
The main goal of the course creator dashboard is to help professors and creators track student enrollment data, providing clear insights into course popularity and growth over time.

### Functional Requirements

| ID      | Requirement Description                                                                 | Priority | Jira Ticket      |
| :------ | :-------------------------------------------------------------------------------------- | :------- | :--------------- |
| CC-FR1  | Display a key metric showing "Total Student Enrollments" across all of the creator's courses. | High     | [Link to JIRA-201] |
| CC-FR2  | Provide a list or table of all courses with their individual enrollment numbers.        | High     | [Link to JIRA-202] |
| CC-FR3  | Display a chart showing new enrollment trends over time (e.g., a bar chart of new enrollments per month). | Medium   | [Link to JIRA-203] |
| CC-FR4  | All data presented must be aggregated and anonymized to protect student privacy.        | High     | [Link to JIRA-204] |


### Non-Functional Requirements

| ID      | Requirement Description                                                                 |
| :------ | :-------------------------------------------------------------------------------------- |
| CC-NFR1 | Data queries for the dashboard must be efficient and load within 5 seconds, even with large datasets. |
| CC-NFR2 | The user interface must be intuitive and easy to understand for non-technical users.     |

### Acceptance Criteria (Traceability to Tests)

| ID      | Related FRs   | Scenario                                                        | Expected Result                                                                    |
| :------ | :------------ | :-------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| CC-AC1  | CC-FR1, FR2   | A course creator logs in and navigates to their dashboard.        | They see the total enrollment number and the list of their courses with individual enrollment counts. |
| CC-AC2  | CC-FR3        | A creator views the enrollment trend chart.                       | The chart correctly displays the number of new students who enrolled in each of the last 6 months. |
| CC-AC3  | CC-FR1        | A new student enrolls in one of the creator's courses.            | The "Total Student Enrollments" number on the dashboard increases by one after the next data refresh. |
