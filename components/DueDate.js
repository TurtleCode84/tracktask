import moment from "moment";

export default function DueDate({ timestamp }) {
  if (timestamp === 0) {
    return (
      <>never</>
    );
  } else {
    return (
      <>{moment.unix(timestamp).local().fromNow()}</>
    );
  }
}
