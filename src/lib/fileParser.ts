import * as mammoth from 'mammoth';

export interface ParsedContent {
  text: string;
  fileName: string;
  fileType: string;
  pageCount?: number;
}

export class FileParser {
  static async parseFile(file: File): Promise<ParsedContent> {
    const fileType = this.getFileType(file.name);
    
    try {
      let text: string;
      let pageCount: number | undefined;

      switch (fileType) {
        case 'pdf':
          const pdfData = await this.parsePDF(file);
          text = pdfData.text;
          pageCount = pdfData.pageCount;
          break;
        case 'docx':
          text = await this.parseDocx(file);
          break;
        case 'txt':
          text = await this.parseTxt(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Clean and normalize the extracted text
      text = this.cleanText(text);

      return {
        text,
        fileName: file.name,
        fileType,
        pageCount,
      };
    } catch (error) {
      console.error('Error parsing file:', error);
      throw new Error(`Failed to parse ${fileType.toUpperCase()} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async parsePDF(file: File): Promise<{ text: string; pageCount: number }> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfParse = await import('pdf-parse');
    const pdfData = await pdfParse.default(arrayBuffer);
    
    return {
      text: pdfData.text,
      pageCount: pdfData.numpages,
    };
  }

  private static async parseDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }
    
    return result.value;
  }

  private static async parseTxt(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  private static getFileType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'docx':
        return 'docx';
      case 'txt':
        return 'txt';
      default:
        throw new Error(`Unsupported file extension: ${extension}`);
    }
  }

  private static cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove line breaks that are not sentence endings
      .replace(/(?<=[.!?])\s*\n\s*(?=[A-Z])/g, '. ')
      // Remove bullet points and replace with clean text
      .replace(/[•·▪▫‣⁃]/g, '•')
      // Remove special characters that might interfere with AI processing
      .replace(/[^\w\s\.\,\;\:\!\?\-\(\)\[\]\{\}\"\'\/\•\n]/g, '')
      // Normalize multiple spaces
      .replace(/ {2,}/g, ' ')
      // Trim whitespace
      .trim();
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const supportedTypes = ['pdf', 'docx', 'txt'];
    
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds 10MB limit',
      };
    }

    const fileType = this.getFileType(file.name);
    if (!supportedTypes.includes(fileType)) {
      return {
        isValid: false,
        error: 'Unsupported file type. Please upload PDF, DOCX, or TXT files.',
      };
    }

    return { isValid: true };
  }

  static extractKeyTopics(text: string, maxTopics: number = 10): string[] {
    // Simple topic extraction based on common patterns
    // This is a basic implementation - in production, you'd use NLP libraries
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const topics: string[] = [];
    
    // Look for patterns that might indicate topics
    const topicPatterns = [
      /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})(?=\s*:)/g, // "Topic:" pattern
      /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})(?=\s+is\s)/g, // "Topic is" pattern
      /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})(?=\s+are\s)/g, // "Topic are" pattern
    ];
    
    for (const pattern of topicPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        topics.push(...matches.map(m => m.trim()));
      }
    }
    
    // If no patterns found, extract capitalized phrases as potential topics
    if (topics.length === 0) {
      const capitalizedPhrases = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g) || [];
      topics.push(...capitalizedPhrases.slice(0, maxTopics));
    }
    
    // Remove duplicates and limit results
    return [...new Set(topics)].slice(0, maxTopics);
  }
}
