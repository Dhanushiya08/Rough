


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
# Invoice Data Extraction Rules

Extract the following fields from the invoice document using the rules below.

---

## 1. Company Code
Fixed value: **8439**

---

## 2. Supplier
Extract the **6-digit vendor code**.

- If the vendor code appears in **orange font**, prioritize that value.
- If no orange-highlighted vendor code is found, extract the vendor code that is **explicitly mentioned or labeled in the document**.

---

## 3. Reference
Extract the **invoice number** as stated in the invoice document.

---

## 4. Amount in Document
Extract the **total amount** mentioned in the invoice.

---

## 5. Document Currency
Extract the **currency mentioned near the grand total amount**.

- If the currency appears in **orange font**, prioritize that value.

---

## 6. Document Date
Extract the **invoice date**.

- Prioritize the date that has an **orange font tick mark annotation** next to it.

---

## 7. Text
Extract the **content written next to the label "Text:"** as digitally annotated in the document.

- The annotation may appear in **orange or black font**.

---

## 8. Document Header Text

Use the following priority order:

**Priority 1:**  
If **"HT:"** is digitally annotated (orange or black font) and the value **starts with LNG1**, use this value as the header text.

**Priority 2:**  
If **"HT:"** is present but the value **does not start with LNG1**, capture the value and continue checking.

**Priority 3 (Fallback):**  
If neither condition yields a valid **LNG1** value, use the value from the **Text** field.

---

## 9. Assignment
Same as **Reference (invoice number)**.

---

## 10. Baseline Payment Date
Same as **Document Date**.

---

## 11. CBS
Extract the **CBS number in the format X.X.X.X (e.g., 1.1.4.1)**.

Identify the CBS value using one of the following indicators:

- A **digital tick or annotation** placed next to the number.
- An **explicit label "CBS"** near the number.
- The number appearing near the **Payment Certificate section** of the document.

If **no CBS value** is present in the document, leave this field **blank**.

---

## 12. Internal Order
Fixed value: **null**
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
https://drive.google.com/file/d/1NWAdrXKjOZvvZfC8njIQsQhhQKLjaRw9/view?usp=sharing


def consolidated_data_prompt(Extracteddata):

    return f"""
You are a document consolidation system.

Data has been extracted from multiple pages of the same invoice.

Your task is to consolidate all extracted values into one final JSON.

Follow these rules strictly.

CONSOLIDATION RULES

1. Business Rules First
Always follow the invoice extraction business rules below.

Fixed values:
companyCode = 8439
internalOrder = null

Derived fields:
assignment = reference
baselinePaymentDate = documentDate

2. Multi-Page Comparison

Multiple pages may contain values for the same field.

Compare all page results and select the most accurate value.

3. Page Priority

Invoices often contain intermediate values on earlier pages.

For financial totals:

amountInDocument
documentCurrency

Prefer values appearing on the LAST page,
especially near labels such as:

TOTAL
GRAND TOTAL
TOTAL AMOUNT THIS INVOICE

Earlier totals may be subtotals.

4. Identifier Fields

For identifier fields:

reference
supplier
cbsNumber

Prefer values that:
• appear consistently across pages
• appear near relevant labels

5. CBS Handling

CBS codes are hierarchical identifiers such as:

1.1.2
1.2.3
1.2.3.4
1.2.3.4R

Never truncate the CBS value.

6. Confidence Score

Confidence should only be used when document structure
and page order cannot determine the correct value.

Do not allow confidence to override business rules.

7. Null Handling

Ignore null values unless all pages contain null.

If all pages contain null, return null.

OUTPUT FORMAT

Return JSON in this format:

{OUTPUT_JSON_SCHEMA}

Provide for each field:
value
reason
confidence

Extracted Page Data:
{Extracteddata}

Return ONLY valid JSON.
"""


11. CBS

Extract the CBS code exactly as written.

CBS codes follow hierarchical numbering separated by periods.

Valid examples include:
1.1.2
1.2.3
1.2.3.4
1.2.3.4R

Rules:
• Do NOT truncate segments
• Preserve suffix characters such as "R"
• Extract the full sequence exactly as written

Priority:
1. Value labeled "CBS"
2. Value marked with annotation tick
3. Value near the Payment Certificate section

If no CBS value exists return null.

Hierarchical identifiers such as CBS must be preserved exactly as written.
Never truncate segments or remove suffix characters.

Annotation labels such as "Text", "TEXT", "HT", or "HT:" must never be returned as extracted values.

2. Supplier

Extract the supplier vendor code using the following strict priority rules.

Priority 1 — Right Corner / Top Corner Check

First inspect the top-right corner or upper-right area of the page.

If a number appears in this area with the following properties:

• The value contains exactly 6 digits
• The value contains only digits (no letters or symbols)
• The value appears in orange, red, or black font

Then extract this value as the supplier vendor code.

Example valid values:
100269
200769

Important restrictions:
• The value must be exactly 6 digits
• Do NOT extract numbers that contain letters
• Do NOT extract numbers longer than 6 digits
• Do NOT extract numbers shorter than 6 digits

Exclude the following types of numbers:
GST numbers
tax numbers
phone numbers
invoice numbers
postal codes

If multiple numbers appear in the corner, choose the value that matches exactly six digits only.

Priority 2 — Labeled Vendor Code

If no valid 6-digit number is found in the right or top corner area:

Search the document for a vendor code explicitly labeled with terms such as:

Vendor
Vendor Code
Supplier
Supplier Code

If a labeled value contains exactly 6 digits, extract that value.

Priority 3 — No Valid Vendor Code

If no valid 6-digit vendor code is found in either location, return null.

Important Rules:

• Extract only numeric values with exactly 6 digits.
• Do not extract GST numbers or tax identifiers.
• Do not infer vendor codes from other numbers.
• Do not extract partial numbers.



2. Supplier

Extract the supplier vendor code using the following priority.

Priority 1 (Highest):
Check the top-right corner or upper-right area of the page.
If a number appears in this area with exactly 6 digits (digits only) and is shown in orange, red, or black font, extract it as the supplier vendor code.

Example: 100269

This rule has higher priority even if another vendor code appears elsewhere in the document.

Priority 2:
If no valid 6-digit number is found in the top-right or upper area, search for a labeled vendor code such as:

Vendor
Vendor Code
Supplier

If the labeled value contains exactly 6 digits, extract it.

Rules:
• The value must contain exactly 6 digits only.
• Ignore GST numbers, phone numbers, or other identifiers.
• If no valid 6-digit vendor code is found, return null.


6. Document Date

Extract the invoice date marked with the orange tick annotation.  
The invoice date is typically located near the "Invoice No." or in the invoice header section.

The date may appear in formats such as:
November 30, 2025
30 Nov 2025
2025-11-30
30/11/2025

Rules:
• Extract the exact date shown next to the orange tick annotation.
• Prefer the date located near "Invoice No." or in the invoice header.
• Do NOT guess or infer dates.
• Convert the extracted date to format DD/MM/YYYY.

Examples:
November 30, 2025 → 30/11/2025
2025-11-30 → 30/11/2025

If no valid date is found, return null.



import boto3
import json

s3 = boto3.client("s3")
lambda_client = boto3.client("lambda")

PROCESS_LAMBDA_ARN = "arn:aws:lambda:ap-south-1:123456789012:function:processInvoice"

def lambda_handler(event, context):

    bucket = event["bucket"]
    prefix = event["prefix"]

    response = s3.list_objects_v2(
        Bucket=bucket,
        Prefix=prefix
    )

    files = response.get("Contents", [])[:5]

    for obj in files:
        key = obj["Key"]

        payload = {
            "bucket": bucket,
            "object_key": key
        }

        lambda_client.invoke(
            FunctionName=PROCESS_LAMBDA_ARN,
            InvocationType="Event",  # async invocation
            Payload=json.dumps(payload)
        )

        print(f"Invoked processing lambda for {key}")

    return {
        "status": "success",
        "files_invoked": len(files)
    }
    def lambda_handler(event, context):

    bucket = event["bucket"]
    key = event["object_key"]

    print("Processing file:", key)

    # Example: read file from S3
    import boto3
    s3 = boto3.client("s3")

    response = s3.get_object(Bucket=bucket, Key=key)
    data = response["Body"].read()

    print("File size:", len(data))


    // mandarin
    INSTRUCTION_RULES = """
================================================
INVOICE EXTRACTION BUSINESS RULES
================================================

1. Company Code
Source: Barcode.
Extract the first 4 digits of the barcode value.

Barcode Structure:
[CompanyCode(4)][Location(2)][Function(2)][DocType(2)][Year(2)][RunningNumber(n)]

Example:
2309NWAPTA25101835 → 2309

------------------------------------------------

2. Vendor Code
Source: Purchase Order.
Extract the vendor code as a numeric value.

------------------------------------------------

3. Reference
Source: Invoice number field.
Extract only the last 8 digits of the invoice number.

Example:
25362000000085009056 → 85009056

------------------------------------------------

4. Amount
Source: Total amount including tax.
Extract the total amount including tax.

------------------------------------------------

5. Currency
Apply the following priority rules:

Priority 1:
If the currency symbol is explicitly stated → use that currency.

Priority 2:
If ¥ or RMB symbol is present → return RMB.

Priority 3:
If $ symbol is present → return USD.

Priority 4 (Default):
If no symbol is present AND the invoice language is Chinese → return RMB.

Output format:
Return currency code (e.g., RMB, USD).

------------------------------------------------

6. Document Date
Source: Invoice date field.
Format: DD-MM-YYYY

------------------------------------------------

7. Tax Code
Source: Tax rate field.

Extract the percentage value (e.g., 13%).

Then map it using the SAP ASP PRD lookup table to get the corresponding tax code.

Note:
Ensure the tax code is in 3-digit padded format (e.g., 040, not 40).

------------------------------------------------

8. Tax Amount
Source: Total tax amount from the "合计" section under the "税额" column.
Extract the total tax value.

------------------------------------------------

9. PO Number
🔍 Lookup Required

PO numbers are 10-digit numeric sequences.

Extraction steps:

Step 1 — Invoice Remarks:
Check the remarks section at the bottom of the invoice for a 10-digit number.

Step 2 — Additional Pages / Attachments:
Look for headers such as:
- "PO:"
- "Purchase Order"

Step 3 — Handwritten Annotations:
Check margins, blank spaces, stamps (especially bottom-right corner).

Look for labels:
- "po."
- "PO:"
- "Po;"
- "po:" (case-insensitive)

Extract the 10-digit number immediately following the label.

Important:
If multiple PO numbers are found, process each PO as a separate entry.

------------------------------------------------

10. Assignment
Same as PO Number.

------------------------------------------------

11. Text
Source: Purchase Order description.

Format:
POnumber - line item value

Example:
4500123456 - 00010

------------------------------------------------

12. Document Header Text
Source: Purchase Order description.

Format:
POnumber - line item

Example:
4500123456 - 00010

------------------------------------------------

13. Baseline Payment Date

If Company Code = '2318':
→ Use posting date (current processing date).

Otherwise:
→ Use Document Date.

Format:
DD/MM/YYYY (e.g., 31/08/2025)

------------------------------------------------

14. Business Area
To be confirmed with client.
Return null if not available.

------------------------------------------------
"""

