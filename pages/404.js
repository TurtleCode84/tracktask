import React from "react";
import Layout from "components/Layout";
import Link from "next/link";

export default function Custom404() {
    return (
        <Layout>
            <h1 style={{marginBottom: "0px", marginTop: "60px"}}><span style={{color: "#006dbe", fontSize: "inherit"}} className="material-symbols-outlined">help</span> 404: This page could not be found.</h1>
            <h3>We&apos;re not sure how you got here, but we couldn&apos;t find the page you were looking for. Maybe there&apos;s a typo in the URL?</h3>
            <p>In the meantime, you probably want to go back to <Link href="/">a page that does exist</Link>?</p>
        </Layout>
    );
}