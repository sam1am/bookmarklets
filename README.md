# Bookmarklets Website Generator

A Node.js script that generates a static website for bookmarklet installation with a clean, responsive Tailwind CSS interface.

View the live site here: https://sam1am.github.io/bookmarklets

## Overview

This script processes bookmarklet files from a `./bookmarklets/` directory and generates a complete static website in the `./site/` directory. The generated website includes:

- A paginated index of all bookmarklets
- Individual detail pages for each bookmarklet
- Minified JavaScript code for proper bookmarklet functionality
- Clear installation instructions for users

## Installation

1. Clone this repository or create a new directory for your project
2. Install the required dependencies:

```bash
npm install terser slugify
```

## Usage

1. Create a `./bookmarklets/` directory in your project
2. Add bookmarklet files following the format outlined below
3. Run the script:

```bash
node generate-site.js
```

4. The generated website will be available in the `./site/` directory

## Bookmarklet File Format

Each bookmarklet should be saved as a separate file in the `./bookmarklets/` directory with the following format:

```
Title of the Bookmarklet
---
Description of what this bookmarklet does and how to use it
---
javascript:(function() {
  // Your unminified bookmarklet code here
  alert('Hello World!');
})();
```

The script will automatically:
- Parse the title and description
- Minify the JavaScript code
- Generate a slug from the title for URLs

## Directory Structure

```
project/
├── bookmarklets/           # Input directory for bookmarklet files
│   ├── bookmarklet1.txt
│   ├── bookmarklet2.txt
│   └── ...
├── site/                   # Output directory for the generated website
│   ├── index.html          # Main page with paginated bookmarklet list
│   ├── page-2.html         # Additional pagination pages
│   ├── bookmarklet-name/   # Individual bookmarklet pages
│   │   └── index.html
│   └── ...
├── generate-site.js        # The generator script
├── package.json
└── README.md
```

## Features

- **Automatic Minification**: Ensures bookmarklets work correctly in modern browsers
- **Responsive Design**: Built with Tailwind CSS for a clean, mobile-friendly interface
- **Pagination**: Handles large collections of bookmarklets efficiently
- **SEO-Friendly URLs**: Creates consistent, clean URLs based on bookmarklet titles
- **Warning Prevention**: Instructs users to drag (not click) bookmarklet buttons
- **Source Code Display**: Shows the original unminified code for transparency

## Configuration

You can customize the script by modifying these constants at the top of the file:

```javascript
const BOOKMARKLETS_DIR = './bookmarklets';    // Input directory
const OUTPUT_DIR = './site';                  // Output directory
const BOOKMARKLETS_PER_PAGE = 10;             // Pagination setting
```

## Example Bookmarklet File

```
Read Mode
---
Removes distractions and formats the current page for comfortable reading
---
javascript:(function() {
  const style = document.createElement('style');
  style.textContent = `
    body {
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
      font-family: Georgia, serif;
      font-size: 18px;
      line-height: 1.6;
      color: #333;
      background-color: #f8f8f8;
    }
    img { max-width: 100%; height: auto; }
  `;
  document.head.appendChild(style);
})();
```

## License

MIT