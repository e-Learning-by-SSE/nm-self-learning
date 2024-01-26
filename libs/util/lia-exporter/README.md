# lia-exporter

This library was generated with [Nx](https://nx.dev).

This library will export a course from the SELF-le@rning platform as lia script markdown as far as reasonable.

Quizzes:
-Single choice: fully exportable, with hints
-Multiple choice: fully exportable, with hints
-Free text: fully exportable (as we do not provide checks for this)
-Cloze quiz: Only single word answers and multiple choice can be exported, gaps with multiple correct answers are not supported and are solved by just using the first of the possible answers
-Coding: only JS is executable other languages will be shown as a task without interaction options. The solutions cannot be checked automatically. We are unable to add hints to these questions.

## Running unit tests

Run `nx test lia-exporter` to execute the unit tests via [Jest](https://jestjs.io).
