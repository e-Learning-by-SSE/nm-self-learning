.. _learning-view:

Lernendenansicht
================

Öffnet ein:e Nutzer:in eine Lerneinheit oder einen Kurs, wird die **Lernendenansicht** geladen. Diese Ansicht ist in zwei Hauptbereiche gegliedert: den :ref:`Playlist-Bereich <playlist-area>` und die :ref:`Nanomodul-Ansicht <nano-module-view>`.

.. _playlist-area:

Playlist-Bereich
----------------

Der Playlist-Bereich zeigt den *Kursfortschritt* sowie die *Kursstruktur* als vertikale Liste an. In dieser Liste werden die Kapitel und die darin enthaltenen Nanomodule dargestellt. Das aktuell ausgewählte Nanomodul ist *grau hervorgehoben*, während abgeschlossene Nanomodule mit einem *grünen Häkchen* (:icon:`check-circle`) markiert sind.

.. _nano-module-view:

Nanomodul-Ansicht
---------------------

In der Nanomodul-Ansicht wird der *Lerninhalt* sowie die *Lernkontrolle* angezeigt.

.. _learning-content:

Lerninhalt
~~~~~~~~~~~

Unterstützte Medienformate:

- Videos
- Artikel im Markdown-Format
- PDF-Dokumente
- Externe Webseiten (via IFrame, z. B. H5P-Inhalte)

Navigations-Button führt von den Inhalten zur Lernkontrolle.

.. _learning-quiz:

Lernkontrolle
~~~~~~~~~~~~~

Eine Lernkontrolle besteht aus einer oder mehreren Aufgaben, die in *Reitern* dargestellt werden. Jede Aufgabe kann einzeln bearbeitet werden. Unterstützte Aufgabentypen sind:

.. hlist::
   :columns: 2

   - Multiple-Choice-Aufgaben
   - Freitext-Aufgaben
   - Exakte Antwort-Aufgaben
   - Programmieraufgaben
   - Ordnen-Aufgaben
   - Syntaxbaum-Aufgaben
   - Lückentext-Aufgaben

.. _quiz-functions:

Aufgabenfunktionen
^^^^^^^^^^^^^^^^^^

Für die Bearbeitung von Aufgaben stehen folgende Funktionen zur Verfügung:

- "Überprüfen"-Button: dient der Abgabe der Aufgabe und zeigt an, ob die Antwort richtig oder falsch ist. Nach der Überprüfung wird die Eingabe gesperrt.
- "Reset"-Button: wird verwendet um nach Überprüfung die Aufgabe zurückzusetzen und einen erneuten Versuch zu ermöglichen.

Optional können Autor:innen im :doc:`Nanomodul-Editor </nano-module-editor>` *Hinweise* für Aufgaben definieren. Der "Ich benötige einen Hinweis"-Button ermöglicht das Anfordern dieser Hinweise. Bei mehreren verfügbaren Hinweisen erfolgt die Anzeige sequentiell pro Klick.

.. _self-regulated-learning:

Spezialfall Selbstreguliertes Lernen
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Bei aktivem *Selbstreguliertem Lernen*, welches durch Autor:innen im :doc:`Kurseditor </course-editor>` festgelegt wird, gelten folgende Besonderheiten:

- Vor dem Lerninhalt erscheint eine *Aktivierungsfrage*

    - Studierende geben eine Freitext-Antwort ein, die zur Reflexion dient
    - Nach dem Speichern der Antwort wird der Lerninhalt angezeigt

- Bei Multiple-Choice-Aufgaben wird zusätzlich ein *Begründungsfeld* angezeigt

    - Studierende können ihre Antwort-Entscheidung (korrekt/falsch) begründen
    - Dieses Feld ist optional und wird *nicht automatisch ausgewertet*