'use client';
import { ReactNode } from 'react';
import { Button } from '@heroui/react';
import { SubmitEvent } from '@/utils/ts';

interface FavoritesCTAProps {
  onSubmitHandler: (evt: SubmitEvent) => Promise<void>;
  inFlight: boolean;
}

export const FavoritesCTA = ({
  onSubmitHandler,
  inFlight
}: FavoritesCTAProps): ReactNode => {
  return (
    <div className="w-[40%]">
      <aside className="mb-8">
        <p className="text-3xl mb-8">
          Here are all the cute dogs you favorited.
        </p>
        <p className="text-3xl mb-8">
          Can&lsquo;t decide which dog you should be matched up with for
          adoption? 🤔
        </p>
        <p className="text-3xl mb-8">
          Click on the &#39;Get Matched&#39; button and our service will match
          you with a dog. 🐶
        </p>

        <p className="text-3xl mb-8">
          Buuuuuuut if you don&lsquo;t like the dog that was selected for you...
          🤨
        </p>

        <p className="text-3xl">
          Feel free to click the button again and get a new match. 😊
        </p>
      </aside>
      <form onSubmit={onSubmitHandler} className="mb-36">
        <Button
          disabled={inFlight}
          className="bg-[#0098F3] text-white self-center"
          type="submit"
        >
          Get Matched
        </Button>
      </form>
    </div>
  );
};
