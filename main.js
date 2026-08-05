
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

    const numberOfPdfFiles = pdfFilesUnsorted.length;

    console.log("Number of pdf files to merge: ", numberOfPdfFiles);

    // Returns early if no pdf files were found
    if (numberOfPdfFiles <= 0) {
        console.log(`Error: no pdf files found in directory ${pdfsDir}`);
        return;
    };

    // Array of sorted pdf files to combine
    const pdfFilePathsSorted = [];

    console.log("\nCollecting pdf files:\n");

    // Fills sorted pdf files array with the files in the unsorted array
    for (let i = 1; i <= numberOfPdfFiles; i++) {

        const currentPdfFileSubstring = `(page ${i} of ${numberOfPdfFiles})`;

        const currentPdfFileName = pdfFilesUnsorted.find(
            (fName) => {
                return fName.includes(currentPdfFileSubstring);
            }
        );

        if (currentPdfFileName) {
            console.log(" ", currentPdfFileName);
            const currentPdfFilePath = path.join(pdfsDir, currentPdfFileName);
            pdfFilePathsSorted.push(currentPdfFilePath);
        } else {
            console.log(" ", `Failed to find pdf file: ${currentPdfFileName}`);
        };

    };

    // Start process of merging all PDFs into one pdf

    console.log("\n🔄 Merging PDFs...");

    // Create merged pdf
    const mergedPdf = await PDFDocument.create();

    // Create merged all pdfs into merged pdf
    for (const pdfPath of pdfFilePathsSorted) {
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
        console.log("\nScript finished.");
    })
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
