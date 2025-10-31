# 9. data catalog for data overview

Date: 2025-07-29

## Status

Accepted.

## Context

As part of building a data dashboard for students and course creators, we identified the need for a clear and centralized overview of all available data assets in the system. To ensure transparency, maintainability, and ease of access, a data catalog was considered as the most suitable solution.

Several options were evaluated based on their ability to support our goals around usability, integration, and future scalability:

1. [DataHub](https://datahub.com) – a mature metadata platform with strong lineage and search capabilities
2. [OpenMetadata](https://open-metadata.org) – a modern, extensible catalog with rich ingestion and active development
3. [Amundsen](https://www.amundsen.io) – a lightweight tool focused on search and discoverability
4. A simple spreadsheet in the GitHub repository – minimal setup, suitable for small-scale prototypes

## Decision

To evaluate the best option for this project, we decided on 5 criteria:

1. **Ease of Setup & Maintenance**
2. **Search & Usability**
3. **Metadata Ingestion Flexibility**
4. **Learning & Educational Value**
5. **Lightweight Architecture**
  
We decided to use **OpenMetadata**.
After checking all the options, we came to the following conclusions:

- **Datahub**
	- **Advantages:**
		- Strong support for metadata versioning and lineage.
		- Rich UI for browsing, search, and insights.
		- Good ingestion framework with prebuilt connectors.
	- **Disadvantages:**
		- Heavier architecture with Kafka and Elasticsearch dependencies.
		- More complex to deploy and maintain.
		- Steeper learning curve for contributions or customization.
- **OpenMetadata**
	- **Advantages:**
		- Active development (thriving Community) and clean architecture.
		- Rich ingestion framework with connectors for databases, dashboards, pipelines, and ML models.
		- Great educational value through clear docs and modular structure.
		- Easy to extend and integrate.
	- **Disadvantages:**
		- Still maturing compared to more established tools.
		- UI can be slightly less intuitive in specific flows.
- **Amundsen**
	- **Advantages:**
		- Simple UI, easy to understand for end users.
		- Originally designed by Lyft for fast metadata search.
		- Easy to deploy
	- **Disadvantages:**
		- Limited ingestion flexibility and lineage support.
		- Less active community and development compared to alternatives.
		- Architecture is somewhat outdated and fragmented.
- **Spreadsheet**
	- **Advantages:**
		- Easiest setup—no infrastructure needed.
		- Highly customizable and portable.
		- Great for prototyping or very small-scale use.
	- **Disadvantages:**
		- No automated metadata ingestion.
		- Not scalable or searchable in a meaningful way.
		- No educational value for metadata tooling or architecture.
		- No support for lineage, APIs, or integrations.

  
**Due to the reasons mentioned above, OpenMetadata was the best choice overall**, as it strikes the best balance between ease of setup, ingestion flexibility, educational value, and scalability. It allows for a meaningful prototype that can grow with the project, supports automation and integration, and gives us hands-on experience with a modern metadata platform—without the operational overhead of heavier alternatives like DataHub.

The decision between **Spreadsheet** and **OpenMetadata** was hard because the **Spreadsheet** would have been significantly easier for a quick prototype and initial demonstration. However, with more data sources and the potential scaling of the project, it would very quickly become unmanageable, especially in terms of consistency, usability, and automation.
## Consequences

- **Positive**:
    - Enables scalable and automated metadata ingestion, making it easier to manage growing and diverse data sources.
    - Provides immediate value through lineage, search, and structured metadata, improving data understanding for both students and course creators.
    - Offers significant educational value by exposing the team to a real-world, modular open-source metadata platform.
    - Reduces future technical debt by avoiding custom or brittle solutions like spreadsheets.
    - Supports integration with future data quality or governance features if needed.
- **Negative**:
    
    - Setup and maintenance are more complex compared to using a static spreadsheet, requiring container orchestration and some system familiarity.
    - As OpenMetadata is still evolving, breaking changes or unstable connectors may introduce occasional upgrade friction.
    - Slightly higher resource usage compared to lightweight alternatives, which may impact prototyping speed if not managed properly.
    - Developers may need time to onboard to OpenMetadata’s architecture and ingestion configuration model.