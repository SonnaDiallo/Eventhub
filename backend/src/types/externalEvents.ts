// Types pour les événements externes

export type UnifiedEvent = {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  venueName?: string;
  coverImage?: string;
  isFree?: boolean;
  price?: number;
  source: 'eventbrite' | 'ticketmaster' | 'seatgeek';
};

// Types Eventbrite
export type EventbriteEvent = {
  id: string;
  name: {
    text: string;
    html: string;
  };
  description?: {
    text: string;
    html: string;
  };
  start: {
    timezone: string;
    local: string;
    utc: string;
  };
  end?: {
    timezone: string;
    local: string;
    utc: string;
  };
  logo?: {
    url: string;
    original?: {
      url: string;
    };
  };
  venue?: {
    name: string;
    address?: {
      address_1?: string;
      address_2?: string;
      city?: string;
      region?: string;
      postal_code?: string;
      country?: string;
      localized_area_display?: string;
    };
  };
  online_event?: boolean;
  is_free?: boolean;
  ticket_availability?: {
    has_available_tickets: boolean;
    minimum_ticket_price?: {
      value: number;
      currency: string;
      display: string;
    };
    maximum_ticket_price?: {
      value: number;
      currency: string;
      display: string;
    };
  };
  category_id?: string;
};

export type EventbriteResponse = {
  events: EventbriteEvent[];
  pagination?: {
    object_count: number;
    page_number: number;
    page_size: number;
    page_count: number;
    has_more_items: boolean;
  };
};
