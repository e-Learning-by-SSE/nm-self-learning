# 2. Auswahl von React gegenüber Angular

Date: 2023-01-01

Titel: Auswahl von React gegenüber Angular für das Frontend der Nanomodule-Plattform

## Status
Accepted

by Klingebiel

## Context
Im Rahmen der Software Systems Engineering Group an der Universität Hildesheim wurde die Entscheidung getroffen, das Frontend der Nanomodule-Plattform mit der React-basierten Technologiestapel zu erstellen, trotz der Verwendung von Angular in anderen Projekten innerhalb der Gruppe. Die Wahl wurde getroffen, indem mehrere Aspekte der Frameworks verglichen wurden, einschließlich ihrer Grundbausteine und der Komplexität bei der Implementierung allgemeiner UI-Kompositionsmuster.

## Decision
React wird als Technologie für das Frontend gewählt. Die Gründe dafür werden in den folgenden Kategorien zusammengefasst:

1. Type Safety: React bietet eine bessere Typsicherheit, was für das Projekt von wesentlicher Bedeutung ist.
2. Error-prone Verbosity: Angular-Komponenten erfordern viel Metadaten und manuelle Arbeit, was zu Fehlern führen kann
3. Code Colocation: React ermöglicht eine bessere Konsistenz und Wartbarkeit, indem mehrere Komponenten in derselben Datei definiert werden können.
4. Programming Language statt Template Language: React verwendet JavaScript direkt im HTML, was leistungsfähiger ist als die benutzerdefinierte Vorlagensyntax von Angular.
5. Simplicity: React ist durch die Verwendung von Programmiersprachenelementen einfacher und intuitiver für Entwickler, besonders für neue Entwickler.

## Consequences
Die Entscheidung für React sollte zu einer besseren Wartbarkeit, Typsicherheit und einer allgemeinen Senkung der Komplexität in der Entwicklung führen. Es wird erwartet, dass sowohl unerfahrene als auch erfahrene Entwickler von der Verwendung von React profitieren werden. Die Entscheidung birgt jedoch das Risiko, dass sie von der bisherigen Praxis der Gruppe abweicht, Angular zu verwenden, und könnte somit anfängliche Anpassungsschwierigkeiten mit sich bringen.

