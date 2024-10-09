# 8. Adoption of SuperJSON for Data Serialization

Date: 2024-10-09

## Status

Accepted

## Context

Our project has increasingly complex data serialization requirements, particularly due to the newly integrated learning diary feature, which heavily relies on handling `Date` and time in deeply nested data types.

The inferred database method type includes `Date`, while the actual API response returns a `string`, leading to an incompatible type system. This discrepancy has created repetitive manual parsing of date strings and significantly increased the transformation overhead.

Handling deeply nested data structures further increased complexity, slowing down development.

We are also planning a future update to the skill-lib, which will involve transitioning to ID sets—a data structure that SuperJSON supports natively.

Currently, JSON compatibility is not a high-priority concern, as we have full control over the monoapp's technologies, and client-server parsing is managed easily with TRPC and Next.js. Integration with SuperJSON required only a minor configuration change.

An additional discovery by Elscha showed that in some isolated cases, the data transfer size was reduced by a factor of 10 in API calls involving lists. This improvement is likely due to SuperJSON’s more efficient serialization of complex data types.

## Decision

We have decided to adopt SuperJSON for data serialization across the project. The key factors driving this decision are:

-   Simplification of `Date` and complex type handling in deeply nested structures.
-   Elimination of the recurring manual transformations needed between database types and API responses.
-   Preparation for the future adoption of ID sets in the skill-lib update.
-   The unexpected benefit of reduced data transfer size in certain API calls.

## Consequences

-   **Positive**: See key factors for decision above.

-   **Negative**:
    -   SuperJSON introduces minor incompatibilities with strict JSON, though this is mitigated by our full control over the client-server architecture.
    -   There may be a slight performance overhead in parsing due to the added metadata, but this is not expected to be significant in our use case.
    -   Project Setup may needs to be changed, since superjson is a native ECMASCript Module which is set in the next.js config. So it can lead to problems when running tests.
