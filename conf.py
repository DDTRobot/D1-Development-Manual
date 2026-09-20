# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

from furo.navigation import get_navigation_tree

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'D1-Development-Manual'
copyright = '2025, DDT'
author = 'edward'
release = 'v0.0.1'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = [
    'myst_parser',
    'sphinx_copybutton',
    'sphinx.ext.mathjax',
    'sphinx.ext.viewcode',
    'sphinx.ext.autodoc',
    # 'matplotlib.sphinxext.plot_directive',
    # "IPython.sphinxext.ipython_directive",
    # "IPython.sphinxext.ipython_console_highlighting"
]

html_theme = 'furo'

templates_path = ['_templates']
exclude_patterns = ['build', '_build', '.venv', '.git', 'README.md', 'docs']

language = 'en'

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output
master_doc = 'index'

html_static_path = ['_static']

html_logo = '_static/brand.webp'
html_favicon = '_static/favicon.png'
html_title = 'D1 Documentation'
html_show_sourcelink = False
html_permalinks = False
html_css_files = ['styles/docs.css']
html_js_files = ['scripts/docs.js']
html_search_language = 'en'
pygments_style = 'a11y-high-contrast-light'
pygments_dark_style = 'a11y-high-contrast-dark'
myst_heading_anchors = 4
myst_enable_extensions = ['colon_fence']
copybutton_selector = 'div.highlight-bash pre, div.highlight-console pre, div.highlight-cpp pre, div.highlight-yaml pre'
copybutton_prompt_text = r'^(?:\$ |robot@[^:]+:[^$]*\$ )'
copybutton_prompt_is_regexp = True
copybutton_only_copy_prompt_lines = False
copybutton_line_continuation_character = '\\'
html_sidebars = {
    '**': ['sidebar/brand.html', 'sidebar/search.html', 'sidebar/navigation.html', 'sidebar/links.html'],
}
html_theme_options = {
    'navigation_with_keys': False,
    'top_of_page_buttons': [],
    'light_css_variables': {
        'font-stack': '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
        'font-stack--headings': 'var(--font-stack)',
        'font-stack--monospace': '"Cascadia Code", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
        'color-brand-primary': '#8a6500',
        'color-brand-content': '#785900',
        'color-brand-visited': '#785900',
        'color-background-primary': '#ffffff',
        'color-background-secondary': '#f6f6f7',
        'color-background-hover': '#ededf0',
        'color-foreground-primary': '#202125',
        'color-foreground-secondary': '#62656d',
        'color-foreground-muted': '#696c74',
        'color-link': '#785900',
        'color-link--hover': '#4f3b00',
        'color-code-background': '#f5f5f6',
        'color-code-foreground': '#34363c',
        'color-admonition-background': '#f8f8f9',
        'color-table-border': '#e3e4e7',
        'color-table-header-background': '#f4f4f5',
        'color-highlight-on-target': '#f8f5e7',
        'd1-accent': '#f4cc24',
        'd1-accent-ink': '#292719',
        'd1-accent-soft': '#faf8ef',
        'd1-line': '#e6e6e9',
        'd1-card': '#ffffff',
        'd1-image-background': '#f2f2f2',
    },
    'dark_css_variables': {
        'color-brand-primary': '#e8c64e',
        'color-brand-content': '#e8c64e',
        'color-brand-visited': '#e8c64e',
        'color-background-primary': '#18191b',
        'color-background-secondary': '#202124',
        'color-background-hover': '#2b2c30',
        'color-foreground-primary': '#eeeff2',
        'color-foreground-secondary': '#bdc0c7',
        'color-foreground-muted': '#a0a4ad',
        'color-link': '#e8c64e',
        'color-link--hover': '#f5dc86',
        'color-code-background': '#222326',
        'color-code-foreground': '#e2e4e8',
        'color-admonition-background': '#222326',
        'color-table-border': '#36383d',
        'color-table-header-background': '#26272b',
        'color-highlight-on-target': '#302c1e',
        'd1-accent': '#e8c64e',
        'd1-accent-ink': '#242516',
        'd1-accent-soft': '#2c291d',
        'd1-line': '#323439',
        'd1-card': '#1c1d20',
        'd1-image-background': '#27282a',
    },
}


def configure_navigation(app, page_name, template_name, context, doctree):
    context['furo_navigation_tree'] = get_navigation_tree(context['toctree'](
        collapse=False,
        titles_only=False,
        maxdepth=3,
        includehidden=True,
    ))
    context['furo_hide_toc'] = True


def setup(app):
    app.connect('html-page-context', configure_navigation, priority=800)
