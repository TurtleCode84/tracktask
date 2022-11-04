import React, { useState } from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import User from "components/User";
import useUser from "lib/useUser";
import useTasks from "lib/useTasks";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import Link from "next/link";

export default function CollectionPreview() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  const { tasks: collections, error } = useTasks(user, true, false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { collectionId } = router.query;
  const collection = collections?.filter(item => item._id === collectionId)?.[0];
  var clientError;
  if (collections && !collection) {
    clientError = "No collection found";
  }
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  if (!collection?.pending) {
    router.push(`/collections/${collectionId}`);
    return;
  }
  return (
    <Layout>
      <h1><span style={{ color: "#006dbe" }} className="material-symbols-outlined">share_reviews</span> Share request for {collection ? <>&apos;{collection.name}&apos;</> : 'a collection'}:</h1>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      {collection ?
      <><h3>Preview information:</h3>
      <p>Shared by: <User user={user} id={collection.owner}/></p>
      <p>Description:</p>{' '}<textarea value={collection.description} rows="4" cols="70" disabled /><br/>
      <p title={collection.created > 0 ? moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'Never'}>Created: {collection.created > 0 ? <>{moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(collection.created).fromNow()})</> : 'never'}</p>
      <p style={{ fontStyle: "italic" }}>Eventually, you will be able to accept, reject, or report this request.</p>
      </>
      :
        <>{error || clientError ? <p>{clientError ? clientError : error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collection...</p>}</>
      }
    </Layout>
  );
}
