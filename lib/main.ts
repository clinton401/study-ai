import { marked } from "marked";
import removeMarkdown from "remove-markdown";

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
  const plainText = removeMarkdown(content);
  navigator.clipboard.writeText(plainText);
  }
   function sanitizeMarkdown(content: string) {
  return content
    .replace(/^```markdown\s*/i, "") 
    .replace(/^```/, "")             
    .replace(/```$/, "");            
}


  export const handleDownload = async (markdown: string, filename: string) => {
    // @ts-ignore
    const html2pdf = (await import("html2pdf.js")).default;
  const sanitizedText = sanitizeMarkdown(markdown)
    const html = await marked(sanitizedText);
  
    const container = document.createElement("div");
    container.innerHTML = html;
  
    container.style.padding = "20px";
    container.style.maxWidth = "800px";
    container.style.fontFamily = "ui-serif, Georgia, Cambria, Times New Roman, Times, serif";
    container.style.color = "#000"; 
    container.style.fontSize = "14px";
    container.style.lineHeight = "1.6";
    container.style.pageBreakInside = "auto"; 
  container.style.pageBreakBefore = "auto";
  container.style.pageBreakAfter = "auto";
  
  
    container.style.backgroundColor = "#fff";
  
    container.querySelectorAll("h1").forEach(el => {
      const element = el as HTMLElement;
      element.style.fontSize = "32px";
      element.style.fontWeight = "900";
      element.style.marginTop = "12px";
      element.style.marginBottom = "12px";
    });
  
    container.querySelectorAll("h2").forEach(el => {
      const element = el as HTMLElement;
      element.style.fontSize = "28px";
      element.style.fontWeight = "600";
      element.style.marginTop = "20px";
      element.style.marginBottom = "10px";
    });
  
    container.querySelectorAll("h3").forEach(el => {
      const element = el as HTMLElement;
      element.style.fontSize = "24px";
      element.style.fontWeight = "500";
      element.style.marginTop = "16px";
      element.style.marginBottom = "8px";
    });
  
    container.querySelectorAll("strong").forEach(el => {
      (el as HTMLElement).style.fontWeight = "bold";
      (el as HTMLElement).style.color = "#000";
    });
  
    container.querySelectorAll("em").forEach(el => {
      (el as HTMLElement).style.fontStyle = "italic";
      (el as HTMLElement).style.color = "#000";
    });
    container.querySelectorAll("p, h1, h2, h3, blockquote, ul, ol, table").forEach(el => {
      const element = el as HTMLElement;
      element.style.pageBreakInside = "avoid";
      element.style.breakInside = "avoid";
    });
    
    html2pdf()
      .set({
        margin: 20,
        filename: `${filename}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(container)
      .save();
    };
   export  function generateTitleFromText(text: string): string {
    const lines = text.trim().split(/\r?\n/);
    const firstLine = lines.find(line => line.length > 10); 
    return firstLine?.slice(0, 100) || "Untitled Summary";
  }
  