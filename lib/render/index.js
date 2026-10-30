import { renderDestination } from './destination.js';
import { renderTour } from './tour.js';
import { renderHotel } from './hotel.js';
import { renderTransport } from './transport.js';
import { renderPost } from './post.js';

// One renderer per content type. Each returns the inner markup of <main>.
export const renderers = {
  destination: renderDestination,
  tour: renderTour,
  hotel: renderHotel,
  transport: renderTransport,
  post: renderPost,
};
