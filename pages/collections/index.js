import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Collection from "components/Collection";
import Link from "next/link";
import useUser from "lib/useUser";
import useData from "lib/useData";

export default function Collections() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  
  //const { tasks: allCollections, error: allCollectionsError } = useTasks(user, true, false);
  const collectionList = allCollections?.map((collection) =>
    <Collection user={user} collection={collection} key={collection._id}/>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>All collections:</h1>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      {collectionList === undefined || allCollectionsError ?
      <>
      {allCollectionsError ? <p style={{ fontStyle: "italic" }}>{allCollectionsError.data ? allCollectionsError.data.message : allCollectionsError.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collections...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {collectionList}
      </ul></>
      }
    </Layout>    
  );
}
