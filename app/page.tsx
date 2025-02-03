'use client';
import { useState, ReactNode, ChangeEvent } from 'react';
import { Button } from '@heroui/button';

export default function Home(): ReactNode {
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { id } = evt.target;

    const update = { [id]: evt.target.value };

    setFormState((prev) => ({ ...prev, ...update }));
  };

  return (
    <div className="max-w-[80%] border border-sky-900 mx-auto min-h-screen">
      <h1 className="text-6xl">Adopt a Pet</h1>
      <h2 className="text-3xl">Ready to adopt a pet?</h2>
      <p className="text-lg">
        Let&lsquo;s get started. Search pets from our inventory.
      </p>
      <form>
        <label htmlFor="firstName">
          First Name:
          <input
            id="firstName"
            type="text"
            value={formState.firstName}
            onChange={handleChange}
          />
        </label>

        <label htmlFor="lastName">
          Last Name:
          <input
            id="lastName"
            type="text"
            value={formState.lastName}
            onChange={handleChange}
          />
        </label>

        <label htmlFor="email">
          Email:
          <input
            id="email"
            type="text"
            value={formState.email}
            onChange={handleChange}
          />
        </label>

        <Button>Submit</Button>
      </form>
    </div>
  );
}
