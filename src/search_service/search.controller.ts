import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search_query.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('hotels')
  searchHotels(@Query() q: SearchQueryDto) {
    return this.searchService.searchHotels(q);
  }

  @Get('restaurants')
  searchRestaurants(@Query() q: SearchQueryDto) {
    return this.searchService.searchRestaurants(q);
  }

  @Get('attractions')
  searchAttractions(@Query() q: SearchQueryDto) {
    return this.searchService.searchAttractions(q);
  }

  @Get('rentals')
  searchRentals(@Query() q: SearchQueryDto) {
    return this.searchService.searchRentals(q);
  }

  @Get('guides')
  searchGuides(@Query() q: SearchQueryDto) {
    return this.searchService.searchGuides(q);
  }
}