import { Spinner } from "@/components/Pending";

/** While a page that reads the account (or anything else on the server) is on its way. */
export default function Loading() {
  return (
    <div className="page-loading" role="status">
      <Spinner label="Loading…" />
    </div>
  );
}
