import { ChangeEvent, SyntheticEvent } from 'react';
import { SharedSelection } from '@heroui/react';

export type InputEvent = ChangeEvent<HTMLInputElement>;

export type SubmitEvent = SyntheticEvent;

export interface UserShape {
  email: string;
  firstName: string;
  lastName: string;
  refreshTimer: number;
}
export interface RequestPayload {
  apiURL: string;
  method: HTTP_METHODS;
  bodyPayload?: any;
}

export interface SearchDogsResponse {
  next?: string;
  resultIds?: string[];
  total?: number;
}

export interface SearchShape {
  ageMin: string;
  ageMax: string;
  zipCodes: string;
  breeds: SharedSelection;
  sort: SharedSelection;
  size: number;
}

export interface PaginationShape {
  from: number;
  page: number;
  total_pages: number;
  total: number;
}

export interface DogDetails {
  age?: number;
  breed?: string;
  id: string;
  img?: string;
  name?: string;
  zip_code?: string;
}

export type HTTP_METHODS = 'POST' | 'PUT' | 'DELETE' | 'GET' | 'PATCH';
