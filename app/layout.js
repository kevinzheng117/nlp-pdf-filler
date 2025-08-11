import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "PDF Form Filler",
  description: "Fill PDF forms using natural language instructions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}