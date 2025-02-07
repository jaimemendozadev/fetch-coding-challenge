import { ChangeEvent, SyntheticEvent } from 'react';
import { SharedSelection } from '@heroui/react';

export type HTTP_METHODS = 'POST' | 'PUT' | 'DELETE' | 'GET' | 'PATCH';

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
  bodyPayload?: { [key: string]: any };
}

export interface SearchShape {
  ageMin: string;
  ageMax: string;
  zipCodes: string;
  breeds: SharedSelection;
}
