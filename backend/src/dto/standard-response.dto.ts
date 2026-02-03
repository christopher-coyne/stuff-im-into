import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class StandardResponse<T> {
  @Expose()
  @ApiProperty({ example: 200 })
  status: number;

  @Expose()
  @ApiProperty()
  data: T;

  constructor(status: number, data: T) {
    this.status = status;
    this.data = data;
  }

  static ok<T>(data: T): StandardResponse<T> {
    return new StandardResponse(200, data);
  }

  static created<T>(data: T): StandardResponse<T> {
    return new StandardResponse(201, data);
  }
}
