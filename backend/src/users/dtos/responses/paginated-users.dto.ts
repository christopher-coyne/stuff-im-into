import { PaginatedResponseDto } from '../../../dto';
import { UserResponseDto } from './user-response.dto';

export class PaginatedUsersDto extends PaginatedResponseDto(UserResponseDto) {}
