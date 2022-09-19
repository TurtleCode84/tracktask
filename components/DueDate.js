import Layout from "components/Layout";

export default function DueDate({ timestamp }) {
  if (timestamp === 0) {
    return (
      <>never</>
    );
  }
  const delta = timestamp - Math.floor(Date.now()/1000);
  switch (delta >= 0) {
    case true:
      if (delta < 60) { //seconds
        return (
          <>in {delta} seconds</>
        );
      } else if (delta < 3600) { //minutes
        return (
          <>in {delta/60} minutes</>
        );
      } else if (delta < 86400) { //hours
        return (
          <>in {delta/3600} hours</>
        );
      } else if (delta < 2635200) { //days
        return (
          <>in {delta/86400} days</>
        );
      } else if (delta < 31622400) { //months (approx 30.5 days)
        return (
          <>in {delta/2635200} months</>
        );
      } else if (delta < 316224000) { //years
        return (
          <>in {delta/31622400} years</>
        );
      } else if (delta < 3162240000) { //decades
        return (
          <>in {delta/31622400} decades</>
        );
      } else if (delta < 31622400000) { //centuries
        return (
          <>in {delta/3162240000} centuries</>
        );
      } else { //everything else
        return (
          <>in a really, really long time {delta}</>
        );
      }
      break;
    case false:
      if (delta > -60) { //seconds
        return (
          <>{delta} seconds ago</>
        );
      } else if (delta > -3600) { //minutes
        return (
          <>{delta/-60} minutes ago</>
        );
      } else if (delta > -86400) { //hours
        return (
          <>{delta/-3600} hours ago</>
        );
      } else if (delta > -2635200) { //days
        return (
          <>{delta/-86400} days ago</>
        );
      } else if (delta > -31622400) { //months (approx 30.5 days)
        return (
          <>{delta/-2635200} months ago</>
        );
      } else if (delta > -316224000) { //years
        return (
          <>{delta/-31622400} years ago</>
        );
      } else if (delta > -3162240000) { //decades
        return (
          <>{delta/-31622400} decades ago</>
        );
      } else if (delta > -31622400000) { //centuries
        return (
          <>{delta/-3162240000} centuries ago</>
        );
      } else { //everything else
        return (
          <>a really, really long time ago {delta}</>
        );
      }
      break;
  }
}
