import { PartialType } from '@nestjs/mapped-types';
import { CreateUserJoinGroupDto } from './create-user_join_group.dto';

export class UpdateUserJoinGroupDto extends PartialType(CreateUserJoinGroupDto) {}
