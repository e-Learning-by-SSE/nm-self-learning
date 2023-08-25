# 4. Wahl Des Authentifizierungssystems

Date: 2023-01-01

## Status

Accepted

by Spark 

erweitert durch [5. Einsatz von Keycloak als OIDC-Broker](0005-einsatz-von-keycloak-als-oidc-broker.md)

## Context

Unsere Anwendung erfordert ein sicheres, robustes und wartbares Authentifizierungssystem. Drei mögliche Ansätze wurden in Erwägung gezogen:

1. Entwicklung eines eigenen Microservices, der auf LDAP zugreift.
2. Nutzung des öffentlichen Protokolls OAuth2.
3. Nutzung des öffentlichen Protokolls OpenID Connect (OIDC).

## Decision

Wir entscheiden uns für die Nutzung des öffentlichen Protokolls OpenID Connect (OIDC).
Nachdem wir alle drei Optionen geprüft haben, kamen wir zu folgenden Schlüssen:

- **Eigener Microservice mit LDAP**:
    - **Vorteile**:
        - Volle Kontrolle über den Authentifizierungsprozess und teil Kontrolle über Daten (LDAP wird durch das RZ gestellt). 
        - Kann spezifisch an die Unternehmensanforderungen angepasst werden.
    - **Nachteile**:
        - Höherer Entwicklungsaufwand.
        - Notwendigkeit für ständige Wartung und Sicherheitsüberprüfungen.

- **OAuth2**:
    - **Vorteile**:
        - Bewährtes und weit verbreitetes Protokoll für die Autorisierung.
    - **Nachteile**:
        - Nur zur Autorisierung und nicht zur Authentifizierung vorgesehen.
        - Kann erweiterte Implementierungs- und Integrationsanforderungen haben, um die Authentifizierung zu unterstützen.
	- Ausschließlich HTTP

- **OIDC**:
    - **Vorteile**:
        - Basiert auf OAuth2, bietet jedoch zusätzliche Authentifizierungsschichten.
        - Standardisiertes und weit verbreitetes Protokoll.
        - Zahlreiche Bibliotheken und Dienste unterstützen die Implementierung.
        - Wir können das Central Authentication System (Apereo CAS) des RZ der Universtiät Hildesheim für diese Technologie nutzen
    - **Nachteile**:
        - Abhängigkeit von OIDC Bibliotheken und ggf. Abhängigkeit vom RZ da OIDC wie auch Oauth2 auf RZ-Seiten weiterleitet. 
	- Ausschließlich HTTP

Aufgrund der oben genannten Gründe war OIDC insgesamt die beste Wahl, da es eine Kombination aus Authentifizierung und Autorisierung bietet und bereits von vielen Anwendungen und Diensten unterstützt wird.

## Consequences

Das Team muss sich ggf. in OIDC Technologien einarbeiten. Wenn Daten von RZ-Kennungen benötigt werden, hat das RZ nun ebenfalls einen ehöhten Aufwand, da dies in deren OIDC-Schnittstelle übernommen werden muss. 
