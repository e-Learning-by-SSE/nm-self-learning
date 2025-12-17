# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'SELF-le@rn'
copyright = '2025, SELF-le@rn University of Hildesheim'
author = 'Michael Ganske'
release = '0.1'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = []

templates_path = ['_templates']
exclude_patterns = []

language = 'en'

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'alabaster'
html_static_path = ['_static']

html_favicon = '_static/favicon.ico'
html_logo = '_static/logo.png'

html_theme_options = {
    'page_width': '1400px',
    'sidebar_width': '300px',
    'body_max_width': 'none',
    'fixed_sidebar': True,
}
