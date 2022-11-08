import moment from "moment";
import { useRouter } from "next/router";

export default function Collection({ user, collection, key, admin }) {
  const router = useRouter();
  var sharedColor = "lightslategray";
  if (collection.owner !== user.id) {
    sharedColor = "#006dbe";
  }
  return (
    <li key={key} className="list-hover" style={{ margin: "0.5em", background: "#f8f8f8", padding: "5px", borderWidth: "2px", borderStyle: "solid", borderColor: "darkgray", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/${admin === true ? 'admin/' : ''}collections/${collection._id}`)}>
      {collection.pending ? <span title="Share request" style={{ color: "#006dbe" }} className="material-symbols-outlined icon-list">share_reviews</span> : <>{collection.sharing.shared ? <span title="Shared" style={{ color: sharedColor }} className="material-symbols-outlined icon-list">group</span> : <span title="Private" style={{ color: "lightslategray" }} className="material-symbols-outlined icon-list">lock</span>}</>}{' '}<b>{collection.name}</b> - {collection.description.slice(0,30).trim()}... (created {collection.created !== 0 ? moment.unix(collection.created).fromNow() : 'never'})
    </li>
  );
}
