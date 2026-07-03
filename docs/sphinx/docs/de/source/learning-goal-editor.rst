.. _learning-goal-editor:

Lernzieleditor
==============

Der **Lernzieleditor** ist für Studierende verfügbar, sofern in den Einstellungen das *Lerntagebuch* aktiviert wurde. Im Profil erscheint dann die Kachel *Meine Lernziele*, die in den Editor weiterleitet.

.. _learning-goal-views:

Ansichten
---------

Der Lernzieleditor bietet zwei verschiedene Ansichten zur Organisation der Lernziele. Der Reiter *In Bearbeitung* zeigt alle aktiven Ziele an, die noch nicht vollständig abgeschlossen sind. Der Reiter *Abgeschlossen* zeigt alle vollständig abgeschlossenen Grob- und Feinziele in einer separaten Übersicht.

.. _create-learning-goal:

Lernziele anlegen
-----------------

Über den Button **Lernziel erstellen** öffnet sich ein Eingabefeld für die Beschreibung des neuen Lernziels.

.. _learning-goal-types:

Grob- und Feinziele
~~~~~~~~~~~~~~~~~~~

Lernziele sind in Grob- und Feinziele unterteilt:

- Grobziel: übergeordnetes Ziel, das mehrere spezifischere Feinziele enthalten kann. 
- Feinziel: spezifisches, detailliertes Ziel, das einem Grobziel zugeordnet ist.

Bei der Erstellung eines Lernziels kann in einem Dropdown-Menü optional ein übergeordnetes Ziel ausgewählt werden. Dies erzeugt ein neues Feinziel unterhalb des übergeordneten Ziels. Wird kein übergeordnetes Ziel ausgewählt, entsteht ein eigenständiges Grobziel.

.. _learning-goal-status:

Bearbeitungsstatus
~~~~~~~~~~~~~~~~~~

Jedes Lernziel verfügt über drei verschiedene Bearbeitungsstati, die durch unterschiedliche Farben gekennzeichnet sind:

- Nicht bearbeitet: grau
- In Bearbeitung: orange
- Abgeschlossen: grün

Der Statuswechsel erfolgt durch einen Klick auf den Statusindikator, wodurch zyklisch zwischen den drei Stati umgeschaltet wird.

.. _learning-goal-rules:

Regeln für Grob- und Feinziele
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Enthält ein Grobziel *mindestens ein Feinziel*, bestimmt dessen Status auch den Status des Grobziels:

  - Ist ein Feinziel im Status *In Bearbeitung*, erhält auch das Grobziel den Status *In Bearbeitung*
  - Sind alle Feinziel im Status *Abgeschlossen*, bleibt das Grobziel zunächst im Status *In Bearbeitung*
  - Grobziele können erst nach manueller Bestätigung den Status *Abgeschlossen* erhalten

Ein als *Abgeschlossen* markiertes Feinziel kann durch erneuten Klick wieder auf *Nicht bearbeitet* gesetzt werden. Dadurch ändert sich gegebenenfalls auch der Status des übergeordneten Grobziels.

.. _learning-goal-functions:

Weitere Funktionen
~~~~~~~~~~~~~~~~~~

Für die Verwaltung der Lernziele stehen folgende Funktionen zur Verfügung:

- :icon:`plus`-Button: fügt einem bestehenden Grobziel ein neues Feinziel hinzu
- :icon:`pencil`-Button: Bearbeiten der Beschreibung eines Ziels
- :icon:`trash`-Button: Entfernen eines Ziels aus der Liste
