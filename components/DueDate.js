import moment from "moment";

export default function DueDate({ timestamp }) {
  if (timestamp === 0) {
    return (
      <>never</>
    );
  } else {
    const m = moment.unix(timestamp).utc().format();
    return (
      <>{moment.local(m).fromNow()}</>
    );
  }
}
