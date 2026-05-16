import json
import os
from fastapi import APIRouter, HTTPException, Query
from pathlib import Path

router = APIRouter()

# Base path for the knowledge base files
KB_PATH = Path(__file__).parent.parent / "knowledge_base"

@router.get("/health")
async def health_check():
    return {"status": "ok", "module": "dictionary"}

@router.get("/terms")
async def get_terms(career: str = Query(..., description="The career ID to fetch terms for")):
    """
    Fetch all technical terms and categories for a specific career from the knowledge base.
    Includes validation of the knowledge base structure.
    """
    file_path = KB_PATH / f"{career}.json"
    
    if not file_path.exists():
        raise HTTPException(
            status_code=404, 
            detail=f"Base de conocimiento para '{career}' no encontrada."
        )
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Basic validation of the structure
        terms = data.get("terms", [])
        categories = data.get("categories", {})
        label = data.get("label", career.replace("_", " ").title())

        # Ensure every term has the minimum required fields to avoid frontend crashes
        validated_terms = []
        for term in terms:
            validated_terms.append({
                "id": term.get("id", "unknown"),
                "term": term.get("term", "No term"),
                "full_form": term.get("full_form"),
                "definition_en": term.get("definition_en", "No English definition provided."),
                "definition_es": term.get("definition_es", "No se proporcionó definición en español."),
                "category": term.get("category", "general"),
                "difficulty": term.get("difficulty", "beginner"),
                "related_terms": term.get("related_terms", []),
                "examples": term.get("examples", []),
                "tags": term.get("tags", [])
            })
            
        return {
            "terms": validated_terms,
            "categories": categories,
            "label": label,
            "domain": data.get("domain", career)
        }
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail=f"Error de formato en el archivo de la base de conocimiento: {career}.json"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error inesperado al leer la base de conocimiento: {str(e)}"
        )
