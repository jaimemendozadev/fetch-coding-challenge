import { Dispatch, SetStateAction } from 'react';
import { StoreShape } from '@/utils/store';
import { HTTP_METHODS } from './ts';

export const BASE_URL = 'https://frontend-take-home-service.fetch.com';
export const AUTH_URL = `${BASE_URL}/auth/login`;
export const UNAUTHORIZED_ERROR_MESSAGE = '"Unauthorized" is not valid JSON';

// See Dev Note #1
export const validateEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

export const reauthenticateUser = async (
  updateStore: Dispatch<SetStateAction<StoreShape>>
): Promise<{ reauthStatus: number }> => {
  try {
    let storedUser: string | null = null;

    if (typeof window !== 'undefined') {
      storedUser = localStorage.getItem('user');
    }
    if (!storedUser) {
      console.warn('No user stored in localStorage. Cannot reauthenticate.');
      return { reauthStatus: 400 };
    }

    const { firstName, lastName, email } = JSON.parse(storedUser);
    const name = `${firstName} ${lastName}`;

    const res = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email })
    }).then((res) => res);

    if (!res || res.status !== 200) {
      console.error('Reauthentication failed.');
      return { reauthStatus: 400 };
    }

    const updatedUser = {
      firstName,
      lastName,
      email,
      refreshTimer: Date.now()
    };

    if (typeof window !== 'undefined') {
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    // Update React Context
    updateStore((prevStore) => ({
      ...prevStore,
      ...{ user: updatedUser }
    }));

    console.log('User successfully reauthenticated and store updated.');

    return { reauthStatus: 200 };
  } catch (error) {
    console.error('Error during reauthentication:', error);
  }

  return { reauthStatus: 400 };
};

interface RequestPayload {
  apiURL: string;
  method: HTTP_METHODS;
  bodyPayload: { [key: string]: any };
}

// 2-5-25 TODO: Left off here, still need to make sure makeBackEndRequest & reauthenticateUser work.

export const makeBackEndRequest = async <T>(
  requestPayload: RequestPayload,
  parseResult: boolean = true,
  updateStore: Dispatch<SetStateAction<StoreShape>> | undefined = undefined
): Promise<T | void> => {
  const { apiURL, method, bodyPayload } = requestPayload;

  try {
    if (method === 'GET') {
      const result = await fetch(apiURL, {
        method,
        credentials: 'include'
      }).then((res) => (parseResult ? res.json() : res));
      return result;
    }

    const result = await fetch(apiURL, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(bodyPayload)
    }).then((res) => (parseResult ? res.json() : res));

    return result;
  } catch (error) {
    // TODO: Handle in telemetry
    console.log(
      `There was an error making a Backend API request to ${apiURL}: `,
      error
    );
    console.log('\n');

    if (
      error instanceof Error &&
      error.message.includes(UNAUTHORIZED_ERROR_MESSAGE) &&
      updateStore 
    ) {
      console.log('Error message: ', error.message);
      console.log('\n');

      const reauthRes = await reauthenticateUser(updateStore);

      if (reauthRes.reauthStatus === 200) {
        const updatedReqPayload = { apiURL, method, bodyPayload };
        return makeBackEndRequest(updatedReqPayload, parseResult, updateStore);
      }
    }
  }

  return undefined;
};

export const DOG_BREEDS = [
  'Affenpinscher',
  'Afghan Hound',
  'African Hunting Dog',
  'Airedale',
  'American Staffordshire Terrier',
  'Appenzeller',
  'Australian Terrier',
  'Basenji',
  'Basset',
  'Beagle',
  'Bedlington Terrier',
  'Bernese Mountain Dog',
  'Black-and-tan Coonhound',
  'Blenheim Spaniel',
  'Bloodhound',
  'Bluetick',
  'Border Collie',
  'Border Terrier',
  'Borzoi',
  'Boston Bull',
  'Bouvier Des Flandres',
  'Boxer',
  'Brabancon Griffon',
  'Briard',
  'Brittany Spaniel',
  'Bull Mastiff',
  'Cairn',
  'Cardigan',
  'Chesapeake Bay Retriever',
  'Chihuahua',
  'Chow',
  'Clumber',
  'Cocker Spaniel',
  'Collie',
  'Curly-coated Retriever',
  'Dandie Dinmont',
  'Dhole',
  'Dingo',
  'Doberman',
  'English Foxhound',
  'English Setter',
  'English Springer',
  'EntleBucher',
  'Eskimo Dog',
  'Flat-coated Retriever',
  'French Bulldog',
  'German Shepherd',
  'German Short-haired Pointer',
  'Giant Schnauzer',
  'Golden Retriever',
  'Gordon Setter',
  'Great Dane',
  'Great Pyrenees',
  'Greater Swiss Mountain Dog',
  'Groenendael',
  'Ibizan Hound',
  'Irish Setter',
  'Irish Terrier',
  'Irish Water Spaniel',
  'Irish Wolfhound',
  'Italian Greyhound',
  'Japanese Spaniel',
  'Keeshond',
  'Kelpie',
  'Kerry Blue Terrier',
  'Komondor',
  'Kuvasz',
  'Labrador Retriever',
  'Lakeland Terrier',
  'Leonberg',
  'Lhasa',
  'Malamute',
  'Malinois',
  'Maltese Dog',
  'Mexican Hairless',
  'Miniature Pinscher',
  'Miniature Poodle',
  'Miniature Schnauzer',
  'Newfoundland',
  'Norfolk Terrier',
  'Norwegian Elkhound',
  'Norwich Terrier',
  'Old English Sheepdog',
  'Otterhound',
  'Papillon',
  'Pekinese',
  'Pembroke',
  'Pomeranian',
  'Pug',
  'Redbone',
  'Rhodesian Ridgeback',
  'Rottweiler',
  'Saint Bernard',
  'Saluki',
  'Samoyed',
  'Schipperke',
  'Scotch Terrier',
  'Scottish Deerhound',
  'Sealyham Terrier',
  'Shetland Sheepdog',
  'Shih-Tzu',
  'Siberian Husky',
  'Silky Terrier',
  'Soft-coated Wheaten Terrier',
  'Staffordshire Bullterrier',
  'Standard Poodle',
  'Standard Schnauzer',
  'Sussex Spaniel',
  'Tibetan Mastiff',
  'Tibetan Terrier',
  'Toy Poodle',
  'Toy Terrier',
  'Vizsla',
  'Walker Hound',
  'Weimaraner',
  'Welsh Springer Spaniel',
  'West Highland White Terrier',
  'Whippet',
  'Wire-haired Fox Terrier',
  'Yorkshire Terrier'
];

/******************************************** 
   * Notes
   ******************************************** 
   
   1) Source of validateEmail Function:
      https://search.brave.com/search?q=javascript+regex+to+validate+an+email&source=desktop&conversation=e4edc873f6330f8b9a6aaf&summary=1



  */
