from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

logger = logging.getLogger(__name__)


class CustomHTTPException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str = None):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code


class ValidationException(CustomHTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=422, detail=detail, error_code="VALIDATION_ERROR")


class NotFoundException(CustomHTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail, error_code="NOT_FOUND")


class UnauthorizedException(CustomHTTPException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=401, detail=detail, error_code="UNAUTHORIZED")


class ForbiddenException(CustomHTTPException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=403, detail=detail, error_code="FORBIDDEN")


class ConflictException(CustomHTTPException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=409, detail=detail, error_code="CONFLICT")


class BadRequestException(CustomHTTPException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=400, detail=detail, error_code="BAD_REQUEST")


class InternalServerException(CustomHTTPException):
    def __init__(self, detail: str = "Internal server error"):
        super().__init__(status_code=500, detail=detail, error_code="INTERNAL_SERVER_ERROR")


async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": getattr(exc, 'error_code', 'HTTP_ERROR'),
                "message": exc.detail,
                "status_code": exc.status_code
            }
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation exceptions"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validation failed",
                "details": errors
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred"
            }
        }
    )


def setup_exception_handlers(app: FastAPI):
    """Setup exception handlers for the FastAPI app"""
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
