import useTool from "lib/useTool";
import Image from "next/legacy/image";
import { useRouter } from 'next/router'

export default function User({ user, id, link }) {
  const router = useRouter();
  const { info, error } = useTool(user, "userInfo", id);
  return (
    <><span style={{ borderRadius: "100%", overflow: "hidden", marginRight: ".3em", verticalAlign: "middle" }}><Image src={info?.profilePicture ? info.profilePicture : "/default-pfp.jpg" } width={32} height={32} alt=""/></span>{link ? <a href={`/admin/users/${info?._id}`} onClick={(e) => {e.preventDefault();router.push(`/admin/users/${info?._id}`);}}>{info?.username}</a> : info?.username}{' '}{info?.permissions.verified && <span title="Verified" style={{ color: "#006dbe" }} className="material-symbols-outlined icon-list">verified</span>}</>
  );
}
