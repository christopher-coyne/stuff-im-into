import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { StandardResponse } from './standard-response.dto';

// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
type Constructor = new (...args: unknown[]) => Object;

// Decorator that applies swagger docs for standard responses
export function ApiStandardResponse(dataType: Constructor, status = 200) {
  return applyDecorators(
    ApiExtraModels(StandardResponse, dataType),
    ApiResponse({
      status,
      description: 'Successful response',
      schema: {
        properties: {
          status: { type: 'number', example: status },
          data: { $ref: getSchemaPath(dataType) },
        },
      },
    }),
  );
}

// For array responses
export function ApiStandardArrayResponse(dataType: Constructor, status = 200) {
  return applyDecorators(
    ApiExtraModels(StandardResponse, dataType),
    ApiResponse({
      status,
      description: 'Successful response',
      schema: {
        properties: {
          status: { type: 'number', example: status },
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(dataType) },
          },
        },
      },
    }),
  );
}
