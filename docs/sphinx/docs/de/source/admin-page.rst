.. _admin-page:

Adminseite
==========

Die Adminseite dient der Verwaltung und Übersicht aller Inhalte innerhalb der SELF-le@rning Plattform. Sie ist nur für Benutzer:innen mit Administratorrechten zugänglich.

Auf der Adminseite befinden sich verschiedene Kacheln, die einen bestimmten Bereich der Lernplattform repräsentieren. Jede Kachel leitet dabei auf eine spezifische Seite weiter in der die Einträge für den jeweiligen Inhaltstyp angezeigt und verwaltet werden können:

* Nanomodule verwalten
* Kurse verwalten
* Fachgebiete verwalten
* Autor:innen verwalten
* Lizenzen verwalten
* Nutzer:innen verwalten
* REST-API Dokumentation
* LLM-Konfiguration

.. _manage-nanomodules:

Nanomodule verwalten
--------------------

Leitet zur Seite für die Verwaltung aller :doc:`Nanomodule <\nano-module-editor>` weiter. Bietet eine tabellarische Übersicht aller Nanomodule mit Such- und Filterfunktionen. Neue Nanomodule können über den "Nanomodul erstellen"-Button erstellt werden. Bestehende Nanomodule können durch Anklicken des Titels bearbeitet werden.

.. _manage-courses:

Kurse verwalten
---------------

Leitet zur Seite für die Verwaltung aller :doc:`Kurse <\course-editor>` weiter. Bietet eine tabellarische Übersicht aller Kurse mit Such- und Filterfunktionen. Neue Kurse können über den "Kurs erstellen"-Button erstellt werden. Bestehende Kurse können durch Anklicken des Titels bearbeitet werden.

.. _manage-subject-areas:

Fachgebiete verwalten
---------------------

Leitet zur Seite für die Verwaltung aller Fachgebiete weiter. Bietet eine tabellarische Übersicht aller Fachgebiete mit Such- und Filterfunktionen. Neue Fachgebiete können über den "Fachgebiet erstellen"-Button erstellt werden. Bei der Erstellung wird einem Fachgebiet ein Titel, ein Slug und ein Untertitel zugeordnet. Zusätzlich lassen sich ein Bild für den Banner und ein Bild für die Kachel hochladen. Bestehende Fachgebiete können ebenfalls bearbeitet werden.

Die Verwaltung von Spezialisierungen erfolgt über die Fachgebietsseite. Durch Klicken auf das Fachgebiet in der Übersicht wird zur Seite des Fachgebiets weitergeleitet. Hier befindet sich eine Auflistung der im Fachgebiet enthaltenen Spezialisierungen. Neue Spezialisierungen können über den "Spezialisierung erstellen"-Button hinzugefügt werden. Die Erstellung einer Spezialisierung ist identisch zu der Erstellung eines Fachgebiets. Weiterhin lassen sich über den "Autoren verwalten"-Button Autor:innen direkt der Spezialisierung zuordnen.

Auf der Spezialisierungsseite befindet sich eine tabellarische Übersicht aller Kurse, die der Spezialisierung zugeordnet sind. Neue Kurse können über den "Kurs erstellen"-Button erstellt und direkt mit der Spezialisierung verknüpft werden. Bestehende Kurse lassen sich über den "Kurs verknüpfen"-Button der Spezialisierung zuordnen. Die Zuordnung eines Kurses zu einer Spezialisierung lässt sich über das X-Icon in der Kursübersicht wieder entfernen.

.. _manage-authors:

Autor:innen verwalten
---------------------

Leitet zur Seite für die Verwaltung aller Autor:innen weiter. Bietet eine tabellarische Übersicht aller Autor:innen mit Such- und Filterfunktionen. Neue Autor:innen lassen sich über den "Autor hinzufügen"-Button aus einer tabellarischen Übersicht bestehender Nutzer:innen hinzufügen. Berechtigungen bestehender Autor:innen können über den ":icon:`pencil` Bearbeiten"-Button angepasst werden. In der Ansicht können Autor:innen Berechtigungen für einzelne Fachgebiete und Spezialisierungen erteilt werden.

.. _manage-licenses:

Lizenzen verwalten
------------------

Leitet zur Seite für die Verwaltung aller Lizenzen weiter. Bietet eine tabellarische Übersicht aller Lizenzen mit Such- und Filterfunktionen. Neue Lizenzen können erstellt, bestehende bearbeitet oder gelöscht werden. Jede Lizenz verfügt über einen Namen, eine Lizenz-URL, eine Lizenz-Bild-URL, eine Beschreibung und Optionen. Die Optionen umfassen:

* Auswählbar: Entscheidet, ob Lizenz in einer Lerneinheit auswählbar ist.
* Export erlaubt: Entscheidet, ob LiaScript-Export erlaubt ist.
* Standardlizenz: Legt fest, ob Lizenz als Standardlizenz für neue Lerneinheiten verwendet wird.

.. _manage-users:

Nutzer:innen verwalten
----------------------

Leitet zur Seite für die Verwaltung aller Nutzer:innen weiter. Bietet eine tabellarische Übersicht aller Nutzer:innen mit Such- und Filterfunktionen. Bestehende Nutzer:innen können bearbeitet oder gelöscht werden. Es können der Name, der Anzeigename, die E-Mail-Adresse und die Rollen der Nutzer:innen geändert werden. Weiterhin kann das Anzeigebild angepasst werden. Bei der Löschung von Nutzerdaten wird zwischen "Nutzerdaten löschen" und "Alle Daten löschen" unterschieden. Erstere Option entfernt nur personenbezogene Daten, während letztere alle mit dem Nutzerkonto verbundenen Daten entfernt.

.. _rest-api-documentation:

REST-API Dokumentation
----------------------

Leitet zur Seite mit der REST-API Dokumentation weiter. Diese Seite bietet eine Übersicht aller verfügbaren API-Endpunkte, deren Methoden, Parameter und Beispielanfragen. Die Dokumentation dient als Referenz für Entwickler:innen, die die SELF-le@rning Plattform in ihre eigenen Anwendungen integrieren möchten.

.. _llm-configuration:

LLM-Konfiguration
-----------------

Leitet zur Seite für die Verwaltung der LLM-Server-Konfiguration weiter. Zur Verwendung von LLM-Funktionalitäten ist zunächst die Angabe der LLM-Server-URL erforderlich. Diese URL verweist auf den Server auf dem die LLM-Modelle ausgeführt werden. Falls für diesen Server ein API-Schlüssel notwendig ist kann dieser in das optionale Feld eingetragen werden. Durch Klicken des "Modelle laden"-Button werden die auf dem Server geladenen Modelle abgerufen. Sobald die Modelle geladen sind lässt sich das Standardmodell für die Plattform auswählen.