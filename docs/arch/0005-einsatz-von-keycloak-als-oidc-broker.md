# 5. Einsatz von Keycloak als OIDC-Broker

Date: 2023-01-01

## Status

Accepted

by Spark    

erweitert [4. Wahl Des Authentifizierungssystems](0004-wahl-des-authentifizierungssystems.md)

## Context

Wir stehen vor der Herausforderung, eine schnelle und flexible Authentifizierungslösung zu implementieren. Das Rechenzentrum (RZ) der Universität wird OIDC erst später unterstützen, und wir haben spezifische Anforderungen an die Plattform, einschließlich der Unterstützung von uni-externen Personen.

## Decision

Wir haben uns entschieden, Keycloak als Broker zwischen dem RZ und der Plattform einzusetzen. Die relevanten Punkte sind:

a. **Schnelle Lösung**: Keycloak kann übergangsweise direkt auf LDAP zugreifen und via OIDC anbieten, bis OIDC im RZ verfügbar ist.
b. **Flexibilität**: Wir können selbständig eigene OIDC-Clients für andere Microservices erstellen.
c. **Sicherheit und Wartung**: Keycloak ist gut gepflegt und gilt als sicher.
d. **Spezifische Integration**: Next-auth besitzt einen speziell auf Keycloak angepassten Provider.
e. **Uni-Externe Unterstützung**: Wir können selbständig Nutzer anlegen für uni-externe Personen, was eine Anforderung an die Plattform ist.

## Consequences

- **Positiv**: Die Entscheidung ermöglicht es uns, schnell und flexibel auf unsere spezifischen Anforderungen zu reagieren.
- **Negativ**: Es wird ein höherer Wartungsaufwand durch eine weitere Software erforderlich. Außerdem wird der Code stärker an Keycloak angepasst, da ein speziell auf Keycloak angepasster Provider über Next-auth verwendet wird.

- [Keycloak-Website](https://www.keycloak.org/)
- [Next-auth Dokumentation](https://next-auth.js.org/)
