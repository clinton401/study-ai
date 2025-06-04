
import { jsPDF } from "jspdf";

export const errorResponse = <T extends Record<string, any> = {}>(
  error: string,
  other?: T
): { error: string; success: null } & T => {
  return {
    error,
    success: null,
    ...(other ?? {} as T),
  };
};


export const generateRandomNumbers = (numLength = 6) => {
    const availableNumbers = "0123456789";
    let randomNumbers = "";
  
    for (let i = 0; i < numLength; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      randomNumbers += availableNumbers[randomIndex];
    }
    
    return randomNumbers;
  };
  

export const otpGenerator = (is10Mins?: boolean, length = 6) => {
    const code = generateRandomNumbers(length);

    const additionNumber = is10Mins ? 600000 : 3_600_000;
    const expiresAt = new Date(Date.now() + additionNumber);

    return { code, expiresAt };
};

export const hasExpired = (expiresAt: Date): boolean => {
  const validDate = new Date(expiresAt)
  return validDate < new Date(); 
};

export function validateFileSize(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE_MB = 10;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size must be 10MB or smaller. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
    };
  }

  return { valid: true };
}

export const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

 export  const handleDownload = (content: string, filename: string) => {
    const doc = new jsPDF();

    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 10;
    const marginTop = 10;
    const marginLeft = 10;
    const maxLineWidth = 180;
  
    const lines = doc.splitTextToSize(content, maxLineWidth);
  
    let cursorY = marginTop;
  
    for (let i = 0; i < lines.length; i++) {
      if (cursorY + lineHeight > pageHeight - marginTop) {
        doc.addPage();
        cursorY = marginTop;
      }
      doc.text(lines[i], marginLeft, cursorY);
      cursorY += lineHeight;
    }
  
    doc.save(`${filename}.pdf`);
  }