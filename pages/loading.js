import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Image from "next/image";

export default function Loader() {
  return (
    <Layout>
      <p>An easteregg maybe?</p>
      <Loading/>
    </Layout>
  );
}
