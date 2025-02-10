'use client';
import { useState, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Image, Button } from '@heroui/react';

import toast from 'react-hot-toast';
import { StoreContext } from '@/utils/store';
import { BASE_URL, validateEmail, makeBackEndRequest } from '@/utils';

import { HTTP_METHODS, InputEvent, SubmitEvent } from '@/utils/ts';
interface FormState {
  firstName: string;
  lastName: string;
  email: string;
}

const toastConfig = { duration: 3000 };
const defaultFirstName = 'Your First Name';
const defaultLastName = 'Your Last Name';
const defaultEmail = 'Your Email';

const defaultState = {
  firstName: defaultFirstName,
  lastName: defaultLastName,
  email: defaultEmail
};

const landingImageURL =
  'https://frontend-take-home.fetch.com/dog-images/n02085620-Chihuahua/n02085620_3006.jpg';

export default function LandingPage(): ReactNode {
  const router = useRouter();
  const { store, updateStore } = useContext(StoreContext);
  const [formState, setFormState] = useState<FormState>(defaultState);

  const handleChange = (evt: InputEvent) => {
    const { id } = evt.target;

    const update = { [id]: evt.target.value };

    setFormState((prev) => ({ ...prev, ...update }));
  };

  const handleFocus = ({ target }: InputEvent) => {
    const { id, value } = target;

    if (id in formState && Object.values(defaultState).includes(value)) {
      setFormState((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleBlur = ({ target }: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = target;

    if (id in formState && value.trim().length === 0) {
      setFormState((prev) => ({
        ...prev,
        [id as keyof FormState]: defaultState[id as keyof FormState]
      }));
    }
  };

  const handleSubmit = async (evt: SubmitEvent) => {
    evt.preventDefault();

    try {
      const authURL = `${BASE_URL}/auth/login`;

      const { email, firstName, lastName } = formState;

      const noFirstName =
        firstName.trim() === defaultFirstName || firstName.trim().length <= 1;
      const noLastName =
        lastName.trim() === defaultLastName || lastName.trim().length <= 1;

      if (noFirstName || noLastName) {
        return toast.error(
          'Please enter a valid first and last name to complete your registration.',
          toastConfig
        );
      }

      const isValidEmail = validateEmail(email);

      if (!isValidEmail) {
        return toast.error(
          'Please enter a valid email to complete your registration.',
          toastConfig
        );
      }

      const name = `${firstName.trim()} ${lastName.trim()}`;
      const trimEmail = email.trim();

      const method: HTTP_METHODS = 'POST';

      const reqPayload = {
        apiURL: authURL,
        method,
        bodyPayload: {
          name,
          email: trimEmail
        }
      };

      const res = await makeBackEndRequest<Response>(reqPayload, false);

      // 2-8-25 TODO: There might be a issue with signup. Need to investigate.
      console.log('res in login/signujp ', res);
      console.log('\n');

      if (res && res.status === 200 && updateStore) {
        const updatedUser = {
          email,
          firstName,
          lastName,
          refreshTimer: Date.now()
        };

        const updatedStore = { ...store, ...{ user: updatedUser } };

        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        toast.success("Woot woot! You've successfully logged in.", toastConfig);

        updateStore(updatedStore);

        router.push('/home');
        return;
      }

      toast.error(
        'There was a problem logging you in. Try again later.',
        toastConfig
      );
    } catch (error) {
      // TODO: Handle in telemetry.
      console.log('Error in handleSubmit: ', error);
    }
  };

  return (
    <div className="max-w-[80%] mx-auto min-h-screen border border-sky-900 flex justify-center items-center">
      <div className="border border-red-800 w-[45%]">
        <div>
          <h1 className="text-8xl mb-6">Adoptogram</h1>
          <p className="text-4xl">Life is ruff enough as it is. 😞</p>
          <p className="text-4xl">🫵🏽 Go adopt a pet! 🐶</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="firstName">
            First Name:
            <input
              id="firstName"
              type="text"
              value={formState.firstName}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </label>

          <label htmlFor="lastName">
            Last Name:
            <input
              id="lastName"
              type="text"
              value={formState.lastName}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </label>

          <label htmlFor="email">
            Email:
            <input
              id="email"
              type="text"
              value={formState.email}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </label>

          <Button type="submit">Submit</Button>
        </form>
      </div>

      <div className="border border-red-800 w-[45%]">
        <Image alt={`Picture of a baby hold a dog.`} src={landingImageURL} />
      </div>
    </div>
  );
}
