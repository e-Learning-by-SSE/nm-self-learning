Learning Diary
==============

The **Learning Diary** can be accessed via the profile once it has been enabled in the settings. After activation, new tiles appear on the profile page that allow access to the learning diary.

.. _access-and-overview:

Access and Overview
-------------------

Via the *Latest Learning Diary Entry* section, one of the most recent entries created by the system or edited by the user can be opened directly. To access the complete collection, the *My Learning Diary* tile is available. It leads to a tabular overview that can be searched for entries using a search bar.

The table displays the entry number, the associated course, the date, and the duration of the learning activity. Additional columns such as learning location, learning strategy, and learning technique can be shown via a dropdown menu in the table header.

Clicking on a table row opens the corresponding entry, while clicking on the course name redirects to the course page.

.. _page-structure:

Page Structure
--------------

The learning diary page consists of three main sections:

- :ref:`Sidebar <diary-sidebar>`
- :ref:`Navigation in the Diary <diary-navigation>`
- :ref:`Entry <diary-entry>`

.. _diary-sidebar:

Sidebar
~~~~~~~

The left sidebar lists all diary entries chronologically ordered by *Today*, *Yesterday*, *This Week*, *This Month*, and the remaining months. Next to each entry number, the course and the creation date are displayed. An icon visualizes the editing status:

- Blue: *New* (created by the system, not yet opened)
- Gray: *Read* (opened, possibly partially edited)
- Green: *Completed* (fully edited)

A small legend of the status icons can be accessed via the *Info Icon* next to the sidebar title.

.. _diary-navigation:

Navigation in the Diary
~~~~~~~~~~~~~~~~~~~~~~~

Above the actual entry is the navigation bar, which allows browsing through the entries.

The buttons *««* and *»»* jump directly to the first and last entry, respectively. The buttons *< Previous Entry* and *Next Entry >* allow switching between entries. An input field in the middle allows direct access to an entry by its number.

.. _diary-entry:

Entry
~~~~~

.. figure:: /_static/screenshots/diary-entry-compact.png
   :alt: Screenshot of the compact entry in the learning diary
   :align: center
   :width: 80%


Entries consist of two vertically displayed components:

- :ref:`Automatically Collected Data <diary-auto-data>`
- :ref:`User-Defined Data <diary-user-data>`

The **user-defined data** must be filled out to complete an entry and reflect on the learning activity.

.. _diary-auto-data:

Automatically Collected Data
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In the upper area, the date, course, duration of learning, and the number of processed learning units are always visible.  
Clicking the *Show More* button opens a table with detailed information about the individual learning units, including title, processing time, number of solved tasks, success rate, and hints used. The table can be collapsed again with *Show Less*.

.. _diary-user-data:

User-Defined Data
^^^^^^^^^^^^^^^^^

Below the automatically collected information are the fields that must be filled out by the learners themselves. These include learning goals, efforts, techniques used, learning location, distractions, and notes. It is possible to switch between a compact and a detailed view at any time. In the detailed view, short descriptions appear for each field, clarifying the purpose of the input.

.. hlist::
   :columns: 3

   * Learning Goals
   * Learning Location
   * Efforts
   * Distractions
   * Techniques Used
   * Notes

The *Learning Goals* field opens a dialog with the learning goal editor. Users can mark existing goals as *in progress* or *completed* or create new learning goals. Every change is automatically documented in the diary entry.

The *Learning Location* field opens a selection window with the options *Library*, *Cafe*, *Home*, and *University*. Additionally, a free text field is available for individual locations, such as *on the bus*.

For *Efforts* and *Distractions*, a five-level star scale appears. Five stars correspond to a high effort or strong distraction, while one star indicates a low value.

The *Techniques Used* field opens an extensive dialog in which more than sixty learning techniques are grouped by strategy type: repetition, elaboration, organization, planning, monitoring, evaluation, resource management, and motivation. Next to each strategy is an info icon that displays a short description, as well as a *More Information* link that leads to a nanomodule explaining the respective strategy in more detail. Learners can click on individual techniques to rate their usefulness on a five-point scale. After confirming with *Done*, the rated number of stars is displayed next to the technique. For each strategy category, there is also a *Create Own Technique* link, through which a new technique can be named and rated. Editing is completed via the *OK* button.

The *Notes* field provides a Markdown editor in which freely formulated comments or observations, for example about distractions during the learning session, can be entered.

.. _entry-completion:

Completion of an Entry
~~~~~~~~~~~~~~~~~~~~~~

A learning diary entry is considered complete when all required input fields have been filled out and saved. The system-collected data is always present and does not need to be manually supplemented. Thus, each completed entry forms a comprehensive, combined record of objective learning activities and subjective reflection.