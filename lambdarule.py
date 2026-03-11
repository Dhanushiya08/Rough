# prompts.py

COMMON_PROMPT = """
You are an OCR and document understanding system for invoice processing.

STRICT EXECUTION MODE:

- Extract ONLY the fields defined in the provided business rules.
- Follow extraction priority exactly as specified.
- Do NOT hallucinate.
- Do NOT infer beyond visible document evidence.
- If a value is missing, ambiguous, or unreadable → return null.
- Prevent field bleeding — each value must belong strictly to its own key.
"""

INSTRUCTION_RULES = """
================================================
INVOICE EXTRACTION BUSINESS RULES
================================================

1. Company Code
Fixed value: 8439.

2. Supplier
Extract the 6-digit vendor code.
If the vendor code appears in orange font, prioritize that value over others.
If no orange-highlighted vendor code is found, extract the vendor code that is explicitly mentioned or labeled in the document.

3. Reference
Extract the invoice number as mentioned in the invoice document.

4. Amount in Document
Extract the total amount mentioned in the invoice.

5. Document Currency
Extract the currency mentioned near the grand total amount.
If the currency appears in orange font, prioritize that value.

6. Document Date
Extract the invoice date.
Prioritize the date that has an orange font tick mark annotated next to it in the document.

7. Text
Extract the content written next to the label "Text:" as digitally annotated in the document.
The annotation may appear in orange or black font.

8. Document Header Text
Extract using the following priority order:

Priority 1:
If "HT:" is digitally annotated (orange or black font) and the value starts with "LNG1",
use this value as the Document Header Text.

Priority 2:
If "HT:" is present but the value does not start with "LNG1",
capture the value but continue checking for a valid LNG1 value.

Priority 3 (Fallback):
If neither condition yields a valid LNG1 value,
use the value extracted in the "Text" field as the Document Header Text.

9. Assignment
Same as Reference (invoice number).

10. Baseline Payment Date
Same as Document Date.

11. CBS
Extract the CBS number in the format X.X.X (example: 1.1.4).

Identify the CBS value using any of the following indicators:
- A digital tick or annotation placed next to the number in the document.
- An explicit label "CBS" near the number.
- The number appearing near the Payment Certificate section of the document.

If no CBS value is present in the document, return null.

12.Internal Order
its null value
"""

OUTPUT_JSON_SCHEMA = """
{
  "extracted_data": {
    "companyCode": "8439",
    "supplier": null,
    "reference": null,
    "amountInDocument": null,
    "documentCurrency": null,
    "documentDate": null,
    "text": null,
    "documentHeaderText": null,
    "assignment": null,
    "baselinePaymentDate": null,
    "cbsNumber": null,
    "internalOrder":null,
  }
}
"""


def build_dynamic_prompt():

    return f"""
{COMMON_PROMPT}

================================================
INVOICE EXTRACTION BUSINESS RULES
================================================

{INSTRUCTION_RULES}

================================================
OUTPUT FORMAT
================================================

{OUTPUT_JSON_SCHEMA}

IMPORTANT:
Return ONLY valid JSON.
Do NOT include explanations.
Do NOT include markdown.
"""



from prompts import build_dynamic_prompt



PROMPT = build_dynamic_prompt()


https://chatgpt.com/share/69b1171d-f640-800f-b6c6-27cc52eb3e03


INSTRUCTION_RULES = """
================================================
BAHASA INVOICE OCR – BUSINESS EXTRACTION RULES
================================================

1. Company Code
Extract the Company Code from the first four (4) digits of the barcode on the invoice.

2. Vendor Code
Extract the Vendor Code from the Vendor Information section.
Typically found in the PO section or within the invoice header under vendor details.

3. Reference
Extract the Invoice Number from the invoice.

4. Amount
Extract only the total value of the line items billed.
Exclude:
- Tax (PPN)
- VAT
- Any additional charges

5. Currency
If the invoice language is Bahasa Indonesia OR a Faktur Pajak is present → set currency as IDR.
If the invoice is in another language → extract the currency directly from the invoice.

6. Document Date
Extract the invoice date (Tanggal Invoice) stated on the invoice.

7. Tax Code (Lookup Required)
Use the first 3 digits of the Faktur Pajak top header code as the lookup key.
Example: 040.

Use this value to filter the Apical Tax Code lookup table using the column:
'Kode Seri Faktur Pajak'.

Return the corresponding value from the column:
'VAT (Rate)'.

Note:
The lookup key must always be a **3-digit padded format**
Example:
040 (not 40).

8. Tax Amount
The Tax Amount must be the same value as the Amount.

9. PO Number
Extract the Purchase Order number.
The PO number must be a **10-digit number**.

It may appear in:
- Attached PO document
- Under "Surat Pesanan"
- Handwritten on the invoice.

10. Assignment
Assignment must contain the same value as the PO Number.

11. Text
Extract one line item description from the invoice.

12. Document Header Text
Extract the full Faktur Pajak header code printed at the top of the Faktur Pajak.

Example:
04002500388182779

13. Baseline Payment Date
Use the **stamp date** stamped on the invoice.
If no stamp date is present, use the Document Date.

14. Business Area
Extract the Business Area value if present in the document.
If not present, return null.
"""

OUTPUT_JSON_SCHEMA = """
{
  "extracted_data": {
    "companyCode": null,
    "vendorCode": null,
    "reference": null,
    "amount": null,
    "currency": null,
    "documentDate": null,
    "taxCode": null,
    "taxAmount": null,
    "poNumber": null,
    "assignment": null,
    "text": null,
    "documentHeaderText": null,
    "baselinePaymentDate": null,
    "businessArea": null
  }
}
"""

PROMPT = """
You are an OCR and document understanding system for Bahasa invoice processing.

Your task is to extract ONLY the fields listed below, strictly following the business rules and derivations provided.

========================
BAHASA INVOICE OCR – BUSINESS EXTRACTION RULES
========================

1. Company Code
- Extract from the barcode on the invoice.
- Use ONLY the first four (4) numeric digits of the barcode.
- Ignore letters or symbols.
- If no barcode is found, return null.

Example:
Barcode: 8437CAAPTB25102454
Company Code: 8437

2. Vendor Code
- The Vendor Code must be extracted from the Vendor Information section of the invoice.
- It may appear in brackets next to the vendor name.
  Example:
    Indo (FTR45678)
    Vendor Code: FTR45678
- Extract the value inside brackets if present.
- Vendor Code may be alphanumeric.
- Do NOT extract the PO Number.
- If multiple numbers appear, select the one clearly associated with vendor name.
- Return exactly as written (preserve letters and numbers).
- If not found, return null.

3. Reference
- Must contain the Invoice Number.
- Invoice Number (Reference) must be extracted ONLY from the Invoice Image.
- Do NOT extract invoice number from PO attachment pages.
- Look specifically for:
  - "Invoice Number"
  - "No. Invoice"
  - "Nomor Invoice"
- Return exactly as written.

4. Amount
- Must reflect ONLY the total value of billed line items.
- EXCLUDE:
  - Tax
  - PPN
  - Additional charges
- Select subtotal before tax if multiple totals exist.
- Extract numeric value only.
- Preserve decimals.
- Remove currency symbols.

5. Currency
- If invoice language is Bahasa Indonesia OR a Faktur Pajak is present → return "IDR".
- Otherwise extract currency from invoice.
- If unclear, return null.

6. Document Date
- Must be the Invoice Date (Tanggal Invoice).
- Extract ONLY from the Invoice Image.
- Look specifically for:
  - "Tanggal Invoice"
  - "Invoice Date"
- Do NOT extract date from PO attachment.
- Extract exactly as written.
- All date outputs MUST be returned in MM/DD/YYYY format.

7. Tax Amount
- Must be EXACTLY the same value as the Amount field.

8. PO Number
- Must be a 10-digit number.
- May be found:
  - In attached PO document
  - Under "Surat Pesanan"
  - Handwritten on invoice
- Extract digits only.
- If not exactly 10 digits, return null.

9. Assignment
- Must be EXACTLY the same value as the PO Number.

10. Baseline Date
- Must be the stamp date stamped on the invoice.
- If no stamp date is present → use Document Date.

========================
GENERAL RULES
========================
- Return ONLY valid JSON.
- No explanations.
- No markdown.
- No hallucination.
- If missing, return null.
- Field names must match exactly.
- All date outputs MUST be returned in MM/DD/YYYY format.

========================
OUTPUT FORMAT
========================

{
  "extracted_data": {
    "Company Code": null,
    "Vendor Code": null,
    "Reference": null,
    "Amount": null,
    "Currency": null,
    "Document Date": null,
    "Tax Amount": null,
    "PO Number": null,
    "Assignment": null,
    "Baseline Date": null
  }
}
"""


