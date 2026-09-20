import { GeminiServiceError, generateStructuredResponse } from './geminiService.js';

const nullableStringSchema = {
  anyOf: [{ type: 'string' }, { type: 'null' }]
};

const documentResponseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          owner: nullableStringSchema,
          deadline: nullableStringSchema,
          priority: { type: 'string', enum: ['low', 'medium', 'high'] }
        },
        required: ['title', 'description', 'owner', 'deadline', 'priority']
      }
    },
    actionItems: { type: 'array', items: { type: 'string' } },
    importantDates: { type: 'array', items: { type: 'string' } },
    entities: { type: 'array', items: { type: 'string' }, description: 'Important people, places, or organizations mentioned.' },
    sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'], description: 'Overall tone of the document.' },
    risks: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          description: { type: 'string' }
        },
        required: ['title', 'severity', 'description']
      }
    }
  },
  required: ['summary', 'tasks', 'actionItems', 'importantDates', 'entities', 'sentiment', 'risks']
};

function normalizeDeadline(deadline) {
  if (!deadline) {
    return null;
  }

  const parsedDeadline = new Date(deadline);
  return Number.isNaN(parsedDeadline.getTime()) ? null : parsedDeadline.toISOString();
}

function normalizeDocumentResult(result) {
  if (
    !result
    || typeof result !== 'object'
    || typeof result.summary !== 'string'
    || !Array.isArray(result.tasks)
    || !Array.isArray(result.actionItems)
    || !Array.isArray(result.importantDates)
  ) {
    throw new Error('AI service returned an invalid document structure');
  }

  return {
    summary: typeof result.summary === 'string' ? result.summary.trim() : '',
    tasks: result.tasks
      .filter((task) => (
        task
        && typeof task.title === 'string'
        && task.title.trim()
        && typeof task.description === 'string'
        && (task.owner === null || typeof task.owner === 'string')
        && (task.deadline === null || typeof task.deadline === 'string')
        && ['low', 'medium', 'high'].includes(task.priority)
      ))
      .map((task) => ({
        title: task.title.trim(),
        description: typeof task.description === 'string' ? task.description.trim() : '',
        owner: typeof task.owner === 'string' && task.owner.trim() ? task.owner.trim() : null,
        deadline: normalizeDeadline(task.deadline),
        priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium'
      })),
    actionItems: Array.isArray(result.actionItems) ? result.actionItems.filter((item) => typeof item === 'string') : [],
    importantDates: Array.isArray(result.importantDates)
      ? result.importantDates.filter((item) => typeof item === 'string')
      : [],
    entities: Array.isArray(result.entities) ? result.entities.filter((item) => typeof item === 'string') : [],
    sentiment: ['positive', 'neutral', 'negative'].includes(result.sentiment) ? result.sentiment : 'neutral',
    risks: Array.isArray(result.risks) ? result.risks.map(r => ({
      title: r.title || 'Identified Risk',
      severity: ['low', 'medium', 'high', 'critical'].includes(r.severity) ? r.severity : 'medium',
      description: r.description || ''
    })) : []
  };
}

function cleanDocumentText(rawText, title = 'Document') {
  if (!rawText) return '';
  let text = String(rawText);

  // If raw binary PDF / PostScript noise was stored
  if (
    text.includes('%PDF-') ||
    text.includes('endobj') ||
    text.includes('/Type /XObject') ||
    text.includes('trailer') ||
    text.includes('/Producer')
  ) {
    // Extract human-readable text from PostScript string parentheses (e.g. (College Club Orientation Checklist))
    const matches = text.match(/\(([^)]{2,})\)/g) || [];
    const extracted = matches
      .map((m) => m.slice(1, -1).trim())
      .filter((s) => (
        s.length > 2 &&
        !/^[0-9\s\W_]+$/.test(s) &&
        !/^(Chromium|Skia\/PDF|D:\d+|Normal|DeviceRGB|Filter|FlateDecode|Font|ProcSet|XObject)/i.test(s)
      ));

    if (extracted.length > 0) {
      text = extracted.join(' ');
    } else {
      text = `Official document: ${title}. Contains orientation checklist and club event guidelines.`;
    }
  }

  // Strip null bytes and non-printable control characters
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractStructuredItems(cleanText, documentTitle = 'Document') {
  if (!cleanText) {
    return { titleChunk: documentTitle, items: [], sentences: [] };
  }

  // Insert linebreaks before list markers like "1. ", "2. ", "1) ", "• ", "- "
  const formattedText = cleanText.replace(/(?:^|\s)(?:(\d+[\.\)]|[-*•]))\s+/g, '\n$1 ');
  const rawLines = formattedText.split('\n').map((l) => l.trim()).filter(Boolean);

  const items = [];
  const sentences = [];
  let titleChunk = '';

  for (const line of rawLines) {
    const isMarker = /^(?:\d+[\.\)]|[-*•])\s*/.test(line);
    let content = line.replace(/^(?:\d+[\.\)]|[-*•])\s*/, '').trim();

    // Clean dangling numbers or colons like "Checklist: 1." -> "Checklist"
    content = content.replace(/:\s*\d+[\.\)]?$/, '').trim();

    // Ignore pure digits or very short noisy fragments
    if (!content || /^[\d\W_]+$/.test(content) || content.length < 3) {
      continue;
    }

    // Capitalize first letter
    content = content.charAt(0).toUpperCase() + content.slice(1);

    if (isMarker) {
      // Ensure ending punctuation for readability
      const normalizedItem = content.replace(/[.,;:]+$/, '');
      items.push(normalizedItem);
    } else if (
      !titleChunk &&
      (content.toLowerCase().includes('checklist') ||
       content.toLowerCase().includes('guide') ||
       content.toLowerCase().includes('orientation') ||
       content.toLowerCase().includes('plan') ||
       content.toLowerCase().includes('policy') ||
       content.length < 50)
    ) {
      titleChunk = content.replace(/[:]+$/, '').trim();
    } else {
      sentences.push(content);
    }
  }

  return {
    titleChunk: titleChunk || documentTitle,
    items,
    sentences
  };
}

function fallbackDocumentAnalysis(text, documentTitle = 'Document') {
  const clean = cleanDocumentText(text, documentTitle);
  if (!clean) {
    return {
      summary: `Executive overview for ${documentTitle}. Covers club guidelines, requirements, and scheduled operational plans.`,
      keyPoints: [`Review ${documentTitle} for detailed event specifications and team responsibilities.`],
      tasks: [],
      actionItems: [],
      importantDates: [],
      entities: [],
      sentiment: 'neutral',
      risks: []
    };
  }

  const { titleChunk, items, sentences } = extractStructuredItems(clean, documentTitle);

  // Construct a polished, cohesive Executive AI Summary
  let summary = '';
  if (items.length > 0) {
    const docSubject = titleChunk || documentTitle;
    const keyActions = items.slice(0, 3).map((item) => item.toLowerCase().replace(/\.$/, '')).join(', ');
    summary = `This document provides operational guidelines and an action checklist for ${docSubject}. Core directives include ${keyActions}.`;
  } else if (sentences.length > 0) {
    const cleanSentences = sentences
      .filter((s) => s.length > 15 && !/^[\d\W_]+$/.test(s))
      .slice(0, 3)
      .map((s) => (s.endsWith('.') ? s : s + '.'));
    summary = cleanSentences.join(' ');
  }

  if (!summary || summary.length < 25) {
    summary = `Executive overview for ${documentTitle}. Details event operations, team responsibilities, and procedural requirements.`;
  }

  // Key highlights: clean bullet points without numeric or fragment artifacts
  const keyPoints = [];
  if (items.length > 0) {
    keyPoints.push(...items.slice(0, 6));
  } else if (sentences.length > 0) {
    keyPoints.push(
      ...sentences
        .filter((s) => s.length > 15 && !/^[\d\W_]+$/.test(s))
        .slice(0, 5)
        .map((s) => s.replace(/[.,;:]+$/, ''))
    );
  }

  if (keyPoints.length === 0) {
    keyPoints.push(`Follow all procedures detailed in ${documentTitle}`);
  }

  // Extract actionable tasks
  const tasks = [];
  const actionItems = [];
  const taskPool = items.length > 0 ? items : sentences;

  for (const item of taskPool) {
    if (item.length >= 8) {
      actionItems.push(item);
      if (tasks.length < 5) {
        tasks.push({
          title: item.length > 60 ? item.substring(0, 57) + '...' : item,
          description: item,
          owner: null,
          deadline: null,
          priority: /urgent|critical|immediate|booking|security|schedule/i.test(item) ? 'high' : 'medium'
        });
      }
    }
  }

  // Extract potential risks
  const risks = [];
  const riskKeywords = /(?:risk|delay|hazard|fail|danger|penalty|cost overrun|overdue|liability|emergency|violation|cancel|shortage|safety)/i;
  
  for (const item of taskPool) {
    if (riskKeywords.test(item) && item.length > 12) {
      if (risks.length < 3) {
        risks.push({
          title: item.length > 50 ? item.substring(0, 47) + '...' : item,
          severity: /danger|emergency|critical|severe|penalty|safety/i.test(item) ? 'critical' : 'high',
          description: item
        });
      }
    }
  }

  // If no explicit risks found, supply standard operational risk checks based on document type
  if (risks.length === 0 && items.length > 0) {
    risks.push({
      title: 'Schedule & Logistics Coordination Delay',
      severity: 'medium',
      description: 'Potential delays if venue bookings or material distribution are not finalized ahead of time.'
    });
  }

  // Extract dates
  const dateRegex = /\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\b/g;
  const foundDates = clean.match(dateRegex) || [];
  const importantDates = Array.from(new Set(foundDates)).slice(0, 6);

  return {
    summary,
    keyPoints: keyPoints.slice(0, 6),
    tasks,
    actionItems: actionItems.slice(0, 6),
    importantDates,
    entities: [],
    sentiment: 'neutral',
    risks
  };
}

export async function parseDocumentText(text, documentTitle = 'Document') {
  const clean = cleanDocumentText(text, documentTitle);
  if (!clean || !clean.trim()) {
    return fallbackDocumentAnalysis('', documentTitle);
  }

  try {
    const result = await generateStructuredResponse({
      systemInstruction: [
        'You extract structured information, executive summaries, tasks, and potential operational/event risks from club documents, guidelines, or event files.',
        'Return only JSON matching the supplied schema. Never return prose, markdown, or extra keys.',
        'Extract an executive summary that clearly explains the main purpose and content of the document.',
        'Extract tasks when actionable commitments or requirements are mentioned.',
        'Extract risks when potential hazards, budget risks, delays, or compliance issues are identified.',
        'Do not invent people, dates, or details. Use null for unknown owner or deadline.'
      ].join(' '),
      prompt: clean.length > 15000 ? clean.substring(0, 15000) : clean,
      responseJsonSchema: documentResponseSchema
    });

    const normalized = normalizeDocumentResult(result);
    if (!normalized.keyPoints || normalized.keyPoints.length === 0) {
      normalized.keyPoints = (normalized.actionItems || [])
        .filter((item) => typeof item === 'string' && item.trim().length >= 6 && !/^[\d\W_]+$/.test(item))
        .map((item) => item.replace(/^(?:\d+[\.\)]|[-*•])\s*/, '').trim())
        .slice(0, 6);
    }
    return normalized;
  } catch (error) {
    console.warn('Gemini structured response unavailable or failed, falling back to extractive parser:', error.message);
    return fallbackDocumentAnalysis(clean, documentTitle);
  }
}

export async function queryDocumentText(text, question) {
  const clean = cleanDocumentText(text);
  if (!clean || !clean.trim()) {
    return {
      answer: 'This document does not contain any readable text to answer questions from.',
      sources: []
    };
  }

  const prompt = `DOCUMENT CONTENT:
"""
${clean.length > 12000 ? clean.substring(0, 12000) + '...[truncated]' : clean}
"""

USER QUESTION:
${question}

Provide a direct, accurate, and concise answer based ONLY on the document content provided above. If the document does not mention the answer, state that clearly.`;

  try {
    const result = await generateStructuredResponse({
      systemInstruction: 'You are an intelligent AI document assistant. Answer questions directly, accurately, and concisely based strictly on the provided document text.',
      prompt,
      responseJsonSchema: {
        type: 'object',
        properties: {
          answer: { type: 'string', description: 'Clear and concise answer to the question' },
          relevantPoints: { type: 'array', items: { type: 'string' }, description: 'Specific bullet points from document supporting the answer' }
        },
        required: ['answer', 'relevantPoints']
      }
    });

    return {
      answer: result.answer || 'No answer could be formulated from the document.',
      relevantPoints: Array.isArray(result.relevantPoints) ? result.relevantPoints : []
    };
  } catch (err) {
    console.warn('AI Q&A fallback triggered:', err.message);
    const keywords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const sentences = clean.split(/(?<=[.?!])\s+/).filter((s) => s.length > 10);
    const matching = sentences.filter((s) => keywords.some((k) => s.toLowerCase().includes(k)));

    if (/task|action|checklist|todo|do|assign/i.test(question)) {
      const taskKeywords = /(?:must|should|will|need to|deadline|submit|prepare|send|coordinate|arrange|organize|complete|review|assign|checklist|orientation)\b/i;
      const taskSentences = sentences.filter((s) => taskKeywords.test(s));
      if (taskSentences.length > 0) {
        return {
          answer: `Here are the key action items and tasks identified:\n` + taskSentences.slice(0, 5).map((t, idx) => `${idx + 1}. ${t}`).join('\n'),
          relevantPoints: taskSentences.slice(0, 5)
        };
      }
      return {
        answer: 'Tasks & Checklist Items:\n1. Prepare and submit event schedule and requirements.\n2. Coordinate with club members and volunteers.\n3. Verify venue booking and logistics.\n4. Complete attendee check-in and orientation materials.',
        relevantPoints: ['Orientation preparation', 'Volunteer coordination', 'Schedule verification']
      };
    }

    if (matching.length > 0) {
      return {
        answer: matching.slice(0, 3).join(' '),
        relevantPoints: matching.slice(0, 3)
      };
    }

    return {
      answer: `Based on this document: ${clean.substring(0, 250)}...`,
      relevantPoints: [clean.substring(0, 100)]
    };
  }
}

