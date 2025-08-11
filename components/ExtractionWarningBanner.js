import { AlertTriangle } from "lucide-react";

export default function ExtractionWarningBanner({
  hasEmptyFields,
  isLowConfidence,
}) {
  if (!hasEmptyFields && !isLowConfidence) {
    return null;
  }

  let message = "";
  if (hasEmptyFields && isLowConfidence) {
    message =
      "Extraction incomplete and low confidence. Review fields before filling.";
  } else if (hasEmptyFields) {
    message = "Some fields are missing. Review and complete before filling.";
  } else if (isLowConfidence) {
    message = "Extraction confidence is low. Review fields before filling.";
  }

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/80 backdrop-blur-sm p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800">{message}</p>
        </div>
      </div>
    </div>
  );
}
