import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Collection from "components/Collection";
import Link from "next/link";
import useUser from "lib/useUser";
import useAdminCollections from "lib/useAdminCollections";

export default function CollectionsAdmin() {
  const { user } = useUser({
    redirectTo: "/login",
    adminOnly: true,
  });
  const { collections, error: collectionsError } = useAdminCollections(user, false);
  const collectionList = collections?.map((collection) =>
    <Collection user={user} collection={collection} key={collection._id} admin={true}/>
  );
  
  if (!user || !user.isLoggedIn || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>All shared collections:</h1>
      <Link href="/admin">Back to admin dashboard</Link><br/>
      {collectionList === undefined || collectionsError ?
      <>
      {collectionsError ? <p style={{ fontStyle: "italic" }}>{collectionsError.data ? collectionsError.data.message : collectionsError.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {collectionList}
      </ul></>
      }
    </Layout>    
  );
}
