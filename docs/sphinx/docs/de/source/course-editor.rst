.. _course-editor:

Kurse erstellen und bearbeiten
==============================

Der Editor für Kurse ist in zwei Bereiche unterteilt. Die Erstellung eines Kurses verlangt das Ausfüllen von :ref:`Grunddaten <base-data-course>` und das Erstellen von :ref:`Kursinhalten <course-content>`. Nachfolgend werden diese beschrieben.

.. _base-data-course:

Grunddaten
----------

Jeder Kurs beinhaltet folgende Grundinformationen:

.. hlist::
   :columns: 3

   * Titel
   * Slug
   * Untertitel
   * Beschreibung
   * Bild
   * Autoren

.. _title-slug-subtitle-description:

Titel, Slug, Untertitel und Beschreibung
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Vergeben Sie für Ihren Kurs einen prägnanten, beschreibenden Titel. Ausgehend von diesem Titel wird automatisch ein Slug generiert. Dieser dient als Baustein für die URL des Kurses und muss einzigartig sein. Für Ihren Kurs können Sie optional einen Untertitel und eine Beschreibung anlegen.

.. _image:

Bild
~~~~

Kurse verfügen über ein optionales Bild. Dieses wird auf der Kursseite und als Vorschau in der Autor:innenansicht angezeigt.

**Bild hinzufügen:**

1. Klicken Sie auf den "Bild hochladen"-Button
2. Wählen Sie eine Bilddatei im Datei-Explorer aus
3. Klicken Sie auf "Öffnen"

.. _authors:

Autoren
~~~~~~~

Kurse verfügen über ein oder mehrere Autor:innen. Standardmäßig werden Sie bei der Erstellung des Kurses als Autor:in hinzugefügt. Weitere Autor:innen können nach Belieben hinzugefügt werden.

**Autor:in hinzufügen:**

1. Klicken Sie auf ":icon:`plus` Hinzufügen"
2. Wählen Sie eine:n Autor:in aus der Liste aus

.. _course-content:

Kursinhalt
----------

.. figure:: /_static/screenshots/chapters-course-editor.png
   :alt: Screenshot des Kapitel-Editors
   :align: center
   :width: 80%

Kursinhalte sind in Kapitel unterteilt denen Nanomodule zugeordnet sind. Jedes Kapitel wird als eigener Bereich dargestellt. Der Titel des Kapitels erscheint in einer Kopfzeile. Neben dem Titel sind mehrere *Aktions-Icons* verfügbar:

* :icon:`arrow-up`- und :icon:`arrow-down`-Icons zum :ref:`Verschieben <rearrange-course>` des Kapitels in der Reihenfolge
* :icon:`pencil`-Icon zum :ref:`Bearbeiten <create-chapter>` des Kapiteltitels
* :icon:`trash`-Icon zum Entfernen der Zuordnung des Kapitels
* :icon:`chevron-left`- und :icon:`chevron-down`-Icons zum Ein- und Ausklappen der Kapitelinhalte

Innerhalb eines Kapitels sind die zugehörigen Nanomodule untereinander angeordnet. Jedes Nanomodul wird als einzelne Zeile mit Titel angezeigt. Neben dem Titel sind mehrere *Aktions-Icons* verfügbar:

* :icon:`arrow-up`- und :icon:`arrow-down`-Icons zum :ref:`Verschieben <rearrange-course>` innerhalb des Kapitels
* :icon:`x-mark`-Icon zum Entfernen der Zuordnung zum Kapitel

Verfügt das Nanomodul über eine Lernkontrolle wird dies links neben dem :icon:`x-mark`-Icon angezeigt.

.. _create-chapter:

Kapitel erstellen
~~~~~~~~~~~~~~~~~

1. Klicken Sie auf den "Kapitel erstellen"-Button
2. Geben Sie einen Titel und optional eine Beschreibung ein
3. Klicken Sie auf den "Erstellen"-Button

Für die Bearbeitung des Titels und der Beschreibung klicken Sie auf das :icon:`pencil`-Icon.

.. _fill-chapter:

Kapitel befüllen
~~~~~~~~~~~~~~~~

Kapitel lassen sich auf zwei Arten mit Inhalten befüllen. Neue Nanomodule können erstellt oder bestehenden Nanomodule verknüpft werden:

**Nanomodule erstellen:**

Klicken Sie auf den "Nanomodul erstellen"-Button um ein neues Nanomodul zu erstellen. Daraufhin öffnet sich der :doc:`Nanomodul-Editor <\nano-module-editor>` als Dialog über dem Kurs-Editor. Der Editor lässt sich in einem separaten Browser-Tab öffnen indem Sie auf "Im separaten Editor öffnen" klicken.

**Nanomodule verknüpfen:**

Klicken Sie auf den ":icon:`link` Nanomodul verknüpfen"-Button um ein existierendes Nanomodul mit dem Kurs zu verknüpfen. Daraufhin öffnet sich ein Dialog in dem Sie das gewünschte Nanomodul anhand dessen Titel suchen und auswählen können. Die Verknüpfung ist sowohl für Ihre eigenen als auch Nanomodule anderen Autor:innen möglichen. Bitte beachten Sie, dass Ihnen die Bearbeitung von Nanomodulen anderer Autor:innen untersagt ist.

.. _rearrange-course:

Kursinhalte verschieben
~~~~~~~~~~~~~~~~~~~~~~~

Sowohl Kapitel als auch Nanomodule lassen sich in ihrer Reihenfolge verschieben:

**Nanomodule verschieben:**

Klicken Sie auf die :icon:`arrow-up`- und :icon:`arrow-down`-Icons links neben dem Titel eines Nanomodules um es zu verschieben. Befindet sich ein Nanomodul an der obersten oder untersten Stelle des Kurses, so kann es in das vorherige oder nächste Kapitel verschoben werden.

**Kapitel verschieben:**

Klicken Sie auf die :icon:`arrow-up`- und :icon:`arrow-down`-Icons rechts neben dem Titel des Kapitels um es zu verschieben.