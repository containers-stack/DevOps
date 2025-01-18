# import libraries
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import AnalyzeResult

# set `<your-endpoint>` and `<your-key>` variables with the values from the Azure portal
endpoint = "YOUR_ENDPOINT"
key = "YOUR_KEY"

# initialize FastAPI app
app = FastAPI()

# add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# helper functions

def get_words(page, line):
    result = []
    for word in page.words:
        if _in_span(word, line.spans):
            result.append(word)
    return result


def _in_span(word, spans):
    for span in spans:
        if word.span.offset >= span.offset and (
            word.span.offset + word.span.length
        ) <= (span.offset + span.length):
            return True
    return False

@app.get("/hc")
async def health_check():
    return {"status": "ok"}

@app.post("/analyze-layout/")
async def analyze_layout(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}")
    document_intelligence_client = DocumentIntelligenceClient(
        endpoint=endpoint, credential=AzureKeyCredential(key)
    )

    with open(file.filename, "wb") as f:
        f.write(await file.read())

    with open(file.filename, "rb") as f:
        poller = document_intelligence_client.begin_analyze_document(
            "prebuilt-layout",
            f,
            content_type="application/pdf",
            locale="he-IL",
            polling_interval=5,
        )

    result: AnalyzeResult = poller.result()

    response = {
        "handwritten_content": any([style.is_handwritten for style in result.styles]) if result.styles else False,
        "pages": [],
        "tables": []
    }

    for page in result.pages:
        page_info = {
            "page_number": page.page_number,
            "width": page.width,
            "height": page.height,
            "unit": page.unit,
            "lines": [],
            "selection_marks": []
        }

        if page.lines:
            for line_idx, line in enumerate(page.lines):
                words = get_words(page, line)
                line_info = {
                    "line_index": line_idx,
                    "word_count": len(words),
                    "text": line.content,
                    "bounding_polygon": line.polygon,
                    "words": [{"content": word.content, "confidence": word.confidence} for word in words]
                }
                page_info["lines"].append(line_info)

        if page.selection_marks:
            for selection_mark in page.selection_marks:
                selection_mark_info = {
                    "state": selection_mark.state,
                    "bounding_polygon": selection_mark.polygon,
                    "confidence": selection_mark.confidence
                }
                page_info["selection_marks"].append(selection_mark_info)

        response["pages"].append(page_info)

    if result.tables:
        for table_idx, table in enumerate(result.tables):
            table_info = {
                "table_index": table_idx,
                "row_count": table.row_count,
                "column_count": table.column_count,
                "bounding_regions": [{"page_number": region.page_number, "polygon": region.polygon} for region in table.bounding_regions] if table.bounding_regions else [],
                "cells": [{"row_index": cell.row_index, "column_index": cell.column_index, "content": cell.content, "bounding_regions": [{"page_number": region.page_number, "polygon": region.polygon} for region in cell.bounding_regions] if cell.bounding_regions else []} for cell in table.cells]
            }
            response["tables"].append(table_info)

    return JSONResponse(content=response)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

