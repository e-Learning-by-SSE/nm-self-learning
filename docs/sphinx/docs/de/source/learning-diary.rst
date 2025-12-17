.. _learning-diary:

Lerntagebuch
============

Hello World

.. icon:: arrow-up

Das **Lerntagebuch** ist über das Profil erreichbar, sobald es in den Einstellungen aktiviert wurde. Nach der Aktivierung erscheinen auf der Profilseite neue Kacheln, über die das Lerntagebuch aufgerufen werden kann.

.. _access-and-overview:

Zugang und Übersicht
--------------------

Über den Abschnitt *Letzter Lerntagebucheintrag* kann einer der zuletzt vom System angelegten oder vom Nutzer bearbeiteten Einträge direkt geöffnet werden. Für den Zugriff auf die gesamte Sammlung dient die Kachel *Mein Lerntagebuch*. Sie führt zu einer tabellarischen Übersicht, die sich mithilfe einer Suchleiste nach Einträgen durchsuchen lässt.  

In der Tabelle sind die Nummer des Eintrags, der zugehörige Kurs, das Datum und die Dauer des Lernvorgangs sichtbar. Über ein Dropdown-Menü im Tabellenkopf lassen sich zusätzliche Spalten wie Lernort, Lernstrategie und Lerntechnik einblenden. 

Durch einen Klick auf eine Tabellenzeile öffnet sich der entsprechende Eintrag, während ein Klick auf den Kursnamen zur Kursseite weiterleitet.

.. _page-structure:

Seitenaufbau
------------

Die Lerntagebuchseite besteht aus drei Hauptbereichen:

- :ref:`Seitenleiste <diary-sidebar>`
- :ref:`Navigation im Tagebuch <diary-navigation>`
- :ref:`Eintrag <diary-entry>`

.. _diary-sidebar:

Seitenleiste
~~~~~~~~~~~~

Die linke Seitenleiste listet alle Tagebucheinträge chronologisch geordnet nach *Heute*, *Gestern*, *Diese Woche*, *Diesen Monat* und den restlichen Monaten auf. Neben jeder Eintragsnummer werden der Kurs und das Erstellungsdatum angezeigt. Ein Icon visualisiert den Bearbeitungsstatus:

- Blau: *Neu* (vom System angelegt, noch nicht geöffnet)
- Grau: *Gelesen* (geöffnet, ggf. teilweise bearbeitet)
- Grün: *Ausgefüllt* (vollständig bearbeitet)

Eine kleine Legende der Statussymbole kann über das *Info-Icon* neben dem Titel der Seitenleiste aufgerufen werden.

.. _diary-navigation:

Navigation im Tagebuch
~~~~~~~~~~~~~~~~~~~~~~

Oberhalb des eigentlichen Eintrags befindet sich die Navigationsleiste, mit der durch die Einträge geblättert werden kann. 

Die Buttons *««* und *»»* springen direkt zum ersten bzw. letzten Eintrag. Mit den Buttons *< Vorheriger Eintrag* und *Nächster Eintrag >* kann zwischen den Einträgen gewechselt werden. Ein Eingabefeld in der Mitte erlaubt das gezielte Aufrufen eines Eintrags über seine Nummer.

.. _diary-entry:

Eintrag
~~~~~~~

.. figure:: /_static/screenshots/diary-entry-compact.png
   :alt: Screenshot des kompakten Eintrags im Lerntagebuch
   :align: center
   :width: 80%


Einträge bestehen aus zwei untereinander dargestellten Komponenten:

- :ref:`Automatisch erfasste Daten <diary-auto-data>`
- :ref:`Nutzerdefinierte Daten <diary-user-data>`

Die **nutzerdefinierten Daten** sind auszufüllen, um einen Eintrag vollständig abzuschließen und die Lernaktivität zu reflektieren.

.. _diary-auto-data:

Automatisch erfasste Daten
^^^^^^^^^^^^^^^^^^^^^^^^^^

Im oberen Bereich sind stets das Datum, der Kurs, die Dauer des Lernens sowie die Anzahl bearbeiteter Lerneinheiten sichtbar.  
Über den Button *Mehr anzeigen* öffnet sich eine Tabelle mit detaillierten Angaben zu den einzelnen Lerneinheiten, darunter Titel, Bearbeitungsdauer, Anzahl gelöster Aufgaben, Erfolgsrate und verwendete Hinweise. Mit *Weniger anzeigen* lässt sich die Tabelle wieder einklappen.

.. _diary-user-data:

Nutzerdefinierte Daten
^^^^^^^^^^^^^^^^^^^^^^

Unterhalb der automatisch erfassten Informationen befinden sich die Felder, die von den Lernenden selbst ausgefüllt werden. Hierzu gehören Lernziele, Bemühungen, genutzte Techniken, Lernort, Ablenkungen und Notizen. Zwischen einer kompakten und einer detaillierten Darstellung kann jederzeit gewechselt werden. In der detaillierten Ansicht erscheinen zu jedem Feld kurze Beschreibungen, die den Zweck der Eingabe verdeutlichen.

.. hlist::
   :columns: 3

   * Lernziele
   * Lernort
   * Bemühungen
   * Ablenkungen
   * Genutzte Techniken
   * Notizen

Beim Feld *Lernziele* öffnet sich ein Dialog mit dem Lernziel-Editor. Nutzer können dort vorhandene Ziele als *bearbeitet* oder *abgeschlossen* markieren oder neue Lernziele anlegen. Jede Änderung wird automatisch im Tagebucheintrag dokumentiert.

Das Feld *Lernort* öffnet ein Auswahlfenster mit den Optionen *Bibliothek*, *Café*, *zu Hause* und *Universität*. Zusätzlich steht ein Freitextfeld für individuelle Orte, etwa *im Bus*, zur Verfügung.

Bei *Bemühungen* und *Ablenkungen* erscheint eine fünfstufige Sternskala. Fünf Sterne entsprechen einer hohen Bemühung beziehungsweise einer starken Ablenkung, während ein Stern jeweils einen niedrigen Wert angibt.

Das Feld *Genutzte Techniken* öffnet einen umfangreichen Dialog, in dem mehr als sechzig Lerntechniken nach Strategietyp gruppiert sind: Wiederholung, Elaboration, Organisation, Planung, Überwachung, Bewertung, Ressourcenmanagement und Motivation. Neben jeder Strategie befindet sich ein Info-Icon, das eine kurze Beschreibung einblendet, sowie ein Link *Weitere Informationen*, der zu einem Nanomodul führt, das die jeweilige Strategie genauer erläutert. Lernende können einzelne Techniken anklicken, um deren Nutzen über eine fünfstufige Skala zu bewerten. Nach der Bestätigung mit *Fertig* wird die bewertete Sternezahl neben der Technik angezeigt. Für jede Strategiekategorie steht außerdem ein Link *Eigene Technik erstellen* zur Verfügung, über den eine neue Technik benannt und bewertet werden kann. Die Bearbeitung wird über den *OK*-Button abgeschlossen.

Im Feld *Notizen* steht ein Markdown-Editor zur Verfügung, in dem frei formulierte Anmerkungen oder Beobachtungen, beispielsweise zu den Ablenkungen während der Lernsitzung, eingetragen werden können.

.. _entry-completion:

Abschluss eines Eintrags
~~~~~~~~~~~~~~~~~~~~~~~~

Ein Lerntagebucheintrag gilt als abgeschlossen, wenn alle erforderlichen Eingabefelder ausgefüllt und gespeichert wurden. Die systemseitig erfassten Daten sind immer vorhanden und müssen nicht manuell ergänzt werden. Damit bildet jeder ausgefüllte Eintrag eine vollständige, kombinierte Aufzeichnung aus objektiven Lernaktivitäten und subjektiver Reflexion.
