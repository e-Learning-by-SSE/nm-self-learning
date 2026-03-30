nm-self-learning-docs
=====================

Documentation for the SELF-le@rning platform.

Adding new documentation
------------------------

Adding new content
~~~~~~~~~~~~~~~~~~

To add new documentation, create a new ``.rst`` file in the ``docs/de/source/`` for the german document and ``docs/en/source`` for the english documentation inside the directory. Make sure to name the file appropriately according to the content. In both directories the file needs to have the identical name for the documentation to work properly. After creating the file, update the ``index.rst`` file to include a link to the new documentation page in both directories.

Adding images
^^^^^^^^^^^^^

Images are placed inside the ``docs/<language>/source/_static/screenshots/`` directory.

Referencing
~~~~~~~~~~~

``:ref:`label``` and ``:doc:`<path/to/file>``` references can be used to link to specific sections or documents within the documentation. These references will display as links in the rendered documentation, allowing users to navigate easily between related topics. By default these links will have the sections or document titles as link text. For better maintenance of multi-language documentation, you should customize the link text by providing an alternative text before the reference in the following format: ```Label text <...>```.

Sections
^^^^^^^^

For each section heading, include a label for cross-referencing. Place this line immediately above the heading it refers to. You can reference this section elsewhere in the same ``.rst`` file using ``:ref:`label-name``` or ``:ref:`Label text <label-name>```.

**Example**::

    .. _section-label:

    Section Title
    -------------

    Refer to :ref:`this section <section-label>`.

Files
^^^^^

To reference the section from a different ``.rst`` file from the same directory, use use ``:doc:`<path/to/file>``` or ``:doc:`Label text <path/to/file>```. 

**Example**: You have a file ``settings.rst`` file. To reference the file from another file, use ``:doc:`Settings <\settings>```.

Translating documentation
~~~~~~~~~~~~~~~~~~~~~~~~~

When translating documentation, ensure that the translated content is placed in the corresponding file within the ``docs/<language>/source/`` directory. Make sure to use the same label names across all translations. When translating the text you should only translate the label text and never the label name itself. If you change the label name make sure to apply it in all translations. 

**Example**: You have a section labeled as ``.. _settings:`` in the English documentation, it should remain ``.. _settings:`` in the German translation. When referencing this label the german documentation should use ``:doc:`Einstellungen <\settings>``` while the english documentation should use ``:doc:`Settings <\settings>```.

When translating the ``index.rst`` file, ensure that the structure and references are consistent across all language versions. Only translate the visible text, not the file paths or label names.