import { removeDevice } from "@/app/account/actions";
import type { DeviceRow } from "@/lib/activate";

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

/** A license's devices, each with Remove (which comes back to `back`). `current`: this computer's device hash. */
export function Devices({ devices, back, current }: { devices: DeviceRow[]; back: string; current?: string | null }) {
  if (!devices.length) return <p className="muted small">Not activated on any device yet.</p>;
  return (
    <ul className="devices">
      {devices.map((d) => (
        <li key={d.device_hash}>
          <div>
            <strong>{d.name}</strong>
            {d.device_hash === current && <span className="badge">This computer</span>}
            <p className="muted small">
              Added {day(d.created_at)} · last seen {day(d.last_seen_at)}
            </p>
          </div>
          <form action={removeDevice.bind(null, d.license_id, d.device_hash, back)}>
            <button className="button small">Remove</button>
          </form>
        </li>
      ))}
    </ul>
  );
}
