# 6. Bennenung von Nutzerkompetenzen und deren Verknüpfung

Date: 2023-08-22

## Status

Accepted

## Context

Wir entwickeln ein System, das die verschiedenen Fähigkeiten oder Kompetenzen eines Nutzers darstellt. Diese Fähigkeiten müssen benannt werden, und es gibt auch das Bedürfnis, diese Fähigkeiten miteinander zu verknüpfen. Die Benennung dieser Konzepte ist wichtig für die Klarheit, die Dokumentation und die Interaktion mit dem System.

## Decision

1. Statt "competence" verwenden wir **"Skill"** als Bezeichnung für individuelle Fähigkeiten oder Kompetenzen.
2. Für die Darstellung, wie Skills miteinander verbunden sind, verwenden wir den Begriff **"Skill Repository"**.

**Begründung**:

- **Skill**:
  - "Competence" wurde ausgeschlossen, da es in didaktischen Domänen semantisch andere Bedeutungen hat, die zu Verwirrungen führen könnten.
  - "Skill" ist ein klarer und unkomplizierter Begriff, der die gewünschte Bedeutung gut übermittelt und Konflikten mit anderen Begrifflichkeiten vorbeugt.

- **Skill Repository**:
  - "Skill Map" wurde ausgeschlossen, da "Map" leicht mit einem Datentyp im Code zu verwechseln ist.
  - "Skill Tree" wurde ausgeschlossen, da es nicht immer einen Graph-Baum darstellen muss.
  - "Skill Network" wurde nicht in Betracht gezogen, weil es nicht die strukturierte Art der Verknüpfung von Skills widerspiegelt.
  - Obwohl "Repository" in Enterprise-Frameworks oft für Datenbank-Repositories verwendet wird, wurde sich für "Skill Repository" entschieden, da dieser Begriff bereits in vielen Prototypen Verwendung fand und somit für das Team erkennbar und verständlich ist.


## Consequences

- Im Code werden wir uns auf die oben genannten Benennungen stützen, um Klarheit und Einheitlichkeit zu gewährleisten.
- Datenbankmodelle werden ebenfalls entsprechend benannt.
- Schnittstellen, insbesondere zur "skill-library", werden klare und konsistente Benennungen verwenden, um Verwirrung und Fehlinterpretationen zu vermeiden.

