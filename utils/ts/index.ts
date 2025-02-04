import { ChangeEvent, SyntheticEvent } from 'react';

export type HTTP_METHODS = 'POST' | 'PUT' | 'DELETE' | 'GET' | 'PATCH';

export type InputEvent = ChangeEvent<HTMLInputElement>;

export type SubmitEvent = SyntheticEvent;

export interface UserShape {
  email: string;
  firstName: string;
  lastName: string;
  refreshTimer: number;
}
