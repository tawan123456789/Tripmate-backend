import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}


const reviewExamples = {
      example1: {
        summary: 'Example Review for Hotel',
        description: 'A sample review for a hotel service',
        value: {
          userId: 'user123',
          placeId: null,
          comment: 'Great stay!',
          score1: 5,
          score2: 4,
          score3: 5,
          score4: 4,
          score5: 5,
          serviceId: 'service123',
          status: 'hotel'
        }
      },
      example2: {
        summary: 'Example Review for Car Rental',
        description: 'A sample review for a car rental service',
        value: {
          userId: 'user456',
          placeId: null,
          comment: 'Smooth ride!',
          score1: 5,
          score2: 4,
          score3: 5,
          score4: 4,
          score5: 5,
          serviceId: 'service456',
          status: 'car'
        }
      },
      example3: {
        summary: 'Example Review for Guide Service',
        description: 'A sample review for a guide service',
        value: {
          userId: 'user789',
          placeId: null,
          comment: 'Informative tour!',
          score1: 5,
          score2: 4,
          score3: 5,
          score4: 4,
          score5: 5,
          serviceId: 'service789',
          status: 'guide'
        }
      },
      example4: {
        summary: 'Example Review for Place',
        description: 'A sample review for a place',
        value: {
          userId: 'user321',
          placeId: 'place123',
          comment: 'Beautiful scenery!',
          score1: 5,
          status: 'place'
        }
      }
    };

export { reviewExamples };