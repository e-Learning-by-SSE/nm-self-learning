.. _skill-editor:

Skill-Editor
============

Das Erstellen von neuen Skills erfolgt über den Autorenbereich. Skills werden in sogenannten Skillkarten gespeichert. Unter dem Punkt *Meine Skillkarten* kann über den “Skillkarte erstellen”-Button eine neue Skillkarte erstellt oder mit dem “:icon:`pencil` Bearbeiten”-Button eine bestehende Skillkarte bearbeitet werden.

.. _skill-editor-structure:

Aufbau des Editors
------------------

Der Editor ist in zwei Ansichten geteilt. Auf der linken Seite befindet sich ein Formular mit dem Namen und der Beschreibung der Skillkarte. Wurde bereits ein Skill angelegt und ausgewählt werden unterhalb dieses Formulars Informationen zum ausgewählten Skill angezeigt: Name, Beschreibung (optional) und Skill-Beziehungen. Skill-Beziehungen stellen das primäre Feature des Editors dar und werden unten detailliert erläutert.

Auf der rechten Seite des Editors befindet sich eine tabellarische Übersicht aller bereits erstellten Skills. In dieser Übersicht sind mehrere Aktionen ausführbar:

Über den “Skill erstellen”-Button in der Kopfzeile wird ein neuer Skill angelegt. Beim Hovern über einen Skill in der Tabelle erscheinen mehrere Icons rechts neben dem Namen:

* Durch Anklicken des :icon:`pencil`-Icons wird der in der Tabelle fokussierte Skill in der linken Ansicht geöffnet und kann bearbeitet werden
* Durch Anklicken des :icon:`folder-plus`-Icons wird dem in der Tabelle fokussierten Skill ein Kind-Skill hinzugefügt
* Durch Anklicken des :icon:`trash`-Icons wird der in der Tabelle fokussierte Skill gelöscht

.. _skill-editor-linking:

Verknüpfung von Skills
----------------------

Abhängigkeiten unter Skills lassen sich hierarchisch durch das Erstellen von Eltern-Kind-Beziehungen modellieren. Dies ermöglicht die Abbildung komplexer curricularer Strukturen. Während die rechte tabellarische Ansicht eine Übersicht der gesamten Struktur der Skillkarte bietet, werden in der linken Ansicht die Eltern- und Kind-Beziehungen eines individuellen Skills veranschaulicht. 

Die “:icon:`plus` Hinzufügen”-Buttons der linken Ansicht dienen der Verknüpfung des ausgewählten Skills mit anderen bereits erstellten Skills. Mit Klicken des Button öffnet sich ein Dialog in dem ein oder mehrere Skills entweder als Eltern oder Kinder des ausgewählten Skills deklariert werden können. Um Zyklen in der Modellierung zu vermeiden kann ein einzelner Skill dabei nur als Elternteil oder als Kind und niemals doppelt ausgewählt werden.

Wird einem Skill ein Eltern-Skill hinzugefügt, so wird er diesem untergeordnet. Der Skill ist folglich ein Bestandteil des Eltern-Skills. Wird einem Skill ein Kind-Skill hinzugefügt, so wird er diesem übergeordnet. Diese Hierarchien lassen sich beliebig tief schachteln. 

Zusammenfassend lassen sich Eltern-Kind-Beziehungen auf zwei Arten erstellen: 

* Mit dem Mauszeiger über einen Skill in der Tabelle hovern und das :icon:`folder-plus`-Icon anklicken
* Anklicken des Skill-Namens einen Skill aus der Tabelle auswählen und auf den ":icon:`plus` Hinzufügen"-Button klicken.

Die beiden Arten unterscheiden sich dabei in Ihrer Wirkung und unterstützen damit unterschiedliche Ziele: Ein neuer Skill wird angelegt; ein oder mehrere existierende Skills werden aus einer Liste ausgewählt; ein spezifischer Skill wird direkt zugeordnet. Alle Optionen erzeugen ebenfalls neue Eltern-Beziehungen.
