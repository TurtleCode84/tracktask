import useTool from "lib/useTool";
import Image from "next/image";
import Link from "next/link";

export default function User({ user, id, link }) {
  const { info, error } = useTool(user, "userInfo", id);
  return (
    <><span style={{ borderRadius: "100%", overflow: "hidden", marginRight: ".3em", verticalAlign: "middle" }}><Image src={info?.profilePicture ? info.profilePicture : "/default-pfp.jpg" } width={32} height={32} alt=""/></span>{link ? <Link href={info?._id}>{info?.username}</Link> : {info?.username}}</>
  );
}
