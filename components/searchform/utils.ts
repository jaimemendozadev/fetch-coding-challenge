/*
export interface SearchShape {
  ageMin: string;
  ageMax: string;
  zipCodes: string;
  breeds: SharedSelection;
  sort: SharedSelection;
  size: number;
}




*/

import { SearchShape } from '@/utils/ts';

export const getZipCodesFromString = (
  zipCodeString: string
): RegExpMatchArray | null => {
  return zipCodeString.match(/\b\d{5}\b/g);
};

export const getFrontendSearchURL = ({
  ageMin,
  ageMax,
  zipCodes,
  size
}: SearchShape): string => {
  let frontendURL = `/search?&size=${size}`;

  if (ageMin.length > 0) {
    frontendURL = `${frontendURL}&ageMin=${ageMin}`;
  }

  if (ageMax.length > 0) {
    frontendURL = `${frontendURL}&ageMax=${ageMax}`;
  }

  let convertedCodes: number[] = [];

  const parsedZipCodes = zipCodes.match(/\b\d{5}\b/g);

  // if (parsedZipCodes === null && zipCodes.length > 0) {
  //   toast.error('Please enter valid 5 digit zip codes.');
  //   return;
  // }

  if (parsedZipCodes !== null) {
    convertedCodes = parsedZipCodes
      .map((codeString) => Number.parseInt(codeString, 10))
      .filter((num) => !Number.isNaN(num));

    if (convertedCodes.length !== parsedZipCodes.length) {
      toast.error('Please enter valid 5 digit zip codes.');
      return;
    }
  }

  const dogBreeds = Array.from(selectedBreeds);

  if (dogBreeds.length) {
    frontendURL = `${frontendURL}&breeds=${dogBreeds}`;
  }

  const sortOrder = Array.from(selectedSortLabel).join('').trim();

  console.log('sortOrder in handleSubmit ', sortOrder);
  console.log('\n');

  console.log('Array.isArray() in handleSubmit ', Array.isArray(sortOrder));
  console.log('\n');

  if (sortOrder.length) {
    const finalLabel =
      sortOrder === DEFAULT_SORT_LABEL ? DEFAULT_SORT : sortOrder;

    console.log('finalLabel ', finalLabel);
    console.log('\n');

    frontendURL = `${frontendURL}&sort=breed:${finalLabel}`;
  } else {
    frontendURL = `${frontendURL}&sort=breed:${DEFAULT_SORT}`;
  }

  console.log('FINALIZED frontendURL ', frontendURL);
  console.log('\n');

  const searchUpdate = {
    ageMin,
    ageMax,
    zipCodes,
    breeds: selectedBreeds,
    sort: selectedSortKeys,
    size
  };
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
