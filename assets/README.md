# Assets Folder

This folder contains static assets for the CSE Study Hub website.

## Folder Structure

```
assets/
├── images/           # Website images, icons, logos
├── documents/        # Sample study materials
├── icons/           # Favicon and app icons
└── README.md        # This file
```

## How to Add Study Materials

1. **Upload materials to this folder** (or create subfolders by subject)
2. **Push to GitHub** to make them accessible
3. **Get the raw GitHub URL** for each file
4. **Add materials through Admin Panel** using the GitHub URLs

## Example GitHub Raw URLs

When you upload a file to GitHub, you can get its raw URL by:

1. Navigate to the file on GitHub
2. Click the "Raw" button
3. Copy the URL

Example URL format:
```
https://raw.githubusercontent.com/username/repository/main/assets/documents/data-structures.pdf
```

## Supported File Types

- **PDFs**: `.pdf` files for textbooks, notes, assignments
- **Images**: `.jpg`, `.png`, `.gif` for diagrams, charts, screenshots
- **Documents**: `.docx`, `.txt` for notes and assignments

## Best Practices

1. **Organize by subject**: Create subfolders for each subject
2. **Use descriptive names**: Name files clearly (e.g., `algorithms-chapter-1.pdf`)
3. **Optimize file sizes**: Compress large files for faster loading
4. **Check accessibility**: Ensure files are publicly accessible on GitHub

## Sample Structure

```
assets/
├── data-structures/
│   ├── trees-and-graphs.pdf
│   ├── sorting-algorithms.pdf
│   └── ds-lab-manual.pdf
├── algorithms/
│   ├── dynamic-programming.pdf
│   ├── greedy-algorithms.pdf
│   └── complexity-analysis.pdf
├── web-development/
│   ├── html-css-guide.pdf
│   ├── javascript-basics.pdf
│   └── react-tutorial.pdf
└── database/
    ├── sql-fundamentals.pdf
    ├── database-design.pdf
    └── nosql-concepts.pdf
```

## Adding Materials via Admin Panel

1. Login as admin
2. Go to Admin Panel > Study Materials
3. Add subjects first (e.g., "Data Structures", "Algorithms")
4. Add materials with:
   - **Title**: Descriptive name
   - **Subject**: Select from dropdown
   - **Type**: PDF, Image, or Note
   - **URL**: GitHub raw URL to the file

## Note

The assets in this folder serve as storage for your study materials. They will be accessible through GitHub's raw file URLs and displayed through the website's interface.
