import moment from "moment";
import { useRouter } from "next/router";

export default function Collection({ user, collection, key, admin }) {
  const router = useRouter();
  var sharedColor = "lightslategray";
  if (collection.owner !== user.id && !admin) {
    sharedColor = "#006dbe";
  }
  return (
    <li key={key} className="list-hover" style={{ margin: "0.5em", background: "var(--element-background)", padding: "8px", borderWidth: "2px", borderStyle: "solid", borderColor: "var(--border-color)", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/${admin === true ? 'admin/' : ''}collections/${collection._id}`)}>
      {collection.pending ? <span title="Share request" style={{ color: "#006dbe" }} className="material-symbols-outlined icon-list">share_reviews</span> : <>{collection.sharing.shared ? <span title="Shared" style={{ color: sharedColor }} className="material-symbols-outlined icon-list">group</span> : <span title="Private" style={{ color: "lightslategray" }} className="material-symbols-outlined icon-list">lock</span>}</>}{' '}<b>{collection.name}</b>{' '}(created {collection.created > 0 ? moment.unix(collection.created).fromNow() : 'never'})
      <div style={{ marginLeft: "22px", marginTop: "3px", color: "var(--secondary-text-color)" }}>{collection.description.length > 50 ? <>{collection.description.slice(0,50).trim()}...</> : collection.description}</div>
    </li>
  );
}
