from ninja import Router

from .token import router as token_router

router = Router()

router.add_router("/tokens", token_router, tags=["tokens"])
