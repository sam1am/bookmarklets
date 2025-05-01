const fs = require('fs').promises;
const path = require('path');
const { minify } = require('terser');
const slugify = require('slugify');

// Configuration
const BOOKMARKLETS_DIR = './bookmarklets';
const OUTPUT_DIR = './docs';
const BOOKMARKLETS_PER_PAGE = 10;

async function main() {
    try {
        // Create output directory if it doesn't exist
        await createDirectoryIfNotExists(OUTPUT_DIR);

        // Read and parse all bookmarklet files
        const bookmarklets = await readBookmarkletFiles();

        // Generate individual bookmarklet pages
        await generateBookmarkletPages(bookmarklets);

        // Generate index pages with pagination
        await generateIndexPages(bookmarklets);

        console.log('Website generation complete!');
    } catch (error) {
        console.error('Error generating website:', error);
    }
}

async function createDirectoryIfNotExists(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function readBookmarkletFiles() {
    const files = await fs.readdir(BOOKMARKLETS_DIR);
    const bookmarklets = [];

    for (const file of files) {
        if (!file.endsWith('.txt') && !file.endsWith('.md')) continue;

        const filePath = path.join(BOOKMARKLETS_DIR, file);
        const content = await fs.readFile(filePath, 'utf8');

        const parts = content.split('---').map(part => part.trim());
        if (parts.length < 3) {
            console.warn(`Skipping ${file}: Invalid format`);
            continue;
        }

        const title = parts[0];
        const description = parts[1];
        const code = parts[2];

        // Prepare minified code for the bookmarklet
        let minifiedCode;
        try {
            const result = await minify(code);
            minifiedCode = result.code;
        } catch (error) {
            console.warn(`Error minifying ${file}: ${error.message}`);
            minifiedCode = code;
        }

        // Convert to bookmarklet format
        const bookmarkletCode = `javascript:${encodeURIComponent(minifiedCode)}`;

        // Generate slug from title
        const slug = slugify(title, { lower: true, strict: true });

        bookmarklets.push({
            title,
            description,
            code,
            minifiedCode: bookmarkletCode,
            slug,
        });
    }

    return bookmarklets;
}

async function generateBookmarkletPages(bookmarklets) {
    for (const bookmarklet of bookmarklets) {
        const bookmarkletDir = path.join(OUTPUT_DIR, bookmarklet.slug);
        await createDirectoryIfNotExists(bookmarkletDir);

        const htmlContent = generateBookmarkletPageHTML(bookmarklet);
        await fs.writeFile(path.join(bookmarkletDir, 'index.html'), htmlContent);
    }
}

async function generateIndexPages(bookmarklets) {
    const totalPages = Math.ceil(bookmarklets.length / BOOKMARKLETS_PER_PAGE);

    for (let page = 1; page <= totalPages; page++) {
        const startIdx = (page - 1) * BOOKMARKLETS_PER_PAGE;
        const endIdx = startIdx + BOOKMARKLETS_PER_PAGE;
        const pageBookmarklets = bookmarklets.slice(startIdx, endIdx);

        const htmlContent = generateIndexPageHTML(pageBookmarklets, page, totalPages);

        if (page === 1) {
            await fs.writeFile(path.join(OUTPUT_DIR, 'index.html'), htmlContent);
        }

        await fs.writeFile(path.join(OUTPUT_DIR, `page-${page}.html`), htmlContent);
    }
}

function generateBookmarkletPageHTML(bookmarklet) {
  // Create the perplexity search query
  const scriptUrl = `https://sam1am.github.io/bookmarklets/${bookmarklet.slug}/index.html`;
  const searchQuery = `how does the script located at ${scriptUrl} work? Is it safe?`;
  const perplexityUrl = `https://perplexity.ai/search?q=${encodeURIComponent(searchQuery)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bookmarklet.title} - Bookmarklet</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
  <div class="container mx-auto px-4 py-8">
    <header class="mb-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-indigo-700">
          <a href="/bookmarklets" class="hover:text-indigo-900">Bookmarklets</a>
        </h1>
      </div>
    </header>
    
    <main>
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">${bookmarklet.title}</h2>
        <div class="prose max-w-none mb-6">
          <p>${bookmarklet.description}</p>
        </div>
        
        
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-2">Installation:</h3>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="mb-4">Drag this button to your bookmarks bar:</p>
            <div class="flex">
              <a href="${bookmarklet.minifiedCode}" 
                 class="bookmarklet bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 cursor-move"
                 onclick="event.preventDefault(); alert('Don\\'t click! Drag this button to your bookmarks bar instead.');">
                ${bookmarklet.title}
              </a>
            </div>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-2">Source Code:</h3>
          <div class="mb-6">
          <a href="${perplexityUrl}" 
             class="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600 inline-block"
             target="_blank">
            Is this script safe?
          </a>
        </div>
          <pre class="bg-gray-100 p-4 rounded-lg overflow-auto text-sm"><code>${escapeHTML(bookmarklet.code)}</code></pre>
        </div>
      </div>
      
      <div class="flex">
        <a href="/bookmarklets" class="text-indigo-600 hover:text-indigo-800">← Back to all bookmarklets</a>
      </div>
    </main>
    
    <footer class="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
      <p>Drag bookmarklets to your bookmarks bar to install them. Don't click on them here.</p>
      <p class="mt-2">
        <a href="https://github.com/sam1am/bookmarklets" class="text-indigo-600 hover:underline">GitHub Repository</a>
      </p>
    </footer>
  </div>
  
  <script>
    // Prevent clicking on bookmarklets directly
    document.querySelectorAll('.bookmarklet').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Don\\'t click! Drag this button to your bookmarks bar instead.');
      });
    });
  </script>
</body>
</html>`;
}

function generateIndexPageHTML(bookmarklets, currentPage, totalPages) {
    const pagination = generatePaginationHTML(currentPage, totalPages);

    const bookmarkletItems = bookmarklets.map(bookmarklet => `
    <div class="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition duration-200">
      <h2 class="text-xl font-bold text-indigo-700 mb-2">
        <a href="./${bookmarklet.slug}/index.html" class="hover:underline">${bookmarklet.title}</a>
      </h2>
      <p class="text-gray-600 mb-4">${bookmarklet.description}</p>
      <div class="flex">
        <a href="${bookmarklet.minifiedCode}" 
           class="bookmarklet bg-indigo-600 text-white px-3 py-1 rounded shadow hover:bg-indigo-700 text-sm cursor-move"
           onclick="event.preventDefault(); alert('Don\\'t click! Drag this button to your bookmarks bar instead.');">
          ${bookmarklet.title}
        </a>
        <a href="./${bookmarklet.slug}/index.html" class="ml-4 text-indigo-600 hover:text-indigo-800 text-sm self-center">Details →</a>
      </div>
    </div>
  `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bookmarklets Collection${currentPage > 1 ? ` - Page ${currentPage}` : ''}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
  <div class="container mx-auto px-4 py-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-indigo-700 mb-2">Bookmarklets Collection</h1>
      <p class="text-gray-600">A collection of useful browser bookmarklets</p>
    </header>
    
    <div class="mb-8 bg-indigo-50 p-6 rounded-lg border border-indigo-200">
      <h2 class="text-xl font-semibold text-indigo-800 mb-3">What are Bookmarklets?</h2>
      <p class="text-gray-700 mb-3">
        Bookmarklets are special browser bookmarks that run JavaScript code instead of opening a webpage. 
        They allow you to add new features to your browser and perform useful actions on the current page with just one click.
      </p>
      <p class="text-gray-700">
        Unlike browser extensions, bookmarklets don't require installation approval, don't run in the background, 
        and don't need to be updated. They're a simple, lightweight way to enhance your browsing experience.
      </p>
    </div>
    
    <div class="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h2 class="text-lg font-semibold text-blue-700 mb-2">How to Install Bookmarklets:</h2>
      <ol class="list-decimal pl-6 space-y-2">
        <li>Make sure your bookmarks bar is visible (Ctrl+Shift+B in most browsers)</li>
        <li>Drag any button below to your bookmarks bar</li>
        <li>Click the bookmarklet in your bookmarks bar when you want to use it</li>
      </ol>
      <p class="mt-4 text-blue-600 font-medium">Important: Don't click the buttons below! Drag them to your bookmarks bar.</p>
    </div>
    
    <main>
      <div class="grid gap-4">
        ${bookmarkletItems}
      </div>
      
      ${pagination}
    </main>
    
    <footer class="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
      <p>Drag bookmarklets to your bookmarks bar to install them. Don't click on them here.</p>
      <p class="mt-2">
        <a href="https://github.com/sam1am/bookmarklets" class="text-indigo-600 hover:underline">GitHub Repository</a>
      </p>
    </footer>
  </div>
  
  <script>
    // Prevent clicking on bookmarklets directly
    document.querySelectorAll('.bookmarklet').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Don\\'t click! Drag this button to your bookmarks bar instead.');
      });
    });
  </script>
</body>
</html>`;
}

function generatePaginationHTML(currentPage, totalPages) {
    if (totalPages <= 1) return '';

    let pagination = '<div class="mt-8 flex justify-center"><nav class="flex items-center space-x-2">';

    // Previous button
    if (currentPage > 1) {
        pagination += `<a href="${currentPage === 2 ? 'index.html' : `page-${currentPage - 1}.html`}" class="px-4 py-2 bg-white rounded border border-gray-300 text-indigo-600 hover:bg-gray-50">Previous</a>`;
    } else {
        pagination += `<span class="px-4 py-2 bg-gray-100 rounded border border-gray-300 text-gray-400 cursor-not-allowed">Previous</span>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            pagination += `<span class="px-4 py-2 bg-indigo-600 text-white rounded border border-indigo-600">${i}</span>`;
        } else {
            pagination += `<a href="${i === 1 ? 'index.html' : `page-${i}.html`}" class="px-4 py-2 bg-white rounded border border-gray-300 text-indigo-600 hover:bg-gray-50">${i}</a>`;
        }
    }

    // Next button
    if (currentPage < totalPages) {
        pagination += `<a href="page-${currentPage + 1}.html" class="px-4 py-2 bg-white rounded border border-gray-300 text-indigo-600 hover:bg-gray-50">Next</a>`;
    } else {
        pagination += `<span class="px-4 py-2 bg-gray-100 rounded border border-gray-300 text-gray-400 cursor-not-allowed">Next</span>`;
    }

    pagination += '</nav></div>';

    return pagination;
}

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Start the script
main();