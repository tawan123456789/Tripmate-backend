import { Controller, Get, Query, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search_query.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('hotels')
  searchHotels(@Query() q: SearchQueryDto,@Req() req: any) {
    return this.searchService.searchHotels(q,req);
  }

  @Get('restaurants')
  searchRestaurants(@Query() q: SearchQueryDto,@Req() req: any) {
    return this.searchService.searchRestaurants(q,req);
  }

  @Get('attractions')
  searchAttractions(@Query() q: SearchQueryDto,@Req() req: any) {
    return this.searchService.searchAttractions(q,req);
  }

  @Get('rentals')
  searchRentals(@Query() q: SearchQueryDto,@Req() req: any) {
    return this.searchService.searchRentals(q,req);
  }

  @Get('guides')
  searchGuides(@Query() q: SearchQueryDto,@Req() req: any) {
    return this.searchService.searchGuides(q,req);
  }
}