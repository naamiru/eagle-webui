import type { Route } from "./+types/home";

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_EXPRESS };
}

export default function Home({
  loaderData: { message },
}: Route.ComponentProps) {
  return <div>{message}</div>;
}
