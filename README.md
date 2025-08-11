# PDF Form Filler

## Overview

A Next.js web application that transforms natural language instructions into filled PDF forms using AI-powered field extraction.
The app uses **regex-based parsing** with **span-based overlap resolution** to accurately identify **buyer**, **seller**, **address**, and **date** from plain English text, then automatically populates PDF AcroForm fields.
Built with **React**, **Tailwind CSS**, and **pdf-lib** for PDF manipulation.

## Approach

Implemented a rules-first extraction system using optimized regex patterns and deterministic parsing, avoiding reliance on external AI APIs. Field extraction uses span-based overlap resolution to ensure mutual exclusivity, followed by confidence scoring to inform the user of potential issues. The frontend integrates a live PDF viewer, auto-fill functionality, and a non-blocking warning system. Session history allows quick re-application of past extractions, and the architecture is modular for easy expansion to other form types.

## Features

- **Natural Language Processing**: Extracts structured data from free-form text using advanced regex patterns and post-processing.
- **Mutually-Exclusive Field Extraction**: Span-based overlap resolution ensures no field content bleeds into others.
- **Confidence Scoring**: Intelligent confidence calculation with adjustments for extraction method and overlap trimming.
- **Session History**: Browser-based history of last 5 successful extractions with one-click re-apply.
- **Warning System**: Non-blocking UI warnings for low confidence or missing fields with visual highlighting.
- **Fully Tested**: 8/8 functional test cases pass, covering edge cases and ensuring robust extraction.
- **Extensible Design**: Modular patterns and mapping make it easy to support other form types and fields.

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

**Live Demo**: [Vercel Deployment Link](https://nlp-pdf-filler.vercel.app)
