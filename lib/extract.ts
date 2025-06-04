"use client";

import mammoth from 'mammoth';



export async function extractTextFromDocx(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const { value: text } = await mammoth.extractRawText({ arrayBuffer });
  return text;
}


export const extractTextFromTxt = async (file: File) => {
    const text = await file.text();
    return text;
  };

