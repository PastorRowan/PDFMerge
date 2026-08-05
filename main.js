
const path = require("path");
const fs = require("fs");

const { PDFDocument } = require("pdf-lib");

async function main() {

    // directory containing pdfs to merge
    const pdfsDir = path.resolve(__dirname, "pdfs");

    // Makes sure pdfs directory exists
    if (!fs.existsSync(pdfsDir)) {
        console.log("\n Creating pdf files directory:\n");
        fs.mkdirSync(pdfsDir, { recursive: true });
    };

    console.log("\nCollecting pdf files:\n");

    // Array of unsorted pdf files to combine
    const pdfFilesUnsorted = fs.readdirSync(pdfsDir);

    const numberOfPages = pdfFilesUnsorted.length;

    // Returns early if pdf directory is empty (no pdfs to merge)
    if (numberOfPages <= 0) {
        console.log("Error: pdf files directory is empty, no pdfs to merge");
        return;
    };

    // Array of sorted pdf files to combine
    const pdfFilesSorted = [];

    console.log("\nCollecting pdf files:\n");

    // Fills sorted pdf files array with the files in the unsorted array
    for (let i = 1; i <= numberOfPages; i++) {

        const pdfFile = pdfFilesUnsorted.find(
            (fName) => {
                return fName.includes(`(page ${i} of ${numberOfPages})`);
            }
        );

        if (pdfFile) {
            console.log(" ", pdfFile);
            pdfFilesSorted.push(pdfFile);
        };

    };

    // Start process of merging all PDFs into one pdf

    console.log("\n🔄 Merging PDFs...");

    // Create merged pdf
    const mergedPdf = await PDFDocument.create();

    // Create merged all pdfs into merged pdf
    for (const pdfPath of pdfFilesSorted) {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdf = await PDFDocument.load(pdfBytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
        console.log(` 📄 Added: ${path.basename(pdfPath)}`);
    };
    
    const finalPdfName = "merged_pdf.pdf";
    const mergedPdfBytes = await mergedPdf.save();

    // Write the merged pdf to disk
    fs.writeFileSync(finalPdfName, mergedPdfBytes);

    console.log(`\n✅ Merged PDF saved as: ${finalPdfName}`);

    console.log("\n✅ Combined PDF created successfully!");

};

main()
    .then(() => {
        console.log("\nApplication finished.");
    })
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
