import { PartialType } from '@nestjs/mapped-types';
import { CreateCarRentalCenterDto } from './create-car_rental_center.dto';

export class UpdateCarRentalCenterDto extends PartialType(CreateCarRentalCenterDto) {}
