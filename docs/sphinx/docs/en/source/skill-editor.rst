Skill-Editor
============

The creation of new skills takes place in the authoring area. Skills are stored in so-called skill cards. Under the item *My Skill Cards*, a new skill card can be created using the "Create Skill Card" button or an existing skill card can be edited using the ":icon:`pencil` Edit" button.

.. _skill-editor-structure:

Structure of the Editor
-----------------------

The editor is divided into two views. On the left side, there is a form with the name and description of the skill card. If a skill has already been created and selected, information about the selected skill is displayed below this form: name, description (optional), and skill relationships. Skill relationships are the primary feature of the editor and are explained in detail below.

On the right side of the editor, there is a tabular overview of all skills that have already been created. Several actions can be performed in this overview:

Using the "Create Skill" button in the header, a new skill is created. When hovering over a skill in the table, several icons appear to the right of the name:

* Clicking the :icon:`pencil` icon opens the skill focused in the table in the left view for editing
* Clicking the :icon:`folder-plus` icon adds a child skill to the skill focused in the table
* Clicking the :icon:`trash` icon deletes the skill focused in the table

.. _skill-editor-linking:

Linking Skills
--------------

Dependencies between skills can be modeled hierarchically by creating parent-child relationships. This allows for the representation of complex curricular structures. While the right tabular view provides an overview of the entire structure of the skill card, the left view illustrates the parent and child relationships of an individual skill.

The “:icon:`plus` Add” buttons in the left view are used to link the selected skill with other already created skills. Clicking the button opens a dialog in which one or more skills can be declared either as parents or children of the selected skill. To avoid cycles in the modeling, a single skill can only be selected as a parent or as a child and never twice.

If a parent skill is added to a skill, it becomes subordinate to the parent skill. The skill is therefore a component of the parent skill. If a child skill is added to a skill, it becomes superior to it. These hierarchies can be nested arbitrarily deep.

In summary, parent-child relationships can be created in two ways:

* Hovering over a skill in the table with the mouse pointer and clicking the :icon:`folder-plus` icon
* Clicking the skill name to select a skill from the table and clicking the ":icon:`plus` Add" button.

The two methods differ in their effect and thus support different goals: a new skill is created; one or more existing skills are selected from a list; a specific skill is directly assigned. All options also create new parent relationships.
