# Kendall Cousins — Portfolio

My personal portfolio site: an International Business & MIS student at the University of Oklahoma, interested in consulting, venture capital, and private equity.

**Live site:** _coming soon on GitHub Pages_

## Pages

| Page | What's on it |
|---|---|
| [Home](index.html) | Bio, headshot, career goals, and a link to my projects |
| [Skills](skills.html) | Skills grouped into six categories, with where I've used each |
| [Experience](experience.html) | Education and work experience in an expandable accordion |
| [Projects](projects.html) | Project cards loaded from JSON, with category filters and keyword search |
| [Contact](contact.html) | Email, LinkedIn, and GitHub links |

## Built with

- HTML, CSS, and JavaScript
- [Bootstrap 5.3](https://getbootstrap.com/) for the responsive navbar, grid, cards, badges, buttons, and accordion
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- Google Fonts: Playfair Display and Source Sans 3

## Features

- **Projects loaded from JSON.** `js/script.js` uses `fetch()` to read `data/projects.json` and builds a card for each project, so the HTML has no hard-coded project cards.
- **Category filters.** The buttons show All, Finance, Strategy, Data, or Programming projects without reloading the page.
- **Keyword search.** Filters projects as you type, matching titles, descriptions, organizations, and technologies. It works together with the category filters.
- **Fun Mode.** The navbar button switches on a random mix of retro web effects. Click it again to go back to the normal site.
- **Custom theme.** Navy and gold colors, serif headings, and restyled Bootstrap components in `css/style.css`.

## Project structure

```
portfolio/
├── index.html
├── skills.html
├── experience.html
├── projects.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   ├── script.js      # loads, filters, and searches projects
│   └── fun-mode.js    # Fun Mode toggle and effects
├── data/
│   └── projects.json  # project data
└── images/
```

## Running it locally

The Projects page loads its data with `fetch()`, which browsers block for files opened directly from disk (`file://`). Run the site through a local web server instead:

- **VS Code:** install the Live Server extension, right-click `index.html`, and choose **Open with Live Server**.
- **Python:** run `python -m http.server` in this folder, then open http://localhost:8000.

## Adding a project

Add an entry to `data/projects.json`:

```json
{
  "title": "Project name",
  "category": "Finance",
  "date": "Fall 2026",
  "organization": "Where it was done",
  "description": "One or two sentences about the project.",
  "technologies": ["Skill one", "Skill two"]
}
```

`date` and `organization` are optional. If you add a new category, also add a matching filter button in `projects.html`.

## Contact

- Email: kendall.cousins@outlook.com
- LinkedIn: [linkedin.com/in/kendall-cousins](https://www.linkedin.com/in/kendall-cousins/)
- GitHub: [github.com/kendall-cousins](https://github.com/kendall-cousins)
