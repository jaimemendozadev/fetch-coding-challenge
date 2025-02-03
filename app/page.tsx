'use client';
import { Button } from '@heroui/button';

export default function Home() {
  return (
    <div>
      <h1>Adopt a Pet</h1>
      <h2>Ready to adopt a pet?</h2>
      <p>Let&lsquo;s get started. Search pets from our inventory.</p>
      <form>
        <Button>Submit</Button>
      </form>
    </div>
  );
}
