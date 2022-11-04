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
      <h1><span style={{ color: "#006dbe" }} className="material-symbols-outlined">share_reviews</span> Share request from {collection ? <User user={user} id={collection.owner}/> : 'another user'}:</h1>
      <p>Back to <Link href={`/collections/${collection?._id}`}>collection</Link> or <Link href="/dashboard">dashboard</Link></p>
      {collection ?
      <><h3>Preview information:</h3>
      <p>Name: {collection.name}</p>
      <p>Description:</p>{' '}<textarea value={collection.description} rows="4" cols="70" disabled /><br/>
      <p title={collection.created > 0 ? moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'Never'}>Created: {collection.created > 0 ? <>{moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(collection.created).fromNow()})</> : 'never'}</p>
      <p style={{ fontStyle: "italic" }}>Eventually you will be able to accept, reject, or report this request.</p>
      </>
      :
        <>{error || clientError ? <p>{clientError ? clientError : error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collection...</p>}</>
      }
    </Layout>
  );
}
