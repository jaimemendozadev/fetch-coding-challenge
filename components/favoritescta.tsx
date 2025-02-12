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
    <div className="border border-red-500 w-[40%]">
      <aside className="mb-8">
        <p className="text-3xl mb-4">
          Here are all the cute dogs you favorited.
        </p>
        <p className="text-3xl mb-4">
          Can&lsquo;t decide which dog you should be matched up with for
          adoption? 🤔
        </p>
        <p className="text-3xl mb-4">
          Go ahead and click on the &#39;Get Matched&#39; button.
        </p>
        <p className="text-3xl mb-4">
          Our service in the ☁️ cloud will take your dog picks and make a
          decision for you.
        </p>
        <p className="text-3xl">No fuss, no muss.</p>
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
