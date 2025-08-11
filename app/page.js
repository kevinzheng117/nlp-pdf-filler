'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import InstructionInput from '../components/InstructionInput';
import ParsedFieldsCard from '../components/ParsedFieldsCard';
import ActionsBar from '../components/ActionsBar';
import PdfViewer from '../components/PdfViewer';

export default function App() {
  // State management
  const [instructionText, setInstructionText] = useState('');
  const [parsedFields, setParsedFields] = useState({
    address: '',
    buyer: '',
    seller: '',
    date: '',
    confidence: 0.0
  });
  const [pdfBlob, setPdfBlob] = useState(null);
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [loadingFill, setLoadingFill] = useState(false);

  // Extract fields from natural language text
  const handleExtract = useCallback(async (text) => {
    if (!text.trim()) {
      toast.error('Please enter some text to extract fields from');
      return;
    }

    setLoadingExtract(true);
    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract fields');
      }

      const result = await response.json();
      setParsedFields(result);
      toast.success(`Fields extracted with ${Math.round(result.confidence * 100)}% confidence`);
      
    } catch (error) {
      console.error('Extract error:', error);
      toast.error(`Extraction failed: ${error.message}`);
    } finally {
      setLoadingExtract(false);
    }
  }, []);

  // Fill PDF with current field values
  const handleFillPdf = useCallback(async () => {
    // Check if we have any field data
    const hasData = Object.entries(parsedFields).some(([key, value]) => 
      key !== 'confidence' && value && value.trim()
    );

    if (!hasData) {
      toast.error('No field data to fill PDF with. Please extract some fields first.');
      return;
    }

    // Show warning for empty fields but allow proceed
    const emptyFields = Object.entries(parsedFields)
      .filter(([key, value]) => key !== 'confidence' && (!value || !value.trim()))
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      toast.warning(`Some fields are empty: ${emptyFields.join(', ')}. PDF will be filled with available data.`);
    }

    setLoadingFill(true);
    try {
      const response = await fetch('/api/fill-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data: {
            address: parsedFields.address || '',
            buyer: parsedFields.buyer || '',
            seller: parsedFields.seller || '',
            date: parsedFields.date || ''
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fill PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      setPdfBlob(blob);
      
      const fieldsCount = response.headers.get('x-fields-filled');
      toast.success(`PDF filled successfully! ${fieldsCount} fields populated.`);
      
    } catch (error) {
      console.error('Fill PDF error:', error);
      toast.error(`PDF filling failed: ${error.message}`);
    } finally {
      setLoadingFill(false);
    }
  }, [parsedFields]);

  // Download the current PDF
  const handleDownloadPdf = useCallback(() => {
    if (!pdfBlob) {
      toast.error('No PDF available to download. Please fill the PDF first.');
      return;
    }

    try {
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'filled_document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    }
  }, [pdfBlob]);

  // Reset all data
  const handleReset = useCallback(() => {
    setInstructionText('');
    setParsedFields({
      address: '',
      buyer: '',
      seller: '',
      date: '',
      confidence: 0.0
    });
    setPdfBlob(null);
    toast.info('Reset complete');
  }, []);

  // Update individual parsed fields
  const updateParsedField = useCallback((fieldName, value) => {
    setParsedFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-purple-600">
      {/* Header */}
      <header className="py-8">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              PDF Form Filler
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Transform natural language instructions into filled PDF forms with AI-powered extraction
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 pb-8">
        <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {/* Left Pane - Input and Fields */}
          <div className="lg:col-span-2 space-y-6">
            <InstructionInput
              value={instructionText}
              onChange={setInstructionText}
              onExtract={handleExtract}
              loading={loadingExtract}
            />
            
            <ParsedFieldsCard
              fields={parsedFields}
              onFieldChange={updateParsedField}
              disabled={loadingExtract || loadingFill}
            />
            
            <ActionsBar
              onFillPdf={handleFillPdf}
              onDownloadPdf={handleDownloadPdf}
              onReset={handleReset}
              loadingFill={loadingFill}
              hasFields={Object.entries(parsedFields).some(([key, value]) => 
                key !== 'confidence' && value && value.trim()
              )}
              hasPdf={!!pdfBlob}
            />
          </div>

          {/* Right Pane - PDF Viewer */}
          <div className="lg:col-span-3">
            <PdfViewer
              pdfBlob={pdfBlob}
              loading={loadingFill}
            />
          </div>
        </div>
      </main>
    </div>
  );
}