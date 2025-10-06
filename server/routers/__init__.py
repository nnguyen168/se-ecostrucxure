# Generic router module for the Databricks app template
# Add your FastAPI routes here

from fastapi import APIRouter

from .user import router as user_router
from .turbine import router as turbine_router
from .genie import router as genie_router

router = APIRouter()
router.include_router(user_router, prefix='/user', tags=['user'])
router.include_router(turbine_router, prefix='/turbine', tags=['turbine'])
router.include_router(genie_router, prefix='/genie', tags=['genie'])
