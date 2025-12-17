Creating and Editing Courses
============================

The course editor is divided into two sections. Creating a course requires filling out the :ref:`Base Data <base-data-course>` and creating the :ref:`Course Content <course-content>`. These are described below.

.. _base-data-course:

Base Data
----------

Each course includes the following basic information:

.. hlist::
   :columns: 3

   * Title
   * Slug
   * Subtitle
   * Description
   * Image
   * Authors

Title, Slug, Subtitle, and Description
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Assign a concise, descriptive title to your course. Based on this title, a slug is automatically generated. It serves as a component of the course URL and must be unique. You can optionally provide a subtitle and a description for your course.

Image
~~~~~

Courses can include an optional image. This image is displayed on the course page and as a preview in the author view.

**Add Image:**

1. Click “Upload Image”
2. Select an image file in the file explorer
3. Click “Open”

Authors
~~~~~~~

Courses can have one or more authors. By default, you are added as the author when creating the course. Additional authors can be added as needed.

**Add Author:**

1. Click “Add”
2. Select an author from the list

.. _course-content:

Course Content
--------------

Course content is divided into chapters, each associated with nano modules. Each chapter is displayed as a separate section. The chapter title appears in a header. Next to the title, several *action icons* are available:

* Arrows for :ref:`rearranging <rearrange-course>` the chapter order
* *Pencil icon* for :ref:`editing <create-chapter>` the chapter title
* *Trash icon* for removing the chapter assignment
* *Chevron icon* for expanding and collapsing chapter content

Within a chapter, the associated nano modules are listed vertically. Each nanomodule appears as a single line with its title. Next to the title, several *action icons* are available:

* Arrows for :ref:`rearranging <rearrange-course>` within the chapter
* *X icon* for removing the assignment from the chapter

If the nanomodule includes a learning check, it is displayed to the left of the X icon.

.. _create-chapter:

Creating Chapters
~~~~~~~~~~~~~~~~~

1. Click “Create Chapter”
2. Enter a title and optionally a description
3. Click “Create”

To edit the title and description, click the *pencil icon*.

Populating Chapters
~~~~~~~~~~~~~~~~~~~

Chapters can be populated with content in two ways. New nano modules can be created or existing ones can be linked:

**Create Nano Module:**

Click “Create Nano Module” to create a new nano module. This opens the :doc:`Nano Module Editor <\nano-module-editor>` as a dialog over the course editor. You can open the editor in a separate browser tab by clicking “Open in separate editor.”

**Link Nano Module:**

Click “Link Nano Module” to link an existing nano module to the course. This opens a dialog where you can search and select the desired nano module by title. Linking is possible for both your own nano modules and those of other authors. Please note that editing nano modules created by other authors is not permitted.

.. _rearrange-course:

Rearranging Course Content
~~~~~~~~~~~~~~~~~~~~~~~~~~

Both chapters and nano modules can be rearranged in their order:

**Rearrange Nano Modules:**

Click the *arrow icons* to the left of a nano module’s title to move it. If a nano module is at the topmost or bottommost position in the course, it can be moved to the previous or next chapter.

**Rearrange Chapters:**

Click the *arrow icons* to the right of the chapter title to move it.
