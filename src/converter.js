const fs = require("fs");
const path = require("path");
const marked = require("marked");

function convertMarkdownToHtml(
  markdownContent,
  headerHtml,
  footerHtml,
  stylePath,
) {
  const bodyHtml = marked.parse(markdownContent);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="${stylePath}">
</head>
<body>
  ${headerHtml}
  <div class="content">
    ${bodyHtml}
  </div>
  ${footerHtml}
</body>
</html>
`;
}

function generateIndexPage(
  pages,
  headerHtml,
  footerHtml,
  stylePath,
  summaryWordCount,
) {
  let listItems = pages
    .map((page) => {
      const title = path.basename(page.fileName, path.extname(page.fileName));
      // Use the provided summary word count
      const summary = page.content
        .replace(/<[^>]+>/g, "")
        .split(/\s+/)
        .slice(0, summaryWordCount)
        .join(" ");
      // Build metadata section
      let metadata = `<div class="metadata">`;
      if (page.author) {
        metadata += `<span>${page.author}</span>`;
      }
      if (page.dateModified) {
        metadata += `<span> - <em>${page.dateModified}</em></span>`;
      }
      metadata += `</div>`;

      return `<li>
      <a href="${page.fileName}">${title}</a>
      ${metadata}
      <p>${summary}... <a href="${page.fileName}"><em>read more</em></a></p>
    </li>`;
    })
    .join("\n");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="${stylePath}">
</head>
<body>
  ${headerHtml}
  <ul>
    ${listItems}
  </ul>
  ${footerHtml}
</body>
</html>
`;
}

function processMarkdownFiles(config) {
  const {
    contentPath,
    headerPath,
    footerPath,
    stylePath,
    outputDirectory,
    summaryWordCount,
    defaultAuthor,
    includeDateModified,
  } = config;

  let headerContent =
    headerPath && fs.existsSync(headerPath)
      ? fs.readFileSync(headerPath, "utf-8")
      : "";
  let footerContent =
    footerPath && fs.existsSync(footerPath)
      ? fs.readFileSync(footerPath, "utf-8")
      : "";
  let styleContent =
    stylePath && fs.existsSync(stylePath)
      ? fs.readFileSync(stylePath, "utf-8")
      : "";

  const headerHtml = headerContent ? marked.parse(headerContent) : "";
  const footerHtml = footerContent ? marked.parse(footerContent) : "";
  let styleFileName = stylePath ? path.basename(stylePath) : "styles.css";
  if (styleContent) {
    fs.writeFileSync(path.join(outputDirectory, styleFileName), styleContent);
  }

  let pages = [];

  if (fs.lstatSync(contentPath).isDirectory()) {
    const files = fs.readdirSync(contentPath);
    files.forEach((file) => {
      if (file === "header.md" || file === "footer.md") return;
      if (path.extname(file).toLowerCase() === ".md") {
        const filePath = path.join(contentPath, file);
        const markdown = fs.readFileSync(filePath, "utf-8");
        const fileStats = fs.statSync(filePath);
        const html = convertMarkdownToHtml(
          markdown,
          headerHtml,
          footerHtml,
          styleFileName,
        );
        const outputFileName =
          path.basename(file, path.extname(file)) + ".html";
        fs.writeFileSync(path.join(outputDirectory, outputFileName), html);
        pages.push({
          fileName: outputFileName,
          content: marked.parse(markdown),
          author: defaultAuthor,
          dateModified: includeDateModified
            ? fileStats.mtime.toLocaleDateString()
            : null,
        });
      }
    });
  } else {
    const markdown = fs.readFileSync(contentPath, "utf-8");
    const fileStats = fs.statSync(contentPath);
    const html = convertMarkdownToHtml(
      markdown,
      headerHtml,
      footerHtml,
      styleFileName,
    );
    const outputFileName =
      path.basename(contentPath, path.extname(contentPath)) + ".html";
    fs.writeFileSync(path.join(outputDirectory, outputFileName), html);
    pages.push({
      fileName: outputFileName,
      content: marked.parse(markdown),
      author: defaultAuthor,
      dateModified: includeDateModified
        ? fileStats.mtime.toLocaleDateString()
        : null,
    });
  }

  const indexHtml = generateIndexPage(
    pages,
    headerHtml,
    footerHtml,
    styleFileName,
    summaryWordCount,
  );
  fs.writeFileSync(path.join(outputDirectory, "index.html"), indexHtml);
}

module.exports = {
  processMarkdownFiles,
};
