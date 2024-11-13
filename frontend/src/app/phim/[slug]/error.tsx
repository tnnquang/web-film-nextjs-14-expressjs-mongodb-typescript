"use client"; // Error components must be Client Components

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPhim({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.log("Error phim info page: ", error);
  }, [error]);

  return (
    <div className="w-full">
      <h2>Something went wrong!</h2>
      <p className="error-message my-2 text-sm leading-6 text-orange-400">
        {error.message}
      </p>
      <button
        className="rounded-md bg-white p-2 text-[#4660e6] transition-all duration-300 hover:bg-blueSecondary hover:text-white"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
