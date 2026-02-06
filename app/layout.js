import "../styles/dashboard.css";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "CSV Analytics Dashboard",
  description: "Upload a CSV and view KPI, charts, and tables.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
