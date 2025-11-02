// src/booking/dto/create-booking.dto.ts
import {
  IsString,
  IsOptional,
  IsDate,
  ValidateIf,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';

/** ใช้ตรวจว่า endBookingDate ≥ startBookingDate เมื่อมีการส่ง end เข้ามา */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Transaction } from '@prisma/client';
type TransactionMethod = Transaction['method'];

function IsAfter(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value == null) return true; // ไม่ส่งมาก็ผ่าน
          const [relatedPropName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropName];
          if (!relatedValue) return true; // ถ้าไม่มี start ก็ไม่เช็ค
          const end = new Date(value).getTime();
          const start = new Date(relatedValue).getTime();
          if (Number.isNaN(end) || Number.isNaN(start)) return false;
          return end >= start;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropName] = args.constraints;
          return `${args.property} must be the same as or after ${relatedPropName}`;
        },
      },
    });
  };
}

export class CreateBookingDto {
  // หมายเหตุ: ถ้า id ให้ DB/Prisma gen เอง ให้เอาออกหรือทำ @IsOptional()
  @IsOptional()
  @IsString()
  id?: string;

  // หากใช้ UUID จริง ให้เปลี่ยนเป็น @IsUUID()
  @IsString()
  serviceId!: string;

  @IsOptional()
  @IsString()
  subServiceId?: string;

  @IsOptional()
  @IsString()
  optionId?: string;

  @IsString()
  groupId!: string;

  @Type(() => Date)
  @IsDate()
  startBookingDate!: Date;

  @ValidateIf((o) => o.endBookingDate !== undefined && o.endBookingDate !== null)
  @Type(() => Date)
  @IsDate()
  @IsAfter('startBookingDate', { message: 'endBookingDate must be >= startBookingDate' })
  endBookingDate!: Date;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  paymentMethod!: TransactionMethod;

  @IsOptional()
  @IsString()
  discountId?: string;
  
  // ถ้ามี enum เช่น 'pending' | 'confirmed' | 'cancelled' ค่อยเปลี่ยนเป็น @IsIn([...])
}
