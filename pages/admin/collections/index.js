import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Collection from "components/Collection";
import Link from "next/link";
import useUser from "lib/useUser";
import useAdminData from "lib/useAdminData";

export default function CollectionsAdmin() {
  const { user } = useUser({
    redirectTo: "/login",
    adminOnly: true,
  });
  
  const { data: collections, error: collectionsError } = useAdminData(user, "collections", false, false);
  const collectionList = collections?.map((collection) =>
    <Collection user={user} collection={collection} key={collection._id} admin={true}/>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>All reported collections:</h1>
      <Link href="/admin">Back to admin dashboard</Link><br/>
      {collectionList && collectionList.length === 0 ? <p style={{ fontStyle: "italic" }}>No collections found!</p> : null}
      {collectionList === undefined || collectionsError ?
      <>
      {collectionsError ? <p style={{ fontStyle: "italic" }}>{collectionsError.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collections...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {collectionList}
      </ul></>
      }
    </Layout>    
  );
}
