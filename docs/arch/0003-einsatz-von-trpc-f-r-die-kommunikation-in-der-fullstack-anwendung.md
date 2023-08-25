# 3. Einsatz von tRPC für die Kommunikation in der Fullstack Anwendung

Date: 2023-01-01

## Status

Accepted 
by Klingebiel

## Context
In der Entwicklung einer client-server-Anwendung besteht die Notwendigkeit, eine effiziente und typesichere Kommunikation zwischen Client und Server zu implementieren. Es gibt verschiedene Ansätze zur Lösung dieses Problems, einschließlich REST, GraphQL und RPC-Stil-APIs. Nach einer Untersuchung dieser Alternativen wurde festgestellt, dass tRPC - eine TypeScript-spezifische RPC-Bibliothek - potenzielle Vorteile in Bezug auf End-to-End-Type-Sicherheit und Entwicklungseffizienz bieten könnte.
Entscheidung

**Links**:
- https://trpc.io/

## Decision
Wir haben uns dafür entschieden, tRPC in unserem Projekt zu verwenden, um die Kommunikation zwischen Client und Server zu ermöglichen.
Begründung

Die Entscheidung für tRPC basiert auf den folgenden Überlegungen:

- Type-Sicherheit: tRPC nutzt das TypeScript-Typesystem, um eine End-to-End-Type-Sicherheit zu erreichen.
- Entwicklungseffizienz: Änderungen an den API-Typdefinitionen werden sofort im Client-Code widergespiegelt.
- Integration mit vorhandenen Tools: tRPC kann mit TypeScript-Validierungsbibliotheken wie Zod und dem beliebten react-query integriert werden.
- Flexibilität: Obwohl tRPC in erster Linie für Fullstack TypeScript-Anwendungen konzipiert ist, kann es auch für konventionelle HTTP-Anfragen verwendet werden, und eine OpenAPI Specification-Integration ist verfügbar.
- Einfachheit: Es erfordert keine Codegenerierung und ermöglicht eine bessere Übersicht und Kopplung zwischen Server und Client.

## Consequences

**Positive Konsequenzen**
        Vereinfachter Entwicklungsprozess mit verbesserter Type-Sicherheit.
        Verbesserte Wartbarkeit durch direkten Zugang zum Backend-Code aus Client-Referenzen.
        Integration mit react-query ermöglicht automatisches Caching und State-Management.

**Negative Konsequenzen**
        Begrenzte Anwendbarkeit außerhalb von Fullstack TypeScript-Projekten.
        Die Unfamiliarität des Teams mit tRPC könnte anfängliche Lernkurven verursachen.

