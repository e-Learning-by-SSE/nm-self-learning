Create and edit nano modules
============================

The nano module editor is divided into three sections. Creating a nano module requires filling out :ref:`base-data-nano-module`, creating :ref:`learning-content`, and :ref:`learning-quiz`. These are described below.

.. _base-data-nano-module:

Basic data
~~~~~~~~~~

Each nano module includes the following basic information:

.. hlist::
   :columns: 2

   * Title
   * Slug
   * Subtitle
   * Description
   * Self-regulated learning
   * Authors
   * License
   * Skills

.. _title-slug-subtitle-description:

Title, Slug, Subtitle, and Description
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Assign a concise, descriptive title to your nano module. Based on this title, a slug is automatically generated. This serves as a unique identifier for the URL of the learning unit and must be unique. You can optionally provide a subtitle and a description for your nano module.

.. _license:

License
^^^^^^^

Choose an appropriate license for your nano module from the following options:

* CC BY 4.0: Free use with attribution.
* CC BY SA 4.0: Free use with attribution and share alike.
* Uni-intern: Internal use within the university only (no sharing permitted).

.. _self-regulated-learning:

Self-regulated learning
^^^^^^^^^^^^^^^^^^^^^^^

Activate the checkbox "Activation question and sequential checking" to enable additional features that promote self-regulated learning.

.. _activation-question:

Activation question
"""""""""""""""""""

Activation questions promote active engagement with the learning content before the actual processing. They activate prior knowledge and create mental anchor points.

**Functionality:**

After activation, an additional text field appears for entering the activation question. Formulate a short, stimulating question. The question is displayed to learners before the actual learning content.

.. _sequential-checking:

Sequential checking
"""""""""""""""""""

**Functionality:**

After activation, learners are shown an additional text field below each answer where they can justify their answer decision (correct/incorrect).

.. _skills:

Skills
^^^^^^

In a nano module, it can be specified which skills are conveyed through the learning content and which skills are required for understanding.

**Add skills:**

1. Click on ":icon:`plus` Add"
2. Select one or more skills from the list
3. Click "Save"
4. The selected skills are added to the nano module

New skills are created in the author area under My Skill Cards.

.. _learning-content:

Learning content
~~~~~~~~~~~~~~~~

In a nano module, various presentation media can be combined to convey learning content to students. The following media are available:

.. hlist::
   :columns: 2

   * Article
   * Video 
   * PDF
   * External website

.. _article:

Article
^^^^^^^

1. Click in the text field or on ":icon:`pencil` Edit" button
2. The Markdown editor opens

The right half of the screen shows a live preview of your article while editing.

.. _video:

Video
^^^^^

Videos can be integrated in three ways: URL linking, file selection, file upload

**URL linking**

1. Enter the URL of the desired video
2. The thumbnail of the video is displayed automatically

Note: The selected video must be publicly available.

**File upload**

1. Click "Upload video"
2. Select a video file from your file explorer
3. Click "Open"
4. A dialog with a progress bar appears
5. The thumbnail of the video is displayed after a successful upload

**File selection**

1. Click on the ":icon:`cloud-arrow-up`" button
2. Select a video file from your uploaded files
3. The thumbnail of the video is displayed automatically

.. _pdf:

PDF
^^^

PDF files can be integrated in three ways: URL linking, file selection, file upload

**URL linking**

1. Enter the URL of the desired PDF file
2. The preview of the PDF file is displayed automatically

Note: The selected PDF file must be publicly available.

**File upload**

1. Click "Upload file"
2. Select a PDF file from your file explorer
3. Click "Open"
4. A dialog with a progress bar appears
5. The preview of the PDF file is displayed after a successful upload

**File selection**

1. Click on the ":icon:`cloud-arrow-up`" button
2. Select a PDF file from your uploaded files
3. The preview of the PDF file is displayed automatically

.. _external-website:

External website
^^^^^^^^^^^^^^^^

The integration of external websites is done by specifying a URL and is suitable for the direct embedding of H5P content in a nano module.

.. _learning-quiz:

Learning quiz
~~~~~~~~~~~~~

The editor consists of two areas:

- Task tabs: Here you see all tasks as tabs. Each card shows the task type (e.g., multiple choice, free text) and the position.
- Task form: In this area, you edit the selected task. Here you can define answers and add hints.

.. _create-quiz-task:

Create task
^^^^^^^^^^^

In a learning quiz, different task types can be combined to test learners' knowledge.

1. Click on "Create task"
2. Select the desired task type from the dropdown menu
3. Enter the task or question in the "Task" text field

The following task types are available:

.. hlist::
   :columns: 2

   * Multiple-Choice questions
   * Exact answer questions
   * Free text tasks
   * Cloze tasks
   * Ordering tasks
   * Programming tasks
   * Language tree tasks

.. _sort-quiz-tasks:

Task sorting
^^^^^^^^^^^^

Tasks can be reordered. To move a task, click on the desired task in the task tab and drag it left or right while holding down the mouse button. The task will be moved by one position.

.. _configure-quiz:

Configure learning quiz
^^^^^^^^^^^^^^^^^^^^^^^

Above the task tabs is the configuration for learning quizzes.

.. _default-quiz-configuration:

Default configuration
"""""""""""""""""""""

The default configuration is:

* All questions must be answered correctly to successfully complete the nano module
* Solutions are not shown after an incorrect answer
* Learners can access all hints without affecting success

Advanced configuration
""""""""""""""""""""""

In the advanced settings, you can adjust the following options:

* Show solutions after incorrect answers
* Disable hints
* Set the maximum number of allowed hints
* Set the maximum number of allowed incorrect answers

Task types
^^^^^^^^^^

Multiple-Choice
"""""""""""""""

In Multiple-Choice tasks, you can create multiple answers. The answers support Markdown format.

**Creating answers:**

1. Click ":icon:`plus`" to add a new answer
2. Enter the desired answer
3. Specify for each answer whether it is correct

**Random order:**

Use the switch "Randomly order answers for the user" to optionally enable the random ordering of answers. If random ordering is enabled, the answers are reshuffled with each attempt. By default, random ordering is disabled.

Exact answer
""""""""""""

In exact answer tasks, you define accepted answers that learners must enter.

**Adding answers:**

1. Click ":icon:`plus`"
2. Enter the accepted answer in the text field

Markdown is not supported.

**Case sensitivity:**

Use the switch "Consider case sensitivity" to specify whether case sensitivity is considered during validation. By default, it is ignored.

Cloze tasks
"""""""""""

For cloze tasks, first write a text and then insert gaps that learners must fill.

**Gap formats:**

Two formats are available:
* Text answers: Learners enter the answer freely
* Single choice: Learners choose from predefined options

**Syntax for text answers:**

Simple answer::

    {T: [Boat]}

Multiple correct answers (comma-separated)::
    {T: [Boat, Ship]}

Incorrect answers are marked with a hash::

    {T: [Boat, Ship, #Car]}

**Syntax for Single choice:**

Change the "T" to "C". Incorrect answers are marked with a hash::

    {C: [Boat, Ship, #Car]}

Ordering
""""""""

In ordering tasks, learners assign elements to the appropriate categories.

**Creating categories:**

1. Click "Add category"
2. Enter a title for the category
3. Click "Add"

**Adding elements:**
1. Click ":icon:`plus`"
2. Enter a label for the element
3. Click "Save"

**Moving elements:**

You can move elements by drag-and-drop within and between categories.

**Random order:**

Use the switch "Randomly order answers for the user" to specify whether categories and elements should be randomly ordered. By default, random ordering is disabled.

Creating hints
^^^^^^^^^^^^^^

Tasks can have hints. Click ":icon:`plus`" to create a new hint.