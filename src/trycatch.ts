class NetworkError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "NetworkError";
  }
}

class DatabaseError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

type UnionToIntersection<U> = (
  U extends any ? (arg: U) => void : never
) extends (arg: infer I) => void
  ? I
  : never;

export async function catchErrorTyped<
  T,
  E extends new (message?: string) => Error
>(
  promise: Promise<T>,
  errorsToCatch?: E[]
): Promise<[UnionToIntersection<InstanceType<E>> | undefined, T | undefined]> {
  try {
    const result = await promise;
    return [undefined, result];
  } catch (error) {
    if (!errorsToCatch) {
      return [error as UnionToIntersection<InstanceType<E>>, undefined];
    }

    if (errorsToCatch.some((ErrorClass) => error instanceof ErrorClass)) {
      return [error as UnionToIntersection<InstanceType<E>>, undefined];
    }

    throw error; // Re-throw if not in errorsToCatch
  }
}

async function fetchData(): Promise<string> {
  // Simulate an error
  throw new DatabaseError("Failed to fetch data due to network issue");
}

export async function exampleUsage() {
  const [error, data] = await catchErrorTyped(fetchData(), [
    DatabaseError,
    NetworkError,
  ]);

  if (error) {
    if (error instanceof NetworkError) {
      console.error("Network error occurred:", error.message);
      // Handle network error
    } else if (error instanceof DatabaseError) {
      console.error("Database error occurred:", error.message);
      // Handle database error
    } else {
      console.error("An unexpected error occurred:", (error as Error).message);
    }
  } else {
    console.log("Data fetched successfully:", data);
  }
}
