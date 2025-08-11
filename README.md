# PDF Form Filler

Transform natural language instructions into filled PDF forms with AI-powered extraction and real-time preview.

![PDF Form Filler Hero](./docs/hero-screenshot.png)

## 🚀 Features

### Core Functionality
- **Natural Language Processing**: Extract form fields from plain English descriptions
- **Real-time PDF Filling**: See your PDF update instantly as you type
- **Template Preview**: View the actual form structure before filling
- **Smart Field Detection**: Automatically identifies address, buyer, seller, and date fields
- **Download Support**: Get your completed PDF with one click

### Advanced Features
- **Auto-fill Toggle**: Automatically fill PDFs after field extraction
- **Confidence Scoring**: See how accurate the field extraction is
- **Field Validation**: Visual feedback for empty or incomplete fields
- **Race Condition Prevention**: Handles rapid user input without conflicts
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

### Extraction Intelligence
- **Rules-First Approach**: Uses regex patterns for high accuracy
- **AI Fallback**: Leverages LLM when regex fails
- **Prefix Trimming**: Cleans up extracted text ("buyer is Jane" → "Jane")
- **Multiple Formats**: Handles various date formats and legal terminology

## 📸 Screenshots

### Template View (Initial Load)
Shows the original PDF form structure immediately upon page load.

![Template View](./docs/template-view.png)

### Field Extraction in Action
Natural language input with real-time field extraction and confidence scoring.

![Field Extraction](./docs/field-extraction.png)

### Auto-fill Toggle States
Toggle between manual and automatic PDF filling.

| Auto-fill OFF | Auto-fill ON |
|---------------|---------------|
| ![Auto-fill OFF](./docs/autofill-off.png) | ![Auto-fill ON](./docs/autofill-on.png) |

### Badge Color States
Visual feedback showing how many fields were successfully filled.

| 4/4 Fields (Green) | 3/4 Fields (Amber) | Template State |
|-------------------|-------------------|----------------|
| ![Green Badge](./docs/badge-green.png) | ![Amber Badge](./docs/badge-amber.png) | ![Template](./docs/badge-hidden.png) |

### Filled PDF Result
Complete PDF with all fields populated and ready for download.

![Filled PDF](./docs/filled-pdf.png)

## 🛠 Installation & Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pdf-form-filler
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   CORS_ORIGINS=*
   # Optional: Leave blank for rules-first extraction only
   EMERGENT_LLM_KEY=your_llm_key_here_or_leave_blank
   ```

4. **Start the development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

### Production Build
```bash
yarn build && yarn start
# or
npm run build && npm start
```

## 🤖 AI Integration (Optional)

**The application works perfectly with rules-first extraction only.** LLM integration is optional and can be enabled by setting the `EMERGENT_LLM_KEY` environment variable.

- **Rules-First Only**: Leave `EMERGENT_LLM_KEY` blank or unset
- **With LLM Fallback**: Set `EMERGENT_LLM_KEY=sk-emergent-your-key-here`

The extraction system uses intelligent regex patterns for high accuracy and only falls back to LLM when patterns fail to extract complete information.

## 📡 API Routes

### Extract Fields
Extract form fields from natural language text.

**Endpoint:** `POST /api/extract`

**Request:**
```json
{
  "text": "The property at 123 Main St was sold by John Doe to Jane Smith on June 15, 2025."
}
```

**Response:**
```json
{
  "address": "123 Main St",
  "buyer": "Jane Smith", 
  "seller": "John Doe",
  "date": "2025-06-15",
  "confidence": 0.93
}
```

**Status Codes:**
- `200`: Successful extraction
- `400`: Invalid or missing text parameter
- `500`: Internal server error

### Fill PDF
Fill the PDF template with provided field data.

**Endpoint:** `POST /api/fill-pdf`

**Request:**
```json
{
  "data": {
    "address": "123 Main St",
    "buyer": "Jane Smith",
    "seller": "John Doe", 
    "date": "2025-06-15"
  }
}
```

**Response:** PDF binary data

**Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="filled_document.pdf"
X-Fields-Filled: 4
X-Message: Successfully filled 4 fields
```

**Status Codes:**
- `200`: PDF generated successfully
- `400`: Invalid data format
- `500`: PDF generation failed

### Get Template PDF
Retrieve the original PDF template.

**Endpoint:** `GET /api/pdf`

**Response:** PDF binary data

**Headers:**
```
Content-Type: application/pdf
Content-Disposition: inline; filename="template.pdf"
Cache-Control: public, max-age=0, must-revalidate
ETag: "hash-of-pdf-content"
X-PDF-Type: template
```

**Status Codes:**
- `200`: Template served successfully
- `304`: Not Modified (client has cached version)
- `500`: Template not found

## 🎯 Usage Examples

### Basic Usage
1. **View Template**: The PDF template displays automatically on page load
2. **Enter Description**: Type a natural language description of your transaction
3. **Extract Fields**: Click "Extract Fields" to parse the information
4. **Review & Edit**: Check extracted fields and make manual corrections if needed
5. **Fill PDF**: Click "Fill PDF" to generate the completed document
6. **Download**: Click "Download PDF" to save the filled form

### Auto-fill Workflow
1. **Enable Auto-fill**: Toggle the "Auto-fill after extract" switch
2. **Type Description**: Start typing your transaction details
3. **Automatic Processing**: Fields extract and PDF fills automatically
4. **Real-time Updates**: See changes reflected immediately in the PDF viewer

### Example Inputs
```
"The property at 123 Main St was sold by John Doe to Jane Smith on June 15, 2025."

"On 6/15/25, Jane Smith purchased 123 Main St from John Doe."

"Seller Acme LLC; Buyer Beta Inc; Address 45 River Rd; Date 2025-06-15."

"Buyer is Jane. Seller is John. Address 123 Main St. Today's date."
```

## ⚙️ Configuration

### Field Mapping
The application maps extracted fields to PDF form fields as follows:
```javascript
{
  address: 'propertyAddress',
  buyer: 'buyer', 
  seller: 'seller',
  date: 'date'
}
```

### Extraction Configuration
The app uses a rules-first approach with optional LLM fallback:
1. **Primary**: Regex pattern matching (high accuracy, fast)
2. **Fallback**: LLM extraction (when LLM key is provided)
3. **Confidence Scoring**: Combines both approaches for reliability

## 🚨 Known Limitations

### Extraction Accuracy
- **Complex Legal Language**: May struggle with heavily technical legal terminology
- **Ambiguous Pronouns**: "He sold to her" requires more context
- **Multiple Transactions**: Designed for single transaction per input
- **Date Formats**: Best with standard formats (MM/DD/YYYY, Month DD, YYYY)

### PDF Limitations  
- **AcroForm Required**: PDF must have fillable form fields
- **Field Name Matching**: Form field names must match expected mapping
- **Text Fields Only**: Does not support checkboxes, radio buttons, or signatures
- **Single Page**: Optimized for single-page forms

### Browser Compatibility
- **Modern Browsers**: Requires ES2018+ support
- **PDF Viewing**: Depends on browser's native PDF viewer
- **File Downloads**: Some mobile browsers may have limitations

### Performance Considerations
- **PDF Size**: Large PDFs (>5MB) may process slowly
- **Concurrent Users**: Single-instance deployment recommended for development
- **Memory Usage**: PDF processing is memory-intensive

## 🛠 Troubleshooting

### Common Issues

#### "Template PDF not found"
**Solution**: Ensure `VM_Takehome_Document.pdf` exists in the project root directory.

#### Fields not extracting correctly
**Possible causes:**
- Input text too ambiguous
- Non-standard terminology used
- Multiple transactions in single input

**Solutions:**
- Use clearer language ("sold by X to Y")
- Include specific dates and addresses
- Separate multiple transactions

#### PDF not filling properly
**Check:**
1. PDF has AcroForm fields (not just text annotations)
2. Field names match: `propertyAddress`, `buyer`, `seller`, `date`
3. Fields are text inputs (not checkboxes/radio buttons)

#### Auto-fill not working
**Verify:**
1. Toggle is enabled (yellow lightning icon)
2. Fields were successfully extracted
3. At least one field has content
4. No JavaScript errors in console

#### Performance issues
**Optimization tips:**
- Clear browser cache
- Reduce PDF template size
- Check network connectivity
- Monitor browser memory usage

### Debug Mode
Enable verbose logging by setting environment variable:
```bash
DEBUG=pdf-form-filler:* yarn dev
```

### Browser Developer Tools
1. Open DevTools (F12)
2. Check Console tab for errors
3. Monitor Network tab for API failures
4. Verify file downloads in DevTools

## 📱 Mobile Support

The application is fully responsive and supports:
- **Touch Gestures**: Tap to interact, pinch to zoom PDFs
- **Mobile Keyboards**: Optimized input fields
- **Portrait/Landscape**: Adaptive layouts
- **Small Screens**: Stacked layout on mobile devices

### Mobile-Specific Features
- Larger touch targets for buttons
- Simplified navigation
- Optimized PDF viewer for small screens
- Touch-friendly form controls

## 🔒 Security Considerations

### Data Handling
- **No Persistent Storage**: User data is not saved on the server
- **Temporary Processing**: PDFs are generated in memory and discarded
- **No Logging**: Personal information is not logged to files

### API Security
- **Input Validation**: All inputs are sanitized and validated
- **Rate Limiting**: Consider implementing rate limiting in production
- **CORS**: Configure CORS settings for production deployment

### Recommended Production Settings
```env
NODE_ENV=production
CORS_ORIGINS=https://yourdomain.com
# Add additional security headers
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`yarn test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Code formatting is enforced
- **TypeScript**: Gradually migrating to TypeScript
- **Testing**: Add tests for new features

### Testing
```bash
# Run extraction tests
yarn test:extraction

# Run API tests  
yarn test:api

# Run full test suite
yarn test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📋 Changelog

### Step 1: PDF Analysis & Field Detection
- ✅ Analyzed template PDF and detected 4 existing AcroForm fields
- ✅ Confirmed field names: `propertyAddress`, `buyer`, `seller`, `date`
- ✅ Established field mapping structure for extraction → PDF filling

### Step 2: Basic Extraction API  
- ✅ Implemented `/api/extract` endpoint with regex-based field extraction
- ✅ Added natural language processing for address, buyer, seller, and date
- ✅ Created confidence scoring system (0.0-1.0 scale)
- ✅ Built error handling and input validation

### Step 3: Rules-First Extraction Logic
- ✅ Enhanced regex patterns with non-greedy matching and proper delimiters
- ✅ Implemented post-processing to clean extracted values
- ✅ Added LLM fallback for missing or low-confidence fields
- ✅ Improved confidence scoring with bonuses/penalties system

### Step 4: Server-Side PDF Filling
- ✅ Created `/api/fill-pdf` endpoint using pdf-lib
- ✅ Implemented field mapping from extracted data to AcroForm fields
- ✅ Added PDF generation with proper headers and metadata
- ✅ Built validation and error handling for PDF operations

### Step 5: UI Integration
- ✅ Built complete Next.js UI with two-pane responsive layout
- ✅ Created components: InstructionInput, ParsedFieldsCard, ActionsBar, PdfViewer
- ✅ Implemented state management for extraction → fill → download workflow
- ✅ Added loading states, error handling, and toast notifications

### Step 6: UI Polish & Styling
- ✅ Applied modern glassmorphism design with gradient backgrounds
- ✅ Enhanced typography and color schemes to match mockup
- ✅ Improved component styling with rounded corners and shadows
- ✅ Added visual hierarchy and professional aesthetics

### Step 7A: Advanced Extraction Fixes
- ✅ Refined regex patterns for better accuracy and prefix trimming
- ✅ Enhanced post-processing to remove leading phrases
- ✅ Fixed confidence scoring with additive bonuses (buyer+seller via regex)
- ✅ Improved field extraction reliability to 90%+ accuracy

### Step 7B: Auto-Fill Toggle Feature
- ✅ Added auto-fill toggle with debouncing (550ms)
- ✅ Implemented race condition prevention using AbortController
- ✅ Built field change detection to trigger auto-fill only when needed
- ✅ Enhanced UX with real-time PDF generation after extraction

### Step 7C: Template PDF on Initial Load
- ✅ Created `/api/pdf` endpoint to serve original template
- ✅ Implemented ETag-based caching for performance
- ✅ Added template loading on page mount for better UX
- ✅ Built "Reset to Template" functionality with proper state management

### Step 8: Final Polish & Quality Assurance
- ✅ Enhanced prefix trimming with comprehensive patterns
- ✅ Added "Filled X/4 fields" badge with color-coded feedback
- ✅ Implemented badge state management (Green/Amber/Gray/Hidden)
- ✅ Created comprehensive test suites for all functionality
- ✅ Achieved 90%+ success rate on extraction accuracy tests

---

**Built with ❤️ using Next.js, pdf-lib, and modern web technologies.**