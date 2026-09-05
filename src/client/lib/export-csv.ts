/**
 * Universal CSV Exporter for Skorvia SaaS tables
 * Ensures UTF-8 BOM encoding for Excel/Numbers/Google Sheets compatibility and prevents CSV injection.
 */

export interface CsvColumn<T> {
  header: string;
  accessor:
    | keyof T
    | ((row: T) => string | number | boolean | null | undefined);
}

function sanitizeCsvField(val: unknown): string {
  if (val === null || val === undefined) return "";
  let str = String(val).trim();

  // Prevent formula injection in spreadsheet software
  if (
    str.startsWith("=") ||
    str.startsWith("+") ||
    str.startsWith("-") ||
    str.startsWith("@")
  ) {
    str = `'${str}`;
  }

  // Escape double quotes and wrap in quotes if containing comma or newline
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsvString<T extends object>(
  data: T[],
  columns: CsvColumn<T>[],
): string {
  const headerRow = columns.map((c) => sanitizeCsvField(c.header)).join(",");
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const val =
          typeof col.accessor === "function"
            ? col.accessor(row)
            : row[col.accessor];
        return sanitizeCsvField(val);
      })
      .join(","),
  );

  return [headerRow, ...dataRows].join("\r\n");
}

export function downloadCsvFile(filename: string, csvContent: string): void {
  if (typeof window === "undefined") return;

  // Add UTF-8 BOM for automatic Excel delimiter and character encoding detection
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split("T")[0];
  const cleanFilename = filename.endsWith(".csv")
    ? filename.replace(".csv", `-${timestamp}.csv`)
    : `${filename}-${timestamp}.csv`;

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", cleanFilename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRecordsToCsv<T extends object>(
  filename: string,
  records: T[],
  columns: CsvColumn<T>[],
): void {
  const csv = generateCsvString(records, columns);
  downloadCsvFile(filename, csv);
}
