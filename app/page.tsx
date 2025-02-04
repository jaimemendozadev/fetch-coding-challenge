'use client';
import { useState, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import toast from 'react-hot-toast';
import { StoreContext } from '@/utils/store';
import { BASE_URL, validateEmail, makeBackEndRequest } from '@/utils';

import { InputEvent, SubmitEvent } from '@/utils/ts';
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

export default function LandingPage(): ReactNode {
  const router = useRouter();
  const { store, updateStore } = useContext(StoreContext);
  const [formState, setFormState] = useState<FormState>(defaultState);

  const handleChange = (evt: InputEvent) => {
    const { id } = evt.target;

    const update = { [id]: evt.target.value.trim() };

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

      const res = await makeBackEndRequest<Response>(
        authURL,
        'POST',
        {
          name,
          email: trimEmail
        },
        false
      );

      if (res && res.status === 200 && updateStore) {
        const updatedUser = {
          email,
          firstName,
          lastName,
          refreshTimer: Date.now()
        };

        const updatedStore = { ...store, ...{ user: updatedUser } };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success("Woot woot! You've successfully logged in.", toastConfig);
        updateStore(updatedStore);
        setTimeout(() => router.push('/home'), 1500);
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
    <div className="max-w-[80%] border border-sky-900 mx-auto min-h-screen">
      <h1 className="text-6xl">Adoptogram</h1>
      <p className="text-3xl">Life is ruff enough as it is. 😞</p>
      <p className="text-3xl">🫵🏽 Go adopt a pet! 🐶</p>

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
  );
}
