export function prepareForSorting(value: any): string {
  if (value == null) return '';

  const stringValue = String(value).trim();

  return stringValue
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
}

export function tryParseNumber(value: any): number | null {
  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    const normalized = value
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

    const num = parseFloat(normalized.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? null : num;
  }

  return null;
}