import React from "react";
import Layout from "components/Layout";
import Link from "next/link";

export default function Custom500() {
    return (
        <Layout>
            <h1 style={{marginBottom: "0px", marginTop: "60px"}}><span style={{color: "red", fontSize: "inherit"}} className="material-symbols-outlined">error</span> 500: Internal server error.</h1>
            <h3>We&apos;re not sure why this happened, but the error has been reported and will be resolved as soon as possible.</h3>
            <p>In the meantime, you probably want to go back to <Link href="/">a page that does work</Link>?</p>
        </Layout>
    );
}