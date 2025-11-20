/**
 * Utility to handle parsing of various file formats into raw text.
 * Supports: PDF (via pdf.js), DOCX (via mammoth), XLSX (via SheetJS), TXT (native)
 */

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  try {
    if (file.type === 'text/plain' || fileExtension === 'txt') {
      return await file.text();
    }

    switch (fileExtension) {
      case 'pdf':
        return await extractTextFromPDF(file);
      case 'docx':
        return await extractTextFromDOCX(file);
      case 'xlsx':
      case 'xls':
        return await extractTextFromExcel(file);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  } catch (error: any) {
    console.error('File Parsing Error:', error);
    throw new Error(`Failed to parse ${file.name}: ${error.message}`);
  }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  if (!window.pdfjsLib) {
    throw new Error("PDF.js library is not loaded.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += `[Page ${i}]\n${pageText}\n\n`;
  }

  return fullText;
};

const extractTextFromDOCX = async (file: File): Promise<string> => {
  if (!window.mammoth) {
    throw new Error("Mammoth library is not loaded.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const extractTextFromExcel = async (file: File): Promise<string> => {
  if (!window.XLSX) {
    throw new Error("SheetJS library is not loaded.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return window.XLSX.utils.sheet_to_csv(worksheet);
};