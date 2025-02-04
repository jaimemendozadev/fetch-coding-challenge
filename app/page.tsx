'use client';
import { useState, ReactNode } from 'react';
import { Button } from '@heroui/button';
import { InputEvent, SubmitEvent, BASE_URL, validateEmail } from '@/utils';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
}

const defaultFirstName = 'Your First Name';
const defaultLastName = 'Your Last Name';
const defaultEmail = 'Your Email';

const defaultState = {
  firstName: defaultFirstName,
  lastName: defaultLastName,
  email: defaultEmail
};

export default function Home(): ReactNode {
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

      const name = `${formState.firstName} ${formState.lastName}`;
      const { email } = formState;

      const isEmail = validateEmail(email);

      const res = await fetch(authURL, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ name, email })
      });

      // console.log('res ', res);
    } catch (error) {
      // TODO: Handle in telemetry.
      console.log('Error in handleSubmit: ', error);
    }
  };

  return (
    <div className="max-w-[80%] border border-sky-900 mx-auto min-h-screen">
      <h1 className="text-6xl">Adopt a Pet</h1>
      <h2 className="text-3xl">Ready to adopt a pet?</h2>
      <p className="text-lg">
        Let&lsquo;s get started. Search pets from our inventory.
      </p>
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
