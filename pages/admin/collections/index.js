import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Collection from "components/Collection";
import useUser from "lib/useUser";
import useAdminData from "lib/useAdminData";
import { useRouter } from "next/router";

export default function CollectionsAdmin() {
  const { user } = useUser({
    redirectTo: "/login",
    adminOnly: true,
  });
  const router = useRouter();
  
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
      <a href="#" onClick={(e) => {e.preventDefault();router.back();}}>Back to previous</a><br/>
      {collectionList && collectionList.length === 0 ? <p style={{ fontStyle: "italic" }}>No collections found!</p> : null}
      {collectionList === undefined || collectionsError ?
      <>
      {collectionsError ? <p style={{ fontStyle: "italic" }}>{collectionsError.data?.message || collectionsError.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collections...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {collectionList}
      </ul></>
      }
    </Layout>    
  );
}
