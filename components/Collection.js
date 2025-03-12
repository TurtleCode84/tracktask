import moment from "moment";
import { useRouter } from "next/router";
import stringToColor from "lib/stringToColor";

export default function Collection({ user, collection, key, admin }) {
  const router = useRouter();
  var sharedColor = "lightslategray";
  if (collection.owner !== user.id && !admin) {
    sharedColor = "#006dbe";
  }
  return (
    <li key={key} id={"collection-" + collection._id} className="list-hover" style={{ margin: "0.5em", background: "var(--element-background)", padding: "8px", borderWidth: "2px", borderStyle: "solid", borderColor: "var(--border-color)", borderRadius: "10px", width: "auto" }} onClick={() => {router.push(`/${admin === true ? 'admin/' : ''}collections/${collection._id}`);}}>
      {admin === true && collection.hidden && <span title="Hidden" style={{ color: "red", marginRight: "5px" }} className="material-symbols-outlined icon-list">disabled_visible</span>}{collection.pending ? <span title="Share request" style={{ color: "#006dbe" }} className="material-symbols-outlined icon-list">share_reviews</span> : <>{collection.sharing.shared ? <span title="Shared" style={{ color: sharedColor }} className="material-symbols-outlined icon-list">group</span> : <span title="Private" style={{ color: "lightslategray" }} className="material-symbols-outlined icon-list">lock</span>}</>}<span style={{ color: stringToColor(collection._id), filter: "grayscale(0.4) brightness(1.5)" }} className="material-symbols-outlined icon-list">fiber_manual_record</span>{collection.archived && <span title="Archived" style={{ color: "lightslategray" }} className="material-symbols-outlined icon-list">archive</span>}{' '}<b>{collection.name}</b>{' '}(created {collection.created > 0 ? moment.unix(collection.created).fromNow() : 'never'})
      <div style={{ marginLeft: "22px", marginTop: "3px", color: "var(--secondary-text-color)" }}>{collection.description ? <>{collection.description.length > 50 ? <>{collection.description.slice(0,50).trim()}...</> : collection.description}</> : <span style={{ fontStyle: "italic" }}>(no description)</span>}</div>
    </li>
  );
}
