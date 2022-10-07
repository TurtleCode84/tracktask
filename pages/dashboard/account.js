import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import DueDate from "components/DueDate";
import Link from "next/link";
import useUser from "lib/useUser";
import useTasks from "lib/useTasks";
import { useRouter } from "next/router";

export default function Account() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>Your account:</h1>
      <p style={{ fontStyle: "italic" }}>Page coming soon...</p>
    </Layout>    
  );
}
