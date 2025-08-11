# PDF Form Filler - Project Report

## Overview

A Next.js web application that transforms natural language instructions into filled PDF forms using AI-powered field extraction. The app uses regex-based extraction with span-based overlap resolution to accurately identify buyer, seller, address, and date fields from plain English text, then automatically populates PDF AcroForm fields. Built with React, Tailwind CSS, and pdf-lib for PDF manipulation.

## Features

• **Natural Language Processing**: Extracts structured data from free-form text using advanced regex patterns and post-processing
• **Mutually-Exclusive Field Extraction**: Span-based overlap resolution ensures no field content bleeds into others
• **Confidence Scoring**: Intelligent confidence calculation with adjustments for extraction method and overlap trimming
• **Session History**: Browser-based history of last 5 successful extractions with one-click re-apply functionality
• **Warning System**: Non-blocking UI warnings for low confidence or missing fields with visual highlighting

## Implementation Notes

• **Rules-First Extraction**: Deterministic regex-based extraction with fallback rules (no external AI dependencies)
• **Overlap Resolution**: Priority-based trimming system (date → seller → buyer → address) with character span tracking
• **PDF Integration**: Direct AcroForm field mapping and manipulation using pdf-lib with blob URL display
• **UX Enhancements**: Glass morphism design, auto-fill capabilities, and comprehensive error handling

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Deployment

**Live Demo**: [Vercel Deployment Link](https://your-vercel-link.vercel.app)
