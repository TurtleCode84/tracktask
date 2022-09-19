import moment from "moment";

export default function DueDate({ timestamp }) {
  return (
    <>{moment.unix(timestamp).fromNow()}</>
  );
}
