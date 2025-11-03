import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    console.log('DTO in controller:', createBookingDto);
    return this.bookingService.makeBooking(createBookingDto);
  }

  @Patch('cancel/:id')
  cancel(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }

  @Patch('confirm/:id')
  confirm(@Param('id') id: string) {
    return this.bookingService.ConfirmBooking(id);
  }

  @Get('getByService/:id')
  getBookingByService(@Param('id') id:string){
    return this.bookingService.getBookingByService(id);
  }

  @Get('/:id')
  getBookingbyId(@Param('id') bid: string){
    return this.bookingService.findOne(bid);
  }

  // @Get()
  // getAll(){
  //   return this.bookingService.findAll();
  // }


  


  // @Post()
  // create(@Body() createBookingDto: CreateBookingDto) {
  //   return this.bookingService.create(createBookingDto);
  // }

  // @Get()
  // findAll() {
  //   return this.bookingService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.bookingService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
  //   return this.bookingService.update(+id, updateBookingDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.bookingService.remove(+id);
  // }

}
