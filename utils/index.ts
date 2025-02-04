import { ChangeEvent, SyntheticEvent } from 'react';

export type HTTP_METHODS = 'POST' | 'PUT' | 'DELETE' | 'GET' | 'PATCH';

export const BASE_URL = 'https://frontend-take-home-service.fetch.com';

export type InputEvent = ChangeEvent<HTMLInputElement>;

export type SubmitEvent = SyntheticEvent;

// See Dev Note #1
export const validateEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

export const makeBackEndRequest = async <T>(
  apiURL: string,
  method: HTTP_METHODS,
  bodyPayload: { [key: string]: any } = {},
  parseResult: boolean = true
): Promise<T | void> => {
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
