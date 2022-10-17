import moment from "moment";

export default function DueDate({ timestamp }) {
  if (!timestamp || timestamp === 0) {
    return (
      <>never</>
    );
  } else {
    return (
      <>{moment.unix(timestamp).fromNow()}</>
    );
  }
}
